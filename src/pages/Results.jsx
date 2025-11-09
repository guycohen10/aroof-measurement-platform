import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, CheckCircle, MapPin, Calendar, Ruler, Download, Phone, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      console.log("🟣 RESULTS PAGE LOADING");
      const urlParams = new URLSearchParams(window.location.search);
      const measurementId = urlParams.get('measurementid');
      
      console.log("🟣 Full URL:", window.location.href);
      console.log("🟣 URL params - measurementid:", measurementId);

      if (!measurementId) {
        console.log("❌ No measurementid in URL - redirecting to Homepage");
        navigate(createPageUrl("Homepage"));
        return;
      }

      try {
        console.log("🟣 Fetching measurement from database with ID:", measurementId);
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        console.log("🟣 Database query result:", measurements);
        
        if (measurements.length > 0) {
          const loadedMeasurement = measurements[0];
          console.log("✅ Measurement found:", loadedMeasurement);
          setMeasurement(loadedMeasurement);
          console.log("✅✅✅ RESULTS PAGE READY TO DISPLAY");
        } else {
          console.log("❌ Measurement not found in database");
          setError("Measurement not found");
        }
      } catch (err) {
        console.error("❌ Error loading measurement data:", err);
        setError("Failed to load measurement data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-slate-700">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !measurement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Measurement Not Found</h2>
            <p className="text-slate-600 mb-6">
              {error || "We couldn't find your measurement data."}
            </p>
            <Link to={createPageUrl("FormPage")}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start New Measurement
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate pricing estimate
  const area = measurement.total_sqft || 0;
  const materialCost = Math.round(area * 4.00);
  const laborCost = Math.round(area * 3.00);
  const totalCost = materialCost + laborCost;
  const lowEstimate = Math.round(totalCost * 0.9);
  const highEstimate = Math.round(totalCost * 1.1);

  const isHomeowner = measurement.user_type === "homeowner";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl(`MeasurementPage?measurementId=${measurement.id}&address=${encodeURIComponent(measurement.property_address || '')}`)}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Measurement
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Measurement Complete!</h1>
          </div>
          <div className="text-center">
            <p className="text-lg opacity-90 mb-2">Property: {measurement.property_address}</p>
            <p className="text-sm opacity-75">
              Measured on {format(new Date(measurement.created_date), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Large Area Display */}
        <Card className="mb-8 border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">Total Roof Area</h2>
            <div className="text-7xl md:text-8xl font-bold text-blue-600 mb-2">
              {area.toLocaleString()}
            </div>
            <p className="text-3xl font-semibold text-slate-600">square feet</p>
          </CardContent>
        </Card>

        {/* Measurement Details */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Measurement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-600">Property Address</p>
                <p className="text-lg font-semibold text-slate-900">{measurement.property_address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-600">Measurement Date</p>
                <p className="text-lg font-semibold text-slate-900">
                  {format(new Date(measurement.created_date), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Ruler className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-600">Measurement Method</p>
                <p className="text-lg font-semibold text-slate-900">Satellite Imagery Analysis</p>
                <p className="text-sm text-slate-500 mt-1">Accuracy: ±2-5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Satellite View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 border-2 border-slate-200 rounded-lg p-12 text-center">
              <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700 mb-2">
                Satellite view with measurements
              </p>
              <p className="text-sm text-slate-500">
                {measurement.property_address}
              </p>
              <p className="text-xs text-slate-400 mt-4">
                Detailed map visualization coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Estimate (for homeowners) */}
        {isHomeowner && (
          <Card className="mb-8 shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Estimated Project Cost
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-600">Materials ({area.toLocaleString()} sq ft × $4.00)</span>
                  <span className="font-bold text-slate-900">${materialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-600">Labor ({area.toLocaleString()} sq ft × $3.00)</span>
                  <span className="font-bold text-slate-900">${laborCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-600 text-white rounded-lg">
                  <span className="text-lg font-semibold">Estimated Cost Range</span>
                  <span className="text-2xl font-bold">${lowEstimate.toLocaleString()} - ${highEstimate.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> This is a preliminary estimate based on standard conditions. 
                  Contact us for a detailed quote that accounts for roof pitch, complexity, and material selection.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to={createPageUrl("FormPage")} className="block">
            <Button size="lg" className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700">
              <Home className="w-5 h-5 mr-2" />
              Measure Another Roof
            </Button>
          </Link>

          <Button 
            size="lg" 
            variant="outline" 
            className="w-full h-16 text-lg border-2"
            onClick={() => alert("PDF download coming soon! We're working on this feature.")}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Report
          </Button>

          <Button 
            size="lg" 
            variant="outline" 
            className="w-full h-16 text-lg border-2 border-green-600 text-green-700 hover:bg-green-50"
          >
            <Phone className="w-5 h-5 mr-2" />
            Contact Aroof
          </Button>
        </div>

        {/* Contact Info */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Get Started?</h3>
            <p className="text-slate-600 mb-4">
              Our roofing experts are here to help with your project
            </p>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>Phone:</strong> (555) 555-5555</p>
              <p><strong>Email:</strong> info@aroof.build</p>
              <p><strong>Hours:</strong> Monday - Friday, 8:00 AM - 6:00 PM</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}