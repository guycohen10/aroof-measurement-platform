import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Ruler } from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center">
              <Home className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-slate-900">Aroof</h1>
          </div>
          <p className="text-2xl text-slate-600 mb-2">Instant Roof Measurements</p>
          <p className="text-lg text-slate-500">Get accurate satellite-based measurements in minutes</p>
        </div>

        {/* User Type Selection */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Homeowner Card */}
          <Link to={createPageUrl("HomeownerStart")}>
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-600 cursor-pointer h-full">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Home className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">I'm a Homeowner</h2>
                <div className="text-5xl font-bold text-blue-600 mb-4">$3</div>
                <p className="text-slate-600 mb-6">
                  Get measurements + instant cost estimate
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg h-12">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Roofer Card */}
          <Link to={createPageUrl("RooferStart")}>
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-orange-500 cursor-pointer h-full">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Ruler className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">I'm a Roofer</h2>
                <div className="text-5xl font-bold text-orange-500 mb-4">$5</div>
                <p className="text-slate-600 mb-6">
                  Professional measurements for your business
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg h-12">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>Fast • Accurate • Affordable</p>
        </div>
      </div>
    </div>
  );
}