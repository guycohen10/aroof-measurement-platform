
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  CheckCircle,
  Phone,
  Calendar,
  FileText,
  Star,
  Shield,
  Award,
  DollarSign,
  Edit,
  Mail,
  Share2,
  Loader2, // Added Loader2 import
  Home // Assuming Home is used for the project gallery placeholder
} from "lucide-react";
import { format } from "date-fns";
import MeasurementSummaryCard from "./MeasurementSummaryCard";
import ResultsMapView from "./ResultsMapView";
import { generateHomeownerPDFContent, downloadPDF } from "./PDFGenerator"; // Added PDF utility imports

export default function HomeownerResults({ measurement, user, setMeasurement }) {
  const [materialType, setMaterialType] = useState("asphalt_shingles");
  const [savingInteraction, setSavingInteraction] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false); // New state for PDF download

  // Calculate pricing
  const totalArea = measurement?.total_sqft || 0;
  const baseMaterialCost = 4.00; // per sq ft
  const baseLaborCost = 3.00; // per sq ft

  // Material multipliers
  const materialMultipliers = {
    asphalt_shingles: 1.0,
    architectural_shingles: 1.25,
    metal_roofing: 1.60,
    tile_roofing: 2.0
  };

  const multiplier = materialMultipliers[materialType] || 1.0;
  
  const materialCost = Math.round(totalArea * baseMaterialCost * multiplier);
  const laborCost = Math.round(totalArea * baseLaborCost * multiplier);
  const wasteCost = Math.round((materialCost + laborCost) * 0.10);
  const subtotal = materialCost + laborCost + wasteCost;
  const lowEstimate = Math.round(subtotal * 0.90);
  const highEstimate = Math.round(subtotal * 1.10);

  const sections = measurement?.measurement_data?.sections || [];

  const handleBookingClick = async () => {
    if (!measurement) return;
    
    setSavingInteraction(true);
    try {
      await base44.entities.Measurement.update(measurement.id, {
        clicked_booking: true
      });
      setMeasurement({ ...measurement, clicked_booking: true });
    } catch (err) {
      console.error("Failed to track booking click:", err);
    } finally {
      setSavingInteraction(false);
    }
  };

  const handleQuoteClick = async () => {
    if (!measurement) return;
    
    setSavingInteraction(true);
    try {
      await base44.entities.Measurement.update(measurement.id, {
        requested_quote: true
      });
      setMeasurement({ ...measurement, requested_quote: true });
    } catch (err) {
      console.error("Failed to track quote request:", err);
    } finally {
      setSavingInteraction(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!measurement) return;

    setDownloadingPdf(true);
    
    try {
      // Track download
      const currentCount = measurement.pdf_download_count || 0;
      await base44.entities.Measurement.update(measurement.id, {
        pdf_download_count: currentCount + 1,
        pdf_generated_date: new Date().toISOString()
      });
      // Update local measurement state for immediate feedback if needed, though not strictly necessary here.
      setMeasurement({ ...measurement, pdf_download_count: currentCount + 1, pdf_generated_date: new Date().toISOString() });


      // Generate PDF content
      const estimate = {
        materialType: materialNames[materialType],
        materialCost,
        laborCost,
        wasteCost,
        subtotal,
        low: lowEstimate,
        high: highEstimate
      };

      const pdfContent = generateHomeownerPDFContent(
        measurement,
        sections,
        totalArea,
        estimate
      );

      // Download as HTML file (can be opened in browser and printed as PDF)
      const filename = `Aroof_Measurement_${measurement.property_address.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy-MM-dd')}.html`;
      downloadPDF(pdfContent, filename);

    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const materialNames = {
    asphalt_shingles: "Asphalt Shingles (Standard)",
    architectural_shingles: "Architectural Shingles (+25%)",
    metal_roofing: "Metal Roofing (+60%)",
    tile_roofing: "Tile Roofing (+100%)"
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Measurement Complete!</h1>
          <p className="text-xl lg:text-2xl text-green-100 mb-2">Your roof measurement is ready</p>
          <p className="text-lg text-green-200">
            {measurement?.property_address}
          </p>
          {measurement?.created_date && (
            <p className="text-sm text-green-200 mt-2">
              Measured on {format(new Date(measurement.created_date), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 3 Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* LEFT COLUMN - Measurement Summary */}
          <div className="space-y-6">
            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <CardTitle className="text-xl">Measurement Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Total Area - Large Display */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-6">
                  <p className="text-blue-100 text-sm mb-2 font-medium">Total Roof Area</p>
                  <p className="text-6xl lg:text-7xl font-bold mb-2">{totalArea.toLocaleString()}</p>
                  <p className="text-2xl font-medium text-blue-100">square feet</p>
                </div>

                {/* Section Breakdown */}
                {sections.length > 1 && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-slate-700 mb-3">Section Breakdown:</p>
                    <div className="space-y-2">
                      {sections.map((section) => (
                        <div
                          key={section.id}
                          className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <span className="font-medium text-slate-900">{section.name}</span>
                          <span className="font-bold text-blue-600">{section.area_sqft.toLocaleString()} sq ft</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Measurement Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Method:</span>
                    <span className="font-medium text-slate-900">Satellite Imagery</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Accuracy:</span>
                    <span className="font-medium text-slate-900">±2-5%</span>
                  </div>
                  {measurement?.created_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Measured:</span>
                      <span className="font-medium text-slate-900">
                        {format(new Date(measurement.created_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                <Link to={createPageUrl(`MeasurementTool?measurementId=${measurement?.id}`)}>
                  <Button variant="outline" className="w-full mt-4">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Measurement
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* CENTER - Map Image */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                <CardTitle className="text-xl">Satellite View</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResultsMapView
                  propertyAddress={measurement?.property_address}
                  sections={sections}
                  totalArea={totalArea}
                  showWatermark={false}
                />
                
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Aroof Cost Estimate */}
          <div className="space-y-6">
            <Card className="shadow-xl border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Estimated Project Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Material Selector */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Select Roofing Material:
                  </label>
                  <Select value={materialType} onValueChange={setMaterialType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asphalt_shingles">Asphalt Shingles (Standard)</SelectItem>
                      <SelectItem value="architectural_shingles">Architectural Shingles (+25%)</SelectItem>
                      <SelectItem value="metal_roofing">Metal Roofing (+60%)</SelectItem>
                      <SelectItem value="tile_roofing">Tile Roofing (+100%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Roof Area:</span>
                    <span className="font-medium">{totalArea.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Material Cost:</span>
                    <span className="font-medium">${materialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Labor Cost:</span>
                    <span className="font-medium">${laborCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Waste Factor (10%):</span>
                    <span className="font-medium">${wasteCost.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold text-slate-900">Subtotal:</span>
                    <span className="font-bold text-slate-900">${subtotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white mb-6">
                  <p className="text-green-100 text-sm mb-2">Estimated Price Range</p>
                  <p className="text-4xl font-bold">
                    ${lowEstimate.toLocaleString()} - ${highEstimate.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-200 mt-2">Based on {materialNames[materialType]}</p>
                </div>

                {/* What's Included */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="font-bold text-slate-900 mb-3 text-sm">What's Included:</p>
                  <div className="space-y-2 text-sm">
                    {[
                      "Premium roofing materials",
                      "Professional installation",
                      "Old roof removal and disposal",
                      "Underlayment and ice shield",
                      "Full cleanup",
                      "Workmanship warranty"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-slate-500 italic">
                  Estimate based on standard conditions. Final price may vary based on roof pitch, complexity, and material selection. Valid for 30 days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CALL TO ACTION SECTION - UPDATED */}
        <Card className="shadow-2xl border-none overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">Ready for Your New Roof?</h2>
              <p className="text-xl text-blue-100">Schedule a Free Inspection</p>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Link to={createPageUrl(`Booking?measurementid=${measurement?.id}`)}>
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-16 text-lg font-bold shadow-lg"
                  onClick={handleBookingClick}
                  disabled={savingInteraction}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Free Inspection
                </Button>
              </Link>

              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-900 hover:bg-blue-50 h-16 text-lg font-bold"
                onClick={handleQuoteClick}
                disabled={savingInteraction}
              >
                <FileText className="w-5 h-5 mr-2" />
                Request Quote
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 h-16 text-lg font-bold"
                asChild
              >
                <a href="tel:+12145550123">
                  <Phone className="w-5 h-5 mr-2" />
                  Call: (214) 555-0123
                </a>
              </Button>
            </div>

            {/* Trust Elements */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-blue-100">4.9/5 stars from 500+ DFW homeowners</p>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="w-10 h-10 mb-2 text-blue-200" />
                <p className="text-sm text-blue-100">Licensed & Insured in Texas</p>
              </div>
              <div className="flex flex-col items-center">
                <Award className="w-10 h-10 mb-2 text-blue-200" />
                <p className="text-sm text-blue-100">Same-day service available</p>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="w-10 h-10 mb-2 text-blue-200" />
                <p className="text-sm text-blue-100">10-year workmanship warranty</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Options */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </>
            )}
          </Button>
          <Button variant="outline" size="lg">
            <Mail className="w-4 h-4 mr-2" />
            Email Results
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
        </div>

        {/* Project Gallery */}
        <Card className="mt-12 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Aroof Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-slate-200 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Home className="w-12 h-12" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              See more of our work and customer testimonials
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
