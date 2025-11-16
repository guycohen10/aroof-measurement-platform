import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, MapPin, Edit3, Trash2, Plus, Layers, TrendingUp, ZoomIn, ZoomOut, Maximize2, RotateCcw, Camera, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SECTION_COLORS = [
  { stroke: '#4A90E2', fill: '#4A90E2', name: 'Blue' },
  { stroke: '#10b981', fill: '#10b981', name: 'Green' },
  { stroke: '#f97316', fill: '#f97316', name: 'Orange' },
  { stroke: '#a855f7', fill: '#a855f7', name: 'Purple' },
  { stroke: '#ef4444', fill: '#ef4444', name: 'Red' },
  { stroke: '#06b6d4', fill: '#06b6d4', name: 'Cyan' },
  { stroke: '#f59e0b', fill: '#f59e0b', name: 'Amber' },
  { stroke: '#ec4899', fill: '#ec4899', name: 'Pink' },
];

const PITCH_OPTIONS = [
  { value: 'flat', label: 'Flat (0/12)', multiplier: 1.00 },
  { value: '2/12', label: '2/12 pitch', multiplier: 1.02 },
  { value: '3/12', label: '3/12 pitch', multiplier: 1.03 },
  { value: '4/12', label: '4/12 pitch', multiplier: 1.05 },
  { value: '5/12', label: '5/12 pitch', multiplier: 1.08 },
  { value: '6/12', label: '6/12 pitch', multiplier: 1.12 },
  { value: '7/12', label: '7/12 pitch', multiplier: 1.16 },
  { value: '8/12', label: '8/12 pitch', multiplier: 1.20 },
  { value: '9/12', label: '9/12 pitch', multiplier: 1.25 },
  { value: '10/12', label: '10/12 pitch', multiplier: 1.30 },
  { value: '11/12', label: '11/12 pitch', multiplier: 1.36 },
  { value: '12/12', label: '12/12 pitch', multiplier: 1.41 },
  { value: 'steep', label: 'Steep (over 12/12)', multiplier: 1.50 },
];

