import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900">Aroof</h1>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Aroof Roof Measurement
        </h2>
        
        {/* Subheading */}
        <p className="text-xl md:text-2xl text-slate-600 mb-12">
          Get instant roof measurements
        </p>

        {/* CTA Button - Updated to go to UserTypeSelection */}
        <Link to={createPageUrl("UserTypeSelection")}>
          <Button 
            size="lg" 
            className="h-16 px-12 text-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Measurement
          </Button>
        </Link>

        {/* Footer */}
        <p className="text-slate-500 mt-12">
          Fast • Accurate • Simple
        </p>
      </div>
    </div>
  );
}