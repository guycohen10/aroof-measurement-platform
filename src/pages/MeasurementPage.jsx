import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, Edit3, Trash2, Plus, Layers, TrendingUp, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SECTION_COLORS = [
  { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.3)', name: 'Red' },
  { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.3)', name: 'Green' },
  { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.3)', name: 'Blue' },
  { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.3)', name: 'Orange' },
  { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.3)', name: 'Purple' },
  { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.3)', name: 'Pink' },
  { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.3)', name: 'Cyan' },
  { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.3)', name: 'DeepOrange' },
];

const PITCH_OPTIONS = [
  { value: 'flat', label: 'Flat (0/12)', multiplier: 1.00 },
  { value: '2/12', label: '2/12 pitch', multiplier: 1.02 },
  { value: '3/12', label: '3/12 pitch', multiplier: 1.03 },
  { value: '4/12', label: '4/12 pitch', multiplier: 1.05 },
  { value: '5/12', label: '5/12 pitch', multiplier: 1.08 },
  { value: '6/12', label: '6/12 pitch', multiplier: 1.12 },
  { value: '7/12', label: '7/12 pitch', multiplier: 1.16 },
  { value: '8/12', label: '8/12 pitch', multiplier: 1.20 },
  { value: '9/12', label: '9/12 pitch', multiplier: 1.25 },
  { value: '10/12', label: '10/12 pitch', multiplier: 1.30 },
  { value: '11/12', label: '11/12 pitch', multiplier: 1.36 },
  { value: '12/12', label: '12/12 pitch', multiplier: 1.41 },
  { value: 'steep', label: 'Steep (over 12/12)', multiplier: 1.50 },
];

const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

