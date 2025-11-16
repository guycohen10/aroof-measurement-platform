import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, Edit3, Trash2, Plus, Layers, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StaticMapDrawing from "../components/measurement/StaticMapDrawing";

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

export default function MeasurementPage() {
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [measurementId, setMeasurementId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [staticImageUrl, setStaticImageUrl] = useState("");
  
  const [sections, setSections] = useState([]);
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

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoordinates({ lat, lng });
        
        // Generate static image URL
        const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=21&size=1200x800&scale=2&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
        setStaticImageUrl(imageUrl);
      }
    }

    setLoading(false);
  }, [navigate]);

  const calculateArea = (coordinates) => {
    if (coordinates.length < 3) return 0;
    
    // Use Shoelace formula for polygon area
    let area = 0;
    const R = 6371000; // Earth radius in meters
    
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      const lat1 = coordinates[i].lat * Math.PI / 180;
      const lat2 = coordinates[j].lat * Math.PI / 180;
      const lng1 = coordinates[i].lng * Math.PI / 180;
      const lng2 = coordinates[j].lng * Math.PI / 180;
      
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    
    area = Math.abs(area * R * R / 2);
    const areaInSquareFeet = area * 10.764;
    return Math.round(areaInSquareFeet * 100) / 100;
  };

  const handleSectionComplete = (coordinates) => {
    const flatArea = calculateArea(coordinates);
    
    const colorIndex = sections.length % SECTION_COLORS.length;
    const sectionColor = SECTION_COLORS[colorIndex];
    
    const newSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      flat_area_sqft: flatArea,
      pitch: 'flat',
      pitch_multiplier: 1.00,
      adjusted_area_sqft: flatArea,
      color: sectionColor.stroke,
      coordinates: coordinates
    };

    setSections(prev => [...prev, newSection]);
    setIsDrawing(false);
    console.log("Section completed:", newSection);
  };

  const deleteSection = useCallback((sectionId) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  }, []);

  const updateSectionPitch = useCallback((sectionId, pitchValue) => {
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
  }, []);

  const updateSectionName = useCallback((sectionId, name) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, name } : section
    ));
  }, []);

  const getTotalFlatArea = () => {
    return sections.reduce((sum, section) => sum + section.flat_area_sqft, 0);
  };

  const getTotalAdjustedArea = () => {
    return sections.reduce((sum, section) => sum + section.adjusted_area_sqft, 0);
  };

  const calculateRoofComponents = useCallback((sections) => {
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
  }, []);

  const handleCompleteMeasurement = useCallback(async () => {
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
      const roofComponents = calculateRoofComponents(sections);

      const measurementData = {
        measurement_data: {
          total_flat_sqft: totalFlat,
          total_adjusted_sqft: totalAdjusted,
          sections: sections
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
        
        base_image_url: staticImageUrl,
        
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
  }, [sections, address, measurementId, staticImageUrl, navigate, calculateRoofComponents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
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
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Measure Your Roof</h2>
            <p className="text-sm text-slate-600">
              Draw each roof section on the satellite image
            </p>
          </div>

          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 font-medium">Property:</p>
                <p className="text-sm font-bold text-blue-900 break-words">{address}</p>
                {coordinates && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Location verified
                  </p>
                )}
              </div>
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
              onClick={() => setIsDrawing(!isDrawing)}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
              disabled={saving}
            >
              {isDrawing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Drawing Section {sections.length + 1}...
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
            
            <p className="text-xs text-slate-500 mt-2 text-center">
              Click to start, then click points on the image
            </p>
          </div>

          {sections.length > 0 && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Roof Sections ({sections.length})
                </h3>
              </div>

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
          )}

          {sections.length > 0 && (
            <div className="sticky bottom-0 p-6 border-t border-slate-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg">
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
                disabled={sections.length === 0 || saving}
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
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

        <div className="flex-1 p-8 overflow-auto">
          {coordinates ? (
            <StaticMapDrawing
              coordinates={coordinates}
              onSectionComplete={handleSectionComplete}
              currentColor={sections.length < SECTION_COLORS.length ? SECTION_COLORS[sections.length].stroke : SECTION_COLORS[0].stroke}
              isDrawing={isDrawing}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">Loading location...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}