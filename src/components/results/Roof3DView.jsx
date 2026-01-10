import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Move, Maximize2, Loader2, AlertCircle, Box } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Roof3DView({ measurement, sections }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapTilt, setMapTilt] = useState(45);
  const [mapHeading, setMapHeading] = useState(0);
  const [view3DAvailable, setView3DAvailable] = useState(true);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  // Load Google Maps script
  useEffect(() => {
    console.log("🚀 Roof3DView: Loading Google Maps script");

    if (window.google && window.google.maps && window.google.maps.geometry) {
      console.log("✅ Roof3DView: Google Maps already loaded");
      if (!scriptLoadedRef.current) {
        scriptLoadedRef.current = true;
        setMapScriptLoaded(true);
      }
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log("⏳ Roof3DView: Script exists, waiting...");
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.geometry) {
          clearInterval(checkInterval);
          console.log("✅ Roof3DView: Google Maps ready!");
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
        } else if (attempts >= 60) {
          clearInterval(checkInterval);
          setError("Google Maps is taking too long to load.");
          setLoading(false);
        }
      }, 200);
      return;
    }

    console.log("📥 Roof3DView: Loading script...");
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing,places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("✅ Roof3DView: Script loaded");
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.geometry) {
          clearInterval(checkInterval);
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
        } else if (attempts >= 40) {
          clearInterval(checkInterval);
          setError("API failed to initialize.");
          setLoading(false);
        }
      }, 100);
    };
    
    script.onerror = () => {
      setError("Failed to load Google Maps.");
      setLoading(false);
    };
    
    document.head.appendChild(script);
  }, []);

  // Initialize map after script loads
  useEffect(() => {
    if (!mapScriptLoaded) return;

    const initializeMap = () => {
      if (!mapRef.current) {
        setTimeout(initializeMap, 100);
        return;
      }

      try {
        // Calculate center from sections
        const allCoords = [];
        if (sections && sections.length > 0) {
          sections.forEach(section => {
            if (section.coordinates && section.coordinates.length > 0) {
              section.coordinates.forEach(coord => {
                allCoords.push({ lat: coord.lat, lng: coord.lng });
              });
            }
          });
        }

        const center = allCoords.length > 0
          ? {
              lat: allCoords.reduce((sum, c) => sum + c.lat, 0) / allCoords.length,
              lng: allCoords.reduce((sum, c) => sum + c.lng, 0) / allCoords.length
            }
          : { lat: 32.7767, lng: -96.7970 };

        console.log("Creating 3D map at:", center);

        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 20,
          mapTypeId: 'satellite',
          tilt: 45,
          heading: 0,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: false,
          zoomControl: true,
          rotateControl: true,
          gestureHandling: 'greedy'
        });

        mapInstanceRef.current = map;

        // Draw polygons
        if (sections && sections.length > 0) {
          sections.forEach((section, idx) => {
            if (!section.coordinates || section.coordinates.length === 0) return;

            const coords = section.coordinates.map(c => ({ lat: c.lat, lng: c.lng }));

            new window.google.maps.Polygon({
              paths: coords,
              strokeColor: section.color || '#ef4444',
              strokeOpacity: 0.9,
              strokeWeight: 3,
              fillColor: section.color || '#ef4444',
              fillOpacity: 0.4,
              map: map
            });
          });
        }

        // Check if 3D is available after map loads
        window.google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
          const actualTilt = map.getTilt();
          if (actualTilt === 0 && mapTilt === 45) {
            console.log("3D view not available for this location");
            setView3DAvailable(false);
          }
          setLoading(false);
        });

      } catch (err) {
        console.error("3D map error:", err);
        setError(`Failed to initialize 3D view: ${err.message}`);
        setLoading(false);
      }
    };

    setTimeout(initializeMap, 100);
  }, [mapScriptLoaded, sections, mapTilt]);

  const rotateView = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const newHeading = (mapHeading + 90) % 360;
    setMapHeading(newHeading);
    mapInstanceRef.current.setHeading(newHeading);
  }, [mapHeading]);

  const toggleTilt = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const newTilt = mapTilt === 45 ? 0 : 45;
    setMapTilt(newTilt);
    mapInstanceRef.current.setTilt(newTilt);
  }, [mapTilt]);

  const resetView = useCallback(() => {
    if (!mapInstanceRef.current) return;
    setMapHeading(0);
    setMapTilt(45);
    mapInstanceRef.current.setHeading(0);
    mapInstanceRef.current.setTilt(45);
    mapInstanceRef.current.setZoom(20);
  }, []);

  if (!mapScriptLoaded && !error) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border-2 border-slate-200">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading 3D map...</p>
        </div>
      </div>
    );
  }

  if (loading && mapScriptLoaded) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border-2 border-slate-200">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Rendering 3D view...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-red-50 rounded-xl border-2 border-red-200">
        <div className="text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-red-900 mb-2">Unable to load 3D view</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!view3DAvailable && (
        <Alert className="bg-yellow-50 border-yellow-300">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            <strong>3D imagery not available for this location.</strong> Showing high-resolution 2D satellite view instead.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
        <div 
          ref={mapRef} 
          className="w-full h-[500px]"
          style={{ minHeight: '500px' }}
        />
        {measurement?.total_adjusted_sqft && (
          <div className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold z-10">
            {Math.round(measurement.total_adjusted_sqft).toLocaleString()} sq ft
          </div>
        )}
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg shadow-lg text-sm font-semibold z-10">
          {view3DAvailable ? '3D View' : '2D View'}
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={rotateView}
          disabled={!view3DAvailable}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Rotate (90°)
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={toggleTilt}
          disabled={!view3DAvailable}
        >
          <Move className="w-4 h-4 mr-2" />
          {mapTilt === 45 ? '2D View' : '3D View'}
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={resetView}
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}