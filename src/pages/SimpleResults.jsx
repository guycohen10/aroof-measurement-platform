import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Download, CheckCircle, Loader2, ArrowLeft } from "lucide-react";

export default function SimpleResults() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMeasurement = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const measurementId = urlParams.get('measurementId');

      console.log("Results page - measurementId:", measurementId);

      if (!measurementId) {
        setError("No measurement ID provided");
        setLoading(false);
        return;
      }

      try {
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        console.log("Loaded measurement:", measurements);

        if (measurements.length > 0) {
          setMeasurement(measurements[0]);
        } else {
          setError("Measurement not found");
        }
      } catch (err) {
        console.error("Error loading measurement:", err);
        setError("Failed to load measurement");
      } finally {
        setLoading(false);
      }
    };

    loadMeasurement();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !measurement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <p className="text-red-600 mb-4">{error || "Measurement not found"}</p>
            <Link to={createPageUrl("Homepage")}>
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalArea = measurement.total_sqft || 0;
  const estimatedCost = Math.round(totalArea * 5);
  const sections = measurement.measurement_data?.sections || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl(`Measure?measurementId=${measurement.id}&address=${encodeURIComponent(measurement.property_address)}`)}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Measurement
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Measurement Complete!</h1>
          <p className="text-xl text-green-100">Your roof measurement is ready</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Measurement Details */}
          <Card className="shadow-xl">
            <CardHeader className="bg-blue-50">
              <CardTitle>Measurement Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Property Address</p>
                  <p className="font-bold text-slate-900">{measurement.property_address}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                  <p className="text-blue-100 text-sm mb-2">Total Roof Area</p>
                  <p className="text-5xl font-bold mb-1">{totalArea.toLocaleString()}</p>
                  <p className="text-xl font-medium">square feet</p>
                </div>

                {sections.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Sections Measured</p>
                    <div className="space-y-2">
                      {sections.map((section) => (
                        <div key={section.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span className="font-medium">{section.name}</span>
                          <span className="font-bold">{section.area_sqft.toLocaleString()} sq ft</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cost Estimate */}
          {measurement.user_type === "homeowner" && (
            <Card className="shadow-xl border-2 border-blue-600">
              <CardHeader className="bg-blue-50">
                <CardTitle>Your Cost Estimate</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Estimated Total Cost</p>
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
                      <p className="text-6xl font-bold mb-2">${estimatedCost.toLocaleString()}</p>
                      <p className="text-green-100">Based on $5 per square foot</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      <strong>What's included:</strong> Materials, labor, cleanup, and warranty
                    </p>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                    Schedule Free Inspection
                  </Button>

                  <Button variant="outline" className="w-full" size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Roofer Results */}
          {measurement.user_type === "roofer" && (
            <Card className="shadow-xl border-2 border-orange-500">
              <CardHeader className="bg-orange-50">
                <CardTitle>Professional Report</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Total Area Measured</p>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                      <p className="text-6xl font-bold mb-2">{totalArea.toLocaleString()}</p>
                      <p className="text-orange-100">square feet</p>
                    </div>
                  </div>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Download Professional Report
                  </Button>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      <strong>Report includes:</strong> Detailed measurements, section breakdown, and watermarked images
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Next Steps */}
        <Card className="mt-8 shadow-xl">
          <CardHeader className="bg-slate-50">
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-900">Review your measurements</p>
                  <p className="text-slate-600">Make sure everything looks accurate</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-900">Download your report</p>
                  <p className="text-slate-600">Save a copy for your records</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-900">Schedule your project</p>
                  <p className="text-slate-600">Book a free consultation with Aroof</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link to={createPageUrl("Homepage")}>
            <Button variant="outline" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Measure Another Roof
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}