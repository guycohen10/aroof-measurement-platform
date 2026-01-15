import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Move, Maximize2, Loader2, AlertCircle, Box } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Roof3DView({ measurement, sections, mapScriptLoaded: parentScriptLoaded }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const polygonsRef = useRef([]);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapTilt, setMapTilt] = useState(45);
  const [mapHeading, setMapHeading] = useState(0);
  const [view3DAvailable, setView3DAvailable] = useState(true);
  const [savedDesign, setSavedDesign] = useState(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  // Use parent script loaded state
  useEffect(() => {
    if (parentScriptLoaded) {
      setMapScriptLoaded(true);
      return;
    }

    if (window.google && window.google.maps && window.google.maps.geometry) {
      if (!scriptLoadedRef.current) {
        scriptLoadedRef.current = true;
        setMapScriptLoaded(true);
      }
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.geometry) {
          clearInterval(checkInterval);
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
        } else if (attempts >= 60) {
          clearInterval(checkInterval);
          setError("Google Maps timeout");
          setLoading(false);
        }
      }, 200);
      return;
    }
  }, [parentScriptLoaded]);

  // Load saved design from sessionStorage on mount
  useEffect(() => {
    try {
      const designData = sessionStorage.getItem('roof_design_preferences');
      if (designData) {
        const parsed = JSON.parse(designData);
        setSavedDesign(parsed);
        console.log('✅ Loaded saved design:', parsed);
      }
    } catch (err) {
      console.log('No saved design found');
    }
  }, []);

  // Initialize map after script loads
  useEffect(() => {
    // CRITICAL: Check if mapRef.current is available
    if (!mapRef.current) {
      console.log("⏳ Roof3DView: DOM element not ready");
      return;
    }

    if (!mapScriptLoaded) return;

    const initializeMap = () => {
      // Double-check ref is still available
      if (!mapRef.current) {
        setError("Map container not available");
        setLoading(false);
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

        // Draw polygons with saved design overlay
        if (sections && sections.length > 0) {
          sections.forEach((section, idx) => {
            if (!section.coordinates || section.coordinates.length === 0) return;

            const coords = section.coordinates.map(c => ({ lat: c.lat, lng: c.lng }));

            // Use saved design color if available, otherwise default
            const fillColor = savedDesign?.colorHex || section.color || '#ef4444';
            // Convert saved opacity (e.g., 70%) to fill opacity (e.g., 0.3 to see through)
            const fillOpacity = savedDesign?.opacity ? (1 - savedDesign.opacity) : 0.4;

            const polygon = new window.google.maps.Polygon({
              paths: coords,
              strokeColor: fillColor,
              strokeOpacity: 1.0,
              strokeWeight: 3,
              fillColor: fillColor,
              fillOpacity: fillOpacity,
              map: map,
              zIndex: 1000 // Render ON TOP of satellite
            });
            
            polygonsRef.current.push(polygon);
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

    initializeMap();
  }, [mapScriptLoaded, sections, mapTilt, mapRef.current, savedDesign]);

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

  return (
    <div className="space-y-4">
      {!view3DAvailable && !loading && (
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
          style={{ width: '100%', height: '500px', visibility: loading || error ? 'hidden' : 'visible' }}
        />
        
        {/* Loading Overlay */}
        {!mapScriptLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700">Loading 3D map...</p>
            </div>
          </div>
        )}
        
        {loading && mapScriptLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700">Rendering 3D view...</p>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center px-4">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-red-900 mb-2">Unable to load 3D view</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {measurement?.total_adjusted_sqft && !loading && !error && (
          <div className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold z-10">
            {Math.round(measurement.total_adjusted_sqft).toLocaleString()} sq ft
          </div>
        )}
        {!loading && !error && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg shadow-lg text-sm font-semibold z-10">
            {view3DAvailable ? '3D View' : '2D View'}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={rotateView}
          disabled={!view3DAvailable || loading}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Rotate (90°)
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={toggleTilt}
          disabled={!view3DAvailable || loading}
        >
          <Move className="w-4 h-4 mr-2" />
          {mapTilt === 45 ? '2D View' : '3D View'}
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={resetView}
          disabled={loading}
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}