export default function MeasurementPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const polygonsRef = useRef([]);
  
  const [address, setAddress] = useState("");
  const [measurementId, setMeasurementId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [geocodingStatus, setGeocodingStatus] = useState("Initializing map...");
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  
  const [sections, setSections] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [currentZoom, setCurrentZoom] = useState(20);
  const [showZoomTutorial, setShowZoomTutorial] = useState(true);
  const [capturingImages, setCapturingImages] = useState(false);

  const [capturedImages, setCapturedImages] = useState([]);
  const [capturing, setCapturing] = useState(false);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressParam = urlParams.get('address');
    const latParam = urlParams.get('lat');
    const lngParam = urlParams.get('lng');
    const measurementIdParam = urlParams.get('measurementId');
    
    if (!addressParam) {
      navigate(createPageUrl("FormPage"));
      return;
    }
    
    const decodedAddress = decodeURIComponent(addressParam);
    setAddress(decodedAddress);

    if (measurementIdParam) {
      setMeasurementId(measurementIdParam);
    }

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoordinates({ lat, lng });
        setGeocodingStatus("Location verified!");
      }
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!address) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.drawing) {
        initializeMap();
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkGoogle = setInterval(() => {
          attempts++;
          if (window.google && window.google.maps && window.google.maps.drawing) {
            clearInterval(checkGoogle);
            initializeMap();
          } else if (attempts >= maxAttempts) {
            clearInterval(checkGoogle);
            setMapError("Google Maps failed to load. Please refresh the page.");
            setMapLoading(false);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initializeMap();
      script.onerror = () => {
        setMapError("Failed to load Google Maps. Please check your internet connection.");
        setMapLoading(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [address, coordinates]);

  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom < 22) mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom > 18) mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (mapInstanceRef.current && coordinates) {
      mapInstanceRef.current.setZoom(20);
      mapInstanceRef.current.setCenter(coordinates);
    }
  }, [coordinates]);

  const handleOptimalZoom = useCallback(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.setZoom(20);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!mapInstanceRef.current || isDrawing) return;
      
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDrawing, handleZoomIn, handleZoomOut, handleResetZoom]);

  const createMap = useCallback((center) => {
    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 20,
        minZoom: 18,
        maxZoom: 22,
        mapTypeId: "satellite",
        tilt: 0,
        zoomControl: true,
        zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
        scrollwheel: true,
        gestureHandling: 'greedy',
        disableDoubleClickZoom: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ["satellite", "hybrid", "roadmap"]
        },
        streetViewControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: { position: window.google.maps.ControlPosition.TOP_RIGHT },
        rotateControl: false,
        scaleControl: true
      });

      mapInstanceRef.current = map;

      window.google.maps.event.addListener(map, 'zoom_changed', () => {
        setCurrentZoom(map.getZoom());
      });

      new window.google.maps.Marker({
        position: center,
        map: map,
        title: address,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#FF0000",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
          scale: 10,
        }
      });

      setMapError("");
      setMapLoading(false);
    } catch (err) {
      setMapError(`Error creating map: ${err.message}`);
      setMapLoading(false);
    }
  }, [address]);

  const initializeMap = useCallback(async () => {
    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps not available");
      }

      const defaultCenter = { lat: 32.7767, lng: -96.7970 };

      if (coordinates) {
        createMap(coordinates);
        return;
      }

      setGeocodingStatus("Finding address location...");
      const geocoder = new window.google.maps.Geocoder();
      let geocodingCompleted = false;
      
      const geocodeTimeout = setTimeout(() => {
        if (!geocodingCompleted) {
          setMapError("Could not find address location. Using default map center.");
          setGeocodingStatus("Using default location");
          createMap(defaultCenter);
        }
      }, 10000);

      geocoder.geocode({ address: address }, (results, status) => {
        geocodingCompleted = true;
        clearTimeout(geocodeTimeout);
        
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const geocodedCenter = { lat: location.lat(), lng: location.lng() };
          setCoordinates(geocodedCenter);
          setGeocodingStatus("Address found!");
          createMap(geocodedCenter);
        } else {
          setMapError(`Could not find address (${status}). Showing default location.`);
          setGeocodingStatus("Using default location");
          createMap(defaultCenter);
        }
      });
    } catch (err) {
      setMapError(`Failed to initialize map: ${err.message}`);
      setMapLoading(false);
    }
  }, [address, coordinates, createMap]);

  const captureCurrentMapView = useCallback(async () => {
    if (!mapInstanceRef.current) {
      alert('Map not loaded yet');
      return;
    }

    setCapturing(true);

    try {
      const center = mapInstanceRef.current.getCenter();
      const zoom = mapInstanceRef.current.getZoom();
      const lat = center.lat();
      const lng = center.lng();
      
      const mapContainer = mapRef.current;
      const width = Math.min(mapContainer.offsetWidth, 640);
      const height = Math.min(mapContainer.offsetHeight, 640);
      
      const staticImageUrl = `https://maps.googleapis.com/maps/api/staticmap?` +
        `center=${lat},${lng}&` +
        `zoom=${zoom}&` +
        `size=${width}x${height}&` +
        `scale=2&` +
        `maptype=satellite&` +
        `key=${GOOGLE_MAPS_API_KEY}`;
      
      const newImage = {
        id: `capture-${Date.now()}`,
        url: staticImageUrl,
        center_lat: lat,
        center_lng: lng,
        zoom: zoom,
        captured_at: new Date().toISOString()
      };
      
      setCapturedImages(prev => [...prev, newImage]);
      setCapturing(false);
      
    } catch (err) {
      console.error("❌ Capture error:", err);
      alert('Failed to capture image');
      setCapturing(false);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  const deleteCapturedImage = useCallback((imageId) => {
    setCapturedImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  const getZoomLevelAdvice = () => {
    if (currentZoom >= 21) {
      return { type: 'success', message: 'Perfect zoom level for accurate measurements', icon: '✓' };
    } else if (currentZoom >= 20) {
      return { type: 'success', message: 'Good zoom level - ready to measure', icon: '✓' };
    } else if (currentZoom >= 19) {
      return { type: 'warning', message: 'Consider zooming in for better accuracy', icon: '⚠️' };
    } else {
      return { type: 'error', message: 'Zoom in closer to see roof details clearly', icon: '❌' };
    }
  };

  const calculateArea = useCallback((polygon) => {
    if (!polygon || !window.google || !window.google.maps.geometry) return 0;
    try {
      const areaInSquareMeters = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
      return Math.round(areaInSquareMeters * 10.764 * 100) / 100;
    } catch (err) {
      return 0;
    }
  }, []);

  const startDrawingSection = useCallback(() => {
    if (!mapInstanceRef.current) {
      setError("Map not initialized. Please wait for the map to load.");
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.drawing) {
      setError("Drawing tools not available. Please refresh the page.");
      return;
    }
    
    setIsDrawing(true);
    setError("");
    
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null);
    }

    const colorIndex = sections.length % SECTION_COLORS.length;
    const sectionColor = SECTION_COLORS[colorIndex];

    try {
      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
          fillColor: sectionColor.fill,
          fillOpacity: 0.35,
          strokeWeight: 3,
          strokeColor: sectionColor.stroke,
          editable: true,
          draggable: false,
          clickable: true
        }
      });

      drawingManagerRef.current = drawingManager;
      drawingManager.setMap(mapInstanceRef.current);

      window.google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
        polygonsRef.current.push(polygon);
        
        const path = polygon.getPath();
        const coordinates = [];
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          coordinates.push({ lat: point.lat(), lng: point.lng() });
        }
        
        const flatArea = calculateArea(polygon);
        
        const newSection = {
          id: `section-${Date.now()}`,
          name: `Section ${sections.length + 1}`,
          flat_area_sqft: flatArea,
          pitch: 'flat',
          pitch_multiplier: 1.00,
          adjusted_area_sqft: flatArea,
          color: sectionColor.stroke,
          coordinates: coordinates,
          polygon: polygon
        };

        setSections(prev => [...prev, newSection]);
        drawingManager.setDrawingMode(null);
        setIsDrawing(false);
        
        const updateSection = () => {
          const newArea = calculateArea(polygon);
          const newCoords = [];
          const path = polygon.getPath();
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            newCoords.push({ lat: point.lat(), lng: point.lng() });
          }
          
          setSections(prev => prev.map(s => 
            s.id === newSection.id
              ? { ...s, flat_area_sqft: newArea, adjusted_area_sqft: newArea * s.pitch_multiplier, coordinates: newCoords }
              : s
          ));
        };

        window.google.maps.event.addListener(path, 'set_at', updateSection);
        window.google.maps.event.addListener(path, 'insert_at', updateSection);
        window.google.maps.event.addListener(path, 'remove_at', updateSection);
      });
    } catch (err) {
      setError(`Failed to start drawing: ${err.message}`);
      setIsDrawing(false);
    }
  }, [sections, calculateArea]);

  const deleteSection = useCallback((sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (section && section.polygon) {
      section.polygon.setMap(null);
      polygonsRef.current = polygonsRef.current.filter(p => p !== section.polygon);
    }
    setSections(prev => prev.filter(s => s.id !== sectionId));
  }, [sections]);

  const updateSectionPitch = useCallback((sectionId, pitchValue) => {
    const pitchOption = PITCH_OPTIONS.find(p => p.value === pitchValue);
    if (!pitchOption) return;

    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            pitch: pitchValue,
            pitch_multiplier: pitchOption.multiplier,
            adjusted_area_sqft: Math.round(section.flat_area_sqft * pitchOption.multiplier * 100) / 100
          }
        : section
    ));
  }, []);

  const updateSectionName = useCallback((sectionId, name) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, name } : section
    ));
  }, []);

  const getTotalFlatArea = () => sections.reduce((sum, section) => sum + section.flat_area_sqft, 0);
  const getTotalAdjustedArea = () => sections.reduce((sum, section) => sum + section.adjusted_area_sqft, 0);

  const calculateRoofComponents = useCallback((sections) => {
    let totalFlatArea = 0, totalActualArea = 0;
    let totalEaves = 0, totalRakes = 0, totalRidges = 0, totalHips = 0, totalValleys = 0, totalSteps = 0;
    const pitchBreakdown = {};
    
    sections.forEach(section => {
      const flatArea = section.flat_area_sqft;
      const pitchMultiplier = section.pitch_multiplier;
      const actualArea = section.adjusted_area_sqft;
      
      totalFlatArea += flatArea;
      totalActualArea += actualArea;
      
      const pitchKey = section.pitch || "flat";
      if (!pitchBreakdown[pitchKey]) pitchBreakdown[pitchKey] = 0;
      pitchBreakdown[pitchKey] += actualArea / 100;
      
      const avgDimension = Math.sqrt(flatArea);
      const perimeter = avgDimension * 4;
      
      totalEaves += perimeter * 0.4;
      totalRakes += (perimeter * 0.3) * pitchMultiplier;
      totalRidges += avgDimension * 0.5;
      totalHips += avgDimension * 0.3 * pitchMultiplier;
      totalValleys += avgDimension * 0.2 * pitchMultiplier;
      totalSteps += perimeter * 0.15;
    });
    
    return {
      totalFlatArea: Math.round(totalFlatArea * 100) / 100,
      totalActualArea: Math.round(totalActualArea * 100) / 100,
      totalSquares: Math.round((totalActualArea / 100) * 100) / 100,
      eaves: Math.round(totalEaves * 10) / 10,
      rakes: Math.round(totalRakes * 10) / 10,
      ridges: Math.round(totalRidges * 10) / 10,
      hips: Math.round(totalHips * 10) / 10,
      valleys: Math.round(totalValleys * 10) / 10,
      steps: Math.round(totalSteps * 10) / 10,
      walls: 0,
      pitchBreakdown
    };
  }, []);

  const captureSatelliteView = async () => {
    const mapContainer = mapRef.current;
    if (!mapContainer || !mapInstanceRef.current) return null;
    
    const originalZoom = mapInstanceRef.current.getZoom();
    const originalCenter = mapInstanceRef.current.getCenter();

    try {
      if (sections.length > 0 && window.google?.maps?.LatLngBounds) {
        const bounds = new window.google.maps.LatLngBounds();
        sections.forEach(section => {
          section.coordinates.forEach(coord => bounds.extend({ lat: coord.lat, lng: coord.lng }));
        });
        mapInstanceRef.current.fitBounds(bounds);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const uiElements = document.querySelectorAll('.gmnoprint, .gm-style-cc, .gm-bundled-control, .gm-svpc, .gm-control-active');
      const originalDisplays = Array.from(uiElements).map(el => el.style.display);
      uiElements.forEach(el => el.style.display = 'none');
      
      const customUI = document.querySelectorAll('[style*="z-index: 10"], [style*="z-index: 1000"]');
      const originalCustomDisplays = Array.from(customUI).map(el => el.style.display);
      customUI.forEach(el => el.style.display = 'none');
      
      polygonsRef.current.forEach(polygon => {
        if (polygon.setVisible) polygon.setVisible(false);
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight
      });
      
      uiElements.forEach((el, i) => el.style.display = originalDisplays[i]);
      customUI.forEach((el, i) => el.style.display = originalCustomDisplays[i]);
      polygonsRef.current.forEach(polygon => {
        if (polygon.setVisible) polygon.setVisible(true);
      });

      if (sections.length > 0) {
        mapInstanceRef.current.setZoom(originalZoom);
        mapInstanceRef.current.setCenter(originalCenter);
      }
      
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      return null;
    }
  };

  const captureMeasurementDiagram = async () => {
    const mapContainer = mapRef.current;
    if (!mapContainer || !mapInstanceRef.current) return null;

    const originalZoom = mapInstanceRef.current.getZoom();
    const originalCenter = mapInstanceRef.current.getCenter();
    
    try {
      if (sections.length > 0 && window.google?.maps?.LatLngBounds) {
        const bounds = new window.google.maps.LatLngBounds();
        sections.forEach(section => {
          section.coordinates.forEach(coord => bounds.extend({ lat: coord.lat, lng: coord.lng }));
        });
        mapInstanceRef.current.fitBounds(bounds);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const uiElements = document.querySelectorAll('.gmnoprint, .gm-style-cc, .gm-bundled-control, .gm-svpc, .gm-control-active');
      const originalDisplays = Array.from(uiElements).map(el => el.style.display);
      uiElements.forEach(el => el.style.display = 'none');
      
      const customUI = document.querySelectorAll('[style*="z-index: 10"], [style*="z-index: 1000"]');
      const originalCustomDisplays = Array.from(customUI).map(el => el.style.display);
      customUI.forEach(el => el.style.display = 'none');
      
      polygonsRef.current.forEach(polygon => {
        if (polygon.setVisible) polygon.setVisible(true);
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight
      });
      
      uiElements.forEach((el, i) => el.style.display = originalDisplays[i]);
      customUI.forEach((el, i) => el.style.display = originalCustomDisplays[i]);

      if (sections.length > 0) {
        mapInstanceRef.current.setZoom(originalZoom);
        mapInstanceRef.current.setCenter(originalCenter);
      }
      
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      return null;
    }
  };

  const handleCompleteMeasurement = useCallback(async () => {
    if (sections.length === 0) {
      setError("Please draw at least one section");
      return;
    }

    const totalAdjusted = getTotalAdjustedArea();
    
    if (totalAdjusted < 100) {
      setError("Total area seems too small. Please verify your measurement.");
      return;
    }

    if (totalAdjusted > 50000) {
      setError("Total area seems unusually large. Please verify your measurement.");
      return;
    }

    setSaving(true);
    setCapturingImages(true);
    setError("");

    try {
      const totalFlat = getTotalFlatArea();
      const sectionsData = sections.map(({ polygon, ...section }) => section);
      const roofComponents = calculateRoofComponents(sections);

      const satelliteImage = await captureSatelliteView();
      const measurementDiagram = await captureMeasurementDiagram();

      const measurementData = {
        measurement_data: {
          total_flat_sqft: totalFlat,
          total_adjusted_sqft: totalAdjusted,
          sections: sectionsData
        },
        total_sqft: totalFlat, 
        total_adjusted_sqft: totalAdjusted,
        eaves_ft: roofComponents.eaves,
        rakes_ft: roofComponents.rakes,
        ridges_ft: roofComponents.ridges,
        hips_ft: roofComponents.hips,
        valleys_ft: roofComponents.valleys,
        steps_ft: roofComponents.steps,
        walls_ft: roofComponents.walls,
        pitch_breakdown: roofComponents.pitchBreakdown,
        satellite_image: satelliteImage,
        measurement_diagram: measurementDiagram,
        captured_images: capturedImages,
        status: "completed",
        completed_at: new Date().toISOString()
      };

      let savedMeasurementId = measurementId;
      let savedMeasurement;

      if (measurementId) {
        await base44.entities.Measurement.update(measurementId, measurementData);
        const updated = await base44.entities.Measurement.filter({ id: measurementId });
        savedMeasurement = updated[0];
      } else {
        savedMeasurement = await base44.entities.Measurement.create({
          property_address: address,
          user_type: "homeowner",
          payment_amount: 3,
          payment_status: "completed",
          stripe_payment_id: "demo_" + Date.now(),
          ...measurementData
        });
        savedMeasurementId = savedMeasurement.id;
      }

      if (!savedMeasurementId) {
        throw new Error("Failed to get measurement ID");
      }

      navigate(createPageUrl(`Results?measurementid=${savedMeasurementId}`));
      
    } catch (err) {
      setError(`Failed to save measurement: ${err.message}. Please try again.`);
      setSaving(false);
      setCapturingImages(false);
    }
  }, [sections, address, measurementId, navigate, calculateRoofComponents, capturedImages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const totalFlat = getTotalFlatArea();
  const totalAdjusted = getTotalAdjustedArea();
  const zoomAdvice = getZoomLevelAdvice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl("FormPage")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Measure Your Roof</h2>
            <p className="text-sm text-slate-600">
              Zoom to different views, capture images, then draw
            </p>
          </div>

          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 font-medium">Property:</p>
                <p className="text-sm font-bold text-blue-900 break-words">{address}</p>
                {coordinates && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Location verified
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            {mapLoading && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  Loading map...
                </AlertDescription>
              </Alert>
            )}

            {mapError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {mapError}
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm"
                    className="mt-2 w-full"
                  >
                    Refresh Page
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!mapLoading && !mapError && (
              <Button
                onClick={captureCurrentMapView}
                disabled={capturing}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold shadow-md"
              >
                {capturing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    📸 Capture View (Zoom {currentZoom})
                  </>
                )}
              </Button>
            )}
            
            <Button
              onClick={startDrawingSection}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-md"
              disabled={isDrawing || mapLoading || !!mapError}
            >
              {isDrawing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Drawing Section {sections.length + 1}...
                </>
              ) : sections.length === 0 ? (
                <>
                  <Edit3 className="w-5 h-5 mr-2" />
                  Start Drawing Section 1
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Section {sections.length + 1}
                </>
              )}
            </Button>
          </div>

          {capturedImages.length > 0 && (
            <div className="p-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                📸 Captured Views ({capturedImages.length})
              </h3>
              <div className="space-y-3">
                {capturedImages.map((img, idx) => (
                  <Card key={img.id} className="p-3 border-2 border-green-200">
                    <div className="flex items-start gap-3">
                      <img 
                        src={img.url} 
                        alt={`Capture ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border-2 border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900">Capture #{idx + 1}</p>
                        <p className="text-xs text-slate-600">Zoom: {img.zoom}</p>
                        <p className="text-xs text-slate-500">{new Date(img.captured_at).toLocaleTimeString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCapturedImage(img.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {sections.length > 0 && (
            <div className="p-6 space-y-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Roof Sections ({sections.length})
                </h3>
              </div>

              {sections.map((section, index) => (
                <Card key={section.id} className="p-4 border-2" style={{ borderColor: section.color }}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: section.color }} />
                      <Input
                        value={section.name}
                        onChange={(e) => updateSectionName(section.id, e.target.value)}
                        className="flex-1 font-semibold"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSection(section.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="bg-slate-50 rounded p-3">
                      <p className="text-xs text-slate-600">Flat Area</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {section.flat_area_sqft.toLocaleString()} sq ft
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">Roof Pitch:</label>
                      <Select value={section.pitch} onValueChange={(value) => updateSectionPitch(section.id, value)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PITCH_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {section.pitch !== 'flat' && (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Actual Surface Area
                        </p>
                        <p className="text-xl font-bold text-green-900">
                          {section.adjusted_area_sqft.toLocaleString()} sq ft
                        </p>
                        <p className="text-xs text-green-600 mt-1">× {section.pitch_multiplier.toFixed(2)} multiplier</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {sections.length > 0 && (
            <div className="sticky bottom-0 p-6 border-t border-slate-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Total Roof Area</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Flat Area:</span>
                  <span className="text-lg font-bold text-slate-900">{totalFlat.toLocaleString()} sq ft</span>
                </div>
                
                {totalAdjusted !== totalFlat && (
                  <div className="flex justify-between items-center pt-2 border-t border-green-200">
                    <span className="text-sm font-semibold text-green-700">Adjusted for Pitch:</span>
                    <span className="text-2xl font-bold text-green-900">{totalAdjusted.toLocaleString()} sq ft</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleCompleteMeasurement}
                disabled={sections.length === 0 || saving || capturingImages}
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                {saving || capturingImages ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Measurement
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          {mapLoading && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-white text-lg">{geocodingStatus}</p>
                <p className="text-slate-400 text-sm mt-2">Address: {address}</p>
              </div>
            </div>
          )}

          {mapError && !mapLoading && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10 p-8">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-bold mb-2">{mapError}</p>
                  <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
                    Refresh Page
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />

          {capturingImages && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Saving Measurement...</h3>
                <p className="text-slate-600">Creating your report</p>
              </div>
            </div>
          )}

          {isDrawing && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10 max-w-md text-center">
              <p className="text-sm font-bold mb-1">🖱️ Click on Map to Draw Section {sections.length + 1}</p>
              <p className="text-xs">Click points around the roof. Double-click to close.</p>
            </div>
          )}

          {sections.length > 0 && !isDrawing && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-green-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10">
              <p className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {sections.length} section{sections.length !== 1 ? 's' : ''} | {capturedImages.length} capture{capturedImages.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}