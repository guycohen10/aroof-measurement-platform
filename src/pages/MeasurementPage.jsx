
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, MapPin, Edit3, Trash2, Plus, Layers, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendMeasurementCompleteEmail } from "../utils/emailAutomation";

// Section colors for visual differentiation
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

// Pitch multipliers for accurate 3D roof surface area calculation
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
  const polygonsRef = useRef([]); // Store all section polygons
  
  const [address, setAddress] = useState("");
  const [measurementId, setMeasurementId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [geocodingStatus, setGeocodingStatus] = useState("Initializing map...");
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  
  // Multi-section state
  const [sections, setSections] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);

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

      const apiKey = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing,places`;
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

  const createMap = useCallback((center) => {
    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 20,
        mapTypeId: "satellite",
        tilt: 0,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ["satellite", "hybrid", "roadmap"]
        },
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        rotateControl: true,
        scaleControl: true
      });

      mapInstanceRef.current = map;

      // Add marker at center
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
          const geocodedCenter = {
            lat: location.lat(),
            lng: location.lng()
          };
          
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
    if (!mapInstanceRef.current) {
      setError("Map not initialized");
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.drawing) {
      setError("Drawing tools not available. Please refresh the page.");
      return;
    }
    
    setIsDrawing(true);
    setError("");
    
    // Remove existing drawing manager if any
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null);
    }

    // Get color for this section
    const colorIndex = sections.length % SECTION_COLORS.length;
    const sectionColor = SECTION_COLORS[colorIndex];

    // Create Drawing Manager
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

    // Listen for polygon completion
    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
      // Store the polygon
      polygonsRef.current.push(polygon);
      
      // Get the points
      const path = polygon.getPath();
      const coordinates = [];
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        coordinates.push({
          lat: point.lat(),
          lng: point.lng()
        });
      }
      
      // Calculate area
      const flatArea = calculateArea(polygon);
      
      // Create new section
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
      
      // Disable drawing mode
      drawingManager.setDrawingMode(null);
      setIsDrawing(false);
      
      // Add listeners for editing
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
    setError("");

    try {
      const totalFlat = getTotalFlatArea();
      const totalAdjusted = getTotalAdjustedArea();

      // Prepare sections data (remove polygon reference)
      const sectionsData = sections.map(({ polygon, ...section }) => section);

      const measurementData = {
        measurement_data: {
          total_flat_sqft: totalFlat,
          total_adjusted_sqft: totalAdjusted,
          sections: sectionsData
        },
        total_sqft: totalFlat, 
        total_adjusted_sqft: totalAdjusted,
        status: "completed",
        completed_at: new Date().toISOString()
      };

      let savedMeasurementId = measurementId;
      let savedMeasurement;

      if (measurementId) {
        await base44.entities.Measurement.update(measurementId, measurementData);
        // Fetch updated measurement for email as update might not return the full object
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

      // Send measurement complete email
      if (savedMeasurement && savedMeasurement.customer_email) {
        try {
          await sendMeasurementCompleteEmail(savedMeasurement);
          console.log("✅ Measurement complete email sent");
        } catch (emailError) {
          console.error("Email send failed (non-blocking):", emailError);
          // Don't block user flow if email fails
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
    }
  }, [sections, address, measurementId, navigate]);

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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Drawing Controls */}
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
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

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <Alert variant="destructive" className="border-none shadow-none bg-transparent p-0">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Drawing Button */}
          <div className="p-6 border-b border-slate-200">
            <Button
              onClick={startDrawingSection}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isDrawing || mapLoading || !!mapError}
            >
              {isDrawing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Drawing...
                </>
              ) : sections.length === 0 ? (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Start Drawing Section 1
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Section
                </>
              )}
            </Button>
          </div>

          {/* Sections List */}
          {sections.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Roof Sections ({sections.length})
                  </h3>
                </div>

                {sections.map((section, index) => (
                  <Card key={section.id} className="p-4 border-2" style={{ borderColor: section.color }}>
                    <div className="space-y-3">
                      {/* Section Name */}
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

                      {/* Flat Area */}
                      <div className="bg-slate-50 rounded p-3">
                        <p className="text-xs text-slate-600">Flat Area (Satellite View)</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {section.flat_area_sqft.toLocaleString()} sq ft
                        </p>
                      </div>

                      {/* Pitch Selector */}
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

                      {/* Adjusted Area */}
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
            </div>
          )}

          {/* Total Area Summary */}
          {sections.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-gradient-to-br from-green-50 to-blue-50">
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
                disabled={sections.length === 0 || saving}
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

          {/* Instructions */}
          {sections.length === 0 && (
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-bold text-blue-900 mb-2">📐 How to Measure Complex Roofs:</p>
                <ul className="text-xs text-blue-800 space-y-2">
                  <li>1. Draw each roof plane separately (front, back, sides)</li>
                  <li>2. Include garage, additions, and all roof sections</li>
                  <li>3. After drawing, select pitch for each section</li>
                  <li>4. Tool calculates actual 3D surface area</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
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
        </div>
      </div>
    </div>
  );
}
