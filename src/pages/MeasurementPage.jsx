
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, MapPin, Edit3, Trash2, Plus, Layers, TrendingUp, ZoomIn, ZoomOut, Maximize2, RotateCcw, Search } from "lucide-react";
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
  const magnifierMapRef = useRef(null); // Re-added
  const magnifierContainerRef = useRef(null); // Re-added

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
  
  const [magnifierEnabled, setMagnifierEnabled] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  // Removed magnifierLatLng state
  const [magnifierSize, setMagnifierSize] = useState(200);
  const [showMagnifierInstructions, setShowMagnifierInstructions] = useState(true);
  const [capturingImages, setCapturingImages] = useState(false);

  // Derived values for magnifier
  const magnifierRadius = magnifierSize / 2;
  // Removed magnifierZoomOffset
  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc'; // Define API key once

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
        console.log("✅ Google Maps already loaded");
        initializeMap();
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log("⏳ Google Maps script found, waiting for load...");
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkGoogle = setInterval(() => {
          attempts++;
          if (window.google && window.google.maps && window.google.maps.drawing) {
            clearInterval(checkGoogle);
            console.log("✅ Google Maps loaded after", attempts, "attempts");
            initializeMap();
          } else if (attempts >= maxAttempts) {
            clearInterval(checkGoogle);
            console.error("❌ Google Maps timeout");
            setMapError("Google Maps failed to load. Please refresh the page.");
            setMapLoading(false);
          }
        }, 100);
        return;
      }

      console.log("📥 Loading Google Maps script...");
      // Using the defined API key
      const apiKey = GOOGLE_MAPS_API_KEY; 
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("✅ Google Maps script loaded");
        initializeMap();
      };
      script.onerror = () => {
        console.error("❌ Failed to load Google Maps script");
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
      if (currentZoom < 22) {
        mapInstanceRef.current.setZoom(currentZoom + 1);
      }
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom > 18) {
        mapInstanceRef.current.setZoom(currentZoom - 1);
      }
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (mapInstanceRef.current && coordinates) {
      mapInstanceRef.current.setZoom(20);
      mapInstanceRef.current.setCenter(coordinates);
    }
  }, [coordinates]);

  const handleOptimalZoom = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(20);
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!mapInstanceRef.current) return;
      
      if (!isDrawing) {
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
      }
      
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMagnifierEnabled(prev => !prev);
        setShowMagnifierInstructions(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDrawing, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Create magnifier map (separate high-zoom instance)
  useEffect(() => {
    if (!magnifierEnabled || !magnifierContainerRef.current || !mapInstanceRef.current) {
      if (magnifierMapRef.current) {
        magnifierMapRef.current = null;
      }
      return;
    }

    if (!window.google || !window.google.maps) return;

    // Create separate magnifier map at MUCH higher zoom
    if (!magnifierMapRef.current) {
      try {
        const mainMap = mapInstanceRef.current;
        const magnifiedZoom = Math.min(mainMap.getZoom() + 3, 23); // 3 zoom levels higher
        
        magnifierMapRef.current = new window.google.maps.Map(magnifierContainerRef.current, {
          zoom: magnifiedZoom,
          center: mainMap.getCenter(),
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          draggable: false,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          gestureHandling: 'none',
          keyboardShortcuts: false,
          clickableIcons: false,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        console.log("✅ Magnifier map created at zoom:", magnifiedZoom);
      } catch (err) {
        console.error("❌ Error creating magnifier map:", err);
      }
    }
  }, [magnifierEnabled]);

  // Update magnifier zoom when main map zoom changes
  useEffect(() => {
    if (magnifierMapRef.current && magnifierEnabled && mapInstanceRef.current) {
      const mainZoom = mapInstanceRef.current.getZoom();
      const magnifiedZoom = Math.min(mainZoom + 3, 23);
      magnifierMapRef.current.setZoom(magnifiedZoom);
    }
  }, [currentZoom, magnifierEnabled]);

  // Track cursor and update magnifier center
  useEffect(() => {
    if (!magnifierEnabled || !mapRef.current || !mapInstanceRef.current) return;

    const mapElement = mapRef.current;
    
    const handleMouseMove = (e) => {
      const rect = mapElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMagnifierPosition({ x, y });

      // Calculate lat/lng under cursor
      try {
        const bounds = mapInstanceRef.current.getBounds();
        if (!bounds) return;

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        if (!ne || !sw) return;
        
        const latRange = ne.lat() - sw.lat();
        const lngRange = ne.lng() - sw.lng();
        
        const latPercent = 1 - (y / rect.height);
        const lngPercent = x / rect.width;
        
        const cursorLat = sw.lat() + (latRange * latPercent);
        const cursorLng = sw.lng() + (lngRange * lngPercent);
        
        // Update magnifier map center to cursor location
        if (magnifierMapRef.current && window.google && window.google.maps) {
          const cursorLatLng = new window.google.maps.LatLng(cursorLat, cursorLng);
          magnifierMapRef.current.setCenter(cursorLatLng);
        }
      } catch (err) {
        // Silent
      }
    };

    mapElement.addEventListener('mousemove', handleMouseMove);
    mapElement.style.cursor = magnifierEnabled ? 'none' : 'default';

    return () => {
      mapElement.removeEventListener('mousemove', handleMouseMove);
      mapElement.style.cursor = 'default';
    };
  }, [magnifierEnabled]);

  const createMap = useCallback((center) => {
    try {
      console.log("🗺️ Creating map with center:", center);
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 20,
        minZoom: 18,
        maxZoom: 22,
        mapTypeId: "satellite",
        tilt: 0,
        
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        },
        
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
        fullscreenControlOptions: {
          position: window.google.maps.ControlPosition.TOP_RIGHT
        },
        rotateControl: false,
        scaleControl: true
      });

      mapInstanceRef.current = map;
      console.log("✅ Map created successfully");

      window.google.maps.event.addListener(map, 'zoom_changed', () => {
        const newZoom = map.getZoom();
        setCurrentZoom(newZoom);
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
      console.error("❌ Error creating map:", err);
      setMapError(`Error creating map: ${err.message}`);
      setMapLoading(false);
    }
  }, [address]);

  const initializeMap = useCallback(async () => {
    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps not available");
      }

      console.log("🗺️ Initializing map for address:", address);

      const defaultCenter = { lat: 32.7767, lng: -96.7970 };

      if (coordinates) {
        console.log("📍 Using provided coordinates:", coordinates);
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
          const geocodedCenter = {
            lat: location.lat(),
            lng: location.lng()
          };
          
          console.log("✅ Address geocoded:", geocodedCenter);
          setCoordinates(geocodedCenter);
          setGeocodingStatus("Address found!");
          createMap(geocodedCenter);
        } else {
          console.warn("⚠️ Geocoding failed:", status);
          setMapError(`Could not find address (${status}). Showing default location.`);
          setGeocodingStatus("Using default location");
          createMap(defaultCenter);
        }
      });

    } catch (err) {
      console.error("❌ Failed to initialize map:", err);
      setMapError(`Failed to initialize map: ${err.message}`);
      setMapLoading(false);
    }
  }, [address, coordinates, createMap]);

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
      const areaInSquareFeet = areaInSquareMeters * 10.764;
      return Math.round(areaInSquareFeet * 100) / 100;
    } catch (err) {
      console.error("Error calculating area:", err);
      return 0;
    }
  }, []);

  const startDrawingSection = useCallback(() => {
    console.log("🎨 Start drawing button clicked");
    console.log("Map instance:", !!mapInstanceRef.current);
    console.log("Google Maps available:", !!window.google?.maps);
    console.log("Drawing library available:", !!window.google?.maps?.drawing);
    
    if (!mapInstanceRef.current) {
      console.error("❌ Map not initialized");
      setError("Map not initialized. Please wait for the map to load.");
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.drawing) {
      console.error("❌ Drawing tools not available");
      setError("Drawing tools not available. Please refresh the page.");
      return;
    }
    
    console.log("✅ All checks passed, starting drawing mode");
    setIsDrawing(true);
    setError("");
    
    if (drawingManagerRef.current) {
      console.log("🧹 Cleaning up existing drawing manager");
      drawingManagerRef.current.setMap(null);
    }

    const colorIndex = sections.length % SECTION_COLORS.length;
    const sectionColor = SECTION_COLORS[colorIndex];
    console.log("🎨 Using color:", sectionColor.name);

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
      console.log("✅ Drawing manager created and attached to map");

      window.google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
        console.log("✅ Polygon completed!");
        polygonsRef.current.push(polygon);
        
        const path = polygon.getPath();
        const coordinates = [];
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          coordinates.push({
            lat: point.lat(),
            lng: point.lng()
          });
        }
        
        const flatArea = calculateArea(polygon);
        console.log("📏 Calculated area:", flatArea, "sq ft");
        
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
        console.log("✅ Section added to state");
        
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
              ? {
                  ...s,
                  flat_area_sqft: newArea,
                  adjusted_area_sqft: newArea * s.pitch_multiplier,
                  coordinates: newCoords
                }
              : s
          ));
        };

        window.google.maps.event.addListener(path, 'set_at', updateSection);
        window.google.maps.event.addListener(path, 'insert_at', updateSection);
        window.google.maps.event.addListener(path, 'remove_at', updateSection);
      });
      
      console.log("✅ Polygon complete listener added");
    } catch (err) {
      console.error("❌ Error creating drawing manager:", err);
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

  const getTotalFlatArea = () => {
    return sections.reduce((sum, section) => sum + section.flat_area_sqft, 0);
  };

  const getTotalAdjustedArea = () => {
    return sections.reduce((sum, section) => sum + section.adjusted_area_sqft, 0);
  };

  const calculateRoofComponents = useCallback((sections) => {
    console.log("📐 Calculating roof components for", sections.length, "sections");
    
    let totalFlatArea = 0;
    let totalActualArea = 0;
    let totalEaves = 0;
    let totalRakes = 0;
    let totalRidges = 0;
    let totalHips = 0;
    let totalValleys = 0;
    let totalSteps = 0;
    
    const pitchBreakdown = {};
    
    sections.forEach(section => {
      const flatArea = section.flat_area_sqft;
      const pitchMultiplier = section.pitch_multiplier;
      const actualArea = section.adjusted_area_sqft;
      
      totalFlatArea += flatArea;
      totalActualArea += actualArea;
      
      // Track pitch breakdown
      const pitchKey = section.pitch || "flat";
      if (!pitchBreakdown[pitchKey]) {
        pitchBreakdown[pitchKey] = 0;
      }
      pitchBreakdown[pitchKey] += actualArea / 100; // Convert to squares
      
      // Calculate perimeter (approximate based on area)
      const avgDimension = Math.sqrt(flatArea); // This is a very crude estimation
      const perimeter = avgDimension * 4; // Assuming a square-like shape for perimeter estimation
      
      // EAVES: Bottom edges (40% of perimeter)
      totalEaves += perimeter * 0.4;
      
      // RAKES: Sloped edges (30% of perimeter, adjusted for pitch)
      totalRakes += (perimeter * 0.3) * pitchMultiplier;
      
      // RIDGES: Peak lines (~50% of longest dimension)
      totalRidges += avgDimension * 0.5;
      
      // HIPS: External corners (30% adjusted for pitch)
      const hipEstimate = avgDimension * 0.3 * pitchMultiplier;
      totalHips += hipEstimate;
      
      // VALLEYS: Internal corners (20% adjusted for pitch)
      const valleyEstimate = avgDimension * 0.2 * pitchMultiplier;
      totalValleys += valleyEstimate;
      
      // STEPS: Wall intersections (15% of perimeter)
      totalSteps += perimeter * 0.15;
    });
    
    const measurements = {
      totalFlatArea: Math.round(totalFlatArea * 100) / 100,
      totalActualArea: Math.round(totalActualArea * 100) / 100,
      totalSquares: Math.round((totalActualArea / 100) * 100) / 100,
      
      eaves: Math.round(totalEaves * 10) / 10,
      rakes: Math.round(totalRakes * 10) / 10,
      ridges: Math.round(totalRidges * 10) / 10,
      hips: Math.round(totalHips * 10) / 10,
      valleys: Math.round(totalValleys * 10) / 10,
      steps: Math.round(totalSteps * 10) / 10,
      walls: 0, // Placeholder, can be estimated more accurately with proper geometry processing
      
      pitchBreakdown: pitchBreakdown
    };
    
    console.log("✅ Roof components calculated:", measurements);
    return measurements;
  }, []);

  // NEW: Function to capture satellite view (clean map without UI)
  const captureSatelliteView = async () => {
    const mapContainer = mapRef.current;
    
    if (!mapContainer) {
      console.error('Map container not found for satellite capture');
      return null;
    }
    
    try {
      console.log('📸 Capturing satellite view...');
      
      // Hide ALL UI elements temporarily
      const uiElements = document.querySelectorAll(
        '.gmnoprint, .gm-style-cc, .gm-bundled-control, .gm-svpc, .gm-control-active'
      );
      const originalDisplays = Array.from(uiElements).map(el => el.style.display);
      uiElements.forEach(el => el.style.display = 'none');
      
      // Also hide our custom UI overlays
      const customUI = document.querySelectorAll('[style*="z-index: 10"], [style*="z-index: 1000"]');
      const originalCustomDisplays = Array.from(customUI).map(el => el.style.display);
      customUI.forEach(el => el.style.display = 'none');
      
      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture clean satellite view
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight
      });
      
      // Restore UI elements
      uiElements.forEach((el, i) => el.style.display = originalDisplays[i]);
      customUI.forEach((el, i) => el.style.display = originalCustomDisplays[i]);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      console.log('✅ Satellite view captured successfully');
      
      return dataUrl;
      
    } catch (error) {
      console.error('❌ Error capturing satellite view:', error);
      return null;
    }
  };

  // NEW: Function to capture measurement diagram (map with drawn polygons)
  const captureMeasurementDiagram = async () => {
    const mapContainer = mapRef.current;
    
    if (!mapContainer) {
      console.error('Map container not found for diagram capture');
      return null;
    }
    
    try {
      console.log('📸 Capturing measurement diagram...');
      
      // Hide UI controls but KEEP polygons visible
      const uiElements = document.querySelectorAll(
        '.gmnoprint, .gm-style-cc, .gm-bundled-control, .gm-svpc, .gm-control-active'
      );
      const originalDisplays = Array.from(uiElements).map(el => el.style.display);
      uiElements.forEach(el => el.style.display = 'none');
      
      // Hide custom UI overlays but keep polygons
      const customUI = document.querySelectorAll('[style*="z-index: 10"], [style*="z-index: 1000"]');
      const originalCustomDisplays = Array.from(customUI).map(el => el.style.display);
      customUI.forEach(el => el.style.display = 'none');
      
      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture map with drawn sections
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight
      });
      
      // Restore UI
      uiElements.forEach((el, i) => el.style.display = originalDisplays[i]);
      customUI.forEach((el, i) => el.style.display = originalCustomDisplays[i]);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      console.log('✅ Measurement diagram captured successfully');
      
      return dataUrl;
      
    } catch (error) {
      console.error('❌ Error capturing measurement diagram:', error);
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
      const totalAdjusted = getTotalAdjustedArea();
      const sectionsData = sections.map(({ polygon, ...section }) => section);
      const roofComponents = calculateRoofComponents(sections);

      // CAPTURE IMAGES BEFORE SAVING
      console.log('📸 Starting image capture...');
      
      // Capture satellite view (clean map)
      const satelliteImage = await captureSatelliteView();
      
      // Capture measurement diagram (with polygons)
      const measurementDiagram = await captureMeasurementDiagram();
      
      console.log('📸 Image capture complete:', {
        satelliteImage: satelliteImage ? 'captured' : 'failed',
        measurementDiagram: measurementDiagram ? 'captured' : 'failed'
      });

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
        
        // ADD CAPTURED IMAGES
        satellite_image: satelliteImage,
        measurement_diagram: measurementDiagram,
        
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

      if (savedMeasurement.customer_email) {
        try {
          console.log("📧 EMAIL WOULD BE SENT TO:", savedMeasurement.customer_email);
        } catch (emailError) {
          console.error("Email send failed (non-blocking):", emailError);
        }
      }

      if (!savedMeasurementId) {
        throw new Error("Failed to get measurement ID");
      }

      const resultsUrl = createPageUrl(`Results?measurementid=${savedMeasurementId}`);
      navigate(resultsUrl);
      
    } catch (err) {
      console.error("ERROR SAVING MEASUREMENT:", err);
      setError(`Failed to save measurement: ${err.message}. Please try again.`);
      setSaving(false);
      setCapturingImages(false);
    }
  }, [sections, address, measurementId, navigate, calculateRoofComponents]);

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
      {/* Header */}
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
        {/* Left Sidebar */}
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
          {/* Title and Address - Fixed at top */}
          <div className="flex-shrink-0">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Measure Your Roof</h2>
              <p className="text-sm text-slate-600">
                Draw each roof section separately, then adjust pitch for accurate measurements
              </p>
            </div>

            {/* Address Display */}
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
          </div>

          {/* STICKY SECTION - Drawing Button + Roof Sections */}
          <div className="flex-1 overflow-y-auto">
            {/* Drawing Button - Always visible at top of scrollable area */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
              <div className="p-4">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}
                
                {mapLoading && (
                  <Alert className="mb-4 bg-blue-50 border-blue-200">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <AlertDescription className="text-sm text-blue-900">
                      Loading map... Please wait before drawing.
                    </AlertDescription>
                  </Alert>
                )}

                {mapError && (
                  <Alert variant="destructive" className="mb-4">
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
                
                <Button
                  onClick={startDrawingSection}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDrawing || mapLoading || !!mapError}
                >
                  {isDrawing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Drawing Section {sections.length + 1}...
                    </>
                  ) : mapLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading Map...
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
                
                {!mapLoading && !mapError && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Click button, then click points on the map to draw
                  </p>
                )}
              </div>
            </div>

            {/* Roof Sections List - Scrollable */}
            {sections.length > 0 && (
              <div className="p-6 space-y-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Roof Sections ({sections.length})
                  </h3>
                </div>

                {sections.map((section) => (
                  <Card key={section.id} className="p-4 border-2" style={{ borderColor: section.color }}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: section.color }}
                        />
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
                        <p className="text-xs text-slate-600">Flat Area (Satellite View)</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {section.flat_area_sqft.toLocaleString()} sq ft
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-700 mb-1 block">
                          Roof Pitch:
                        </label>
                        <Select
                          value={section.pitch}
                          onValueChange={(value) => updateSectionPitch(section.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PITCH_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
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
                          <p className="text-xs text-green-600 mt-1">
                            × {section.pitch_multiplier.toFixed(2)} multiplier
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Total Area Summary - Sticky at bottom when sections exist */}
            {sections.length > 0 && (
              <div className="sticky bottom-0 p-6 border-t border-slate-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Total Roof Area</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Flat Area:</span>
                    <span className="text-lg font-bold text-slate-900">
                      {totalFlat.toLocaleString()} sq ft
                    </span>
                  </div>
                  
                  {totalAdjusted !== totalFlat && (
                    <div className="flex justify-between items-center pt-2 border-t border-green-200">
                      <span className="text-sm font-semibold text-green-700">
                        Adjusted for Pitch:
                      </span>
                      <span className="text-2xl font-bold text-green-900">
                        {totalAdjusted.toLocaleString()} sq ft
                      </span>
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
                      {capturingImages ? 'Capturing Images...' : 'Saving...'}
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

            {/* Instructions - Only shown when no sections */}
            {sections.length === 0 && (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-blue-900 mb-2">📐 How to Measure Complex Roofs:</p>
                  <ul className="text-xs text-blue-800 space-y-2">
                    <li>1. Zoom in close and use magnifier for details</li>
                    <li>2. Draw each roof plane separately (front, back, sides)</li>
                    <li>3. Include garage, additions, and all roof sections</li>
                    <li>4. After drawing, select pitch for each section</li>
                    <li>5. Tool calculates actual 3D surface area</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Magnifying Glass Section */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                Magnifying Glass
              </h3>

              <Button
                onClick={() => setMagnifierEnabled(!magnifierEnabled)}
                className={`w-full h-12 mb-3 text-lg font-bold ${
                  magnifierEnabled
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Search className="w-5 h-5 mr-2" />
                {magnifierEnabled ? '🔍 Magnifier ON' : '🔍 Magnifier OFF'}
              </Button>

              {magnifierEnabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">
                      Magnifier Size: {magnifierSize}px
                    </label>
                    <input
                      type="range"
                      min="100" 
                      max="300"
                      step="25"
                      value={magnifierSize}
                      onChange={(e) => setMagnifierSize(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>
                </div>
              )}

              {magnifierEnabled && showMagnifierInstructions && (
                <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg text-xs">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-purple-900">💡 How to Use:</h4>
                    <button
                      onClick={() => setShowMagnifierInstructions(false)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ✕
                    </button>
                  </div>
                  <ul className="text-purple-800 space-y-1">
                    <li>• Move mouse over the roof</li>
                    <li>• Magnifier shows EXACT area under cursor</li>
                    <li>• Click points precisely with magnifier</li>
                    <li>• Press <kbd className="px-1 bg-purple-100 border rounded text-[10px]">M</kbd> to toggle</li>
                  </ul>
                </div>
              )}

              <div className="mt-2 p-2 bg-purple-100 border border-purple-200 rounded text-xs text-purple-800 text-center">
                Press <kbd className="px-2 py-1 bg-white border rounded font-bold">M</kbd> to toggle magnifier
              </div>
            </div>

            {/* Zoom Controls Section */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                🔍 Zoom Controls
              </h3>
              
              <div className={`mb-3 p-2 rounded-lg text-center font-medium ${
                zoomAdvice.type === 'success' ? 'bg-green-100 text-green-800' :
                zoomAdvice.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                <div className="text-lg">{zoomAdvice.icon} Zoom: {currentZoom} / 22</div>
                <div className="text-xs mt-1">{zoomAdvice.message}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  onClick={handleZoomIn}
                  disabled={currentZoom >= 22}
                  className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <ZoomIn className="w-5 h-5 mr-2" />
                  Zoom In
                </Button>
                
                <Button
                  onClick={handleZoomOut}
                  disabled={currentZoom <= 18}
                  className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <ZoomOut className="w-5 h-5 mr-2" />
                  Zoom Out
                </Button>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleResetZoom}
                  variant="outline"
                  className="w-full h-10"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>

                {currentZoom < 20 && (
                  <Button
                    onClick={handleOptimalZoom}
                    className="w-full h-10 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Auto-Zoom to Optimal
                  </Button>
                )}
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-slate-700 mb-2 block">
                  Zoom Level Slider
                </label>
                <input
                  type="range"
                  min="18"
                  max="22"
                  value={currentZoom}
                  onChange={(e) => mapInstanceRef.current?.setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Far (18)</span>
                  <span>Close (22)</span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <div className="font-bold mb-1">⌨️ Keyboard Shortcuts:</div>
                <div>• Press <kbd className="px-1 bg-white border rounded">+</kbd> to zoom in</div>
                <div>• Press <kbd className="px-1 bg-white border rounded">-</kbd> to zoom out</div>
                <div>• Press <kbd className="px-1 bg-white border rounded">0</kbd> to reset</div>
              </div>
            </div>

            {/* Zoom Tutorial */}
            {showZoomTutorial && sections.length === 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-blue-900">💡 Measurement Tip</h4>
                  <button
                    onClick={() => setShowZoomTutorial(false)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-blue-800 mb-2">
                  Use zoom controls and magnifying glass for accurate measurements
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>🖱️ Mouse wheel to zoom</li>
                  <li>📱 Pinch to zoom on mobile</li>
                  <li>🔘 Click +/- buttons above</li>
                  <li>🔍 Magnifier tracks cursor EXACTLY</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {mapLoading && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-white text-lg">{geocodingStatus}</p>
                <p className="text-slate-400 text-sm mt-2">Address: {address}</p>
                <p className="text-slate-500 text-xs mt-4">Loading Google Maps drawing tools...</p>
              </div>
            </div>
          )}

          {mapError && !mapLoading && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10 p-8">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-bold mb-2">{mapError}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    className="mt-2"
                  >
                    Refresh Page
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />

          {/* Capturing Images Overlay */}
          {capturingImages && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  📸 Capturing Satellite Imagery
                </h3>
                <p className="text-slate-600 mb-1">
                  Creating high-quality images for your report...
                </p>
                <p className="text-sm text-slate-500">
                  This takes just a moment
                </p>
              </div>
            </div>
          )}

          {/* MAGNIFIER - Separate high-zoom map in circular lens */}
          {magnifierEnabled && !capturingImages && (
            <div
              style={{
                position: 'absolute',
                left: magnifierPosition.x - magnifierRadius,
                top: magnifierPosition.y - magnifierRadius,
                width: magnifierSize,
                height: magnifierSize,
                borderRadius: '50%',
                border: '4px solid #9333ea',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 1000,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                background: '#1e293b'
              }}
            >
              {/* Separate Google Maps instance at higher zoom */}
              <div
                ref={magnifierContainerRef}
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
              
              {/* Crosshair overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '40px',
                  height: '40px',
                  pointerEvents: 'none',
                  zIndex: 1001
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#9333ea',
                  transform: 'translateY(-50%)',
                  boxShadow: '0 0 4px rgba(147, 51, 234, 0.8)'
                }} />
                
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: '#9333ea',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 4px rgba(147, 51, 234, 0.8)'
                }} />
                
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#9333ea',
                  border: '2px solid white',
                  boxShadow: '0 0 6px rgba(147, 51, 234, 0.9)'
                }} />
              </div>
            </div>
          )}

          {/* Drawing Indicator */}
          {isDrawing && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10 max-w-md text-center">
              <p className="text-sm font-bold mb-1">
                🖱️ Click on Map to Draw Section {sections.length + 1}
              </p>
              <p className="text-xs">
                Click points around the roof section. Double-click to close the polygon.
              </p>
            </div>
          )}

          {/* Section Count Indicator */}
          {sections.length > 0 && !isDrawing && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-green-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10">
              <p className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {sections.length} section{sections.length !== 1 ? 's' : ''} drawn | {totalAdjusted.toLocaleString()} sq ft total
              </p>
            </div>
          )}

          {/* Mobile Zoom Controls */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 lg:hidden z-10">
            <Button
              onClick={handleZoomIn}
              disabled={currentZoom >= 22}
              className="h-14 w-14 bg-white hover:bg-slate-50 text-blue-600 shadow-lg rounded-full"
              size="icon"
            >
              <ZoomIn className="w-6 h-6" />
            </Button>
            <Button
              onClick={handleZoomOut}
              disabled={currentZoom <= 18}
              className="h-14 w-14 bg-white hover:bg-slate-50 text-blue-600 shadow-lg rounded-full"
              size="icon"
            >
              <ZoomOut className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