export default function MeasurementPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  
  const [address, setAddress] = useState("");
  const [measurementId, setMeasurementId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [baseImageUrl, setBaseImageUrl] = useState("");
  
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [mapMetadata, setMapMetadata] = useState({
    centerLat: 0,
    centerLng: 0,
    zoom: 21,
    imageWidth: 1200,
    imageHeight: 800,
    scale: 2
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressParam = urlParams.get('address');
    const latParam = urlParams.get('lat');
    const lngParam = urlParams.get('lng');
    const measurementIdParam = urlParams.get('measurementId');
    
    if (!addressParam) {
      navigate(createPageUrl("FormPage"));
      return;
    }
    
    const decodedAddress = decodeURIComponent(addressParam);
    setAddress(decodedAddress);

    if (measurementIdParam) {
      setMeasurementId(measurementIdParam);
    }

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoordinates({ lat, lng });
        loadStaticMap(lat, lng);
      }
    }

    setLoading(false);
  }, [navigate]);

  const loadStaticMap = (lat, lng) => {
    setImageLoading(true);
    setError("");
    
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=21&size=1200x800&scale=2&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
    
    setBaseImageUrl(staticMapUrl);
    setMapMetadata(prev => ({
      ...prev,
      centerLat: lat,
      centerLng: lng
    }));

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = staticMapUrl;
    
    img.onload = () => {
      imageRef.current = img;
      setImageLoading(false);
      redrawCanvas();
    };
    
    img.onerror = () => {
      setError("Failed to load satellite image. Please refresh.");
      setImageLoading(false);
    };
  };

  const pixelToLatLng = (pixelX, pixelY) => {
    const metersPerPixel = 156543.03392 * Math.cos(mapMetadata.centerLat * Math.PI / 180) / Math.pow(2, mapMetadata.zoom) / mapMetadata.scale;
    
    const centerPixelX = mapMetadata.imageWidth / 2;
    const centerPixelY = mapMetadata.imageHeight / 2;
    
    const offsetX = (pixelX - centerPixelX) * metersPerPixel;
    const offsetY = (centerPixelY - pixelY) * metersPerPixel;
    
    const lat = mapMetadata.centerLat + (offsetY / 111320);
    const lng = mapMetadata.centerLng + (offsetX / (111320 * Math.cos(mapMetadata.centerLat * Math.PI / 180)));
    
    return { lat, lng };
  };

  const latLngToPixel = (lat, lng) => {
    const metersPerPixel = 156543.03392 * Math.cos(mapMetadata.centerLat * Math.PI / 180) / Math.pow(2, mapMetadata.zoom) / mapMetadata.scale;
    
    const offsetLat = lat - mapMetadata.centerLat;
    const offsetLng = lng - mapMetadata.centerLng;
    
    const metersY = offsetLat * 111320;
    const metersX = offsetLng * (111320 * Math.cos(mapMetadata.centerLat * Math.PI / 180));
    
    const centerPixelX = mapMetadata.imageWidth / 2;
    const centerPixelY = mapMetadata.imageHeight / 2;
    
    const x = centerPixelX + (metersX / metersPerPixel);
    const y = centerPixelY - (metersY / metersPerPixel);
    
    return { x, y };
  };

  const calculatePolygonArea = (points) => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const xi = points[i].lng * 111320 * Math.cos(points[i].lat * Math.PI / 180);
      const yi = points[i].lat * 111320;
      const xj = points[j].lng * 111320 * Math.cos(points[j].lat * Math.PI / 180);
      const yj = points[j].lat * 111320;
      area += xi * yj - xj * yi;
    }
    
    area = Math.abs(area) / 2;
    const areaInSquareFeet = area * 10.764;
    return Math.round(areaInSquareFeet * 100) / 100;
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    sections.forEach((section, idx) => {
      const color = SECTION_COLORS[idx % SECTION_COLORS.length];
      
      if (section.coordinates && section.coordinates.length > 0) {
        const pixels = section.coordinates.map(coord => latLngToPixel(coord.lat, coord.lng));
        
        ctx.fillStyle = color.fill;
        ctx.strokeStyle = color.stroke;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(pixels[0].x, pixels[0].y);
        for (let i = 1; i < pixels.length; i++) {
          ctx.lineTo(pixels[i].x, pixels[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        pixels.forEach(p => {
          ctx.fillStyle = color.stroke;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });
    
    if (currentSection.length > 0) {
      const color = SECTION_COLORS[sections.length % SECTION_COLORS.length];
      
      currentSection.forEach((point, i) => {
        ctx.fillStyle = color.stroke;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        if (i > 0) {
          ctx.strokeStyle = color.stroke;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(currentSection[i - 1].x, currentSection[i - 1].y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      });
    }
  };

  const handleCanvasClick = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const latLng = pixelToLatLng(x, y);
    
    setCurrentSection(prev => [...prev, { lat: latLng.lat, lng: latLng.lng, x, y }]);
    
    setTimeout(redrawCanvas, 0);
  };

  const handleCanvasDoubleClick = () => {
    if (currentSection.length < 3) {
      setError("Need at least 3 points to complete a section");
      return;
    }
    
    const coordinates = currentSection.map(p => ({ lat: p.lat, lng: p.lng }));
    const flatArea = calculatePolygonArea(coordinates);
    
    const colorIndex = sections.length % SECTION_COLORS.length;
    const color = SECTION_COLORS[colorIndex];
    
    const newSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      flat_area_sqft: flatArea,
      pitch: 'flat',
      pitch_multiplier: 1.00,
      adjusted_area_sqft: flatArea,
      color: color.stroke,
      coordinates: coordinates
    };
    
    setSections(prev => [...prev, newSection]);
    setCurrentSection([]);
    setIsDrawing(false);
    setError("");
    
    setTimeout(redrawCanvas, 0);
  };

  const startDrawingSection = () => {
    if (!baseImageUrl) {
      setError("Map not loaded yet");
      return;
    }
    setIsDrawing(true);
    setCurrentSection([]);
    setError("");
  };

  const deleteSection = (sectionId) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setTimeout(redrawCanvas, 0);
  };

  const updateSectionPitch = (sectionId, pitchValue) => {
    const pitchOption = PITCH_OPTIONS.find(p => p.value === pitchValue);
    if (!pitchOption) return;

    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            pitch: pitchValue,
            pitch_multiplier: pitchOption.multiplier,
            adjusted_area_sqft: Math.round(section.flat_area_sqft * pitchOption.multiplier * 100) / 100
          }
        : section
    ));
  };

  const updateSectionName = (sectionId, name) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, name } : section
    ));
  };

  const getTotalFlatArea = () => {
    return sections.reduce((sum, section) => sum + section.flat_area_sqft, 0);
  };

  const getTotalAdjustedArea = () => {
    return sections.reduce((sum, section) => sum + section.adjusted_area_sqft, 0);
  };

  const calculateRoofComponents = (sections) => {
    let totalFlatArea = 0;
    let totalActualArea = 0;
    let totalEaves = 0;
    let totalRakes = 0;
    let totalRidges = 0;
    let totalHips = 0;
    let totalValleys = 0;
    let totalSteps = 0;
    
    const pitchBreakdown = {};
    
    sections.forEach(section => {
      const flatArea = section.flat_area_sqft;
      const pitchMultiplier = section.pitch_multiplier;
      const actualArea = section.adjusted_area_sqft;
      
      totalFlatArea += flatArea;
      totalActualArea += actualArea;
      
      const pitchKey = section.pitch || "flat";
      if (!pitchBreakdown[pitchKey]) {
        pitchBreakdown[pitchKey] = 0;
      }
      pitchBreakdown[pitchKey] += actualArea / 100;
      
      const avgDimension = Math.sqrt(flatArea);
      const perimeter = avgDimension * 4;
      
      totalEaves += perimeter * 0.4;
      totalRakes += (perimeter * 0.3) * pitchMultiplier;
      totalRidges += avgDimension * 0.5;
      totalHips += avgDimension * 0.3 * pitchMultiplier;
      totalValleys += avgDimension * 0.2 * pitchMultiplier;
      totalSteps += perimeter * 0.15;
    });
    
    return {
      totalFlatArea: Math.round(totalFlatArea * 100) / 100,
      totalActualArea: Math.round(totalActualArea * 100) / 100,
      totalSquares: Math.round((totalActualArea / 100) * 100) / 100,
      eaves: Math.round(totalEaves * 10) / 10,
      rakes: Math.round(totalRakes * 10) / 10,
      ridges: Math.round(totalRidges * 10) / 10,
      hips: Math.round(totalHips * 10) / 10,
      valleys: Math.round(totalValleys * 10) / 10,
      steps: Math.round(totalSteps * 10) / 10,
      walls: 0,
      pitchBreakdown: pitchBreakdown
    };
  };

  const handleCompleteMeasurement = async () => {
    if (sections.length === 0) {
      setError("Please draw at least one section");
      return;
    }

    const totalAdjusted = getTotalAdjustedArea();
    
    if (totalAdjusted < 100) {
      setError("Total area seems too small. Please verify.");
      return;
    }

    if (totalAdjusted > 50000) {
      setError("Total area seems too large. Please verify.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const totalFlat = getTotalFlatArea();
      const totalAdjusted = getTotalAdjustedArea();
      const sectionsData = sections.map(s => s);
      const roofComponents = calculateRoofComponents(sections);

      const measurementData = {
        measurement_data: {
          total_flat_sqft: totalFlat,
          total_adjusted_sqft: totalAdjusted,
          sections: sectionsData
        },
        total_sqft: totalFlat,
        total_adjusted_sqft: totalAdjusted,
        eaves_ft: roofComponents.eaves,
        rakes_ft: roofComponents.rakes,
        ridges_ft: roofComponents.ridges,
        hips_ft: roofComponents.hips,
        valleys_ft: roofComponents.valleys,
        steps_ft: roofComponents.steps,
        walls_ft: roofComponents.walls,
        pitch_breakdown: roofComponents.pitchBreakdown,
        base_image_url: baseImageUrl,
        base_image_center: {
          lat: mapMetadata.centerLat,
          lng: mapMetadata.centerLng
        },
        status: "completed",
        completed_at: new Date().toISOString()
      };

      let savedMeasurementId = measurementId;
      let savedMeasurement;

      if (measurementId) {
        await base44.entities.Measurement.update(measurementId, measurementData);
        const updated = await base44.entities.Measurement.filter({ id: measurementId });
        savedMeasurement = updated[0];
      } else {
        savedMeasurement = await base44.entities.Measurement.create({
          property_address: address,
          user_type: "homeowner",
          payment_amount: 3,
          payment_status: "completed",
          stripe_payment_id: "demo_" + Date.now(),
          ...measurementData
        });
        
        savedMeasurementId = savedMeasurement.id;
      }

      if (!savedMeasurementId) {
        throw new Error("Failed to get measurement ID");
      }

      const resultsUrl = createPageUrl(`Results?measurementid=${savedMeasurementId}`);
      navigate(resultsUrl);
      
    } catch (err) {
      console.error("ERROR SAVING:", err);
      setError(`Failed to save: ${err.message}`);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalFlat = getTotalFlatArea();
  const totalAdjusted = getTotalAdjustedArea();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl("FormPage")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Measure Your Roof</h2>
            <p className="text-sm text-slate-600 mb-4">
              Draw sections on the satellite image
            </p>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-bold text-blue-900 truncate">{address}</p>
            </div>
          </div>

          <div className="p-4 border-b">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={startDrawingSection}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700"
              disabled={isDrawing || imageLoading}
            >
              {isDrawing ? (
                <>Drawing Section {sections.length + 1}...</>
              ) : imageLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading Map...
                </>
              ) : sections.length === 0 ? (
                <>
                  <Edit3 className="w-5 h-5 mr-2" />
                  Start Drawing Section 1
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Section {sections.length + 1}
                </>
              )}
            </Button>
            
            {isDrawing && (
              <p className="text-xs text-blue-600 mt-2 text-center font-semibold">
                Click to add points • Double-click to finish
              </p>
            )}
          </div>

          {sections.length > 0 && (
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Sections ({sections.length})
                </h3>
              </div>

              {sections.map((section) => (
                <Card key={section.id} className="p-4 border-2" style={{ borderColor: section.color }}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: section.color }}
                      />
                      <Input
                        value={section.name}
                        onChange={(e) => updateSectionName(section.id, e.target.value)}
                        className="flex-1 font-semibold"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSection(section.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="bg-slate-50 rounded p-3">
                      <p className="text-xs text-slate-600">Flat Area</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {section.flat_area_sqft.toLocaleString()} sq ft
                      </p>
                    </div>

                    <Select
                      value={section.pitch}
                      onValueChange={(value) => updateSectionPitch(section.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PITCH_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {section.pitch !== 'flat' && (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Actual Surface Area
                        </p>
                        <p className="text-xl font-bold text-green-900">
                          {section.adjusted_area_sqft.toLocaleString()} sq ft
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {sections.length > 0 && (
            <div className="p-6 border-t bg-gradient-to-br from-green-50 to-blue-50">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Total Roof Area</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Flat:</span>
                  <span className="text-lg font-bold">{totalFlat.toLocaleString()} sq ft</span>
                </div>
                
                {totalAdjusted !== totalFlat && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-semibold text-green-700">Adjusted:</span>
                    <span className="text-2xl font-bold text-green-900">
                      {totalAdjusted.toLocaleString()} sq ft
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleCompleteMeasurement}
                disabled={sections.length === 0 || saving}
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Measurement
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 relative bg-slate-900 flex items-center justify-center">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/80">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-white">Loading satellite image...</p>
              </div>
            </div>
          )}

          {baseImageUrl && (
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              onClick={handleCanvasClick}
              onDoubleClick={handleCanvasDoubleClick}
              className="max-w-full max-h-full cursor-crosshair shadow-2xl"
              style={{ 
                cursor: isDrawing ? 'crosshair' : 'default',
                imageRendering: 'crisp-edges'
              }}
            />
          )}

          {isDrawing && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-10">
              <p className="text-sm font-bold">
                Click to add points • Double-click to finish
              </p>
              <p className="text-xs mt-1">
                {currentSection.length} point{currentSection.length !== 1 ? 's' : ''} placed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}