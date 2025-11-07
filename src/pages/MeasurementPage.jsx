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
  const drawingListenersRef = useRef([]);
  
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
      if (window.google && window.google.maps) {
        console.log("Google Maps already loaded, initializing map...");
        initializeMap();
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
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
    if (!mapInstanceRef.current) return;
    
    setIsDrawing(true);
    setPolygonPoints([]);
    setPolygonClosed(false);
    setArea(0);
    
    // Clear existing polygon if any
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // Change cursor
    mapInstanceRef.current.setOptions({ draggableCursor: 'crosshair' });

    // Add click listener for drawing
    const clickListener = mapInstanceRef.current.addListener('click', (event) => {
      addPoint(event.latLng);
    });

    drawingListenersRef.current.push(clickListener);
  };

  const addPoint = (latLng) => {
    const newPoints = [...polygonPoints, { lat: latLng.lat(), lng: latLng.lng() }];
    setPolygonPoints(newPoints);

    // Check if we should close the polygon (clicked near first point)
    if (newPoints.length >= 3) {
      const firstPoint = newPoints[0];
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(firstPoint.lat, firstPoint.lng),
        latLng
      );

      // If clicked within 10 meters of first point, close polygon
      if (distance < 10) {
        closePolygon(newPoints);
        return;
      }
    }

    // Draw the polygon with current points
    drawPolygon(newPoints, false);
  };

  const drawPolygon = (points, closed) => {
    // Remove existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    // Create new polygon
    const polygon = new window.google.maps.Polygon({
      paths: points,
      strokeColor: '#4A90E2',
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: closed ? '#4A90E2' : 'transparent',
      fillOpacity: closed ? 0.4 : 0,
      editable: closed,
      draggable: false,
      map: mapInstanceRef.current
    });

    polygonRef.current = polygon;

    // If closed and editable, add listeners for editing
    if (closed) {
      const path = polygon.getPath();
      
      window.google.maps.event.addListener(path, 'set_at', () => {
        calculateArea(polygon);
      });
      
      window.google.maps.event.addListener(path, 'insert_at', () => {
        calculateArea(polygon);
      });
    }
  };

  const closePolygon = (points) => {
    setIsDrawing(false);
    setPolygonClosed(true);
    setPolygonPoints(points);

    // Remove drawing listeners
    drawingListenersRef.current.forEach(listener => {
      window.google.maps.event.removeListener(listener);
    });
    drawingListenersRef.current = [];

    // Reset cursor
    mapInstanceRef.current.setOptions({ draggableCursor: null });

    // Draw closed polygon
    drawPolygon(points, true);

    // Calculate area
    if (polygonRef.current) {
      calculateArea(polygonRef.current);
    }
  };

  const calculateArea = (polygon) => {
    if (!polygon || !window.google) return;

    try {
      const areaInSquareMeters = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
      const areaInSquareFeet = areaInSquareMeters * 10.764;
      const roundedArea = Math.round(areaInSquareFeet * 100) / 100;
      setArea(roundedArea);
    } catch (err) {
      console.error("Error calculating area:", err);
    }
  };

  const undoLastPoint = () => {
    if (polygonPoints.length === 0) return;
    
    const newPoints = polygonPoints.slice(0, -1);
    setPolygonPoints(newPoints);
    
    if (newPoints.length > 0) {
      drawPolygon(newPoints, false);
    } else {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
    }
  };

  const clearDrawing = () => {
    // Remove polygon from map
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // Remove drawing listeners
    drawingListenersRef.current.forEach(listener => {
      window.google.maps.event.removeListener(listener);
    });
    drawingListenersRef.current = [];

    // Reset cursor
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({ draggableCursor: null });
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

      // Save measurement to database
      const measurement = await base44.entities.RoofMeasurement.create({
        address: address,
        area_sqft: area,
        polygon_data: polygonData,
        measurement_date: new Date().toISOString()
      });

      console.log("Measurement saved:", measurement);

      // Redirect to results page (create this page next)
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
        if (isDrawing) {
          clearDrawing();
        }
      } else if (e.key === 'Enter') {
        if (isDrawing && polygonPoints.length >= 3) {
          closePolygon(polygonPoints);
        }
      } else if ((e.key === 'z' && (e.ctrlKey || e.metaKey)) || e.key === 'Backspace' || e.key === 'Delete') {
        if (isDrawing && polygonPoints.length > 0) {
          e.preventDefault();
          undoLastPoint();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, polygonPoints, polygonClosed]);

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
                    Drawing Mode Active
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Click on the map to add points. Double-click or click near the first point to close.
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Points: {polygonPoints.length}
                  </p>
                </div>

                <Button
                  onClick={undoLastPoint}
                  variant="outline"
                  className="w-full"
                  disabled={polygonPoints.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo Last Point
                </Button>

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
                    Polygon Complete
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    You can drag the points to adjust the shape
                  </p>
                </div>

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
              <p className="text-xs font-bold text-slate-900 mb-2">Keyboard Shortcuts:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">ESC</kbd> - Cancel drawing</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Enter</kbd> - Close polygon</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Ctrl+Z</kbd> - Undo point</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Delete</kbd> - Remove point</li>
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
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10">
              <p className="text-sm font-medium">
                Click points around your roof. Double-click or click near first point to close.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}