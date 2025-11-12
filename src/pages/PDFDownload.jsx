import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, CheckCircle, Download, FileText, Loader2, Calendar, Mail } from "lucide-react";

export default function PDFDownload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [userType, setUserType] = useState('homeowner');
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const measurementId = urlParams.get('measurementid');
    const typeParam = urlParams.get('usertype');

    if (!measurementId) {
      navigate(createPageUrl("Homepage"));
      return;
    }

    if (typeParam) {
      setUserType(typeParam);
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

  const handleDownloadPDF = () => {
    alert('📄 PDF Generation feature coming soon!\n\nYour payment was successful and your report is being prepared. You\'ll receive an email with the download link within 5 minutes.\n\nFor immediate assistance, call (850) 238-9727');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Aroof</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Payment Successful! ✓
          </h1>
          <p className="text-2xl text-slate-600">
            Your PDF report is being prepared
          </p>
        </div>

        <Card className="shadow-2xl mb-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <CardTitle className="text-2xl text-center">Report Details</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-blue-600 mb-1">Report Type</p>
              <p className="text-3xl font-bold text-blue-900 capitalize">{userType} Report</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="text-slate-600">Property:</span>
                <span className="font-semibold text-slate-900">{measurement.property_address}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="text-slate-600">Roof Area:</span>
                <span className="font-semibold text-slate-900">{area.toLocaleString()} sq ft</span>
              </div>
            </div>

            <Button
              onClick={handleDownloadPDF}
              className="w-full h-16 text-xl bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Download className="w-6 h-6 mr-2" />
              Download Your PDF Report
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-xl">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Mail, text: "You'll receive an email with your PDF report within 5 minutes" },
              { icon: Download, text: "Download and save your report for future reference" },
              { icon: FileText, text: "Share with contractors or insurance companies as needed" },
              { icon: Calendar, text: "Ready to proceed? Schedule a FREE inspection with us" }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-slate-700 pt-2">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <Link to={createPageUrl(`Results?measurementid=${measurement.id}`)}>
            <Button variant="outline" size="lg">
              Back to Results
            </Button>
          </Link>
          <p className="text-sm text-slate-600">
            Questions? Call us at <a href="tel:+18502389727" className="font-bold text-blue-600 hover:underline">(850) 238-9727</a>
          </p>
        </div>
      </div>
    </div>
  );
}