import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Home, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MapView from "../components/measurement/MapView";
import Sidebar from "../components/measurement/Sidebar";

export default function Measure() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurementId, setMeasurementId] = useState(null);
  const [address, setAddress] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('measurementId');
    const addr = urlParams.get('address');

    console.log("Measure page - measurementId:", id);
    console.log("Measure page - address:", addr);

    if (!id || !addr) {
      setError("Missing measurement ID or address");
      setLoading(false);
      return;
    }

    setMeasurementId(id);
    setAddress(decodeURIComponent(addr));
    setLoading(false);
  }, []);

  const handleComplete = async () => {
    if (sections.length === 0) {
      setError("Please add at least one roof section");
      return;
    }

    setSaving(true);
    const totalArea = sections.reduce((sum, s) => sum + s.area_sqft, 0);

    try {
      await base44.entities.Measurement.update(measurementId, {
        measurement_data: {
          sections: sections,
          total_area_sqft: totalArea
        },
        total_sqft: totalArea
      });

      console.log("Measurement saved, redirecting to results");
      navigate(createPageUrl(`Results?measurementId=${measurementId}`));
    } catch (err) {
      console.error("Error saving:", err);
      setError("Failed to save measurement");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !address) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalArea = sections.reduce((sum, s) => sum + s.area_sqft, 0);

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Top Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Aroof</h1>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-slate-300">
              <span className="font-medium text-white">{address}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-4">
            <p className="text-sm text-slate-400">Total Area</p>
            <p className="text-lg font-bold text-white">{totalArea.toLocaleString()} sq ft</p>
          </div>

          <Button
            onClick={handleComplete}
            disabled={sections.length === 0 || saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Measurement
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert variant="destructive" className="shadow-lg">
            <AlertDescription>{error}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError("")}
              className="absolute top-2 right-2"
            >
              ×
            </Button>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          sections={sections}
          setSections={setSections}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          drawingMode={drawingMode}
          setDrawingMode={setDrawingMode}
        />

        <MapView
          propertyAddress={address}
          sections={sections}
          setSections={setSections}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          drawingMode={drawingMode}
          setDrawingMode={setDrawingMode}
        />
      </div>
    </div>
  );
}