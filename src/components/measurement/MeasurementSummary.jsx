import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Layers } from "lucide-react";

const SECTION_COLORS = [
  "#4A90E2",
  "#50C878",
  "#FF8C42",
  "#9B59B6",
  "#E74C3C",
];

export default function MeasurementSummary({
  sections,
  totalArea,
  selectedSectionId,
  setSelectedSectionId,
  onDeleteSection
}) {
  if (sections.length === 0) {
    return (
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader className="p-4">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-center py-8">
            <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No sections added yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Click "Add Roof Section" to start measuring
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader className="p-4">
        <CardTitle className="text-sm text-white flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Measurements ({sections.length} sections)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {sections.map((section, index) => {
          const color = SECTION_COLORS[index % SECTION_COLORS.length];
          const isSelected = section.id === selectedSectionId;

          return (
            <div
              key={section.id}
              onClick={() => setSelectedSectionId(section.id)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all
                ${isSelected 
                  ? "bg-slate-600 border-2 border-yellow-400" 
                  : "bg-slate-800 border border-slate-600 hover:bg-slate-600"
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-white font-medium text-sm">
                    {section.name}
                  </span>
                  {isSelected && (
                    <Edit2 className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(section.id);
                  }}
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-slate-400 text-xs">Area</p>
                  <p className="text-white font-bold text-lg">
                    {section.area_sqft.toLocaleString()} sq ft
                  </p>
                </div>
                {isSelected && (
                  <p className="text-yellow-400 text-xs">
                    Click to edit
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-slate-600">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Roof Area</p>
              <p className="text-white font-bold text-2xl">
                {totalArea.toLocaleString()} sq ft
              </p>
            </div>
          </div>
        </div>

        {/* Validation Messages */}
        {totalArea > 0 && totalArea < 100 && (
          <div className="bg-yellow-900/30 border border-yellow-500 rounded p-2 text-xs text-yellow-200">
            ⚠️ Area seems small. Please verify measurements.
          </div>
        )}
        {totalArea > 50000 && (
          <div className="bg-red-900/30 border border-red-500 rounded p-2 text-xs text-red-200">
            ⚠️ Area seems unusually large. Please verify measurements.
          </div>
        )}
      </CardContent>
    </Card>
  );
}