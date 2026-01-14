import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Palette } from "lucide-react";

export default function RoofVisualizer({ mapInstance, roofPolygon, polygonsArray, onClose }) {
  const [selectedMaterial, setSelectedMaterial] = useState('asphalt');
  const [selectedColor, setSelectedColor] = useState('#3b3b3b');
  const [opacity, setOpacity] = useState(0.7);
  
  // Material database with realistic roof colors
  const materials = {
    asphalt: {
      name: 'Asphalt Shingles',
      icon: '🏠',
      colors: [
        { name: 'Charcoal', hex: '#3b3b3b' },
        { name: 'Weathered Wood', hex: '#8b7355' },
        { name: 'Mission Brown', hex: '#5d4037' },
        { name: 'Pewter Gray', hex: '#6b7280' },
        { name: 'Black', hex: '#1a1a1a' },
        { name: 'Slate', hex: '#4a5568' }
      ]
    },
    metal: {
      name: 'Metal Roofing',
      icon: '⚡',
      colors: [
        { name: 'Galvalume', hex: '#b0b0b0' },
        { name: 'Copper', hex: '#b87333' },
        { name: 'Bronze', hex: '#cd7f32' },
        { name: 'Charcoal', hex: '#36454f' },
        { name: 'Forest Green', hex: '#228b22' },
        { name: 'Barn Red', hex: '#7c0a02' }
      ]
    },
    tile: {
      name: 'Tile Roofing',
      icon: '🎨',
      colors: [
        { name: 'Terracotta', hex: '#e2725b' },
        { name: 'Spanish Red', hex: '#c1440e' },
        { name: 'Tuscan Blend', hex: '#a0522d' },
        { name: 'Slate Gray', hex: '#708090' },
        { name: 'Concrete Gray', hex: '#9e9e9e' },
        { name: 'Mission Tan', hex: '#d2b48c' }
      ]
    }
  };
  
  // Original polygon styles (for reverting)
  const originalStyles = useRef({});
  
  useEffect(() => {
    // Store original styles when component mounts
    if (polygonsArray && polygonsArray.length > 0) {
      polygonsArray.forEach((polygon, idx) => {
        if (polygon && polygon.get) {
          originalStyles.current[idx] = {
            fillColor: polygon.get('fillColor'),
            fillOpacity: polygon.get('fillOpacity'),
            strokeColor: polygon.get('strokeColor'),
            strokeOpacity: polygon.get('strokeOpacity')
          };
        }
      });
    }
    
    // Store solar polygon original style
    if (roofPolygon && roofPolygon.get) {
      originalStyles.current['solar'] = {
        fillColor: roofPolygon.get('fillColor'),
        fillOpacity: roofPolygon.get('fillOpacity'),
        strokeColor: roofPolygon.get('strokeColor'),
        strokeOpacity: roofPolygon.get('strokeOpacity')
      };
    }
    
    // Apply initial visualization
    applyVisualization();
    
    // Cleanup on unmount - CRITICAL: Revert to original
    return () => {
      revertToOriginal();
    };
  }, []);
  
  useEffect(() => {
    applyVisualization();
  }, [selectedColor, opacity]);
  
  const applyVisualization = () => {
    // Apply to all user-drawn polygons
    if (polygonsArray && polygonsArray.length > 0) {
      polygonsArray.forEach(polygon => {
        if (polygon && polygon.setOptions) {
          polygon.setOptions({
            fillColor: selectedColor,
            fillOpacity: opacity,
            strokeColor: selectedColor,
            strokeOpacity: 1.0
          });
        }
      });
    }
    
    // Apply to solar polygon if it exists
    if (roofPolygon && roofPolygon.setOptions) {
      roofPolygon.setOptions({
        fillColor: selectedColor,
        fillOpacity: opacity,
        strokeColor: selectedColor,
        strokeOpacity: 1.0
      });
    }
  };
  
  const revertToOriginal = () => {
    console.log('🔄 Reverting polygons to original measurement green');
    
    // Revert user-drawn polygons
    if (polygonsArray && polygonsArray.length > 0) {
      polygonsArray.forEach((polygon, idx) => {
        if (polygon && polygon.setOptions) {
          const original = originalStyles.current[idx];
          if (original) {
            polygon.setOptions(original);
          } else {
            // Fallback to standard measurement green
            polygon.setOptions({
              fillColor: '#22c55e',
              fillOpacity: 0.35,
              strokeColor: '#22c55e',
              strokeOpacity: 1.0
            });
          }
        }
      });
    }
    
    // Revert solar polygon
    if (roofPolygon && roofPolygon.setOptions) {
      const original = originalStyles.current['solar'];
      if (original) {
        roofPolygon.setOptions(original);
      } else {
        // Fallback to standard measurement green
        roofPolygon.setOptions({
          fillColor: '#10B981',
          fillOpacity: 0.15,
          strokeColor: '#10B981',
          strokeOpacity: 1.0
        });
      }
    }
  };
  
  const handleClose = () => {
    revertToOriginal();
    onClose();
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 pb-6 pointer-events-auto">
        <Card className="bg-white/95 backdrop-blur-xl border-2 border-purple-300 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">🎨 AI Design Studio</h3>
                  <p className="text-sm text-slate-600">Visualize different roof materials</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Material Tabs */}
            <div className="mb-6">
              <label className="text-sm font-bold text-slate-700 mb-3 block">Material Type</label>
              <div className="flex gap-3">
                {Object.entries(materials).map(([key, material]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedMaterial(key);
                      setSelectedColor(material.colors[0].hex);
                    }}
                    className={`flex-1 p-4 border-2 rounded-xl transition-all ${
                      selectedMaterial === key
                        ? 'border-purple-600 bg-purple-50 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">{material.icon}</div>
                    <div className="text-sm font-bold text-slate-900">{material.name}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Color Swatches */}
            <div className="mb-6">
              <label className="text-sm font-bold text-slate-700 mb-3 block">Color Selection</label>
              <div className="flex gap-3 flex-wrap">
                {materials[selectedMaterial].colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color.hex)}
                    className={`relative group`}
                    title={color.name}
                  >
                    <div
                      className={`w-14 h-14 rounded-full border-4 transition-all shadow-lg ${
                        selectedColor === color.hex
                          ? 'border-purple-600 scale-110'
                          : 'border-white hover:border-purple-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap ${
                      selectedColor === color.hex ? 'text-purple-600' : 'text-slate-600'
                    }`}>
                      {color.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Opacity Slider */}
            <div className="mb-4 pt-8">
              <label className="text-sm font-bold text-slate-700 mb-3 block">
                Transparency: {Math.round(opacity * 100)}%
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity * 100}
                  onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
                  className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      ${selectedColor}00 0%, 
                      ${selectedColor}80 50%, 
                      ${selectedColor}ff 100%)`
                  }}
                />
                <span className="text-sm font-semibold text-slate-600 min-w-[50px] text-right">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                💡 Higher transparency shows more satellite texture underneath
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Exit Design Mode
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => alert('Screenshot/export feature coming soon!')}
              >
                📸 Save Design
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}