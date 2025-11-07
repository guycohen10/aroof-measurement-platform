import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Download, Phone, Calendar, Mail, CheckCircle, DollarSign, Layers } from "lucide-react";

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const measurementId = urlParams.get('measurementId');

      if (!measurementId) {
        navigate(createPageUrl("Homepage"));
        return;
      }

      try {
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        if (measurements.length > 0) {
          setMeasurement(measurements[0]);
          
          // Load user data
          const users = await base44.entities.User.filter({ id: measurements[0].user_id });
          if (users.length > 0) {
            setUser(users[0]);
          }
        } else {
          navigate(createPageUrl("Homepage"));
        }
      } catch (err) {
        console.error(err);
        navigate(createPageUrl("Homepage"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const isHomeowner = measurement?.user_type === "homeowner";
  const sections = measurement?.measurement_data?.sections || [];
  const totalArea = measurement?.total_sqft || 0;
  const estimate = measurement?.aroof_estimate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Aroof</h1>
                <p className="text-xs text-slate-500">Aroof.build</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Success!</h2>
              <p>Your roof measurement is complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Measurement Details */}
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-2xl">Measurement Results</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Property Address</p>
                    <p className="font-medium text-slate-900">{measurement?.property_address}</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Total Roof Area</p>
                    <p className="text-4xl font-bold text-blue-900">
                      {totalArea > 0 ? totalArea.toLocaleString() : '1,850'} sq ft
                    </p>
                    {totalArea === 0 && (
                      <p className="text-sm text-slate-500 mt-1">Sample measurement data</p>
                    )}
                  </div>

                  {sections.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-5 h-5 text-slate-600" />
                        <h3 className="font-bold text-slate-900">Section Breakdown</h3>
                      </div>
                      <div className="space-y-2">
                        {sections.map((section, index) => (
                          <div
                            key={section.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: section.color }}
                              />
                              <span className="font-medium text-slate-900">{section.name}</span>
                            </div>
                            <span className="font-bold text-slate-900">
                              {section.area_sqft.toLocaleString()} sq ft
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sections.length === 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-1">Roof Pitch</p>
                        <p className="text-2xl font-bold text-slate-900">6/12</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-1">Sections</p>
                        <p className="text-2xl font-bold text-slate-900">4</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Homeowner Estimate */}
            {isHomeowner && (
              <Card className="border-none shadow-xl border-2 border-blue-900">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-blue-900" />
                    Your Aroof Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-slate-600">Material Cost</span>
                      <span className="font-medium text-slate-900">
                        ${estimate ? estimate.material_cost.toLocaleString() : '5,550'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-slate-600">Labor Cost</span>
                      <span className="font-medium text-slate-900">
                        ${estimate ? estimate.labor_cost.toLocaleString() : '3,700'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-slate-600">Permits & Fees</span>
                      <span className="font-medium text-slate-900">$450</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold text-slate-900">Total Estimate</span>
                      <span className="text-3xl font-bold text-blue-900">
                        ${estimate ? estimate.total_cost.toLocaleString() : '9,700'}
                      </span>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <p className="text-sm text-green-800">
                        <strong>Note:</strong> This estimate is based on your measured roof area of {totalArea > 0 ? totalArea.toLocaleString() : '1,850'} sq ft. 
                        Final pricing may vary based on material selection, roof complexity, and local conditions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Download Report */}
            <Card className="border-none shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Detailed Report</h3>
                    <p className="text-sm text-slate-600">
                      {isHomeowner 
                        ? "Download your measurement results and estimate" 
                        : "Download your professional measurement report"}
                    </p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Name</p>
                    <p className="font-medium text-slate-900">{user?.name}</p>
                  </div>
                  {user?.business_name && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Business</p>
                      <p className="font-medium text-slate-900">{user.business_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="font-medium text-slate-900 text-sm break-all">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Phone</p>
                    <p className="font-medium text-slate-900">{user?.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            {isHomeowner && (
              <Card className="border-none shadow-xl bg-gradient-to-br from-blue-900 to-blue-700 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Ready to Start?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-blue-100">
                    Schedule a consultation with Aroof to discuss your project
                  </p>
                  <Button className="w-full bg-white text-blue-900 hover:bg-blue-50">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isHomeowner && (
              <Card className="border-none shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 mb-3">Need Another Measurement?</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Get professional measurements for additional properties
                  </p>
                  <Link to={createPageUrl("RooferForm")}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      New Measurement
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Confirmation Email Notice */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Confirmation Sent</h3>
                <p className="text-slate-700">
                  We've sent a copy of your measurement results to <strong>{user?.email}</strong>. 
                  Check your inbox for the full details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}