
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, MapPin, Edit3, Trash2, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MeasurementPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonRef = useRef(null);
  const drawingManagerRef = useRef(null);
  
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [geocodingStatus, setGeocodingStatus] = useState("Finding address...");
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [area, setArea] = useState(0);
  const [polygonClosed, setPolygonClosed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Get address and coordinates from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const addressParam = urlParams.get('address');
    const latParam = urlParams.get('lat');
    const lngParam = urlParams.get('lng');
    
    if (!addressParam) {
      navigate(createPageUrl("FormPage"));
      return;
    }
    
    const decodedAddress = decodeURIComponent(addressParam);
    console.log("MeasurementPage: Address from URL:", decodedAddress);
    setAddress(decodedAddress);

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log("MeasurementPage: Using coordinates from URL:", { lat, lng });
        setCoordinates({ lat, lng });
      }
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!address) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.drawing) {
        console.log("Google Maps already loaded, initializing map...");
        initializeMap();
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.drawing) {
            clearInterval(checkGoogle);
            initializeMap();
          }
        }, 100);
        return;
      }

      const apiKey = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("✅ Google Maps script loaded successfully");
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

  const initializeMap = async () => {
    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps not available");
      }

      let center;
      const defaultCenter = { lat: 32.7767, lng: -96.7970 };

      if (coordinates) {
        center = coordinates;
        setGeocodingStatus("Address verified!");
      } else {
        center = defaultCenter;
        setGeocodingStatus("Finding address...");
      }

      console.log("Creating map with center:", center);

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

      // Add a simple test click listener to verify map is interactive
      map.addListener('click', (event) => {
        console.log('Map clicked at:', event.latLng.lat(), event.latLng.lng());
      });

      if (coordinates) {
        setMapError("");
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
        setMapLoading(false);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const geocodedCenter = {
            lat: location.lat(),
            lng: location.lng()
          };
          
          map.setCenter(geocodedCenter);
          map.setZoom(20);
          setCoordinates(geocodedCenter);
          setMapError("");
          setGeocodingStatus("Address found!");
          
          new window.google.maps.Marker({
            position: geocodedCenter,
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
        } else {
          setMapError(`Could not find address. Showing default location.`);
          setGeocodingStatus("Address not found");
        }
        setMapLoading(false);
      });

    } catch (err) {
      console.error("❌ Error initializing map:", err);
      setMapError(`Failed to initialize map: ${err.message}`);
      setMapLoading(false);
    }
  };

  const startDrawing = () => {
    if (!mapInstanceRef.current) {
      console.error("Map not initialized");
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.drawing) {
      console.error("Google Maps Drawing library not loaded");
      setError("Drawing tools not available. Please refresh the page.");
      return;
    }
    
    console.log("Starting drawing mode...");
    setIsDrawing(true);
    setPolygonClosed(false);
    setArea(0);
    setError("");
    
    // Clear existing polygon if any
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // Remove existing drawing manager if any
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null);
    }

    // Create Drawing Manager with Google's built-in drawing tools
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false, // We control it with our own button
      polygonOptions: {
        fillColor: '#4A90E2',
        fillOpacity: 0.4,
        strokeWeight: 3,
        strokeColor: '#4A90E2',
        editable: true,
        draggable: false,
        clickable: true
      }
    });

    drawingManagerRef.current = drawingManager;
    drawingManager.setMap(mapInstanceRef.current);

    console.log("Drawing Manager created and attached to map");

    // Listen for polygon completion
    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
      console.log("Polygon completed!");
      
      // Store the polygon
      polygonRef.current = polygon;
      
      // Get the points
      const path = polygon.getPath();
      const points = [];
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        points.push({
          lat: point.lat(),
          lng: point.lng()
        });
      }
      
      console.log("Polygon points:", points);
      setPolygonPoints(points);
      
      // Calculate area
      calculateArea(polygon);
      
      // Disable drawing mode
      drawingManager.setDrawingMode(null);
      setIsDrawing(false);
      setPolygonClosed(true);
      
      // Add listeners for editing
      window.google.maps.event.addListener(path, 'set_at', () => {
        console.log("Polygon edited - vertex moved");
        calculateArea(polygon);
        updatePolygonPoints(polygon);
      });
      
      window.google.maps.event.addListener(path, 'insert_at', () => {
        console.log("Polygon edited - vertex added");
        calculateArea(polygon);
        updatePolygonPoints(polygon);
      });

      window.google.maps.event.addListener(path, 'remove_at', () => {
        console.log("Polygon edited - vertex removed");
        calculateArea(polygon);
        updatePolygonPoints(polygon);
      });
    });

    // Listen for overlay clicks while drawing
    window.google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
      console.log("Overlay complete event:", event.type);
    });
  };

  const updatePolygonPoints = (polygon) => {
    const path = polygon.getPath();
    const points = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      points.push({
        lat: point.lat(),
        lng: point.lng()
      });
    }
    setPolygonPoints(points);
  };

  const calculateArea = (polygon) => {
    if (!polygon || !window.google) return;

    try {
      const areaInSquareMeters = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
      const areaInSquareFeet = areaInSquareMeters * 10.764;
      const roundedArea = Math.round(areaInSquareFeet * 100) / 100;
      console.log("Area calculated:", roundedArea, "sq ft");
      setArea(roundedArea);
    } catch (err) {
      console.error("Error calculating area:", err);
    }
  };

  const undoLastPoint = () => {
    if (!polygonRef.current) return;
    
    const path = polygonRef.current.getPath();
    if (path.getLength() > 0) {
      path.removeAt(path.getLength() - 1);
      calculateArea(polygonRef.current);
      updatePolygonPoints(polygonRef.current);
    }
  };

  const clearDrawing = () => {
    console.log("Clearing drawing...");
    
    // Remove polygon from map
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // Remove drawing manager
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null);
      drawingManagerRef.current = null;
    }

    // Reset state
    setPolygonPoints([]);
    setArea(0);
    setIsDrawing(false);
    setPolygonClosed(false);
    setError("");
  };

  const handleCompleteMeasurement = async () => {
    if (!polygonClosed || area === 0) {
      setError("Please complete drawing your roof outline first");
      return;
    }

    if (area < 100) {
      setError("Area seems too small. Please verify your measurement.");
      return;
    }

    if (area > 50000) {
      setError("Area seems unusually large. Please verify your measurement.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Get polygon coordinates
      const polygonData = polygonPoints.map(point => ({
        lat: point.lat,
        lng: point.lng
      }));

      console.log("Saving measurement with area:", area, "and", polygonData.length, "points");

      // Save measurement to database
      const measurement = await base44.entities.RoofMeasurement.create({
        address: address,
        area_sqft: area,
        polygon_data: polygonData,
        measurement_date: new Date().toISOString()
      });

      console.log("Measurement saved:", measurement);

      // Show success message
      alert(`✅ Measurement saved successfully!\n\nAddress: ${address}\nArea: ${area.toLocaleString()} sq ft`);
      
      navigate(createPageUrl("Homepage"));
    } catch (err) {
      console.error("Error saving measurement:", err);
      setError(`Failed to save measurement: ${err.message}`);
      setSaving(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isDrawing || polygonClosed) {
          clearDrawing();
        }
      } else if (e.key === 'Enter') {
        if (polygonClosed && area > 0) {
          handleCompleteMeasurement();
        }
      } else if ((e.key === 'z' && (e.ctrlKey || e.metaKey)) || e.key === 'Backspace' || e.key === 'Delete') {
        if (polygonClosed && polygonRef.current) { // Only allow undo/delete if polygon is closed and exists
          e.preventDefault();
          undoLastPoint();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, polygonClosed, area, handleCompleteMeasurement, undoLastPoint, clearDrawing]);

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
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Measure Your Roof</h2>
            <p className="text-sm text-slate-600">
              Click points around your roof perimeter to create a polygon
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

          {/* Drawing Controls */}
          <div className="p-6 space-y-4">
            {!isDrawing && !polygonClosed && (
              <Button
                onClick={startDrawing}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={mapLoading || !!mapError}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Start Drawing
              </Button>
            )}

            {isDrawing && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">
                    🖱️ Drawing Mode Active
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Click on the map to add points around your roof. Double-click or click the first point again to close the polygon.
                  </p>
                  <p className="text-xs text-blue-600 mt-2 font-bold">
                    👆 Click points on the satellite map to draw!
                  </p>
                </div>

                <Button
                  onClick={clearDrawing}
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel Drawing
                </Button>
              </div>
            )}

            {polygonClosed && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Polygon Complete!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    You can drag the corner points to adjust the shape
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Points: {polygonPoints.length}
                  </p>
                </div>

                <Button
                  onClick={undoLastPoint}
                  variant="outline"
                  className="w-full"
                  disabled={polygonPoints.length <= 3} // Disable if less than 3 points (minimum for a polygon)
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Remove Last Point
                </Button>

                <Button
                  onClick={clearDrawing}
                  variant="outline"
                  className="w-full"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Redraw
                </Button>
              </div>
            )}

            {/* Area Display */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6">
              <p className="text-sm text-green-700 font-medium mb-2">Total Roof Area:</p>
              <p className="text-5xl font-bold text-green-900">
                {area.toLocaleString()}
              </p>
              <p className="text-xl font-medium text-green-800 mt-1">square feet</p>
            </div>

            {/* Complete Button */}
            <Button
              onClick={handleCompleteMeasurement}
              disabled={!polygonClosed || area === 0 || saving}
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

            {/* Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-900 mb-2">How to Draw:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Click points around your roof edges</li>
                <li>• Double-click or click first point to close</li>
                <li>• Drag corners to adjust after closing</li>
                <li>• Press ESC to cancel and start over</li>
              </ul>
              <p className="text-xs font-bold text-slate-900 mt-3 mb-2">Keyboard Shortcuts:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">ESC</kbd> - Cancel drawing</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Enter</kbd> - Save measurement</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Backspace</kbd> - Remove point</li>
              </ul>
            </div>
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
              </div>
            </div>
          )}

          {mapError && !mapLoading && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10 p-8">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{mapError}</AlertDescription>
              </Alert>
            </div>
          )}

          <div 
            ref={mapRef} 
            id="map"
            className="w-full h-full"
          />

          {!mapError && !mapLoading && coordinates && !isDrawing && !polygonClosed && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10">
              <p className="text-sm font-medium">
                ✅ Map ready! Click "Start Drawing" to begin measuring your roof
              </p>
            </div>
          )}

          {isDrawing && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10 max-w-md text-center">
              <p className="text-sm font-bold mb-1">
                🖱️ Click on the Map to Draw
              </p>
              <p className="text-xs">
                Click points around your roof. Double-click or click the first point to close the polygon.
              </p>
            </div>
          )}

          {polygonClosed && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-green-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10">
              <p className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Polygon complete! Area: {area.toLocaleString()} sq ft
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
