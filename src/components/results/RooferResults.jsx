import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Mail, CheckCircle, Layers, Building2 } from "lucide-react";
import { format } from "date-fns";
import ResultsMapView from "./ResultsMapView";

const SECTION_COLORS = ["#4A90E2", "#50C878", "#FF8C42", "#9B59B6", "#E74C3C"];

export default function RooferResults({ measurement, user }) {
  const sections = measurement?.measurement_data?.sections || [];
  const totalArea = measurement?.total_sqft || 0;

  return (
    <>
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <CheckCircle className="w-12 h-12 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-bold mb-1">Measurement Complete!</h2>
              <p className="text-orange-100 text-lg">
                Your professional measurement report is ready
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map View */}
            <ResultsMapView
              propertyAddress={measurement?.property_address}
              sections={sections}
              measurementId={measurement?.id}
            />

            {/* Measurement Details */}
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-2xl">Measurement Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Property Address</p>
                    <p className="font-medium text-slate-900 text-lg">{measurement?.property_address}</p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <p className="text-sm text-slate-600 mb-2">Total Roof Area</p>
                    <p className="text-5xl font-bold text-orange-600">
                      {totalArea.toLocaleString()} sq ft
                    </p>
                  </div>

                  {sections.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-5 h-5 text-slate-600" />
                        <h3 className="font-bold text-slate-900 text-lg">Section Breakdown</h3>
                      </div>
                      <div className="space-y-3">
                        {sections.map((section, index) => (
                          <div
                            key={section.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-5 h-5 rounded"
                                style={{ backgroundColor: SECTION_COLORS[index % SECTION_COLORS.length] }}
                              />
                              <span className="font-medium text-slate-900 text-lg">{section.name}</span>
                            </div>
                            <span className="font-bold text-slate-900 text-xl">
                              {section.area_sqft.toLocaleString()} sq ft
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-500 mb-1">Measurement Date</p>
                    <p className="font-medium text-slate-900">
                      {format(new Date(measurement?.created_date), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Report */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2">Professional Report</h3>
                    <p className="text-slate-300">
                      Download your complete measurement report with all section details
                    </p>
                  </div>
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 whitespace-nowrap">
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Business Info */}
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {user?.business_name && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Business Name</p>
                      <p className="font-medium text-slate-900">{user.business_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Contact Name</p>
                    <p className="font-medium text-slate-900">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="font-medium text-slate-900 text-sm break-all">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Phone</p>
                    <p className="font-medium text-slate-900">{user?.phone}</p>
                  </div>
                  {user?.license_number && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">License Number</p>
                      <p className="font-medium text-slate-900">{user.license_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-none shadow-xl">
              <CardContent className="p-6 space-y-3">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Report
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              </CardContent>
            </Card>

            {/* New Measurement */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-3">Need Another Measurement?</h3>
                <p className="text-orange-100 mb-4">
                  Get professional measurements for additional properties
                </p>
                <Link to={createPageUrl("RooferForm")}>
                  <Button className="w-full bg-white text-orange-600 hover:bg-orange-50" size="lg">
                    New Measurement
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Email Confirmation */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Report Sent</h3>
                <p className="text-slate-700">
                  A copy of your measurement report has been sent to <strong>{user?.email}</strong>. 
                  Check your inbox for the detailed PDF.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}