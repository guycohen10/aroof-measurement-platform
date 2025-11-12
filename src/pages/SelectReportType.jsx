import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, FileText, CheckCircle, Loader2, DollarSign, Building2, Users } from "lucide-react";

export default function SelectReportType() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMeasurement();
  }, []);

  const loadMeasurement = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const measurementId = urlParams.get('measurementid');

    if (!measurementId) {
      navigate(createPageUrl("Homepage"));
      return;
    }

    try {
      const measurements = await base44.entities.Measurement.filter({ id: measurementId });
      
      if (measurements.length > 0) {
        setMeasurement(measurements[0]);
      } else {
        setError("Measurement not found");
      }
    } catch (err) {
      console.error("Error loading measurement:", err);
      setError("Failed to load measurement data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (userType, amount) => {
    if (!measurement) return;

    const params = new URLSearchParams({
      measurementid: measurement.id,
      usertype: userType,
      amount: amount.toString(),
      address: measurement.property_address,
      name: measurement.customer_name || '',
      email: measurement.customer_email || '',
      phone: measurement.customer_phone || ''
    });

    navigate(createPageUrl(`Payment?${params.toString()}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !measurement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error || "Measurement not found"}</p>
            <Link to={createPageUrl("Homepage")}>
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const area = measurement.total_adjusted_sqft || measurement.total_sqft || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl(`Results?measurementid=${measurement.id}`)}>
              <Button variant="ghost" size="sm">
                Back to Results
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Select Your Report Type
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Choose the PDF report that best fits your needs
          </p>
          <p className="text-sm text-slate-500">
            Property: {measurement.property_address} • {area.toLocaleString()} sq ft
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Homeowner Report */}
          <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => handleSelectType('homeowner', 3)}>
            <CardHeader className="bg-gradient-to-br from-blue-50 to-white border-b pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-center text-slate-900">Homeowner Report</CardTitle>
              <div className="text-center mt-4">
                <div className="text-5xl font-bold text-blue-600">$3</div>
                <p className="text-sm text-slate-600 mt-1">One-time payment</p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-6 text-center">
                Perfect for property owners planning a roof project
              </p>
              
              <div className="space-y-3 mb-6">
                {[
                  "Detailed satellite measurements",
                  "Complete cost estimate breakdown",
                  "Material & labor pricing",
                  "Professional PDF report",
                  "Roof section analysis",
                  "What's included guide",
                  "Next steps recommendations"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                onClick={() => handleSelectType('homeowner', 3)}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Download Report - $3
              </Button>
            </CardContent>
          </Card>

          {/* Professional/Roofer Report */}
          <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => handleSelectType('roofer', 5)}>
            <CardHeader className="bg-gradient-to-br from-purple-50 to-white border-b pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-center text-slate-900">Professional Report</CardTitle>
              <div className="text-center mt-4">
                <div className="text-5xl font-bold text-purple-600">$5</div>
                <p className="text-sm text-slate-600 mt-1">One-time payment</p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-6 text-center">
                Designed for contractors and roofing professionals
              </p>
              
              <div className="space-y-3 mb-6">
                {[
                  "Precise measurements with pitch adjustments",
                  "Material quantity calculations",
                  "Shingles, underlayment, ridge cap estimates",
                  "Client-ready branded PDF",
                  "No Aroof watermark",
                  "Professional formatting",
                  "Perfect for client presentations"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700"
                onClick={() => handleSelectType('roofer', 5)}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Download Report - $5
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Satisfaction Guarantee */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 max-w-3xl mx-auto">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-slate-900">100% Satisfaction Guaranteed</h3>
            </div>
            <p className="text-slate-700">
              If measurements are inaccurate or you're not satisfied, we'll refund your money - no questions asked
            </p>
          </CardContent>
        </Card>

        {/* Back to Results */}
        <div className="text-center mt-8">
          <Link to={createPageUrl(`Results?measurementid=${measurement.id}`)}>
            <Button variant="outline" size="lg">
              ← Back to View Results (Free)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}