import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Loader2, AlertCircle, Maximize2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SECTION_COLORS = [
  { fill: "#4A90E2", stroke: "#2E5C8A" },
  { fill: "#50C878", stroke: "#2E7D4E" },
  { fill: "#FF8C42", stroke: "#CC6F35" },
  { fill: "#9B59B6", stroke: "#7D3C98" },
  { fill: "#E74C3C", stroke: "#C0392B" },
];

export default function ResultsMapView({ propertyAddress, sections, measurementId }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const initializeMap = () => {
      if (!window.google || !window.google.maps) {
        setError("Google Maps not available");
        setLoading(false);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: propertyAddress }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          
          const map = new window.google.maps.Map(mapRef.current, {
            center: location,
            zoom: 20,
            mapTypeId: "satellite",
            tilt: 0,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            rotateControl: true,
          });

          mapInstanceRef.current = map;

          // Draw sections
          if (sections && sections.length > 0) {
            sections.forEach((section, index) => {
              if (!section.coordinates || section.coordinates.length < 3) return;

              const color = SECTION_COLORS[index % SECTION_COLORS.length];

              const polygon = new window.google.maps.Polygon({
                paths: section.coordinates.map(coord => ({
                  lat: coord[0],
                  lng: coord[1]
                })),
                strokeColor: color.stroke,
                strokeOpacity: 1,
                strokeWeight: 3,
                fillColor: color.fill,
                fillOpacity: 0.5,
                map: map
              });

              // Add label with area
              const bounds = new window.google.maps.LatLngBounds();
              section.coordinates.forEach(coord => {
                bounds.extend({ lat: coord[0], lng: coord[1] });
              });
              
              const center = bounds.getCenter();
              new window.google.maps.Marker({
                position: center,
                map: map,
                label: {
                  text: `${section.name}\n${section.area_sqft.toLocaleString()} sq ft`,
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold"
                },
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 0,
                }
              });
            });
          }

          setLoading(false);
        } else {
          setError("Could not locate property");
          setLoading(false);
        }
      });
    };

    if (propertyAddress) {
      initializeMap();
    }
  }, [propertyAddress, sections]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (error || !window.google) {
    return (
      <Card className="border-none shadow-xl">
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Map preview not available. Your measurement data has been saved and can be viewed in the PDF report.
            </AlertDescription>
          </Alert>
          {sections.length > 0 && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900 mb-2">Measured Sections:</p>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id} className="text-slate-700">
                    • {section.name}: {section.area_sqft.toLocaleString()} sq ft
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-none shadow-xl ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardContent className="p-0 relative">
        <div className={`relative ${isFullscreen ? 'h-screen' : 'h-96 lg:h-[500px]'}`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-slate-600">Loading map...</p>
              </div>
            </div>
          )}
          
          <div ref={mapRef} className="w-full h-full rounded-lg" />

          {/* Overlay Controls */}
          {!loading && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <Button
                onClick={toggleFullscreen}
                size="sm"
                className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Link to={createPageUrl(`MeasurementTool?measurementId=${measurementId}`)}>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-full"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          )}

          {/* Legend */}
          {!loading && sections.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
              <p className="text-sm font-bold text-slate-900 mb-2">Measured Sections</p>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div key={section.id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: SECTION_COLORS[index % SECTION_COLORS.length].fill }}
                    />
                    <span className="text-sm text-slate-700">
                      {section.name}: <strong>{section.area_sqft.toLocaleString()} sq ft</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}