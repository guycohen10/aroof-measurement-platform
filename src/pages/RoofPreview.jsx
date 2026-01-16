import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Radio } from "@/components/ui/radio-group";
import { ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";

export default function RoofPreview() {
  const navigate = useNavigate();
  const [visualizations, setVisualizations] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vizsJson = sessionStorage.getItem('funnel_visualizations');
    if (!vizsJson) {
      navigate(createPageUrl("StartFunnel"));
      return;
    }

    try {
      const vizs = JSON.parse(vizsJson);
      setVisualizations(vizs);
      setSelectedStyle(vizs[0]?.color);
      setLoading(false);

      base44.analytics.track({
        eventName: "funnel_preview_viewed",
        properties: { styles_shown: vizs.length }
      });
    } catch (err) {
      console.error('Failed to load visualizations:', err);
      navigate(createPageUrl("StartFunnel"));
    }
  }, []);

  const handleProceed = () => {
    if (!selectedStyle) {
      toast.error("Please select a roof style");
      return;
    }

    const selected = visualizations.find(v => v.color === selectedStyle);
    sessionStorage.setItem('funnel_selected_visualization', JSON.stringify(selected));

    base44.analytics.track({
      eventName: "funnel_style_selected",
      properties: { style: selected?.style }
    });

    navigate(createPageUrl("MeasurementChoice"));
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white pt-24 pb-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Here's Your Home with a New Roof
        </h1>
        <p className="text-xl text-slate-600">
          Choose your favorite style below
        </p>
      </div>

      {/* Visualization Cards */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {visualizations.map((viz) => (
            <Card
              key={viz.color}
              onClick={() => setSelectedStyle(viz.color)}
              className={`cursor-pointer overflow-hidden transition-all duration-300 ${
                selectedStyle === viz.color
                  ? 'ring-4 ring-blue-600 shadow-xl'
                  : 'hover:shadow-lg'
              }`}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-slate-200">
                <img
                  src={viz.url}
                  alt={viz.style}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Radio
                    checked={selectedStyle === viz.color}
                    onCheckedChange={() => setSelectedStyle(viz.color)}
                  />
                  <h3 className="font-bold text-lg text-slate-900">
                    {viz.style}
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-none text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Love what you see?
          </h2>
          <p className="text-blue-100 mb-8">
            Get exact pricing for your chosen roof style
          </p>

          <Button
            onClick={handleProceed}
            size="lg"
            className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold h-14 text-lg mb-4"
          >
            Get My Exact Estimate <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Link to={createPageUrl("MeasurementChoice")}>
            <button className="text-blue-100 hover:text-white text-sm underline block w-full">
              Skip visualization, just measure my roof
            </button>
          </Link>
        </Card>
      </div>
    </div>
  );
}