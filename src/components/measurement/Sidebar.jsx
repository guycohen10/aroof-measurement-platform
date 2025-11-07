import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Info, Undo2, Square } from "lucide-react";

export default function Sidebar({
  sections,
  setSections,
  selectedSectionId,
  setSelectedSectionId,
  drawingMode,
  setDrawingMode
}) {
  const handleStartDrawing = () => {
    setDrawingMode(true);
    setSelectedSectionId(null);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all measurements? This cannot be undone.")) {
      setSections([]);
      setSelectedSectionId(null);
    }
  };

  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
      }
    }
  };

  const totalArea = sections.reduce((sum, section) => sum + section.area_sqft, 0);

  return (
    <div className="w-80 lg:w-96 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2">Draw Your Roof</h2>
        <p className="text-slate-300 text-sm">Click points around your roof perimeter to measure</p>
      </div>

      {/* Instructions */}
      <Card className="m-4 bg-blue-900/30 border-blue-500">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-blue-200 flex items-center gap-2">
            <Info className="w-4 h-4" />
            How to Measure
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <ol className="space-y-2 text-sm text-blue-100">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Click "Start Drawing" button</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Click points around your roof edge</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Click near first point to close shape</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Add more sections if needed</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Drawing Controls */}
      <div className="px-4 space-y-3">
        {!drawingMode ? (
          <Button
            onClick={handleStartDrawing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start Drawing
          </Button>
        ) : (
          <div className="bg-blue-900/50 border-2 border-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Square className="w-5 h-5 text-blue-300 animate-pulse" />
              <span className="text-white font-medium">Drawing Mode Active</span>
            </div>
            <p className="text-sm text-blue-200">
              Click on the map to add points. Click near the first point to complete.
            </p>
            <p className="text-xs text-blue-300 mt-2">
              Press ESC to cancel
            </p>
          </div>
        )}

        {sections.length > 0 && (
          <Button
            onClick={handleClearAll}
            variant="outline"
            className="w-full border-red-500 text-red-400 hover:bg-red-500/10 h-10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Area Display */}
      <Card className="m-4 bg-gradient-to-br from-green-600 to-green-700 border-green-500">
        <CardContent className="p-6">
          <p className="text-green-100 text-sm mb-2">Total Roof Area</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">
              {totalArea.toLocaleString()}
            </span>
            <span className="text-xl text-green-100">sq ft</span>
          </div>
          {sections.length > 0 && (
            <p className="text-xs text-green-100 mt-2">
              {sections.length} section{sections.length !== 1 ? 's' : ''} measured
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sections List */}
      {sections.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-sm font-bold text-white mb-3">Measured Sections</h3>
          <div className="space-y-2">
            {sections.map((section, index) => {
              const isSelected = section.id === selectedSectionId;
              const colors = [
                { bg: 'bg-blue-600', text: 'text-blue-100' },
                { bg: 'bg-green-600', text: 'text-green-100' },
                { bg: 'bg-orange-600', text: 'text-orange-100' },
                { bg: 'bg-purple-600', text: 'text-purple-100' },
                { bg: 'bg-red-600', text: 'text-red-100' },
              ];
              const color = colors[index % colors.length];

              return (
                <div
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-slate-600 ring-2 ring-yellow-400' 
                      : 'bg-slate-700 hover:bg-slate-600'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                      <span className="text-white font-medium text-sm">
                        {section.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">
                      {section.area_sqft.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-300">sq ft</span>
                  </div>
                  {isSelected && (
                    <p className="text-xs text-yellow-400 mt-1">
                      ✏️ Click to edit • Drag vertices to adjust
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      {sections.length === 0 && !drawingMode && (
        <div className="m-4 mt-auto">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-xs text-slate-400">
                  <p><strong className="text-slate-300">Tip:</strong> Zoom in for more accurate measurements</p>
                  <p><strong className="text-slate-300">Tip:</strong> Measure each roof plane separately for complex roofs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}