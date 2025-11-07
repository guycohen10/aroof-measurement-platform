import React from "react";
import { CheckCircle } from "lucide-react";

export default function InstructionsPanel() {
  const steps = [
    {
      number: 1,
      title: "Add a roof section",
      description: "Click 'Add Roof Section' button to start drawing"
    },
    {
      number: 2,
      title: "Draw the perimeter",
      description: "Click around your roof edges to create points"
    },
    {
      number: 3,
      title: "Close the shape",
      description: "Click near your first point to complete the section"
    },
    {
      number: 4,
      title: "Add more sections",
      description: "Repeat for complex roofs with multiple planes"
    },
    {
      number: 5,
      title: "Review and adjust",
      description: "Select sections to edit, drag vertices to fine-tune"
    },
    {
      number: 6,
      title: "Complete measurement",
      description: "Click 'Complete Measurement' when finished"
    }
  ];

  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.number} className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {step.number}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{step.title}</p>
            <p className="text-slate-300 text-xs mt-0.5">{step.description}</p>
          </div>
        </div>
      ))}

      <div className="mt-4 pt-4 border-t border-slate-600">
        <p className="text-xs text-slate-400">
          <strong className="text-slate-300">Keyboard shortcuts:</strong>
        </p>
        <ul className="text-xs text-slate-400 mt-2 space-y-1">
          <li>• ESC - Cancel drawing</li>
          <li>• Delete - Remove selected section</li>
        </ul>
      </div>
    </div>
  );
}