import React, { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const SECTION_COLORS = [
  { fill: "#4A90E2", stroke: "#2E5C8A" },
  { fill: "#50C878", stroke: "#2E7D4E" },
  { fill: "#FF8C42", stroke: "#CC6F35" },
  { fill: "#9B59B6", stroke: "#7D3C98" },
  { fill: "#E74C3C", stroke: "#C0392B" },
];

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
  const polygonsRef = useRef({});
  const currentDrawingRef = useRef(null);
  const tempMarkersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      setError(
        "Google Maps API is not configured. To enable the measurement tool, add your Google Maps API key in the app settings."
      );
      setLoading(false);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = async () => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      
      // Geocode the address
      geocoder.geocode({ address: propertyAddress }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          
          // Create map
          const map = new window.google.maps.Map(mapRef.current, {
            center: location,
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
          });

          mapInstanceRef.current = map;

          // Add click listener for drawing
          map.addListener("click", (e) => {
            if (drawingMode) {
              handleMapClick(e.latLng);
            }
          });

          setLoading(false);
        } else {
          setError("Could not locate property address on map");
          setLoading(false);
        }
      });
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("Failed to initialize map");
      setLoading(false);
    }
  };

  // Draw sections on map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing polygons
    Object.values(polygonsRef.current).forEach(polygon => polygon.setMap(null));
    polygonsRef.current = {};

    // Draw all sections
    sections.forEach((section, index) => {
      if (!section.coordinates || section.coordinates.length < 3) return;

      const color = SECTION_COLORS[index % SECTION_COLORS.length];
      const isSelected = section.id === selectedSectionId;

      const polygon = new window.google.maps.Polygon({
        paths: section.coordinates.map(coord => ({
          lat: coord[0],
          lng: coord[1]
        })),
        strokeColor: isSelected ? "#FFD700" : color.stroke,
        strokeOpacity: 1,
        strokeWeight: isSelected ? 3 : 2,
        fillColor: color.fill,
        fillOpacity: 0.4,
        editable: isSelected,
        draggable: false,
        map: mapInstanceRef.current
      });

      // Click to select
      polygon.addListener("click", () => {
        setSelectedSectionId(section.id);
      });

      // Update coordinates when edited
      if (isSelected) {
        const updatePath = () => {
          const path = polygon.getPath();
          const coordinates = [];
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coordinates.push([point.lat(), point.lng()]);
          }
          
          // Calculate new area
          const area = window.google.maps.geometry.spherical.computeArea(path);
          const sqft = area * 10.7639; // Convert sq meters to sq feet

          setSections(prevSections =>
            prevSections.map(s =>
              s.id === section.id
                ? { ...s, coordinates, area_sqft: Math.round(sqft * 100) / 100 }
                : s
            )
          );
        };

        polygon.getPath().addListener("set_at", updatePath);
        polygon.getPath().addListener("insert_at", updatePath);
        polygon.getPath().addListener("remove_at", updatePath);
      }

      // Add label
      const bounds = new window.google.maps.LatLngBounds();
      section.coordinates.forEach(coord => {
        bounds.extend({ lat: coord[0], lng: coord[1] });
      });
      
      const center = bounds.getCenter();
      const label = new window.google.maps.Marker({
        position: center,
        map: mapInstanceRef.current,
        label: {
          text: section.name,
          color: "white",
          fontSize: "14px",
          fontWeight: "bold"
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 0,
        }
      });

      polygonsRef.current[section.id] = polygon;
    });
  }, [sections, selectedSectionId]);

  const handleMapClick = (latLng) => {
    if (!currentDrawingRef.current) {
      // Start new polygon
      currentDrawingRef.current = {
        coordinates: [[latLng.lat(), latLng.lng()]],
        markers: []
      };
    } else {
      const firstPoint = currentDrawingRef.current.coordinates[0];
      const lastPoint = [latLng.lat(), latLng.lng()];
      
      // Check if clicking near first point to close polygon
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(firstPoint[0], firstPoint[1]),
        latLng
      );

      if (distance < 5 && currentDrawingRef.current.coordinates.length >= 3) {
        // Close polygon
        completePolygon();
        return;
      }

      // Add point
      currentDrawingRef.current.coordinates.push(lastPoint);
    }

    // Add marker for point
    const marker = new window.google.maps.Marker({
      position: latLng,
      map: mapInstanceRef.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: "#4A90E2",
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 2,
        scale: 6,
      }
    });

    tempMarkersRef.current.push(marker);
    currentDrawingRef.current.markers.push(marker);

    // Draw lines
    if (currentDrawingRef.current.coordinates.length > 1) {
      const polyline = new window.google.maps.Polyline({
        path: currentDrawingRef.current.coordinates.map(coord => ({
          lat: coord[0],
          lng: coord[1]
        })),
        strokeColor: "#4A90E2",
        strokeOpacity: 1,
        strokeWeight: 2,
        map: mapInstanceRef.current
      });
      
      tempMarkersRef.current.push(polyline);
    }
  };

  const completePolygon = () => {
    if (!currentDrawingRef.current || currentDrawingRef.current.coordinates.length < 3) {
      return;
    }

    // Calculate area
    const path = currentDrawingRef.current.coordinates.map(coord =>
      new window.google.maps.LatLng(coord[0], coord[1])
    );
    
    const area = window.google.maps.geometry.spherical.computeArea(path);
    const sqft = area * 10.7639; // Convert to square feet

    if (sqft < 100) {
      alert("Area is too small. Please draw a larger polygon.");
      cancelDrawing();
      return;
    }

    // Create new section
    const newSection = {
      id: Date.now(),
      name: `Section ${sections.length + 1}`,
      coordinates: currentDrawingRef.current.coordinates,
      area_sqft: Math.round(sqft * 100) / 100,
      color: SECTION_COLORS[sections.length % SECTION_COLORS.length].fill
    };

    setSections(prev => [...prev, newSection]);
    
    // Clean up drawing
    tempMarkersRef.current.forEach(item => item.setMap(null));
    tempMarkersRef.current = [];
    currentDrawingRef.current = null;
    setDrawingMode(false);
  };

  const cancelDrawing = () => {
    tempMarkersRef.current.forEach(item => item.setMap(null));
    tempMarkersRef.current = [];
    currentDrawingRef.current = null;
    setDrawingMode(false);
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && drawingMode) {
        cancelDrawing();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawingMode]);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-slate-900 flex items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <p className="font-semibold mb-2">{error}</p>
            <p className="text-sm">
              To enable the measurement tool:
            </p>
            <ol className="text-sm mt-2 ml-4 list-decimal space-y-1">
              <li>Get a Google Maps API key from Google Cloud Console</li>
              <li>Enable Maps JavaScript API and Geocoding API</li>
              <li>Add the API key to your app configuration</li>
            </ol>
            <p className="text-sm mt-3">
              For now, you can continue to see the results page with sample data.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Drawing Instructions Overlay */}
      {drawingMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-10">
          <p className="font-medium">
            Click to add points around the roof perimeter. Click near the first point to close.
          </p>
          <p className="text-sm mt-1 text-blue-100">
            Press ESC to cancel
          </p>
        </div>
      )}
    </div>
  );
}