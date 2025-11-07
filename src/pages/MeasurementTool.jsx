
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Home, Save, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MapView from "../components/measurement/MapView";
import Sidebar from "../components/measurement/Sidebar";

export default function MeasurementTool() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  useEffect(() => {
    const loadMeasurement = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const measurementId = urlParams.get('measurementId');

      console.log("MeasurementTool: Loading measurement with ID:", measurementId);
      console.log("MeasurementTool: Full URL:", window.location.href);

      if (!measurementId) {
        console.error("MeasurementTool: No measurement ID found in URL");
        setError("No measurement ID provided. Redirecting to homepage...");
        setTimeout(() => navigate(createPageUrl("Homepage")), 2000);
        return;
      }

      try {
        console.log("MeasurementTool: Querying measurement from database...");
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        console.log("MeasurementTool: Query result:", measurements);
        
        if (measurements.length > 0) {
          const m = measurements[0];
          console.log("MeasurementTool: Measurement loaded successfully:", m);
          setMeasurement(m);
          
          // Load existing measurement data if available
          if (m.measurement_data?.sections) {
            console.log("MeasurementTool: Loading existing sections:", m.measurement_data.sections);
            setSections(m.measurement_data.sections);
          }
          setLoading(false); // Only set loading to false on successful load
        } else {
          console.error("MeasurementTool: Measurement not found in database");
          setError("Measurement not found. Redirecting to homepage...");
          setTimeout(() => navigate(createPageUrl("Homepage")), 2000);
        }
      } catch (err) {
        console.error("MeasurementTool: Error loading measurement:", err);
        setError(`Failed to load measurement: ${err.message}. Redirecting to homepage...`);
        setTimeout(() => navigate(createPageUrl("Homepage")), 3000);
      }
    };

    loadMeasurement();
  }, [navigate]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!measurement || sections.length === 0) return;

    const autoSaveInterval = setInterval(async () => {
      await handleSave(true);
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [measurement, sections]);

  const handleSave = async (isAutoSave = false) => {
    if (!measurement) return;

    setSaving(true);
    if (!isAutoSave) setAutoSaveStatus("");

    try {
      const totalArea = sections.reduce((sum, section) => sum + section.area_sqft, 0);
      
      await base44.entities.Measurement.update(measurement.id, {
        measurement_data: {
          sections: sections,
          total_area_sqft: totalArea,
          property_address: measurement.property_address,
          measurement_date: new Date().toISOString()
        },
        total_sqft: totalArea
      });

      if (isAutoSave) {
        setAutoSaveStatus("Auto-saved");
        setTimeout(() => setAutoSaveStatus(""), 3000);
      }
    } catch (err) {
      console.error("Failed to save:", err);
      if (!isAutoSave) {
        setError("Failed to save measurement");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteMeasurement = async () => {
    if (sections.length === 0) {
      setError("Please add at least one roof section before completing");
      return;
    }

    const totalArea = sections.reduce((sum, section) => sum + section.area_sqft, 0);
    
    if (totalArea < 100) {
      setError("Total area seems too small. Please verify your measurements.");
      return;
    }

    if (totalArea > 50000) {
      setError("Total area seems unusually large. Please verify your measurements.");
      return;
    }

    await handleSave(false);
    
    // Calculate estimate for homeowners
    if (measurement.user_type === "homeowner") {
      const materialCost = totalArea * 3;
      const laborCost = totalArea * 2;
      const fees = 450;
      
      await base44.entities.Measurement.update(measurement.id, {
        aroof_estimate: {
          material_cost: materialCost,
          labor_cost: laborCost,
          total_cost: materialCost + laborCost + fees
        }
      });
    }

    navigate(createPageUrl(`Results?measurementId=${measurement.id}`));
  };

  const handleSaveAndExit = async () => {
    await handleSave(false);
    navigate(createPageUrl("Homepage"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Loading measurement tool...</p>
          <p className="text-slate-400 text-sm">Please wait while we load your data</p>
        </div>
      </div>
    );
  }

  if (error && !measurement) { // Display a more prominent error if measurement couldn't be loaded at all
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate(createPageUrl("Homepage"))}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Top Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Aroof</h1>
            </div>
          </Link>
          <div className="hidden md:block">
            <p className="text-sm text-slate-300">
              Measuring: <span className="font-medium text-white">{measurement?.property_address}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {autoSaveStatus && (
            <span className="text-sm text-green-400">{autoSaveStatus}</span>
          )}
          
          <Button
            variant="outline"
            onClick={handleSaveAndExit}
            disabled={saving}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save & Exit
          </Button>

          <Button
            onClick={handleCompleteMeasurement}
            disabled={sections.length === 0 || saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Complete Measurement
          </Button>
        </div>
      </header>

      {/* Error Alert */}
      {error && measurement && ( // Only show this error if a measurement was loaded but another error occurred later
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
        {/* Sidebar */}
        <Sidebar
          sections={sections}
          setSections={setSections}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          drawingMode={drawingMode}
          setDrawingMode={setDrawingMode}
          userType={measurement?.user_type}
        />

        {/* Map View */}
        <MapView
          propertyAddress={measurement?.property_address}
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
