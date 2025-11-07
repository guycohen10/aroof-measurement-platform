import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MeasurementPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const [area, setArea] = useState(0);
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    // Get address from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const addressParam = urlParams.get('address');
    
    if (!addressParam) {
      navigate(createPageUrl("FormPage"));
      return;
    }
    
    setAddress(decodeURIComponent(addressParam));
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!address) return;

    const loadGoogleMaps = () => {
      console.log("Loading Google Maps...");

      // Check if already loaded
      if (window.google && window.google.maps) {
        console.log("Google Maps already loaded");
        initializeMap();
        return;
      }

      // Check if script is being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log("Google Maps script already in DOM, waiting...");
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle);
            console.log("Google Maps now available");
            initializeMap();
          }
        }, 100);
        return;
      }

      // Load the script
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      
      console.log("API Key exists:", !!apiKey);

      if (!apiKey) {
        setMapError("Google Maps API key not configured. Please add GOOGLE_MAPS_API_KEY to your app secrets.");
        setMapLoading(false);
        console.error("Please add your Google Maps API key:");
        console.error("1. Go to https://developers.google.com/maps/documentation/javascript/get-api-key");
        console.error("2. Create an API key and enable Maps JavaScript API and Geocoding API");
        console.error("3. Add the key to Dashboard → Settings → Secrets as GOOGLE_MAPS_API_KEY");
        return;
      }

      console.log("Loading Google Maps script...");

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("Google Maps script loaded successfully");
        initializeMap();
      };
      
      script.onerror = () => {
        console.error("Failed to load Google Maps script");
        setMapError("Unable to load map. Please check API key and internet connection.");
        setMapLoading(false);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [address]);

  const initializeMap = async () => {
    console.log("Initializing map...");
    
    try {
      if (!window.google || !window.google.maps) {
        console.error("Google Maps not available");
        setMapError("Google Maps not available");
        setMapLoading(false);
        return;
      }

      // Default to Dallas coordinates
      let center = { lat: 32.7767, lng: -96.7970 };

      console.log("Geocoding address:", address);

      // Try to geocode the address
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
          center = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          console.log("Address geocoded successfully:", center);
          setCoordinates(center);
        } else {
          console.warn("Geocoding failed:", status, "Using default Dallas location");
          setMapError(`Address not found. Showing Dallas, TX instead. Status: ${status}`);
        }

        // Create map
        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 18,
          mapTypeId: "satellite",
          tilt: 0,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT,
          },
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          rotateControl: true,
          scaleControl: true
        });

        mapInstanceRef.current = map;

        // Add marker at the center
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

        console.log("Map initialized successfully");
        setMapLoading(false);
      });

    } catch (err) {
      console.error("Error initializing map:", err);
      setMapError(`Failed to initialize map: ${err.message}`);
      setMapLoading(false);
    }
  };

  const handleStartDrawing = () => {
    alert("Drawing tools will be added in the next step!");
  };

  const handleCalculateArea = () => {
    alert("Area calculation will be added in the next step!");
  };

  const handleSave = async () => {
    if (area <= 0) {
      setError("Please enter a valid roof area or draw on the map");
      return;
    }

    try {
      // Save measurement to database
      const measurement = await base44.entities.RoofMeasurement.create({
        address: address,
        area_sqft: area
      });

      // Show success and navigate back to homepage
      alert(`Measurement saved! Area: ${area.toLocaleString()} sq ft`);
      navigate(createPageUrl("Homepage"));
    } catch (err) {
      console.error("Error saving measurement:", err);
      setError("Failed to save measurement. Please try again.");
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Roof Measurement Tool</CardTitle>
            <p className="text-center text-slate-600 mt-2">
              Use the satellite map to measure your roof
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {/* Display Address */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Property Address:</p>
                <p className="text-lg font-bold text-blue-900">{address}</p>
                {coordinates && (
                  <p className="text-xs text-slate-500 mt-1">
                    Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            {/* Map Error */}
            {mapError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {mapError}
                  <div className="mt-2 text-sm">
                    <strong>Setup Instructions:</strong>
                    <ol className="list-decimal ml-4 mt-1">
                      <li>Get API key from <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer" className="underline">Google Maps Platform</a></li>
                      <li>Enable "Maps JavaScript API" and "Geocoding API"</li>
                      <li>Add key to Dashboard → Settings → Secrets as GOOGLE_MAPS_API_KEY</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Map Container */}
            <div className="relative mb-6">
              {mapLoading && (
                <div className="absolute inset-0 bg-slate-900 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-white text-lg">Loading satellite map...</p>
                    <p className="text-slate-400 text-sm mt-2">Please wait...</p>
                  </div>
                </div>
              )}
              <div 
                ref={mapRef} 
                className="w-full rounded-lg overflow-hidden border-2 border-slate-300"
                style={{ height: '600px' }}
              />
              {!mapError && !mapLoading && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                  ✅ Map loaded successfully! Drawing tools coming next.
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleStartDrawing}
                  variant="outline"
                  className="h-12"
                  disabled={!!mapError}
                >
                  Start Drawing
                </Button>
                <Button
                  onClick={handleCalculateArea}
                  variant="outline"
                  className="h-12"
                  disabled={!!mapError}
                >
                  Calculate Area
                </Button>
                <div className="flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-lg px-4">
                  <span className="text-lg font-bold text-green-900">
                    Area: {area.toLocaleString()} sq ft
                  </span>
                </div>
              </div>

              {/* Temporary Manual Entry */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>Temporary:</strong> Enter area manually while drawing tools are being added:
                </p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Enter sq ft"
                    value={area || ''}
                    onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 border border-yellow-300 rounded-lg"
                  />
                  <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Measurement
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 bg-slate-50">
          <CardContent className="p-6">
            <h4 className="font-bold text-slate-900 mb-3">Next Steps:</h4>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>✅ Map is displaying the property location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span>Next: Add polygon drawing tools to trace roof outline</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span>Then: Automatic area calculation using Google Geometry API</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}