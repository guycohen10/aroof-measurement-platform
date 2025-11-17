
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, MapPin, Edit3, Trash2, Plus, Layers, ZoomIn, ZoomOut, Maximize2, RotateCcw, Camera, X, Info, Square, Circle as CircleIcon, Pentagon, Eraser, MousePointer } from "lucide-react";
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
  { stroke: '#8b5cf6', fill: '#8b5cf6', name: 'Violet' },
  { stroke: '#14b8a6', fill: '#14b8a6', name: 'Teal' },
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
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const polygonsRef = useRef([]);
  const containerRef = useRef(null);
  
  const [address, setAddress] = useState("");
  const [measurementId, setMeasurementId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [geocodingStatus, setGeocodingStatus] = useState("Initializing map...");
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  
  const [capturedImages, setCapturedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [sections, setSections] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [currentZoom, setCurrentZoom] = useState(20);
  const [capturing, setCapturing] = useState(false);
  
  // Drawing tools state
  const [drawingShape, setDrawingShape] = useState('polygon');
  const [lineThickness, setLineThickness] = useState(3);
  const [selectedColor, setSelectedColor] = useState(SECTION_COLORS[0]);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);
  const [shapeOpacity, setShapeOpacity] = useState(0.5);

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

  const createMap = useCallback((center) => {
    if (!mapRef.current) {
      console.error("❌ Map container ref is null");
      setTimeout(() => createMap(center), 200);
      return;
    }

    try {
      console.log("✅ Creating Google Map with center:", center);
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 20,
        minZoom: 18,
        maxZoom: 22,
        mapTypeId: "satellite",
        tilt: 0,
        zoomControl: false,
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
      console.log("✅ Map instance created");
      
      window.google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
        console.log("✅ Google Map tiles loaded successfully.");
        setMapLoading(false);
        setMapError("");
      });
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

    } catch (err) {
      console.error("❌ Error creating map instance:", err);
      setMapError(`Error creating map: ${err.message}`);
      setMapLoading(false);
    }
  }, [address]);

  const initializeMap = useCallback(async () => {
    console.log("🔄 initializeMap called");
    
    if (!mapRef.current) {
      console.log("⏳ Map ref not ready, retrying in 100ms...");
      setTimeout(initializeMap, 100); 
      return;
    }

    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps API not loaded");
      }

      console.log("✅ Google Maps API available");
      const defaultCenter = { lat: 32.7767, lng: -96.7970 };

      if (coordinates) {
        console.log("✅ Using provided coordinates:", coordinates);
        createMap(coordinates);
        return;
      }

      setGeocodingStatus("Finding address location...");
      console.log("🔄 Geocoding address:", address);
      
      const geocoder = new window.google.maps.Geocoder();
      let geocodingCompleted = false;
      
      const geocodeTimeout = setTimeout(() => {
        if (!geocodingCompleted) {
          console.warn("⚠️ Geocoding timed out after 10 seconds. Using default map center.");
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
          console.log("✅ Address successfully geocoded:", geocodedCenter);
          setCoordinates(geocodedCenter);
          setGeocodingStatus("Address found!");
          createMap(geocodedCenter);
        } else {
          console.error("❌ Geocoding failed:", status);
          setMapError(`Could not find address (${status}). Showing default location.`);
          setGeocodingStatus("Using default location");
          createMap(defaultCenter);
        }
      });
    } catch (err) {
      console.error("❌ Failed to initialize map (catch block):", err);
      setMapError(`Failed to initialize map: ${err.message}`);
      setMapLoading(false);
    }
  }, [address, coordinates, createMap]);

  useEffect(() => {
    if (!address) {
      console.log("⏳ Waiting for address...");
      return;
    }

    console.log("🚀 Starting Google Maps load process");

    const loadGoogleMaps = () => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        console.log("✅ Google Maps already loaded");
        setTimeout(initializeMap, 300); 
        return;
      }

      // Check if script tag exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log("⏳ Script tag exists, waiting for load...");
        let attempts = 0;
        const maxAttempts = 30; 
        
        const checkInterval = setInterval(() => {
          attempts++;
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            console.log("✅ Google Maps API detected after waiting.");
            setTimeout(initializeMap, 300);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error("❌ Google Maps API did not load within expected time.");
            setMapError("Google Maps failed to load. Please refresh the page.");
            setMapLoading(false);
          }
        }, 200);
        return;
      }

      // Create new script
      console.log("📥 Loading Google Maps script...");
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing,places&callback=initGoogleMapsCallback`;
      script.async = true;
      script.defer = true;
      
      window.initGoogleMapsCallback = () => {
        console.log("✅ Google Maps callback fired");
        delete window.initGoogleMapsCallback; 
        setTimeout(initializeMap, 300);
      };
      
      script.onerror = (e) => {
        console.error("❌ Script load error:", e);
        setMapError("Failed to load Google Maps. Please check your internet connection.");
        setMapLoading(false);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [address, initializeMap, GOOGLE_MAPS_API_KEY]);

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

  const handleCaptureView = useCallback(async () => {
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
      
      const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=800x600&scale=2&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
      
      const testImg = new Image();
      
      testImg.onload = () => {
        const newImage = {
          id: `capture-${Date.now()}`,
          url: imageUrl,
          zoom: zoom,
          center: { lat, lng },
          sections: [],
          width: 800,
          height: 600,
          captured_at: new Date().toISOString()
        };
        
        setCapturedImages(prev => [...prev, newImage]);
        setCapturing(false);
      };
      
      testImg.onerror = () => {
        setCapturing(false);
        alert('⚠️ GOOGLE MAPS STATIC API NOT ENABLED\n\nTo fix: Enable "Maps Static API" in Google Cloud Console');
      };
      
      testImg.src = imageUrl;
      
    } catch (err) {
      alert('Failed to capture image: ' + err.message);
      setCapturing(false);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  const selectImageForDrawing = useCallback((index) => {
    setSelectedImageIndex(index);
    setIsDrawingMode(true);
    setSections(capturedImages[index].sections || []);
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
    setEditMode(false);
    setSelectedSection(null);
  }, [capturedImages]);

  const removeCapturedImage = useCallback((index) => {
    if (confirm('Remove this captured view?')) {
      setCapturedImages(prev => prev.filter((_, i) => i !== index));
      if (selectedImageIndex === index) {
        setSelectedImageIndex(null);
        setIsDrawingMode(false);
      }
    }
  }, [selectedImageIndex]);

  const exitDrawingMode = useCallback(() => {
    setSelectedImageIndex(null);
    setIsDrawingMode(false);
    setSections([]);
    setIsDrawing(false);
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
    setEditMode(false);
    setSelectedSection(null);
  }, []);

  const handleCanvasZoomIn = useCallback(() => {
    setCanvasZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleCanvasZoomOut = useCallback(() => {
    setCanvasZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleCanvasResetZoom = useCallback(() => {
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
  }, []);

  const clearAllSections = useCallback(() => {
    if (confirm('Clear all sections from this image?')) {
      setSections([]);
      setSelectedSection(null);
      if (selectedImageIndex !== null) {
        setCapturedImages(prev => prev.map((img, i) => 
          i === selectedImageIndex ? { ...img, sections: [] } : img
        ));
      }
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [selectedImageIndex]);

  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    sections.forEach(section => {
      if (section.points && section.points.length > 0) {
        const isSelected = selectedSection?.id === section.id;
        const opacity = section.opacity !== undefined ? section.opacity : shapeOpacity;
        
        ctx.fillStyle = section.color + Math.round(opacity * 255).toString(16).padStart(2, '0');
        ctx.strokeStyle = section.color;
        ctx.lineWidth = section.lineThickness || 3;
        
        if (isSelected) {
          ctx.lineWidth = (section.lineThickness || 3) + 2;
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(section.points[0].x, section.points[0].y);
        for (let i = 1; i < section.points.length; i++) {
          ctx.lineTo(section.points[i].x, section.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw edit handles if selected
        if (isSelected && editMode) {
          section.points.forEach((point, idx) => {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = section.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          });
        }
      }
    });
  }, [sections, selectedSection, editMode, shapeOpacity]);

  const setupDrawingCanvas = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const rect = img.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleCanvasClick = useCallback((e) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Edit mode - select section or point
    if (editMode && !isDrawing) {
      // Check if clicking on a point handle
      if (selectedSection) {
        for (let i = 0; i < selectedSection.points.length; i++) {
          const point = selectedSection.points[i];
          const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
          if (distance < 10) {
            setDraggedPointIndex(i);
            return;
          }
        }
      }
      
      // Check if clicking inside a section
      const ctx = canvas.getContext('2d');
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.points) {
          ctx.beginPath();
          ctx.moveTo(section.points[0].x, section.points[0].y);
          for (let j = 1; j < section.points.length; j++) {
            ctx.lineTo(section.points[j].x, section.points[j].y);
          }
          ctx.closePath();
          
          if (ctx.isPointInPath(x, y)) {
            setSelectedSection(section);
            redrawCanvas();
            return;
          }
        }
      }
      
      // Clicked outside - deselect
      setSelectedSection(null);
      redrawCanvas();
    }
  }, [editMode, isDrawing, selectedSection, sections, redrawCanvas]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!canvasRef.current || !editMode || draggedPointIndex === null || !selectedSection) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const updatedPoints = [...selectedSection.points];
    updatedPoints[draggedPointIndex] = { x, y };
    
    const updatedSection = { ...selectedSection, points: updatedPoints };
    const updatedSections = sections.map(s => s.id === selectedSection.id ? updatedSection : s);
    
    setSections(updatedSections);
    setSelectedSection(updatedSection);
    
    if (selectedImageIndex !== null) {
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
    }
  }, [editMode, draggedPointIndex, selectedSection, sections, selectedImageIndex]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggedPointIndex(null);
  }, []);

  const startDrawingSection = useCallback(() => {
    if (!canvasRef.current || selectedImageIndex === null) {
      setError("Please select a captured image first");
      return;
    }
    
    if (editMode) {
      setError("Exit edit mode to draw new sections");
      return;
    }
    
    setIsDrawing(true);
    setError("");
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const points = [];
    let startPoint = null;

    let isDrawingActive = true;

    const handleClick = (e) => {
      if (!isDrawingActive) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      if (drawingShape === 'polygon') {
        points.push({ x, y });
        
        ctx.fillStyle = selectedColor.stroke;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        if (points.length > 1) {
          ctx.strokeStyle = selectedColor.stroke;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      } else if (drawingShape === 'rectangle' || drawingShape === 'circle') {
        if (!startPoint) {
          startPoint = { x, y };
          ctx.fillStyle = selectedColor.stroke;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawingActive || !startPoint) return;
      if (drawingShape !== 'rectangle' && drawingShape !== 'circle') return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      redrawCanvas();
      
      ctx.strokeStyle = selectedColor.stroke;
      ctx.lineWidth = lineThickness;
      const opacity = shapeOpacity;
      ctx.fillStyle = selectedColor.fill + Math.round(opacity * 255).toString(16).padStart(2, '0');
      
      if (drawingShape === 'rectangle') {
        const width = x - startPoint.x;
        const height = y - startPoint.y;
        ctx.beginPath();
        ctx.rect(startPoint.x, startPoint.y, width, height);
        ctx.fill();
        ctx.stroke();
      } else if (drawingShape === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    };

    const finishDrawing = (e) => {
      if (!isDrawingActive) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      let finalPoints = [];
      
      if (drawingShape === 'rectangle' && startPoint) {
        const width = x - startPoint.x;
        const height = y - startPoint.y;
        finalPoints = [
          startPoint,
          { x: startPoint.x + width, y: startPoint.y },
          { x: startPoint.x + width, y: startPoint.y + height },
          { x: startPoint.x, y: startPoint.y + height }
        ];
      } else if (drawingShape === 'circle' && startPoint) {
        const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
        const numPoints = 32;
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * 2 * Math.PI;
          finalPoints.push({
            x: startPoint.x + radius * Math.cos(angle),
            y: startPoint.y + radius * Math.sin(angle)
          });
        }
      }
      
      if (finalPoints.length > 0) {
        completeSection(finalPoints);
      }
    };

    const handleDblClick = () => {
      if (drawingShape !== 'polygon') return;
      if (points.length < 3) {
        alert('Please click at least 3 points');
        return;
      }
      
      completeSection(points);
    };

    const completeSection = (sectionPoints) => {
      isDrawingActive = false;
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('dblclick', handleDblClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
      
      const staticMapImageWidth = capturedImages[selectedImageIndex].width || 800;
      const zoomLevel = capturedImages[selectedImageIndex].zoom || 20;
      const centerLat = capturedImages[selectedImageIndex].center.lat;
      const metersPerPixel = (156543.03392 * Math.cos(centerLat * Math.PI / 180)) / Math.pow(2, zoomLevel);
      
      const areaPixels = Math.abs(sectionPoints.reduce((sum, point, i) => {
        const nextPoint = sectionPoints[(i + 1) % sectionPoints.length];
        return sum + (point.x * nextPoint.y - nextPoint.x * point.y);
      }, 0) / 2);
      
      const areaMeters = areaPixels * (metersPerPixel * metersPerPixel);
      const areaSqFt = areaMeters * 10.7639;
      
      const newSection = {
        id: `section-${Date.now()}`,
        name: `Section ${sections.length + 1}`,
        flat_area_sqft: Math.round(areaSqFt * 100) / 100,
        pitch: 'flat',
        pitch_multiplier: 1.00,
        adjusted_area_sqft: Math.round(areaSqFt * 100) / 100,
        color: selectedColor.stroke,
        lineThickness: lineThickness,
        opacity: shapeOpacity,
        shape: drawingShape,
        points: sectionPoints
      };

      const updatedSections = [...sections, newSection];
      setSections(updatedSections);
      
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
      
      setIsDrawing(false);
      redrawCanvas();
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('dblclick', handleDblClick);
    
    if (drawingShape === 'rectangle' || drawingShape === 'circle') {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', finishDrawing);
    }
  }, [sections, selectedImageIndex, capturedImages, drawingShape, lineThickness, selectedColor, shapeOpacity, editMode, redrawCanvas]);

  const deleteSection = useCallback((sectionId) => {
    const updatedSections = sections.filter(s => s.id !== sectionId);
    setSections(updatedSections);
    
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
    
    if (selectedImageIndex !== null) {
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
    }
    
    redrawCanvas();
  }, [sections, selectedSection, selectedImageIndex, redrawCanvas]);

  const updateSectionPitch = useCallback((sectionId, pitchValue) => {
    const pitchOption = PITCH_OPTIONS.find(p => p.value === pitchValue);
    if (!pitchOption) return;

    const updatedSections = sections.map(section => 
      section.id === sectionId
        ? {
            ...section,
            pitch: pitchValue,
            pitch_multiplier: pitchOption.multiplier,
            adjusted_area_sqft: Math.round(section.flat_area_sqft * pitchOption.multiplier * 100) / 100
          }
        : section
    );
    
    setSections(updatedSections);
    
    if (selectedImageIndex !== null) {
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
    }
  }, [sections, selectedImageIndex]);

  const updateSectionName = useCallback((sectionId, name) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId ? { ...section, name } : section
    );
    
    setSections(updatedSections);
    
    if (selectedImageIndex !== null) {
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
    }
  }, [sections, selectedImageIndex]);

  useEffect(() => {
    if (isDrawingMode && selectedImageIndex !== null && imageRef.current) {
      setupDrawingCanvas();
    }
  }, [isDrawingMode, selectedImageIndex, setupDrawingCanvas]);

  const getTotalArea = () => {
    return capturedImages.reduce((total, img) => {
      return total + (img.sections || []).reduce((sum, section) => sum + section.adjusted_area_sqft, 0);
    }, 0);
  };

  const handleCompleteMeasurement = useCallback(async () => {
    if (capturedImages.length === 0) {
      setError("Please capture at least one view");
      return;
    }

    const totalAdjusted = getTotalArea();
    
    if (totalAdjusted < 100) {
      setError("Total area seems too small. Please verify your measurements.");
      return;
    }

    if (totalAdjusted > 50000) {
      setError("Total area seems unusually large. Please verify your measurements.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const allSections = capturedImages.flatMap((img, imgIndex) => 
        (img.sections || []).map(section => ({
          ...section,
          imageIndex: imgIndex
        }))
      );

      const measurementData = {
        property_address: address,
        user_type: "homeowner",
        captured_images: capturedImages,
        measurement_data: {
          total_adjusted_sqft: totalAdjusted,
          sections: allSections
        },
        total_sqft: totalAdjusted,
        total_adjusted_sqft: totalAdjusted,
        payment_amount: 3,
        payment_status: "completed",
        stripe_payment_id: "demo_" + Date.now(),
        status: "completed",
        completed_at: new Date().toISOString()
      };

      let savedMeasurementId = measurementId;

      if (measurementId) {
        await base44.entities.Measurement.update(measurementId, measurementData);
      } else {
        const savedMeasurement = await base44.entities.Measurement.create(measurementData);
        savedMeasurementId = savedMeasurement.id;
      }

      if (!savedMeasurementId) {
        throw new Error("Failed to get measurement ID");
      }

      navigate(createPageUrl(`Results?measurementid=${savedMeasurementId}`));
      
    } catch (err) {
      setError(`Failed to save measurement: ${err.message}. Please try again.`);
      setSaving(false);
    }
  }, [capturedImages, address, measurementId, navigate]);

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

  const totalArea = getTotalArea();
  const getZoomAdvice = () => {
    if (currentZoom >= 21) {
      return { type: 'success', message: 'Perfect zoom - ready to capture', icon: '✓' };
    } else if (currentZoom >= 20) {
      return { type: 'success', message: 'Good zoom level', icon: '✓' };
    } else if (currentZoom >= 19) {
      return { type: 'warning', message: 'Zoom in more for better detail', icon: '⚠️' };
    } else {
      return { type: 'error', message: 'Zoom in closer', icon: '❌' };
    }
  };
  const zoomAdvice = getZoomAdvice();

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
            <p className="text-sm text-slate-600">Follow the steps below</p>
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

            {mapError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{mapError}</AlertDescription>
              </Alert>
            )}

            {mapLoading && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-xs text-blue-900">
                  {geocodingStatus}
                </AlertDescription>
              </Alert>
            )}
            
            {!mapLoading && !mapError && !isDrawingMode && (
              <>
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-900">
                    <strong>Step 1:</strong> Use zoom controls to find best view. Capture as many angles as needed.
                  </AlertDescription>
                </Alert>

                <Card className="p-3 bg-white border-2 border-slate-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                      <span className="text-xs font-bold text-slate-700">Zoom Level</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        zoomAdvice.type === 'success' ? 'bg-green-100 text-green-800' :
                        zoomAdvice.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {zoomAdvice.icon} {currentZoom}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleZoomOut} disabled={currentZoom <= 18} className="flex-1">
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleOptimalZoom} className="flex-1">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleZoomIn} disabled={currentZoom >= 22} className="flex-1">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button size="sm" variant="outline" onClick={handleResetZoom} className="w-full">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset View
                    </Button>
                  </div>
                </Card>

                <Button
                  onClick={handleCaptureView}
                  disabled={capturing}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
                >
                  {capturing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      📸 Capture This View
                    </>
                  )}
                </Button>
              </>
            )}

            {isDrawingMode && (
              <>
                <Alert className={editMode ? "bg-amber-50 border-amber-200" : "bg-purple-50 border-purple-200"}>
                  <Info className={`h-4 w-4 ${editMode ? 'text-amber-600' : 'text-purple-600'}`} />
                  <AlertDescription className={`text-xs ${editMode ? 'text-amber-900' : 'text-purple-900'}`}>
                    <strong>{editMode ? 'Edit Mode:' : 'Drawing Tools:'}</strong> {editMode ? 'Click shape to select, drag points to edit' : 'Select shape, color, thickness and opacity'}
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={!editMode ? 'default' : 'outline'}
                    onClick={() => {
                      setEditMode(false);
                      setSelectedSection(null);
                      redrawCanvas();
                    }}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Draw
                  </Button>
                  <Button
                    size="sm"
                    variant={editMode ? 'default' : 'outline'}
                    onClick={() => {
                      setEditMode(true);
                      setIsDrawing(false);
                    }}
                    className="flex-1"
                  >
                    <MousePointer className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>

                {!editMode && (
                  <Card className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">Shape</label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            variant={drawingShape === 'polygon' ? 'default' : 'outline'}
                            onClick={() => setDrawingShape('polygon')}
                            className="w-full"
                          >
                            <Pentagon className="w-4 h-4 mr-1" />
                            Polygon
                          </Button>
                          <Button
                            size="sm"
                            variant={drawingShape === 'rectangle' ? 'default' : 'outline'}
                            onClick={() => setDrawingShape('rectangle')}
                            className="w-full"
                          >
                            <Square className="w-4 h-4 mr-1" />
                            Box
                          </Button>
                          <Button
                            size="sm"
                            variant={drawingShape === 'circle' ? 'default' : 'outline'}
                            onClick={() => setDrawingShape('circle')}
                            className="w-full"
                          >
                            <CircleIcon className="w-4 h-4 mr-1" />
                            Circle
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">Color</label>
                        <div className="grid grid-cols-5 gap-2">
                          {SECTION_COLORS.map((color) => (
                            <button
                              key={color.stroke}
                              onClick={() => setSelectedColor(color)}
                              className={`w-8 h-8 rounded-full border-2 ${
                                selectedColor.stroke === color.stroke ? 'border-slate-900 scale-110' : 'border-slate-300'
                              } transition-all`}
                              style={{ backgroundColor: color.stroke }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">
                          Line Thickness: {lineThickness}px
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={lineThickness}
                          onChange={(e) => setLineThickness(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">
                          Opacity: {Math.round(shapeOpacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={shapeOpacity * 100}
                          onChange={(e) => {
                            const newOpacity = parseInt(e.target.value) / 100;
                            setShapeOpacity(newOpacity);
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {editMode && selectedSection && (
                  <Card className="p-3 bg-amber-50 border-2 border-amber-200">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-amber-900">Selected: {selectedSection.name}</p>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">
                          Adjust Opacity: {Math.round((selectedSection.opacity || shapeOpacity) * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(selectedSection.opacity || shapeOpacity) * 100}
                          onChange={(e) => {
                            const newOpacity = parseInt(e.target.value) / 100;
                            const updatedSections = sections.map(s => 
                              s.id === selectedSection.id ? { ...s, opacity: newOpacity } : s
                            );
                            setSections(updatedSections);
                            setSelectedSection({ ...selectedSection, opacity: newOpacity });
                            
                            if (selectedImageIndex !== null) {
                              setCapturedImages(prev => prev.map((img, i) => 
                                i === selectedImageIndex ? { ...img, sections: updatedSections } : img
                              ));
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSection(selectedSection.id)}
                        className="w-full text-red-600 border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected
                      </Button>
                    </div>
                  </Card>
                )}

                {!editMode && (
                  <Button
                    onClick={startDrawingSection}
                    disabled={isDrawing}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
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
                )}

                {sections.length > 0 && (
                  <Button
                    onClick={clearAllSections}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Eraser className="w-4 h-4 mr-2" />
                    Clear All Sections
                  </Button>
                )}

                <Button
                  onClick={exitDrawingMode}
                  variant="outline"
                  className="w-full"
                >
                  ← Back to Live Map
                </Button>
              </>
            )}
          </div>

          {capturedImages.length > 0 && !isDrawingMode && (
            <div className="p-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                📸 Captured Views ({capturedImages.length})
              </h3>
              <div className="space-y-3">
                {capturedImages.map((img, idx) => (
                  <Card key={img.id} className="p-3 border-2 border-green-200">
                    <img 
                      src={img.url} 
                      alt={`View ${idx + 1}`}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <div className="text-xs text-slate-600 mb-2">
                      View {idx + 1} - Zoom: {img.zoom}
                      {img.sections?.length > 0 && (
                        <span className="ml-2 text-green-600 font-bold">
                          ({img.sections.length} section{img.sections.length !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => selectImageForDrawing(idx)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Draw on this image
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCapturedImage(idx)}
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

          {isDrawingMode && sections.length > 0 && (
            <div className="p-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                <Layers className="w-4 h-4 inline mr-1" />
                Sections ({sections.length})
              </h3>
              <div className="space-y-3">
                {sections.map((section) => (
                  <Card 
                    key={section.id} 
                    className={`p-3 border-2 ${selectedSection?.id === section.id ? 'ring-2 ring-amber-400' : ''}`}
                    style={{ borderColor: section.color }}
                    onClick={() => {
                      if (editMode) {
                        setSelectedSection(section);
                        redrawCanvas();
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }} />
                        <Input
                          value={section.name}
                          onChange={(e) => updateSectionName(section.id, e.target.value)}
                          className="flex-1 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSection(section.id);
                          }}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-xs">
                        <span className="text-slate-600">Area: </span>
                        <span className="font-bold">{section.flat_area_sqft.toLocaleString()} sq ft</span>
                      </div>

                      <Select value={section.pitch} onValueChange={(value) => updateSectionPitch(section.id, value)}>
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PITCH_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {section.pitch !== 'flat' && (
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-xs text-green-700">
                            Adjusted: <strong>{section.adjusted_area_sqft.toLocaleString()} sq ft</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {capturedImages.length > 0 && (
            <div className="sticky bottom-0 p-6 border-t border-slate-200 bg-gradient-to-br from-green-50 to-blue-50">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Total Roof Area</h3>
              <div className="text-3xl font-bold text-green-900 mb-4">
                {totalArea.toLocaleString()} sq ft
              </div>

              <Button
                onClick={handleCompleteMeasurement}
                disabled={saving}
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? (
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

        <div className="flex-1 bg-slate-900 p-6 overflow-y-auto">
          <div style={{ marginBottom: '50px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              padding: '14px 24px',
              borderRadius: '16px 16px 0 0',
              fontWeight: '600',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <span style={{ fontSize: '24px' }}>🛰️</span>
              Live Satellite View
            </div>
            <div className="relative">
              <div 
                ref={mapRef} 
                style={{ 
                  width: '100%', 
                  height: '700px',
                  borderRadius: '0 0 16px 16px',
                  border: '3px solid #3b82f6',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  backgroundColor: '#1e293b' 
                }} 
              />
              {mapLoading && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0 0 16px 16px',
                  zIndex: 10
                }}>
                  <Loader2 className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-white">{geocodingStatus}</p>
                </div>
              )}
            </div>
          </div>

          <div style={{
            height: '3px',
            background: 'linear-gradient(to right, transparent, #64748b, transparent)',
            marginBottom: '40px',
            borderRadius: '2px'
          }} />

          <div style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)'
          }}>
            <span style={{ fontSize: '28px' }}>🖼️</span>
            Captured Views for Drawing
            {capturedImages.length > 0 && (
              <span style={{ 
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '6px 16px',
                borderRadius: '24px',
                fontSize: '18px',
                fontWeight: '700',
                marginLeft: 'auto'
              }}>
                {capturedImages.length}
              </span>
            )}
          </div>

          {capturedImages.length === 0 && !isDrawingMode && (
            <div style={{
              padding: '80px 40px',
              textAlign: 'center',
              color: '#94a3b8',
              border: '3px dashed #475569',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.5)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📸</div>
              <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>No views captured yet</p>
              <p style={{ fontSize: '15px' }}>Use "Capture This View" button above to start</p>
            </div>
          )}

          {!isDrawingMode && capturedImages.length > 0 && (
            <div className="space-y-8">
              {capturedImages.map((img, idx) => (
                <div 
                  key={img.id} 
                  style={{
                    marginBottom: '32px',
                    border: '3px solid #a855f7',
                    borderRadius: '16px',
                    padding: '20px',
                    background: 'white',
                    boxShadow: '0 8px 24px rgba(168, 85, 247, 0.35)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    <span style={{ fontSize: '16px' }}>🖼️ Captured View {idx + 1}</span>
                    <span style={{ 
                      fontSize: '13px',
                      background: 'rgba(255, 255, 255, 0.25)',
                      padding: '4px 12px',
                      borderRadius: '8px'
                    }}>
                      Zoom: {img.zoom}
                    </span>
                  </div>
                  
                  <img 
                    ref={imageRef} 
                    src={capturedImages[selectedImageIndex]?.url}
                    alt={`Captured view ${idx + 1}`}
                    style={{ 
                      width: '100%', 
                      display: 'block', 
                      minHeight: '400px', 
                      objectFit: 'cover', 
                      background: '#f3f4f6',
                      borderRadius: '12px',
                      marginBottom: '16px'
                    }}
                  />
                  
                  <div style={{ padding: '4px 0' }}>
                    {img.sections?.length > 0 && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#059669', 
                        fontWeight: 'bold', 
                        marginBottom: '12px' 
                      }}>
                        ✓ {img.sections.length} section{img.sections.length !== 1 ? 's' : ''} drawn
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Button
                        onClick={() => selectImageForDrawing(idx)}
                        style={{
                          flex: 1,
                          height: '48px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '15px'
                        }}
                      >
                        ✏️ Draw on This Image
                      </Button>
                      <Button
                        onClick={() => removeCapturedImage(idx)}
                        variant="outline"
                        style={{
                          padding: '0 20px',
                          height: '48px',
                          color: '#ef4444',
                          borderColor: '#fca5a5',
                          fontSize: '18px'
                        }}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isDrawingMode && selectedImageIndex !== null && (
            <div className="flex flex-col items-center">
              <div style={{
                marginBottom: '30px',
                background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                color: 'white',
                padding: '20px 32px',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(168, 85, 247, 0.5)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '1200px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                      {editMode ? '✏️ Edit Mode' : '🎨 Drawing Mode'} - View {selectedImageIndex + 1}
                    </p>
                    <p style={{ fontSize: '15px', opacity: 0.95 }}>
                      {editMode ? 'Click shape to select, drag points to modify' : 
                       drawingShape === 'polygon' ? 'Click points around roof sections. Double-click to finish.' :
                       drawingShape === 'rectangle' ? 'Click and drag to draw a rectangle.' :
                       'Click center, then click edge to set radius.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCanvasZoomOut}
                      disabled={canvasZoom <= 0.5}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCanvasResetZoom}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCanvasZoomIn}
                      disabled={canvasZoom >= 3}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div 
                ref={containerRef}
                style={{ 
                  position: 'relative', 
                  width: '100%', 
                  maxWidth: '1200px',
                  overflow: 'auto',
                  border: '4px solid #a855f7',
                  borderRadius: '16px',
                  boxShadow: '0 12px 40px rgba(168, 85, 247, 0.4)',
                  background: '#1e293b'
                }}
              >
                <div style={{
                  transform: `scale(${canvasZoom}) translate(${canvasPan.x}px, ${canvasPan.y}px)`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s ease-out'
                }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      ref={imageRef}
                      src={capturedImages[selectedImageIndex]?.url}
                      alt="Drawing surface"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                      onLoad={setupDrawingCanvas}
                    />
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        cursor: editMode ? (draggedPointIndex !== null ? 'grabbing' : 'pointer') : (isDrawing ? 'crosshair' : 'default'),
                        pointerEvents: 'all'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
