import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

export default function DesignPreview() {
  const [savedDesign, setSavedDesign] = useState(null);

  useEffect(() => {
    try {
      const designData = sessionStorage.getItem('roof_design_preferences');
      if (designData) {
        const parsed = JSON.parse(designData);
        setSavedDesign(parsed);
        console.log('✅ Design Preview loaded:', parsed);
      }
    } catch (err) {
      console.log('No saved design found');
    }
  }, []);

  if (!savedDesign) return null;

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Active Design Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
          <p className="text-xs text-slate-600 mb-2 font-semibold">Material</p>
          <p className="text-lg font-bold text-slate-900">{savedDesign.material}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
          <p className="text-xs text-slate-600 mb-3 font-semibold">Color & Texture</p>
          <div className="flex items-center gap-3">
            <div 
              className="w-20 h-20 rounded-lg border-4 border-white shadow-lg"
              style={{ 
                backgroundColor: savedDesign.colorHex,
                opacity: savedDesign.opacity
              }}
            />
            <div>
              <p className="text-base font-bold text-slate-900">{savedDesign.color}</p>
              <p className="text-sm text-slate-600 mt-1">
                {Math.round(savedDesign.opacity * 100)}% Opacity
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-100 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-900 font-semibold">
            ✓ Design Applied to Maps Below
          </p>
        </div>
      </CardContent>
    </Card>
  );
}