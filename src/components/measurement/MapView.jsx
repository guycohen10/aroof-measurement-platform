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

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle);
            initializeMap();
          }
        }, 100);
        return;
      }

      // Load the script
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      
      if (!apiKey) {
        setError(
          "Google Maps API key not configured. Please add GOOGLE_MAPS_API_KEY to your app secrets."
        );
        setLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("Google Maps loaded successfully");
        initializeMap();
      };
      
      script.onerror = () => {
        setError("Failed to load Google Maps. Please check your API key and internet connection.");
        setLoading(false);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = async () => {
    try {
      if (!window.google || !window.google.maps) {
        setError("Google Maps not available");
        setLoading(false);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      
      console.log("Geocoding address:", propertyAddress);
      
      // Geocode the address
      geocoder.geocode({ address: propertyAddress }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          
          console.log("Location found:", location.toString());
          
          // Create map with satellite view
          const map = new window.google.maps.Map(mapRef.current, {
            center: location,
            zoom: 20,
            mapTypeId: "satellite",
            tilt: 0,
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: window.google.maps.ControlPosition.TOP_RIGHT,
              style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              mapTypeIds: ["satellite", "hybrid", "roadmap"]
            },
            streetViewControl: false,
            fullscreenControl: true,
            fullscreenControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_TOP
            },
            zoomControl: true,
            zoomControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_CENTER
            },
            rotateControl: true,
            rotateControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_CENTER
            },
            scaleControl: true
          });

          mapInstanceRef.current = map;

          // Add marker at property location
          new window.google.maps.Marker({
            position: location,
            map: map,
            title: propertyAddress,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#FF0000",
              fillOpacity: 0.8,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
              scale: 8,
            }
          });

          // Add click listener for drawing
          map.addListener("click", (e) => {
            if (drawingMode) {
              handleMapClick(e.latLng);
            }
          });

          setLoading(false);
        } else {
          console.error("Geocoding failed:", status);
          setError(`Could not locate address: ${propertyAddress}. Status: ${status}`);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error("Map initialization error:", err);
      setError(`Failed to initialize map: ${err.message}`);
      setLoading(false);
    }
  };

  // Draw existing sections on map
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
        strokeWeight: isSelected ? 4 : 3,
        fillColor: color.fill,
        fillOpacity: 0.4,
        editable: isSelected,
        draggable: false,
        map: mapInstanceRef.current
      });

      // Click to select
      polygon.addListener("click", () => {
        setSelectedSectionId(section.id);
        setDrawingMode(false);
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

      // Add label at center
      const bounds = new window.google.maps.LatLngBounds();
      section.coordinates.forEach(coord => {
        bounds.extend({ lat: coord[0], lng: coord[1] });
      });
      
      const center = bounds.getCenter();
      new window.google.maps.Marker({
        position: center,
        map: mapInstanceRef.current,
        label: {
          text: `${section.name}\n${section.area_sqft.toLocaleString()} sq ft`,
          color: "white",
          fontSize: "12px",
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
      
      // Check if clicking near first point to close polygon (within 10 meters)
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(firstPoint[0], firstPoint[1]),
        latLng
      );

      if (distance < 10 && currentDrawingRef.current.coordinates.length >= 3) {
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
        scale: 7,
      }
    });

    tempMarkersRef.current.push(marker);
    currentDrawingRef.current.markers.push(marker);

    // Draw lines between points
    if (currentDrawingRef.current.coordinates.length > 1) {
      const polyline = new window.google.maps.Polyline({
        path: currentDrawingRef.current.coordinates.map(coord => ({
          lat: coord[0],
          lng: coord[1]
        })),
        strokeColor: "#4A90E2",
        strokeOpacity: 1,
        strokeWeight: 3,
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

    if (sqft < 10) {
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

  // Handle escape key to cancel drawing
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
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading satellite map...</p>
          <p className="text-slate-400 text-sm mt-2">Locating {propertyAddress}</p>
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
                <li>Add the API key to your app settings as GOOGLE_MAPS_API_KEY</li>
              </ol>
            </div>
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
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-lg shadow-2xl z-10 max-w-md">
          <p className="font-bold text-lg mb-1">
            🖱️ Click to Add Points
          </p>
          <p className="text-sm text-blue-100">
            Click around the roof perimeter. Click near the first point when done, or press ESC to cancel.
          </p>
        </div>
      )}

      {/* Map Controls Help */}
      {!drawingMode && sections.length === 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 text-white px-6 py-3 rounded-lg shadow-lg z-10">
          <p className="text-sm">
            <strong>💡 Tip:</strong> Zoom in closer to the roof for more accurate measurements
          </p>
        </div>
      )}
    </div>
  );
}