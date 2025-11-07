import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Mail,
  Edit,
  Copy,
  History,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ResultsMapView from "./ResultsMapView";

export default function RooferResults({ measurement, user }) {
  const [savingPdfDownload, setSavingPdfDownload] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalArea = measurement?.total_sqft || 0;
  const sections = measurement?.measurement_data?.sections || [];
  
  // Generate unique report ID
  const reportId = `ARM-${format(new Date(measurement?.created_date || new Date()), 'yyyy')}-${measurement?.id?.slice(0, 6).toUpperCase()}`;

  // Material calculations
  const wasteArea = Math.round(totalArea * 1.1);
  const shingles3Tab = Math.ceil(wasteArea / 33.3); // bundles
  const shinglesArch = Math.ceil(wasteArea / 32); // bundles
  const underlayment = Math.ceil(wasteArea / 400); // rolls
  
  // Calculate perimeter (approximate from sections)
  const totalPerimeter = sections.reduce((sum, section) => {
    // Rough perimeter calculation from area (assuming roughly square sections)
    const sideLength = Math.sqrt(section.area_sqft);
    return sum + (sideLength * 4);
  }, 0);
  const ridgeCap = Math.round(totalPerimeter * 0.3); // Approximate
  const starterStrips = Math.round(totalPerimeter);

  const handleDownloadPdf = async () => {
    setSavingPdfDownload(true);
    
    try {
      // Track PDF download
      const currentCount = measurement.pdf_download_count || 0;
      await base44.entities.Measurement.update(measurement.id, {
        pdf_download_count: currentCount + 1,
        last_accessed_date: new Date().toISOString()
      });

      // In production, this would generate and download the PDF
      alert("PDF download functionality will be available soon. Your download has been tracked.");
    } catch (err) {
      console.error("Failed to track PDF download:", err);
    } finally {
      setSavingPdfDownload(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}${createPageUrl(`Results?measurementId=${measurement.id}`)}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-orange-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-300 mb-2">Professional Measurement Report</p>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Report ID: {reportId}</h1>
              <p className="text-xl text-slate-200 mb-1">{measurement?.property_address}</p>
              {user?.business_name && (
                <p className="text-slate-300">
                  Measured by: <span className="font-medium text-white">{user.business_name}</span>
                </p>
              )}
              {measurement?.created_date && (
                <p className="text-sm text-slate-400 mt-2">
                  Date: {format(new Date(measurement.created_date), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-slate-300">Total Area</p>
                <p className="text-4xl font-bold">{totalArea.toLocaleString()}</p>
                <p className="text-slate-300">sq ft</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Primary Measurement Display */}
        <Card className="shadow-2xl mb-8 border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b">
            <CardTitle className="text-2xl">Measurement Report</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Total Area - Large Display */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-10 text-white mb-8">
              <p className="text-orange-100 text-lg mb-3 font-medium">Total Roof Area</p>
              <p className="text-7xl lg:text-8xl font-bold mb-3">{totalArea.toLocaleString()}</p>
              <p className="text-3xl font-medium text-orange-100">square feet</p>
            </div>

            {/* Section Breakdown Table */}
            {sections.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Section Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-300">
                        <th className="text-left p-4 font-bold text-slate-700">Section</th>
                        <th className="text-right p-4 font-bold text-slate-700">Area (sq ft)</th>
                        {sections[0]?.perimeter && (
                          <th className="text-right p-4 font-bold text-slate-700">Perimeter (ft)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map((section, index) => (
                        <tr key={section.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-900">{section.name}</td>
                          <td className="p-4 text-right font-bold text-orange-600">
                            {section.area_sqft.toLocaleString()}
                          </td>
                          {section.perimeter && (
                            <td className="p-4 text-right text-slate-700">
                              {Math.round(section.perimeter).toLocaleString()}
                            </td>
                          )}
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td className="p-4 text-slate-900">TOTAL</td>
                        <td className="p-4 text-right text-orange-600">{totalArea.toLocaleString()}</td>
                        {sections[0]?.perimeter && (
                          <td className="p-4 text-right text-slate-900">
                            {Math.round(totalPerimeter).toLocaleString()}
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Measurement Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Method</p>
                <p className="font-bold text-slate-900">Satellite Imagery</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Accuracy</p>
                <p className="font-bold text-slate-900">±2-5%</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Sections Measured</p>
                <p className="font-bold text-slate-900">{sections.length || 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Map with Watermark */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
              <CardTitle className="text-xl">Satellite View with Measurements</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResultsMapView
                propertyAddress={measurement?.property_address}
                sections={sections}
                totalArea={totalArea}
                showWatermark={true}
              />
              
              <Alert className="mt-4 border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm text-orange-900">
                  <strong>Watermarked Image:</strong> This image includes Aroof.build branding for professional use.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Material Estimation Helper */}
          <Card className="shadow-xl border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Material Estimation Helper
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <AlertDescription className="text-sm text-blue-900">
                  <strong>Note:</strong> These are estimates for planning purposes. Always verify quantities before ordering materials.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* Base Calculations */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-3">Base Calculations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Base roof area:</span>
                      <span className="font-bold text-slate-900">{totalArea.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Add 10% waste:</span>
                      <span className="font-bold text-slate-900">{wasteArea.toLocaleString()} sq ft</span>
                    </div>
                  </div>
                </div>

                {/* Shingles */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-3">Shingles Needed</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">3-tab (33.3 sq ft/bundle):</span>
                      <span className="font-bold text-orange-600">{shingles3Tab} bundles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Architectural (32 sq ft/bundle):</span>
                      <span className="font-bold text-orange-600">{shinglesArch} bundles</span>
                    </div>
                  </div>
                </div>

                {/* Other Materials */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-3">Other Materials</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Underlayment (400 sq ft/roll):</span>
                      <span className="font-bold text-slate-900">{underlayment} rolls</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ridge cap (estimate):</span>
                      <span className="font-bold text-slate-900">{ridgeCap} linear ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Starter strips:</span>
                      <span className="font-bold text-slate-900">{starterStrips} linear ft</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roofer Notes Section */}
        {measurement?.roofer_notes && (
          <Card className="shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
              <CardTitle className="text-xl">Project Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-slate-900 whitespace-pre-wrap">{measurement.roofer_notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="shadow-2xl border-none overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Report Actions</h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 h-14 text-lg font-bold"
                onClick={handleDownloadPdf}
                disabled={savingPdfDownload}
              >
                {savingPdfDownload ? (
                  <>Tracking...</>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF Report
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 h-14 text-lg font-bold"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Report to Client
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to={createPageUrl("Homepage")}>
                  Measure Another Property
                </Link>
              </Button>

              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to={createPageUrl(`MeasurementTool?measurementId=${measurement?.id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Measurement
                </Link>
              </Button>

              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Report Link
                  </>
                )}
              </Button>
            </div>

            {measurement?.pdf_download_count > 0 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-orange-100">
                  This report has been downloaded {measurement.pdf_download_count} time{measurement.pdf_download_count !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Professional Notice */}
        <Card className="mt-8 bg-slate-50 border-slate-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-slate-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-slate-900 mb-2">Professional Business Tool</p>
                <p className="text-sm text-slate-700">
                  This measurement report is designed for roofing professionals and contractors. 
                  No Aroof pricing or marketing is included - this is your professional tool for accurate measurements and client proposals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}