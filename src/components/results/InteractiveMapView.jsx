import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

export default function InteractiveMapView({ measurement, sections }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonsRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc&libraries=places,drawing`;
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
      // Default center (will be updated by geocoding or polygon bounds)
      let mapCenter = { lat: 32.7767, lng: -96.7970 }; // Dallas default

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

      // Geocode address if no coordinates available
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: measurement.property_address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
        }
      });

      // Draw polygons from saved measurement data
      if (sections && sections.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        
        sections.forEach((section, index) => {
          if (section.coordinates && section.coordinates.length > 0) {
            const coords = section.coordinates.map(coord => ({
              lat: coord.lat,
              lng: coord.lng
            }));

            // Extend bounds
            coords.forEach(coord => bounds.extend(coord));

            // Create polygon
            const polygon = new window.google.maps.Polygon({
              paths: coords,
              strokeColor: '#2563eb',
              strokeOpacity: 1,
              strokeWeight: 3,
              fillColor: '#3b82f6',
              fillOpacity: 0.35,
              map: map,
              editable: false,
              draggable: false
            });

            polygonsRef.current.push(polygon);

            // Add label with area
            const center = getPolygonCenter(coords);
            const marker = new window.google.maps.Marker({
              position: center,
              map: map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 0,
              },
              label: {
                text: `${section.area_sqft?.toLocaleString() || ''} sq ft`,
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 'bold',
                className: 'map-label'
              }
            });

            polygonsRef.current.push(marker);
          }
        });

        // Fit map to polygons
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
          // Zoom out slightly for context
          setTimeout(() => {
            const currentZoom = map.getZoom();
            map.setZoom(currentZoom - 0.5);
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
    let latSum = 0;
    let lngSum = 0;
    coords.forEach(coord => {
      latSum += coord.lat;
      lngSum += coord.lng;
    });
    return {
      lat: latSum / coords.length,
      lng: lngSum / coords.length
    };
  };

  const downloadMapImage = () => {
    if (!mapInstanceRef.current) return;
    alert("Map image download feature coming soon! You can take a screenshot for now.");
  };

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom - 1);
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
        <div 
          ref={mapRef} 
          className="w-full h-[500px]"
          style={{ touchAction: 'pan-x pan-y' }}
        />
        
        {/* Custom Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-lg hover:bg-slate-50"
            onClick={zoomIn}
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-lg hover:bg-slate-50"
            onClick={zoomOut}
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Total Area Badge */}
        {measurement?.total_sqft && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold">
            Total: {measurement.total_sqft.toLocaleString()} sq ft
          </div>
        )}
      </div>

      {/* Download Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={downloadMapImage}
      >
        <Download className="w-4 h-4 mr-2" />
        Download Map Image
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