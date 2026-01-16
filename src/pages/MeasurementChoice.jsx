import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Zap, Crosshair } from "lucide-react";

export default function MeasurementChoice() {
  const navigate = useNavigate();
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const selectedAddress = sessionStorage.getItem("selectedAddress");
    const addressJSON = sessionStorage.getItem("addressData");
    
    if (!selectedAddress || !addressJSON) {
      navigate(createPageUrl("Start"));
      return;
    }

    try {
      setAddressData(JSON.parse(addressJSON));
    } catch {
      navigate(createPageUrl("Start"));
    }
  }, [navigate]);

  const handleQuickEstimate = async () => {
    if (!addressData) return;
    setLoading(true);

    try {
      // Create measurement record
      const measurement = await base44.entities.Measurement.create({
        property_address: addressData.formatted_address,
        user_type: "homeowner",
        measurement_type: "quick_estimate",
        estimation_method: "building_sqft_multiplier",
        lead_status: "new",
      });

      // Store measurement ID
      sessionStorage.setItem("measurementId", measurement.id);
      sessionStorage.setItem("measurementMethod", "quick");

      // Proceed to contact capture
      navigate(createPageUrl("GetEstimate"));
    } catch (err) {
      console.error("Error creating measurement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailedMeasurement = async () => {
    if (!addressData) return;
    setLoading(true);

    try {
      // Create measurement record
      const measurement = await base44.entities.Measurement.create({
        property_address: addressData.formatted_address,
        user_type: "homeowner",
        measurement_type: "detailed_polygon",
        estimation_method: "manual_polygon",
        lead_status: "new",
      });

      // Store measurement ID
      sessionStorage.setItem("measurementId", measurement.id);
      sessionStorage.setItem("measurementMethod", "detailed");

      // Navigate to detailed measurement tool with address pre-loaded
      navigate(createPageUrl("MeasurementPage") + `?id=${measurement.id}`);
    } catch (err) {
      console.error("Error creating measurement:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!addressData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Address Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Your Home</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            Choose Your Measurement Method
          </h1>
          <p className="text-lg text-slate-600 font-semibold">
            {addressData.formatted_address}
          </p>
        </div>

        {/* Two Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Quick Estimate */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 p-8 transition-all">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Quick Estimate</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Instant estimate based on building footprint and local data
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
                <span>⏱️</span>
                <span>60 Seconds</span>
              </div>
              <p className="text-sm text-blue-700">
                Get results instantly without manual drawing
              </p>

              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm text-blue-700 font-medium">
                  ±10% accuracy
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={handleQuickEstimate}
              disabled={loading}
            >
              {loading ? "Creating..." : "Quick Estimate"}
            </Button>
          </div>

          {/* Detailed Measurement */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 p-8 transition-all">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
              <Crosshair className="w-8 h-8 text-orange-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Precise Measurement</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Draw exact roof perimeter for maximum accuracy and detailed material breakdown
            </p>

            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-orange-900 font-semibold mb-2">
                <span>📐</span>
                <span>3 Minutes</span>
              </div>
              <p className="text-sm text-orange-700">
                Interactive map tool to trace your roof precisely
              </p>

              <div className="mt-3 pt-3 border-t border-orange-200">
                <p className="text-sm text-orange-700 font-medium">
                  ±2% accuracy
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold"
              onClick={handleDetailedMeasurement}
              disabled={loading}
            >
              {loading ? "Creating..." : "Detailed Measurement"}
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <p className="text-slate-700">
            <span className="font-semibold">Not sure which to choose?</span> Start with Quick Estimate—you can always get a detailed measurement later.
          </p>
        </div>
      </div>
    </div>
  );
}