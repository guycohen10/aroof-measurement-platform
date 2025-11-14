import React, { useState, useEffect, useRef, useCallback } from "react";
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
  { stroke: '#4A90E2', fill: '#4A90E2', name: 'Blue' },
  { stroke: '#10b981', fill: '#10b981', name: 'Green' },
  { stroke: '#f97316', fill: '#f97316', name: 'Orange' },
  { stroke: '#a855f7', fill: '#a855f7', name: 'Purple' },
  { stroke: '#ef4444', fill: '#ef4444', name: 'Red' },
  { stroke: '#06b6d4', fill: '#06b6d4', name: 'Cyan' },
  { stroke: '#f59e0b', fill: '#f59e0b', name: 'Amber' },
  { stroke: '#ec4899', fill: '#ec4899', name: 'Pink' },
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
const MAP_ZOOM = 21;
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;
const MAP_SCALE = 2;

export default function MeasurementPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  const [address, setAddress] = useState("");
  const [measurementId, setMeasurementId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geocodingStatus, setGeocodingStatus] = useState("Initializing...");
  const [error, setError] = useState("");
  
  const [baseImageUrl, setBaseImageUrl] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);

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

    const initializeMap = async () => {
      let lat, lng;

      if (latParam && lngParam) {
        lat = parseFloat(latParam);
        lng = parseFloat(lngParam);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log("✅ Using provided coordinates:", lat, lng);
          setMapCenter({ lat, lng });
          const imageUrl = generateStaticMapUrl(lat, lng);
          console.log("📷 Generated image URL:", imageUrl);
          setBaseImageUrl(imageUrl);
          setGeocodingStatus("Loading satellite image...");
          setLoading(false);
          return;
        }
      }

      setGeocodingStatus("Finding address location...");
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(decodedAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
        
        console.log("🔍 Geocoding address...");
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        console.log("📍 Geocode response:", data.status);
        
        if (data.status === "OK" && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          lat = location.lat;
          lng = location.lng;
          
          console.log("✅ Address geocoded:", lat, lng);
          setMapCenter({ lat, lng });
          const imageUrl = generateStaticMapUrl(lat, lng);
          console.log("📷 Generated image URL:", imageUrl);
          setBaseImageUrl(imageUrl);
          setGeocodingStatus("Loading satellite image...");
        } else {
          console.error("❌ Geocoding failed:", data.status);
          setError(`Could not find address: ${data.status}`);
        }
      } catch (err) {
        console.error("❌ Geocoding error:", err);
        setError(`Failed to geocode address: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeMap();
  }, [navigate]);

  const generateStaticMapUrl = (lat, lng) => {
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${MAP_ZOOM}&size=${MAP_WIDTH}x${MAP_HEIGHT}&scale=${MAP_SCALE}&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
    return url;
  };

  useEffect(() => {
    if (!baseImageUrl || !containerRef.current) return;

    console.log("🖼️ Loading image:", baseImageUrl);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log("✅ Image loaded successfully!");
      imageRef.current = img;
      setImageLoaded(true);
      setImageError(false);
      setGeocodingStatus("Ready to measure!");
      redrawCanvas();
    };

    img.onerror = (e) => {
      console.error("❌ Failed to load image:", e);
      console.error("Image URL:", baseImageUrl);
      setImageError(true);
      setError("Failed to load satellite image. The image URL may be invalid or blocked by CORS policy.");
    };

    img.src = baseImageUrl;
  }, [baseImageUrl]);

  const pixelToLatLng = useCallback((pixelX, pixelY) => {
    if (!mapCenter) return null;

    const metersPerPixel = 156543.03392 * Math.cos(mapCenter.lat * Math.PI / 180) / Math.pow(2, MAP_ZOOM);
    
    const centerPixelX = MAP_WIDTH / 2;
    const centerPixelY = MAP_HEIGHT / 2;
    
    const offsetX = (pixelX - centerPixelX) * metersPerPixel;
    const offsetY = (centerPixelY - pixelY) * metersPerPixel;
    
    const lat = mapCenter.lat + (offsetY / 111320);
    const lng = mapCenter.lng + (offsetX / (111320 * Math.cos(mapCenter.lat * Math.PI / 180)));
    
    return { lat, lng };
  }, [mapCenter]);

  const latLngToPixel = useCallback((lat, lng) => {
    if (!mapCenter) return null;

    const metersPerPixel = 156543.03392 * Math.cos(mapCenter.lat * Math.PI / 180) / Math.pow(2, MAP_ZOOM);
    
    const latDiff = lat - mapCenter.lat;
    const lngDiff = lng - mapCenter.lng;
    
    const offsetY = latDiff * 111320;
    const offsetX = lngDiff * 111320 * Math.cos(mapCenter.lat * Math.PI / 180);
    
    const centerPixelX = MAP_WIDTH / 2;
    const centerPixelY = MAP_HEIGHT / 2;
    
    const pixelX = centerPixelX + (offsetX / metersPerPixel);
    const pixelY = centerPixelY - (offsetY / metersPerPixel);
    
    return { x: pixelX, y: pixelY };
  }, [mapCenter]);

  const calculatePolygonArea = useCallback((points) => {
    if (points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].lat * points[j].lng;
      area -= points[j].lat * points[i].lng;
    }
    area = Math.abs(area) / 2;

    const sqMeters = area * 111320 * 111320 * Math.cos(mapCenter.lat * Math.PI / 180);
    const sqFeet = sqMeters * 10.764;
    
    return sqFeet;
  }, [mapCenter]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    
    // Draw the satellite image first
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    ctx.drawImage(imageRef.current, 0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Draw completed sections
    sections.forEach((section, idx) => {
      const color = section.color || SECTION_COLORS[idx % SECTION_COLORS.length].stroke;
      
      if (section.coordinates && section.coordinates.length > 0) {
        const pixels = section.coordinates.map(coord => latLngToPixel(coord.lat, coord.lng)).filter(p => p);
        
        if (pixels.length > 2) {
          ctx.fillStyle = color + '55';
          ctx.beginPath();
          ctx.moveTo(pixels[0].x, pixels[0].y);
          for (let i = 1; i < pixels.length; i++) {
            ctx.lineTo(pixels[i].x, pixels[i].y);
          }
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.stroke();

          pixels.forEach(pixel => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(pixel.x, pixel.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        }
      }
    });

    // Draw current section being drawn
    if (currentSection.length > 0) {
      const color = SECTION_COLORS[sections.length % SECTION_COLORS.length].stroke;
      
      if (currentSection.length > 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(currentSection[0].x, currentSection[0].y);
        for (let i = 1; i < currentSection.length; i++) {
          ctx.lineTo(currentSection[i].x, currentSection[i].y);
        }
        ctx.stroke();
      }

      currentSection.forEach(point => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [sections, currentSection, imageLoaded, latLngToPixel]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleCanvasClick = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = MAP_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const latLng = pixelToLatLng(x, y);
    if (!latLng) return;

    const newPoint = { ...latLng, x, y };
    setCurrentSection(prev => [...prev, newPoint]);
  };

  const completeSection = () => {
    if (currentSection.length < 3) {
      setError("Please draw at least 3 points");
      return;
    }

    const coordinates = currentSection.map(p => ({ lat: p.lat, lng: p.lng }));
    const flatArea = calculatePolygonArea(coordinates);

    const colorIndex = sections.length % SECTION_COLORS.length;
    const newSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      coordinates: coordinates,
      flat_area_sqft: flatArea,
      pitch: 'flat',
      pitch_multiplier: 1.00,
      adjusted_area_sqft: flatArea,
      color: SECTION_COLORS[colorIndex].stroke
    };

    setSections(prev => [...prev, newSection]);
    setCurrentSection([]);
    setIsDrawing(false);
    setError("");
  };

  const undoLastPoint = () => {
    setCurrentSection(prev => prev.slice(0, -1));
  };

  const startDrawingSection = () => {
    if (!imageLoaded) {
      setError("Please wait for the satellite image to load");
      return;
    }
    setIsDrawing(true);
    setCurrentSection([]);
    setError("");
  };

  const deleteSection = (sectionId) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
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
      setError("Total area seems too small. Please verify your measurement.");
      return;
    }

    if (totalAdjusted > 50000) {
      setError("Total area seems unusually large. Please verify your measurement.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const totalFlat = getTotalFlatArea();
      const totalAdjusted = getTotalAdjustedArea();
      const sectionsData = sections.map(s => ({
        id: s.id,
        name: s.name,
        coordinates: s.coordinates,
        flat_area_sqft: s.flat_area_sqft,
        pitch: s.pitch,
        pitch_multiplier: s.pitch_multiplier,
        adjusted_area_sqft: s.adjusted_area_sqft,
        color: s.color
      }));
      const roofComponents = calculateRoofComponents(sections);

      const measurementData = {
        base_image_url: baseImageUrl,
        map_center_lat: mapCenter.lat,
        map_center_lng: mapCenter.lng,
        map_zoom: MAP_ZOOM,
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
      console.error("ERROR SAVING MEASUREMENT:", err);
      setError(`Failed to save measurement: ${err.message}. Please try again.`);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">{geocodingStatus}</p>
        </div>
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
        {/* Left Sidebar */}
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Measure Your Roof</h2>
            <p className="text-sm text-slate-600 mb-4">
              Draw sections on the satellite image, then adjust pitch
            </p>
            <p className="text-sm text-blue-600 font-medium break-words">{address}</p>
          </div>

          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          {imageError && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Failed to load satellite image. Please try refreshing the page.
                <br />
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm"
                  className="mt-2 w-full"
                >
                  Refresh Page
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Drawing Controls */}
          <div className="p-4 border-b border-slate-200">
            {!isDrawing && currentSection.length === 0 && (
              <Button
                onClick={startDrawingSection}
                disabled={!imageLoaded || imageError}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                {sections.length === 0 ? 'Start Drawing Section 1' : `Add Section ${sections.length + 1}`}
              </Button>
            )}

            {isDrawing && (
              <div className="space-y-2">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-sm text-blue-900">
                    Click on the image to add points. Need at least 3 points.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    onClick={undoLastPoint}
                    variant="outline"
                    className="flex-1"
                    disabled={currentSection.length === 0}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Undo
                  </Button>
                  <Button
                    onClick={completeSection}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={currentSection.length < 3}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  {currentSection.length} point{currentSection.length !== 1 ? 's' : ''} drawn
                </p>
              </div>
            )}
          </div>

          {/* Sections List */}
          {sections.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Roof Sections ({sections.length})
                </h3>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <Card key={section.id} className="p-4 border-2" style={{ borderColor: section.color }}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
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
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

                      <div>
                        <label className="text-xs font-medium text-slate-700 mb-1 block">
                          Roof Pitch:
                        </label>
                        <Select
                          value={section.pitch}
                          onValueChange={(value) => updateSectionPitch(section.id, value)}
                        >
                          <SelectTrigger className="w-full">
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
                      </div>

                      {section.pitch !== 'flat' && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-xs text-green-700 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Actual Surface Area
                          </p>
                          <p className="text-xl font-bold text-green-900">
                            {section.adjusted_area_sqft.toLocaleString()} sq ft
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            × {section.pitch_multiplier.toFixed(2)} multiplier
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Total and Complete Button */}
          {sections.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-gradient-to-br from-green-50 to-blue-50">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Total Roof Area</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Flat Area:</span>
                  <span className="text-lg font-bold text-slate-900">
                    {totalFlat.toLocaleString()} sq ft
                  </span>
                </div>
                
                {totalAdjusted !== totalFlat && (
                  <div className="flex justify-between items-center pt-2 border-t border-green-200">
                    <span className="text-sm font-semibold text-green-700">
                      Adjusted for Pitch:
                    </span>
                    <span className="text-2xl font-bold text-green-900">
                      {totalAdjusted.toLocaleString()} sq ft
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleCompleteMeasurement}
                disabled={sections.length === 0 || saving || isDrawing}
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

        {/* Map Container */}
        <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-auto p-8">
          {!imageLoaded && !imageError && baseImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-white text-lg">{geocodingStatus}</p>
                <p className="text-slate-400 text-sm mt-2">Loading satellite image...</p>
              </div>
            </div>
          )}

          {isDrawing && imageLoaded && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10">
              <p className="text-sm font-bold mb-1">
                🖱️ Click to Draw Section {sections.length + 1}
              </p>
              <p className="text-xs">
                Add points by clicking. Need at least 3 points to complete.
              </p>
            </div>
          )}

          {sections.length > 0 && !isDrawing && imageLoaded && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-green-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-10">
              <p className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {sections.length} section{sections.length !== 1 ? 's' : ''} drawn | {totalAdjusted.toLocaleString()} sq ft total
              </p>
            </div>
          )}

          <div ref={containerRef} className="relative shadow-2xl rounded-lg overflow-hidden" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              onClick={handleCanvasClick}
              className="absolute top-0 left-0 cursor-crosshair"
              style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}