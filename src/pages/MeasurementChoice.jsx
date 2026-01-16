import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Crosshair } from "lucide-react";

export default function MeasurementChoice() {
  const navigate = useNavigate();

  const handleQuickEstimate = () => {
    base44.analytics.track({
      eventName: "funnel_measurement_method_chosen",
      properties: { method: "quick_estimate" }
    });
    sessionStorage.setItem('funnel_measurement_method', 'quick_estimate');
    navigate(createPageUrl("GetEstimate"));
  };

  const handleDetailedMeasurement = () => {
    base44.analytics.track({
      eventName: "funnel_measurement_method_chosen",
      properties: { method: "detailed_measurement" }
    });
    sessionStorage.setItem('funnel_measurement_method', 'detailed_measurement');
    navigate(createPageUrl("MeasurementPage"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white pt-24 pb-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Choose Your Measurement Method
        </h1>
        <p className="text-xl text-slate-600">
          Pick the level of detail that works for you
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Estimate */}
          <Card className="hover:shadow-xl transition-all border-2 hover:border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Quick Estimate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Instant estimate based on your building footprint
              </p>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  ±10% accuracy
                </p>
                <p className="text-xs text-blue-700">
                  Perfect for quick budgeting and comparison
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>⏱️</span>
                  <span>60 seconds</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>💰</span>
                  <span>No charge</span>
                </div>
              </div>

              <Button
                onClick={handleQuickEstimate}
                className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-12"
              >
                Quick Estimate
              </Button>
            </CardContent>
          </Card>

          {/* Precise Measurement */}
          <Card className="hover:shadow-xl transition-all border-2 hover:border-purple-300 md:ring-2 md:ring-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crosshair className="w-6 h-6 text-purple-600" />
                Precise Measurement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Draw your exact roof perimeter for maximum accuracy
              </p>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-900 mb-2">
                  ±2% accuracy
                </p>
                <p className="text-xs text-purple-700">
                  Ideal for getting precise quotes from contractors
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>⏱️</span>
                  <span>3 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>💰</span>
                  <span>Free (optional $3 PDF)</span>
                </div>
              </div>

              <Button
                onClick={handleDetailedMeasurement}
                className="w-full bg-purple-600 hover:bg-purple-700 font-bold h-12"
              >
                Detailed Measurement
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}