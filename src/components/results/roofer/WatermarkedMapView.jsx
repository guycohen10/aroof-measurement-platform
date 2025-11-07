import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Edit2, Download, Maximize2, Loader2 } from "lucide-react";

const SECTION_COLORS = [
  { fill: "#4A90E2", stroke: "#2E5C8A" },
  { fill: "#50C878", stroke: "#2E7D4E" },
  { fill: "#FF8C42", stroke: "#CC6F35" },
  { fill: "#9B59B6", stroke: "#7D3C98" },
  { fill: "#E74C3C", stroke: "#C0392B" },
];

export default function WatermarkedMapView({ propertyAddress, sections, measurementId }) {
  const mapRef = useRef(null);
  const canvasRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    initializeMap();
  }, [propertyAddress, sections]);

  const initializeMap = () => {
    if (!window.google || !window.google.maps) {
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
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          rotateControl: false,
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

            // Add label
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
        setMapReady(true);
        
        // Apply watermark after map loads
        setTimeout(() => applyWatermark(), 1000);
      } else {
        setLoading(false);
      }
    });
  };

  const applyWatermark = () => {
    if (!canvasRef.current || !mapRef.current) return;

    const canvas = canvasRef.current;
    const mapElement = mapRef.current;
    
    // Set canvas size to match map
    canvas.width = mapElement.offsetWidth;
    canvas.height = mapElement.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Set watermark style
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    
    // Calculate diagonal position
    const text = 'Measured with Aroof.build';
    const textWidth = ctx.measureText(text).width;
    
    // Save context, rotate, and draw text diagonally
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6); // 30 degrees
    ctx.strokeText(text, -textWidth / 2, 0);
    ctx.fillText(text, -textWidth / 2, 0);
    ctx.restore();
    
    // Add small logo text in corner
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('Aroof.build', 20, canvas.height - 20);
  };

  const downloadImage = () => {
    // In production, this would capture the map and download with watermark
    alert('Download functionality will capture the watermarked map image');
  };

  if (!window.google) {
    return (
      <Card className="border-none shadow-xl">
        <CardContent className="p-6">
          <p className="text-slate-600 text-center">
            Map preview not available. Measurements are saved and can be viewed in PDF report.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="border-b bg-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Map className="w-5 h-5 text-orange-500" />
            Satellite View with Measurements
          </CardTitle>
          <div className="flex gap-2">
            <Link to={createPageUrl(`MeasurementTool?measurementId=${measurementId}`)}>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={downloadImage}>
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10 h-96">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
                <p className="text-slate-600">Loading map...</p>
              </div>
            </div>
          )}
          
          <div ref={mapRef} className="w-full h-96 lg:h-[500px]" />
          
          {/* Watermark Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
          />

          {/* Watermark Note */}
          {mapReady && (
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded px-3 py-2 text-xs text-slate-600 z-20">
              © Aroof.build - Professional Measurement
            </div>
          )}
        </div>

        {/* Map Legend */}
        {sections.length > 0 && (
          <div className="p-4 bg-slate-50 border-t">
            <p className="text-sm font-bold text-slate-900 mb-2">Section Legend</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {sections.map((section, index) => (
                <div key={section.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border-2"
                    style={{ 
                      backgroundColor: SECTION_COLORS[index % SECTION_COLORS.length].fill,
                      borderColor: SECTION_COLORS[index % SECTION_COLORS.length].stroke
                    }}
                  />
                  <span className="text-sm text-slate-700">{section.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Watermark Info */}
        <div className="p-4 bg-orange-50 border-t border-orange-200">
          <p className="text-sm text-orange-900">
            <strong>Note:</strong> All images include Aroof.build watermark for professional use. 
            Downloaded images and PDF reports will contain watermarked imagery.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}