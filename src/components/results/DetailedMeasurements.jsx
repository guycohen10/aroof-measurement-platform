import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ruler, ChevronDown, ChevronUp, Edit, Save, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DetailedMeasurements({ measurement }) {
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manualOverrides, setManualOverrides] = useState(measurement.manual_overrides || {});
  
  // Get values (use manual overrides if they exist)
  const eaves = manualOverrides.eaves_ft ?? measurement.eaves_ft ?? 0;
  const rakes = manualOverrides.rakes_ft ?? measurement.rakes_ft ?? 0;
  const ridges = manualOverrides.ridges_ft ?? measurement.ridges_ft ?? 0;
  const hips = manualOverrides.hips_ft ?? measurement.hips_ft ?? 0;
  const valleys = manualOverrides.valleys_ft ?? measurement.valleys_ft ?? 0;
  const steps = manualOverrides.steps_ft ?? measurement.steps_ft ?? 0;
  const walls = manualOverrides.walls_ft ?? measurement.walls_ft ?? 0;
  
  const pitchBreakdown = measurement.pitch_breakdown || {};
  const totalActualArea = measurement.total_adjusted_sqft || measurement.total_sqft || 0;
  const totalSquares = totalActualArea / 100;

  const handleManualUpdate = (field, value) => {
    setManualOverrides(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSaveManualOverrides = async () => {
    setSaving(true);
    try {
      await base44.entities.Measurement.update(measurement.id, {
        manual_overrides: manualOverrides,
        eaves_ft: manualOverrides.eaves_ft ?? measurement.eaves_ft,
        rakes_ft: manualOverrides.rakes_ft ?? measurement.rakes_ft,
        ridges_ft: manualOverrides.ridges_ft ?? measurement.ridges_ft,
        hips_ft: manualOverrides.hips_ft ?? measurement.hips_ft,
        valleys_ft: manualOverrides.valleys_ft ?? measurement.valleys_ft,
        steps_ft: manualOverrides.steps_ft ?? measurement.steps_ft,
        walls_ft: manualOverrides.walls_ft ?? measurement.walls_ft
      });
      
      window.location.reload();
    } catch (err) {
      console.error("Failed to save overrides:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetOverrides = () => {
    setManualOverrides({});
  };

  // Only show if we have calculated measurements
  if (!measurement.eaves_ft && !measurement.rakes_ft && !measurement.ridges_ft) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Line Measurements */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            Detailed Roof Measurements
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">Line measurements in linear feet</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Eaves (bottom edges)", value: eaves, icon: "📐", note: "Where gutters typically install" },
              { label: "Rakes (gable edges)", value: rakes, icon: "📐", note: "Sloped perimeter edges" },
              { label: "Ridges (peaks)", value: ridges, icon: "📐", note: "Top horizontal lines, need ridge cap" },
              { label: "Hips (external corners)", value: hips, icon: "📐", note: "Outside corner lines, need hip cap" },
              { label: "Valleys (internal corners)", value: valleys, icon: "📐", note: "Inside corners where water channels" },
              { label: "Steps (wall intersections)", value: steps, icon: "📐", note: "Where roof meets vertical walls" }
            ].map((item, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-600">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">{item.label}</p>
                    <p className="text-2xl font-bold text-slate-900 my-1">
                      {item.value.toLocaleString()} ft
                    </p>
                    <p className="text-xs text-slate-500">{item.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pitch Breakdown */}
      {Object.keys(pitchBreakdown).length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Pitch Breakdown</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Area distribution by roof pitch</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(pitchBreakdown).map(([pitch, squares]) => (
                <div key={pitch} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900 text-lg">{pitch}</span>
                      <span className="text-slate-600">{squares.toFixed(2)} squares</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {((squares / totalSquares) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-6 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${(squares / totalSquares) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waste Calculations */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Material Estimates with Waste Factor</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Industry-standard waste factors account for cutting, overlap, and handling
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-left rounded-tl-lg">Measurement</th>
                  <th className="p-3 text-center">Actual</th>
                  <th className="p-3 text-center">+5%</th>
                  <th className="p-3 text-center">+10%</th>
                  <th className="p-3 text-center bg-green-600 font-bold">+12% ⭐</th>
                  <th className="p-3 text-center">+15%</th>
                  <th className="p-3 text-center rounded-tr-lg">+20%</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50 border-b">
                  <td className="p-3 font-semibold">Squares:</td>
                  <td className="p-3 text-center">{totalSquares.toFixed(2)}</td>
                  <td className="p-3 text-center">{(totalSquares * 1.05).toFixed(2)}</td>
                  <td className="p-3 text-center">{(totalSquares * 1.10).toFixed(2)}</td>
                  <td className="p-3 text-center bg-green-50 font-bold text-green-900">
                    {(totalSquares * 1.12).toFixed(2)}
                  </td>
                  <td className="p-3 text-center">{(totalSquares * 1.15).toFixed(2)}</td>
                  <td className="p-3 text-center">{(totalSquares * 1.20).toFixed(2)}</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 font-semibold">Area (sq ft):</td>
                  <td className="p-3 text-center">{Math.round(totalActualArea).toLocaleString()}</td>
                  <td className="p-3 text-center">{Math.round(totalActualArea * 1.05).toLocaleString()}</td>
                  <td className="p-3 text-center">{Math.round(totalActualArea * 1.10).toLocaleString()}</td>
                  <td className="p-3 text-center bg-green-50 font-bold text-green-900">
                    {Math.round(totalActualArea * 1.12).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">{Math.round(totalActualArea * 1.15).toLocaleString()}</td>
                  <td className="p-3 text-center">{Math.round(totalActualArea * 1.20).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>✓ Recommended:</strong> +12% waste factor for standard installations with valleys and hips
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual Override Section */}
      <Card className="shadow-lg border-2 border-amber-200">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-amber-50"
            onClick={() => setShowManualEdit(!showManualEdit)}
          >
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-600" />
              <span className="text-lg font-bold text-slate-900">Advanced: Manually Adjust Measurements</span>
            </div>
            {showManualEdit ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </CardHeader>
        
        {showManualEdit && (
          <CardContent className="p-6 bg-amber-50/30">
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-900">
                ⚠️ <strong>Note:</strong> These are automatic estimates based on typical roof geometry. 
                If you have precise measurements from a professional inspection, you can override them here.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { field: 'eaves_ft', label: 'Eaves (ft)', value: eaves },
                { field: 'rakes_ft', label: 'Rakes (ft)', value: rakes },
                { field: 'ridges_ft', label: 'Ridges (ft)', value: ridges },
                { field: 'hips_ft', label: 'Hips (ft)', value: hips },
                { field: 'valleys_ft', label: 'Valleys (ft)', value: valleys },
                { field: 'steps_ft', label: 'Steps (ft)', value: steps },
                { field: 'walls_ft', label: 'Walls (ft)', value: walls }
              ].map((item) => (
                <div key={item.field}>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    {item.label}
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={manualOverrides[item.field] ?? item.value}
                    onChange={(e) => handleManualUpdate(item.field, e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveManualOverrides}
                disabled={saving}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Manual Overrides
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleResetOverrides}
                variant="outline"
                className="h-12"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset to Auto
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}