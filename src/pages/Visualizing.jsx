import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function Visualizing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [addressData, setAddressData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const addressJSON = sessionStorage.getItem("funnelAddress");
    if (!addressJSON) {
      navigate(createPageUrl("Start"));
      return;
    }

    try {
      const address = JSON.parse(addressJSON);
      setAddressData(address);
    } catch {
      navigate(createPageUrl("Start"));
    }
  }, [navigate]);

  // Simulate progress and generate visualizations
  useEffect(() => {
    if (!addressData) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + Math.random() * 20;
        return prev;
      });
    }, 500);

    // Generate roof visualizations
    const generateVisualizations = async () => {
      try {
        // Call the roof generation function for 3 styles
        const styles = [
          { name: "Classic Gray", color: "dark gray" },
          { name: "Warm Brown", color: "brown" },
          { name: "Timeless Black", color: "black" },
        ];

        const visualizations = [];

        for (const style of styles) {
          const result = await base44.functions.invoke("GenerateRealisticRoof", {
            address: addressData.formatted_address,
            lat: addressData.latitude,
            lng: addressData.longitude,
            material: "architectural_shingles",
            color: style.color,
            style_name: style.name,
          });

          visualizations.push({
            style: style.name,
            url: result.data.url || result.data.image_url,
          });
        }

        // Store visualizations
        sessionStorage.setItem("roofVisualizations", JSON.stringify(visualizations));
        sessionStorage.setItem("selectedStyle", JSON.stringify(styles[0]));

        setProgress(100);

        // Redirect after 1.5 seconds
        setTimeout(() => {
          navigate(createPageUrl("RoofPreview"));
        }, 1500);
      } catch (err) {
        console.error("Visualization error:", err);
        // Skip to measurement if visualization fails
        setTimeout(() => {
          navigate(createPageUrl("MeasurementChoice"));
        }, 2000);
      }
    };

    generateVisualizations();

    return () => clearInterval(progressInterval);
  }, [addressData, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-700 rounded-full mx-auto flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-white animate-spin"></div>
            <span className="text-2xl">🏠</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Creating Your Visualization
          </h1>
          <p className="text-blue-100 text-lg">
            {addressData?.formatted_address || "Processing your address..."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full h-2 bg-blue-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-blue-200 text-sm mt-3">
            {Math.round(progress)}% - Generating AI roof visualization...
          </p>
        </div>

        {/* What's Happening */}
        <div className="space-y-3 text-blue-100 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛰️</span>
            <span>Analyzing satellite imagery of your home</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <span>Generating 3 roof style visualizations</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <span>Calculating material and labor costs</span>
          </div>
        </div>
      </div>
    </div>
  );
}