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
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc&libraries=places,drawing,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => setError("Failed to load Google Maps");
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [measurement, sections]);

  const initMap = () => {
    if (!mapRef.current || !measurement?.property_address) {
      setLoading(false);
      return;
    }

    try {
      let mapCenter = { lat: 32.7767, lng: -96.7970 };

      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 20,
        mapTypeId: 'satellite',
        tilt: 0,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        }
      });

      mapInstanceRef.current = map;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: measurement.property_address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
        }
      });

      if (sections && sections.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        
        sections.forEach((section) => {
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

            const center = getPolygonCenter(coords);
            new window.google.maps.Marker({
              position: center,
              map: map,
              icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 0 },
              label: {
                text: section.name || `${Math.round(section.adjusted_area_sqft || section.flat_area_sqft || 0).toLocaleString()} sq ft`,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold',
                className: 'map-label'
              }
            });
          }
        });

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
          setTimeout(() => {
            const currentZoom = map.getZoom();
            map.setZoom(Math.min(currentZoom - 0.5, 20));
          }, 100);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to load map");
      setLoading(false);
    }
  };

  const getPolygonCenter = (coords) => {
    let latSum = 0, lngSum = 0;
    coords.forEach(coord => {
      latSum += coord.lat;
      lngSum += coord.lng;
    });
    return { lat: latSum / coords.length, lng: lngSum / coords.length };
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
      alert('Failed to download image. Please try again.');
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
      <div className="bg-slate-100 border-2 border-slate-200 rounded-lg p-12 text-center">
        <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-slate-600">Loading satellite view...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 shadow-lg">
        <div ref={mapRef} className="w-full h-[500px]" style={{ touchAction: 'pan-x pan-y' }} />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="bg-white shadow-lg" onClick={zoomIn}>
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-white shadow-lg" onClick={zoomOut}>
            <ZoomOut className="w-5 h-5" />
          </Button>
        </div>

        {measurement?.total_adjusted_sqft && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold">
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

      <style>{`
        .map-label {
          background: rgba(37, 99, 235, 0.9);
          padding: 4px 8px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}