import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, AlertCircle } from "lucide-react";

export default function InteractiveMapView({ measurement, sections }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  // CRITICAL FIX: Load Google Maps script FIRST
  useEffect(() => {
    console.log("🚀 InteractiveMapView: Loading Google Maps script");

    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.geometry) {
      console.log("✅ InteractiveMapView: Google Maps already loaded");
      if (!scriptLoadedRef.current) {
        scriptLoadedRef.current = true;
        setMapScriptLoaded(true);
      }
      return;
    }

    // Check if script tag exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log("⏳ InteractiveMapView: Script exists, waiting...");
      let attempts = 0;
      const maxAttempts = 60;
      
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.geometry) {
          clearInterval(checkInterval);
          console.log("✅ InteractiveMapView: Google Maps ready!");
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error("❌ InteractiveMapView: Timeout");
          setError("Google Maps is taking too long to load.");
          setLoading(false);
        }
      }, 200);
      return;
    }

    // Create new script
    console.log("📥 InteractiveMapView: Loading Google Maps script...");
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing,places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("✅ InteractiveMapView: Script loaded, checking API...");
      
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.geometry) {
          clearInterval(checkInterval);
          console.log("✅ InteractiveMapView: API ready!");
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
        } else if (attempts >= 40) {
          clearInterval(checkInterval);
          console.error("❌ InteractiveMapView: API not ready");
          setError("Google Maps API failed to initialize.");
          setLoading(false);
        }
      }, 100);
    };
    
    script.onerror = () => {
      console.error("❌ InteractiveMapView: Script load error");
      setError("Failed to load Google Maps. Check internet connection.");
      setLoading(false);
    };
    
    document.head.appendChild(script);
  }, []);

  // Initialize map ONLY after script is loaded
  useEffect(() => {
    if (!mapScriptLoaded) {
      console.log("⏳ InteractiveMapView: Waiting for script...");
      return;
    }

    if (!sections || sections.length === 0) {
      setError("No measurement sections available");
      setLoading(false);
      return;
    }

    console.log("✅ InteractiveMapView: Script loaded, initializing map...");

    let attemptCount = 0;
    const maxAttempts = 10;

    const initializeMap = () => {
      attemptCount++;

      if (!mapRef.current) {
        if (attemptCount < maxAttempts) {
          setTimeout(initializeMap, 200);
        } else {
          setError("Map container not available");
          setLoading(false);
        }
        return;
      }

      try {
        console.log("Initializing Interactive Map with", sections.length, "sections");

        // Calculate center from all coordinates
        const allCoords = [];
        sections.forEach(section => {
          if (section.coordinates && section.coordinates.length > 0) {
            section.coordinates.forEach(coord => {
              allCoords.push({ lat: coord.lat, lng: coord.lng });
            });
          }
        });

        if (allCoords.length === 0) {
          setError("No valid coordinates found");
          setLoading(false);
          return;
        }

        const centerLat = allCoords.reduce((sum, c) => sum + c.lat, 0) / allCoords.length;
        const centerLng = allCoords.reduce((sum, c) => sum + c.lng, 0) / allCoords.length;

        console.log("Map center:", { lat: centerLat, lng: centerLng });

        // Create map
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 20,
          mapTypeId: 'satellite',
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: true,
          zoomControl: true,
          gestureHandling: 'greedy'
        });

        mapInstanceRef.current = map;

        // Create bounds
        const bounds = new window.google.maps.LatLngBounds();

        // Draw sections
        sections.forEach((section, idx) => {
          if (!section.coordinates || section.coordinates.length === 0) return;

          const coords = section.coordinates.map(c => ({ lat: c.lat, lng: c.lng }));
          
          // Extend bounds
          coords.forEach(c => bounds.extend(c));

          // Create polygon
          const polygon = new window.google.maps.Polygon({
            paths: coords,
            strokeColor: section.color || '#3b82f6',
            strokeOpacity: 0.9,
            strokeWeight: 3,
            fillColor: section.color || '#3b82f6',
            fillOpacity: 0.35,
            map: map,
            clickable: false
          });

          // Add label
          const centerLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
          const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;

          new window.google.maps.Marker({
            position: { lat: centerLat, lng: centerLng },
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 0
            },
            label: {
              text: `${Math.round(section.adjusted_area_sqft || section.flat_area_sqft || 0)} ft²`,
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold'
            }
          });

          console.log(`Section ${idx + 1} drawn:`, section.name, coords.length, "points");
        });

        // Fit to bounds
        map.fitBounds(bounds);
        
        // Adjust zoom if too close
        window.google.maps.event.addListenerOnce(map, 'idle', () => {
          if (map.getZoom() > 21) {
            map.setZoom(21);
          }
          console.log("Map initialized successfully");
          setLoading(false);
          setError("");
        });

      } catch (err) {
        console.error("Map initialization error:", err);
        setError(`Failed to initialize map: ${err.message}`);
        setLoading(false);
      }
    };

    // Start initialization
    const timer = setTimeout(initializeMap, 100);
    return () => clearTimeout(timer);
  }, [mapScriptLoaded, sections]);

  const downloadImage = async () => {
    if (!mapRef.current) return;

    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // Wait for map to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        logging: false
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to generate image');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `roof-interactive-map-${Date.now()}.png`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');

    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download map image');
    } finally {
      setDownloading(false);
    }
  };

  if (!mapScriptLoaded && !error) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border-2 border-slate-200">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading Google Maps script...</p>
          <p className="text-sm text-slate-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (loading && mapScriptLoaded) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border-2 border-slate-200">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Rendering interactive map...</p>
          <p className="text-sm text-slate-500 mt-2">Drawing {sections.length} section{sections.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-red-50 rounded-xl border-2 border-red-200">
        <div className="text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-red-900 mb-2">Unable to load map</p>
          <p className="text-sm text-red-700">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg bg-slate-100">
        <div 
          ref={mapRef} 
          className="w-full h-[500px]"
          style={{ minHeight: '500px' }}
        />
        {measurement?.total_adjusted_sqft && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold z-10">
            Total: {Math.round(measurement.total_adjusted_sqft).toLocaleString()} sq ft
          </div>
        )}
      </div>

      <Button 
        variant="outline" 
        className="w-full" 
        onClick={downloadImage} 
        disabled={downloading}
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download Map Image
          </>
        )}
      </Button>
    </div>
  );
}