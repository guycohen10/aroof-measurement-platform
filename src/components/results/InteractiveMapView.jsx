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
    const initGoogleMaps = () => {
      if (window.google && window.google.maps) {
        console.log("✅ Google Maps available, initializing...");
        initMap();
      } else {
        console.log("⏳ Loading Google Maps...");
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc&libraries=places,drawing,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("✅ Google Maps loaded");
          initMap();
        };
        script.onerror = () => {
          console.error("❌ Failed to load Google Maps");
          setError("Failed to load Google Maps");
          setLoading(false);
        };
        document.head.appendChild(script);
      }
    };

    initGoogleMaps();
  }, [measurement, sections]);

  const initMap = () => {
    if (!mapRef.current) {
      console.error("❌ Map container ref not found");
      setLoading(false);
      return;
    }

    if (!measurement?.property_address && (!sections || sections.length === 0)) {
      console.error("❌ No address or sections available");
      setError("No measurement data available");
      setLoading(false);
      return;
    }

    try {
      console.log("🗺️ Creating map instance...");
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
      console.log("✅ Map instance created");

      // Geocode address
      if (measurement?.property_address) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: measurement.property_address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            console.log("📍 Address geocoded:", location.lat(), location.lng());
            map.setCenter(location);
          }
        });
      }

      // Draw polygons from sections
      if (sections && sections.length > 0) {
        console.log(`📐 Drawing ${sections.length} sections...`);
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

            // Add section label
            const center = getPolygonCenter(coords);
            new window.google.maps.Marker({
              position: center,
              map: map,
              icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 0 },
              label: {
                text: `${section.name || 'Section ' + (idx + 1)}`,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold'
              }
            });
          }
        });

        if (!bounds.isEmpty()) {
          console.log("📏 Fitting map to bounds");
          map.fitBounds(bounds);
          setTimeout(() => {
            const currentZoom = map.getZoom();
            if (currentZoom > 20) {
              map.setZoom(20);
            }
          }, 100);
        }
      }

      setLoading(false);
      console.log("✅ Map initialization complete");
    } catch (err) {
      console.error("❌ Error initializing map:", err);
      setError("Failed to load map: " + err.message);
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
        <p className="text-sm text-red-500 mt-2">Please refresh the page to try again</p>
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
    </div>
  );
}