import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function RoofPreview() {
  const navigate = useNavigate();
  const [addressData, setAddressData] = useState(null);
  const [visualizations, setVisualizations] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);

  useEffect(() => {
    const addressJSON = sessionStorage.getItem("funnelAddress");
    const vizsJSON = sessionStorage.getItem("roofVisualizations");

    if (!addressJSON || !vizsJSON) {
      navigate(createPageUrl("Start"));
      return;
    }

    try {
      setAddressData(JSON.parse(addressJSON));
      const vizs = JSON.parse(vizsJSON);
      setVisualizations(vizs);
      setSelectedStyle(vizs[0]);
    } catch {
      navigate(createPageUrl("Start"));
    }
  }, [navigate]);

  const handleContinue = () => {
    if (selectedStyle) {
      sessionStorage.setItem("selectedStyle", JSON.stringify(selectedStyle));
      navigate(createPageUrl("MeasurementChoice"));
    }
  };

  if (!addressData || visualizations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading visualizations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(createPageUrl("Start"))}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Your Home</p>
            <p className="text-sm font-semibold text-slate-900">
              {addressData.formatted_address}
            </p>
          </div>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Here's Your Home with a New Roof
          </h1>
          <p className="text-lg text-slate-600">
            Select your favorite style to get exact pricing
          </p>
        </div>

        {/* Visualizations Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {visualizations.map((viz, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedStyle(viz)}
              className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                selectedStyle?.style === viz.style
                  ? "border-blue-600 ring-2 ring-blue-200"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              {/* Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center relative">
                <span className="text-4xl">🏠</span>
                {/* In production, replace with: <img src={viz.url} alt={viz.style} className="w-full h-full object-cover" /> */}
              </div>

              {/* Style Info */}
              <div className="p-4 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="radio"
                    name="roofStyle"
                    checked={selectedStyle?.style === viz.style}
                    onChange={() => setSelectedStyle(viz)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <h3 className="font-bold text-slate-900">{viz.style}</h3>
                </div>
                <p className="text-sm text-slate-600">
                  {idx === 0 && "Classic and timeless"}
                  {idx === 1 && "Warm and inviting"}
                  {idx === 2 && "Modern and sleek"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">
            Love what you see? Get exact pricing for your chosen style
          </h2>
          <Button
            size="lg"
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
            onClick={handleContinue}
          >
            Get My Exact Estimate <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Secondary Action */}
        <div className="text-center">
          <button
            onClick={() => navigate(createPageUrl("MeasurementChoice"))}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Skip visualization, just measure my roof →
          </button>
        </div>
      </div>
    </div>
  );
}