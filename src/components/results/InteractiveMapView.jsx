import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export default function InteractiveMapView({ measurement, sections }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadMap = () => {
      if (!mapRef.current || !sections || sections.length === 0) {
        setError("No data available");
        setLoading(false);
        return;
      }

      if (!window.google || !window.google.maps) {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc&libraries=geometry';
        script.async = true;
        script.onload = () => setTimeout(initMap, 100);
        script.onerror = () => {
          setError("Failed to load Google Maps");
          setLoading(false);
        };
        document.head.appendChild(script);
      } else {
        setTimeout(initMap, 100);
      }
    };

    const initMap = () => {
      try {
        const allCoords = [];
        sections.forEach(s => {
          if (s.coordinates) {
            s.coordinates.forEach(c => allCoords.push(c));
          }
        });

        if (allCoords.length === 0) {
          setError("No coordinates");
          setLoading(false);
          return;
        }

        const centerLat = allCoords.reduce((sum, c) => sum + c.lat, 0) / allCoords.length;
        const centerLng = allCoords.reduce((sum, c) => sum + c.lng, 0) / allCoords.length;

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 20,
          mapTypeId: 'satellite',
          streetViewControl: false,
          fullscreenControl: false
        });

        mapInstanceRef.current = map;

        const bounds = new window.google.maps.LatLngBounds();
        
        sections.forEach((section, idx) => {
          if (!section.coordinates || section.coordinates.length === 0) return;
          
          const coords = section.coordinates.map(c => ({ lat: c.lat, lng: c.lng }));
          coords.forEach(c => bounds.extend(c));

          new window.google.maps.Polygon({
            paths: coords,
            strokeColor: section.color || '#3b82f6',
            strokeWeight: 3,
            fillColor: section.color || '#3b82f6',
            fillOpacity: 0.35,
            map: map
          });

          const cLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
          const cLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
          
          new window.google.maps.Marker({
            position: { lat: cLat, lng: cLng },
            map: map,
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 0 },
            label: {
              text: `${Math.round(section.adjusted_area_sqft || section.flat_area_sqft || 0)} ft²`,
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 'bold'
            }
          });
        });

        map.fitBounds(bounds);
        setTimeout(() => {
          if (map.getZoom() > 20) map.setZoom(20);
        }, 100);

        setLoading(false);
      } catch (err) {
        setError("Map error: " + err.message);
        setLoading(false);
      }
    };

    loadMap();
  }, [sections]);

  const downloadImage = async () => {
    if (!mapRef.current) return;
    
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      await new Promise(r => setTimeout(r, 500));
      
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        scale: 2
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `roof-map-${Date.now()}.png`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      });
      
    } catch (err) {
      alert('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-slate-100 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 shadow-lg">
        <div ref={mapRef} className="w-full h-[500px] bg-slate-100" />
        {measurement?.total_adjusted_sqft && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold z-10">
            Total: {Math.round(measurement.total_adjusted_sqft).toLocaleString()} sq ft
          </div>
        )}
      </div>

      <Button variant="outline" className="w-full" onClick={downloadImage} disabled={downloading}>
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