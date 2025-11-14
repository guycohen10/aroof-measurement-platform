import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

export default function InteractiveMapView({ measurement, sections }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonsRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    console.log("🗺️ InteractiveMapView mounting...");
    console.log("Sections:", sections);
    console.log("Measurement:", measurement?.property_address);
    
    const initGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.geometry) {
        console.log("✅ Google Maps ready");
        setTimeout(() => initMap(), 100);
      } else {
        console.log("⏳ Loading Google Maps...");
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        
        if (existingScript) {
          console.log("Script exists, waiting...");
          const checkInterval = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.geometry) {
              clearInterval(checkInterval);
              console.log("✅ Google Maps now ready");
              initMap();
            }
          }, 200);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.google) {
              setError("Google Maps failed to load");
              setLoading(false);
            }
          }, 10000);
          return;
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc&libraries=places,drawing,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("✅ Script loaded");
          setTimeout(() => initMap(), 100);
        };
        script.onerror = () => {
          console.error("❌ Script failed");
          setError("Failed to load Google Maps");
          setLoading(false);
        };
        document.head.appendChild(script);
      }
    };

    initGoogleMaps();
  }, [measurement, sections]);

  const initMap = () => {
    console.log("🗺️ Initializing map...");
    
    if (!mapRef.current) {
      console.error("❌ Map ref not found");
      setLoading(false);
      return;
    }

    if (!sections || sections.length === 0) {
      console.error("❌ No sections");
      setError("No measurement sections available");
      setLoading(false);
      return;
    }

    try {
      console.log("Creating map instance...");
      
      // Calculate center from sections
      const allCoords = [];
      sections.forEach(section => {
        if (section.coordinates) {
          section.coordinates.forEach(coord => {
            allCoords.push({ lat: coord.lat, lng: coord.lng });
          });
        }
      });
      
      if (allCoords.length === 0) {
        setError("No coordinates found");
        setLoading(false);
        return;
      }
      
      const centerLat = allCoords.reduce((sum, c) => sum + c.lat, 0) / allCoords.length;
      const centerLng = allCoords.reduce((sum, c) => sum + c.lng, 0) / allCoords.length;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 20,
        mapTypeId: 'satellite',
        tilt: 0,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: false,
        zoomControl: false
      });

      mapInstanceRef.current = map;
      console.log("✅ Map created");

      // Draw polygons
      const bounds = new window.google.maps.LatLngBounds();
      
      sections.forEach((section, idx) => {
        if (section.coordinates && section.coordinates.length > 0) {
          const coords = section.coordinates.map(coord => ({
            lat: coord.lat,
            lng: coord.lng
          }));

          coords.forEach(coord => bounds.extend(coord));

          const polygon = new window.google.maps.Polygon({
            paths: coords,
            strokeColor: section.color || '#3b82f6',
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: section.color || '#3b82f6',
            fillOpacity: 0.35,
            map: map,
            editable: false,
            draggable: false
          });

          polygonsRef.current.push(polygon);
          console.log(`✅ Drew section ${idx + 1}`);

          const centerLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
          const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
          
          new window.google.maps.Marker({
            position: { lat: centerLat, lng: centerLng },
            map: map,
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 0 },
            label: {
              text: section.name || `${Math.round(section.adjusted_area_sqft || section.flat_area_sqft || 0)} sq ft`,
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold'
            }
          });
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        setTimeout(() => {
          const zoom = map.getZoom();
          if (zoom > 20) map.setZoom(20);
        }, 100);
      }

      setLoading(false);
      console.log("✅ Map complete");
    } catch (err) {
      console.error("❌ Map error:", err);
      setError("Failed to load map: " + err.message);
      setLoading(false);
    }
  };

  const downloadMapImage = async () => {
    if (!mapRef.current) return;
    
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `roof-measurement-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
      
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-100 rounded-lg p-12 text-center h-[500px] flex items-center justify-center">
        <div>
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-8 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 shadow-lg">
        <div ref={mapRef} className="w-full h-[500px] bg-slate-100" />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <Button size="icon" variant="secondary" className="bg-white shadow-lg hover:bg-slate-50" onClick={zoomIn}>
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-white shadow-lg hover:bg-slate-50" onClick={zoomOut}>
            <ZoomOut className="w-5 h-5" />
          </Button>
        </div>

        {measurement?.total_adjusted_sqft && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold z-10">
            Total: {Math.round(measurement.total_adjusted_sqft).toLocaleString()} sq ft
          </div>
        )}
      </div>

      <Button variant="outline" className="w-full" onClick={downloadMapImage} disabled={downloading}>
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