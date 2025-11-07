import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Square,
  Check
} from "lucide-react";
import InstructionsPanel from "./InstructionsPanel";
import MeasurementSummary from "./MeasurementSummary";

export default function Sidebar({
  sections,
  setSections,
  selectedSectionId,
  setSelectedSectionId,
  drawingMode,
  setDrawingMode,
  userType
}) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAddSection = () => {
    setDrawingMode(true);
    setSelectedSectionId(null);
  };

  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all measurements? This cannot be undone.")) {
      setSections([]);
      setSelectedSectionId(null);
    }
  };

  const totalArea = sections.reduce((sum, section) => sum + section.area_sqft, 0);

  if (isCollapsed) {
    return (
      <div className="bg-slate-800 border-r border-slate-700 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="text-white hover:bg-slate-700"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 lg:w-96 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Measurement Tools</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Instructions */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader 
              className="cursor-pointer flex flex-row items-center justify-between p-4"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <CardTitle className="text-sm text-white">Instructions</CardTitle>
              </div>
              {showInstructions ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </CardHeader>
            {showInstructions && (
              <CardContent className="p-4 pt-0">
                <InstructionsPanel />
              </CardContent>
            )}
          </Card>

          {/* Drawing Tools */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="p-4">
              <CardTitle className="text-sm text-white">Drawing Tools</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <Button
                onClick={handleAddSection}
                disabled={drawingMode}
                className={`w-full justify-start ${
                  drawingMode 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-600 hover:bg-slate-500 text-white"
                }`}
              >
                {drawingMode ? (
                  <>
                    <Square className="w-4 h-4 mr-2 animate-pulse" />
                    Drawing Mode Active...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Roof Section
                  </>
                )}
              </Button>

              {drawingMode && (
                <div className="bg-blue-900/30 border border-blue-500 rounded p-3 text-sm text-blue-200">
                  <p className="font-medium mb-1">Drawing in progress</p>
                  <p className="text-xs">Click on the map to add points around your roof</p>
                </div>
              )}

              {sections.length > 0 && (
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  className="w-full justify-start border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Sections
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Measurement Summary */}
          <MeasurementSummary
            sections={sections}
            totalArea={totalArea}
            selectedSectionId={selectedSectionId}
            setSelectedSectionId={setSelectedSectionId}
            onDeleteSection={handleDeleteSection}
            userType={userType}
          />

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Total Sections</span>
                  <span className="text-white font-bold text-lg">{sections.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Total Area</span>
                  <span className="text-white font-bold text-2xl">
                    {totalArea.toLocaleString()} sq ft
                  </span>
                </div>
                {userType === "homeowner" && totalArea > 0 && (
                  <div className="pt-3 border-t border-blue-400">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100 text-sm">Est. Cost</span>
                      <span className="text-white font-bold text-lg">
                        ${((totalArea * 5) + 450).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-1">Preliminary estimate</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong className="text-white">Tip:</strong> Click on a section to select and edit it</p>
                  <p><strong className="text-white">Tip:</strong> Drag vertices to adjust section boundaries</p>
                  <p><strong className="text-white">Tip:</strong> Zoom in for more accurate measurements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}