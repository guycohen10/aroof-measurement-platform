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
    
    const decodedAddress = decodeURIComponent(addressParam);
    console.log("MeasurementPage: Address from URL:", decodedAddress);
    setAddress(decodedAddress);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!address) return;

    const loadGoogleMaps = () => {
      console.log("Loading Google Maps for address:", address);

      // Check if already loaded
      if (window.google && window.google.maps) {
        console.log("Google Maps already loaded, initializing map...");
        initializeMap();
        return;
      }

      // Check if script is being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log("Google Maps script already in DOM, waiting for load...");
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle);
            console.log("Google Maps loaded from existing script");
            initializeMap();
          }
        }, 100);
        return;
      }

      // Use the API key from environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
      
      console.log("Loading Google Maps script with API key...");

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
  }, [address]);

  const initializeMap = async () => {
    console.log("Initializing map for address:", address);
    
    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps not available");
      }

      // Default to Dallas coordinates
      let center = { lat: 32.7767, lng: -96.7970 };

      console.log("Starting geocoding for:", address);

      // Geocode the address
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: address }, (results, status) => {
        console.log("Geocoding status:", status);
        
        if (status === "OK" && results[0]) {
          center = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          console.log("✅ Address geocoded successfully:", center);
          console.log("Full location:", results[0].formatted_address);
          setCoordinates(center);
          setMapError(""); // Clear any previous errors
        } else {
          console.warn("⚠️ Geocoding failed:", status);
          setMapError(`Could not find address: "${address}". Showing Dallas, TX instead. Please check the address and try again.`);
        }

        // Create map with satellite view
        console.log("Creating Google Map instance...");
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
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP
          },
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER
          },
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

        console.log("✅ Map initialized successfully");
        setMapLoading(false);
      });

    } catch (err) {
      console.error("❌ Error initializing map:", err);
      setMapError(`Failed to initialize map: ${err.message}`);
      setMapLoading(false);
    }
  };

  const handleStartDrawing = () => {
    alert("Drawing polygon functionality will be added next! For now, you can manually enter the area below.");
  };

  const handleClear = () => {
    setArea(0);
  };

  const handleSave = async () => {
    if (area <= 0) {
      setError("Please enter a valid roof area");
      return;
    }

    try {
      // Save measurement to database
      const measurement = await base44.entities.RoofMeasurement.create({
        address: address,
        area_sqft: area
      });

      alert(`✅ Measurement saved successfully!\n\nAddress: ${address}\nArea: ${area.toLocaleString()} sq ft`);
      
      // Redirect to homepage
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
              Measure your roof using satellite imagery
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {/* Display Address */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-blue-600 font-medium">Property Address:</p>
                <p className="text-lg font-bold text-blue-900">{address}</p>
                {coordinates && (
                  <p className="text-xs text-slate-500 mt-1">
                    📍 Location found: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            {/* Map Error */}
            {mapError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{mapError}</AlertDescription>
              </Alert>
            )}

            {/* Map Container */}
            <div className="relative mb-6">
              {mapLoading && (
                <div className="absolute inset-0 bg-slate-900 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-white text-lg">Loading satellite map...</p>
                    <p className="text-slate-400 text-sm mt-2">Locating: {address}</p>
                  </div>
                </div>
              )}
              <div 
                ref={mapRef} 
                id="map"
                className="w-full rounded-lg overflow-hidden border-2 border-slate-300"
                style={{ height: '600px', minHeight: '600px' }}
              />
              {!mapError && !mapLoading && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Map loaded successfully!
                </div>
              )}
            </div>

            {/* Area Display */}
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium mb-2">Total Roof Area:</p>
              <p className="text-5xl font-bold text-green-900">
                {area.toLocaleString()} <span className="text-2xl">sq ft</span>
              </p>
            </div>

            {/* Control Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleStartDrawing}
                  variant="outline"
                  className="h-12 text-base"
                  disabled={!!mapError || mapLoading}
                >
                  Start Drawing
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="h-12 text-base"
                  disabled={area === 0}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSave}
                  className="h-12 text-base bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={area === 0}
                >
                  Save Measurement
                </Button>
              </div>

              {/* Temporary Manual Entry */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3 font-medium">
                  ⚠️ Drawing tool coming soon! For now, enter the roof area manually:
                </p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Enter area in sq ft (e.g., 2500)"
                    value={area || ''}
                    onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 border border-yellow-300 rounded-lg text-lg"
                    min="0"
                    step="0.01"
                  />
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
            <h4 className="font-bold text-slate-900 mb-3">How it works:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Map displays your property</p>
                  <p className="text-sm text-slate-600">Satellite view shows your roof from above</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-slate-900">Draw polygon around roof (coming soon)</p>
                  <p className="text-sm text-slate-600">Click points around the roof perimeter</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-slate-900">Auto-calculated area</p>
                  <p className="text-sm text-slate-600">System calculates square footage automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  4
                </div>
                <div>
                  <p className="font-medium text-slate-900">Save measurement</p>
                  <p className="text-sm text-slate-600">Saved to database for your records</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h4 className="font-bold text-blue-900 mb-3">Testing:</h4>
            <p className="text-blue-800 text-sm">
              Test URL: <code className="bg-blue-100 px-2 py-1 rounded">/MeasurementPage?address=5103+lincolnshire+ct+dallas+tx</code>
            </p>
            <p className="text-blue-700 text-sm mt-2">
              The map should automatically locate and center on this address in Dallas, TX
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}