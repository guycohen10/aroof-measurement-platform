import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Visualizing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateVisualizations();
  }, []);

  const generateVisualizations = async () => {
    try {
      const address = sessionStorage.getItem('funnel_address');
      if (!address) {
        navigate(createPageUrl("StartFunnel"));
        return;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 30;
        });
      }, 500);

      // Generate 3 roof visualizations in parallel
      const roofVariations = [
        { color: "dark_gray", name: "Classic Gray" },
        { color: "brown", name: "Warm Brown" },
        { color: "black", name: "Timeless Black" }
      ];

      const visualizations = [];

      for (const variation of roofVariations) {
        try {
          // Use existing function or replicate API to generate image
          // For now, we'll use placeholder logic
          const imageUrl = await generateRoofImage(address, variation.color);
          visualizations.push({
            url: imageUrl,
            style: variation.name,
            color: variation.color
          });
        } catch (err) {
          console.error(`Failed to generate ${variation.name}:`, err);
          // Use placeholder if generation fails
          visualizations.push({
            url: `https://via.placeholder.com/600x400?text=${variation.name}`,
            style: variation.name,
            color: variation.color
          });
        }
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Store visualizations in session
      sessionStorage.setItem('funnel_visualizations', JSON.stringify(visualizations));

      // Track event
      base44.analytics.track({
        eventName: "funnel_visualizations_generated",
        properties: { address, count: visualizations.length }
      });

      // Redirect after brief delay
      setTimeout(() => {
        navigate(createPageUrl("RoofPreview"));
      }, 500);
    } catch (err) {
      console.error('Visualization error:', err);
      setError('Failed to generate visualizations. Please try again.');
      setTimeout(() => {
        navigate(createPageUrl("StartFunnel"));
      }, 3000);
    }
  };

  const generateRoofImage = async (address, colorVariant) => {
    try {
      // This would call your GenerateRealisticRoof function or Replicate API
      // For MVP, returning placeholder URLs
      const placeholders = {
        dark_gray: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
        brown: "https://images.unsplash.com/photo-1563528223-65c02cd4f566?w=600&h=400&fit=crop",
        black: "https://images.unsplash.com/photo-1540932239986-310128078ceb?w=600&h=400&fit=crop"
      };
      return placeholders[colorVariant] || placeholders.dark_gray;
    } catch (err) {
      console.error('Image generation failed:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-6" />
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Creating Your New Roof
        </h1>
        
        <p className="text-xl text-blue-100 mb-8">
          Generating AI-powered roof visualizations with 3 style options...
        </p>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-300 to-blue-200 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-blue-200 text-sm mb-8">
          {Math.round(progress)}% Complete
        </p>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <p className="text-blue-100 text-sm">
          This usually takes 15-20 seconds. Hang tight!
        </p>
      </div>
    </div>
  );
}