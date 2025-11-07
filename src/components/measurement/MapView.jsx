import React, { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export default function MapView({
  propertyAddress,
  sections,
  setSections,
  selectedSectionId,
  setSelectedSectionId,
  drawingMode,
  setDrawingMode
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("MapView: Starting map initialization");
    console.log("MapView: Property address:", propertyAddress);

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log("MapView: Google Maps already loaded");
      initializeMap();
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log("MapView: Google Maps script already in DOM, waiting...");
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          console.log("MapView: Google Maps now available");
          initializeMap();
        }
      }, 100);
      return;
    }

    // Load Google Maps script
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    
    console.log("MapView: API Key exists:", !!apiKey);

    if (!apiKey) {
      setError("Google Maps API key not configured. Please add GOOGLE_MAPS_API_KEY to your app secrets in Dashboard → Settings.");
      setLoading(false);
      return;
    }

    console.log("MapView: Loading Google Maps script...");

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing,places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("MapView: Google Maps script loaded successfully");
      initializeMap();
    };
    
    script.onerror = () => {
      console.error("MapView: Failed to load Google Maps script");
      setError("Failed to load Google Maps. Please check your API key and internet connection.");
      setLoading(false);
    };

    document.head.appendChild(script);
  }, []);

  const initializeMap = () => {
    console.log("MapView: Initializing map...");
    
    try {
      if (!window.google || !window.google.maps) {
        console.error("MapView: Google Maps not available");
        setError("Google Maps not available");
        setLoading(false);
        return;
      }

      // For now, use Dallas coordinates as default
      const defaultLocation = { lat: 32.8551, lng: -96.8005 };
      
      console.log("MapView: Creating map at Dallas location");

      // Create map
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 20,
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

      // Add a marker at the center
      new window.google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: propertyAddress || "Property Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#FF0000",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
          scale: 10,
        }
      });

      console.log("MapView: Map initialized successfully");
      setLoading(false);

    } catch (err) {
      console.error("MapView: Error initializing map:", err);
      setError(`Failed to initialize map: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading satellite map...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-slate-900 flex items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="mt-2">
            <p className="font-semibold text-lg mb-3">{error}</p>
            <div className="bg-red-950 border border-red-800 rounded-lg p-4 mt-4">
              <p className="font-semibold mb-2">To enable Google Maps:</p>
              <ol className="text-sm space-y-2 ml-4 list-decimal">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                <li>Create a project and enable these APIs:
                  <ul className="ml-4 mt-1 list-disc">
                    <li>Maps JavaScript API</li>
                    <li>Geocoding API</li>
                    <li>Geometry Library</li>
                  </ul>
                </li>
                <li>Create an API key in Credentials</li>
                <li>Go to Dashboard → Settings → Secrets</li>
                <li>Add secret: GOOGLE_MAPS_API_KEY = your_api_key</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-slate-900">
      {/* Address Display */}
      {propertyAddress && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <p className="text-sm text-slate-600 mb-1">Measuring Property:</p>
          <p className="text-lg font-bold text-slate-900">{propertyAddress}</p>
          <p className="text-xs text-slate-500 mt-2">
            📍 Map centered on Dallas, TX (demo location)
          </p>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[600px]"
        style={{ minHeight: '600px' }}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10">
        <p className="text-sm font-medium">
          ✅ Basic map is working! Drawing tools will be added next.
        </p>
      </div>
    </div>
  );
}