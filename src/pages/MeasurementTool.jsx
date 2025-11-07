import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Ruler, ArrowRight, CheckCircle } from "lucide-react";

export default function MeasurementTool() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);

  useEffect(() => {
    const loadMeasurement = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const measurementId = urlParams.get('measurementId');

      if (!measurementId) {
        navigate(createPageUrl("Homepage"));
        return;
      }

      try {
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        if (measurements.length > 0) {
          setMeasurement(measurements[0]);
        } else {
          navigate(createPageUrl("Homepage"));
        }
      } catch (err) {
        console.error(err);
        navigate(createPageUrl("Homepage"));
      } finally {
        setLoading(false);
      }
    };

    loadMeasurement();
  }, [navigate]);

  const handleContinue = () => {
    // This is a placeholder - actual measurement tool will be built in next phase
    navigate(createPageUrl(`Results?measurementId=${measurement.id}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading measurement tool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Aroof</h1>
              <p className="text-xs text-slate-500">Aroof.build</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Step 3 of 3</span>
          <span className="text-sm text-slate-500">Measure Your Roof</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-blue-900 h-2 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-none shadow-xl">
          <CardContent className="p-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ruler className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Measurement Tool Coming Next
              </h1>

              <p className="text-xl text-slate-600 mb-8">
                This is where the interactive satellite-based roof measurement tool will be integrated.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-slate-900 mb-4">What this tool will include:</h3>
                <div className="space-y-3 text-left">
                  {[
                    "Google Maps satellite view integration",
                    "Draw and measure roof sections",
                    "Automatic square footage calculations",
                    "Pitch detection and adjustments",
                    "Save measurement data",
                    "Generate detailed reports"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-600">
                  For now, let's continue to see the results page:
                </p>
                <Button
                  onClick={handleContinue}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-8 h-12 text-lg"
                >
                  Continue to Results
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="mt-8 text-sm text-slate-500">
                <p>Measurement ID: {measurement?.id}</p>
                <p>Property: {measurement?.property_address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}