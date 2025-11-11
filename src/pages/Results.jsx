
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, ArrowLeft, CheckCircle, MapPin, Calendar, Ruler, Download, Phone, FileText, Star, Shield, DollarSign, Zap, Award, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import InteractiveMapView from "../components/results/InteractiveMapView";
import { generateHomeownerPDF, generateRooferPDF, downloadHTML } from "../utils/pdfGenerator";

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState("");
  const [materialType, setMaterialType] = useState("asphalt_shingles");
  const [trackingAction, setTrackingAction] = useState(false);

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

  const trackConversion = async (action, data = {}) => {
    if (!measurement || trackingAction) return;
    
    setTrackingAction(true);
    try {
      await base44.entities.Measurement.update(measurement.id, data);
      setMeasurement({ ...measurement, ...data });
      console.log(`✅ Tracked: ${action}`);
    } catch (err) {
      console.error("Failed to track conversion:", err);
    } finally {
      setTrackingAction(false);
    }
  };

  const handleScheduleClick = () => {
    trackConversion("booking_clicked", { clicked_booking: true });
    navigate(createPageUrl(`Booking?measurementid=${measurement.id}`));
  };

  const handleCallClick = () => {
    trackConversion("call_clicked", { clicked_call: true });
  };

  const handleDownloadClick = () => {
    if (!measurement) return;

    const currentCount = measurement.pdf_download_count || 0;
    trackConversion("download_clicked", { 
      downloaded_report: true,
      pdf_download_count: currentCount + 1,
      pdf_generated_date: new Date().toISOString()
    });

    // Get sections from measurement data
    const sections = measurement?.measurement_data?.sections || [];
    const area = measurement.total_sqft || 0;
    const isHomeowner = measurement.user_type === "homeowner";

    // Material multipliers
    const materialMultipliers = {
      asphalt_shingles: 1.0,
      architectural_shingles: 1.25,
      metal_roofing: 1.60,
      tile_roofing: 2.0
    };

    const materialNames = {
      asphalt_shingles: "Asphalt Shingles (Standard)",
      architectural_shingles: "Architectural Shingles (+25%)",
      metal_roofing: "Metal Roofing (+60%)",
      tile_roofing: "Tile Roofing (+100%)"
    };

    // Calculate pricing with material multiplier
    const multiplier = materialMultipliers[materialType] || 1.0;
    const baseMaterialCost = area * 4.00;
    const materialCost = Math.round(baseMaterialCost * multiplier);
    const laborCost = Math.round(area * 3.00);
    const wasteCost = Math.round((materialCost + laborCost) * 0.10);
    const subtotal = materialCost + laborCost + wasteCost;
    const lowEstimate = Math.round(subtotal * 0.90);
    const highEstimate = Math.round(subtotal * 1.10);
    
    // Prepare estimate data
    const estimateData = {
      materialType: materialNames[materialType],
      materialRate: (4.00 * multiplier).toFixed(2),
      materialCost,
      laborCost,
      wasteCost,
      subtotal,
      low: lowEstimate,
      high: highEstimate
    };

    // Generate HTML content
    const htmlContent = isHomeowner
      ? generateHomeownerPDF(measurement, sections, estimateData)
      : generateRooferPDF(measurement, sections, measurement.roofer_notes);

    // Create filename
    const filename = isHomeowner
      ? `Aroof_Estimate_${measurement.property_address.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy-MM-dd')}.html`
      : `Roof_Measurement_${measurement.property_address.replace(/[^a-z0-9]/gi, '_')}_ARM-${Date.now()}.html`;

    // Download and open
    downloadHTML(htmlContent, filename);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-2xl font-semibold text-slate-700 mb-2">Loading Your Results...</p>
          <p className="text-slate-500">This will only take a moment</p>
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

  // Get sections from measurement data
  const sections = measurement?.measurement_data?.sections || [];
  const area = measurement.total_sqft || 0;
  const isHomeowner = measurement.user_type === "homeowner";

  // Material multipliers
  const materialMultipliers = {
    asphalt_shingles: 1.0,
    architectural_shingles: 1.25,
    metal_roofing: 1.60,
    tile_roofing: 2.0
  };

  const materialNames = {
    asphalt_shingles: "Asphalt Shingles (Standard)",
    architectural_shingles: "Architectural Shingles (+25%)",
    metal_roofing: "Metal Roofing (+60%)",
    tile_roofing: "Tile Roofing (+100%)"
  };

  // Calculate pricing with material multiplier
  const multiplier = materialMultipliers[materialType] || 1.0;
  const baseMaterialCost = area * 4.00;
  const materialCost = Math.round(baseMaterialCost * multiplier);
  const laborCost = Math.round(area * 3.00);
  const wasteCost = Math.round((materialCost + laborCost) * 0.10);
  const subtotal = materialCost + laborCost + wasteCost;
  const lowEstimate = Math.round(subtotal * 0.90);
  const highEstimate = Math.round(subtotal * 1.10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Modern Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">Aroof</span>
                <p className="text-xs text-blue-600 font-semibold">Your Measurement Results</p>
              </div>
            </Link>
            <Link to={createPageUrl(`MeasurementPage?measurementId=${measurement.id}&address=${encodeURIComponent(measurement.property_address || '')}`)}>
              <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Measurement
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Enhanced Success Banner with Animation */}
      <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMTZjMCAyLjMxIDEuNzkgNCA0IDRzNC0xLjc5IDQtNC0xLjc5LTQtNC00LTQgMS43OS00IDR6bS02IDBjMCAyLjMxIDEuNzkgNCA0IDRzNC0xLjc5IDQtNC0xLjc5LTQtNC00LTQgMS43OS00IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Measurement Complete!</h1>
          </div>
          <p className="text-center text-2xl text-green-100 mb-3">{measurement?.property_address}</p>
          {measurement?.created_date && (
            <p className="text-center text-green-200">
              Measured on {format(new Date(measurement.created_date), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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

        {/* Interactive Map with Polygon */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Satellite View with Measurements</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Interactive map - zoom and pan to explore</p>
          </CardHeader>
          <CardContent>
            <InteractiveMapView measurement={measurement} sections={sections} />
          </CardContent>
        </Card>

        {/* Pricing Estimate (for homeowners) */}
        {isHomeowner && (
          <Card className="mb-8 shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                Estimated Project Cost
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Material Selector */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Select Roofing Material:
                </label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asphalt_shingles">
                      Asphalt Shingles (Standard)
                    </SelectItem>
                    <SelectItem value="architectural_shingles">
                      Architectural Shingles (+25%)
                    </SelectItem>
                    <SelectItem value="metal_roofing">
                      Metal Roofing (+60%)
                    </SelectItem>
                    <SelectItem value="tile_roofing">
                      Tile Roofing (+100%)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cost Breakdown with Animation */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200 transition-all duration-300">
                  <span className="text-slate-600">
                    Materials ({area.toLocaleString()} sq ft × ${(4.00 * multiplier).toFixed(2)})
                  </span>
                  <span className="font-bold text-slate-900 transition-all duration-300">
                    ${materialCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-600">Labor ({area.toLocaleString()} sq ft × $3.00)</span>
                  <span className="font-bold text-slate-900">${laborCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-600">Waste Factor (10%)</span>
                  <span className="font-bold text-slate-900">${wasteCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-600 text-white rounded-lg transition-all duration-300">
                  <span className="text-lg font-semibold">Estimated Cost Range</span>
                  <span className="text-2xl font-bold transition-all duration-300">
                    ${lowEstimate.toLocaleString()} - ${highEstimate.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-slate-900 mb-4 text-lg">What's Included:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Premium roofing materials",
                    "Professional installation by licensed crew",
                    "Complete tear-off & disposal of old roof",
                    "Underlayment & ice/water shield",
                    "Proper ventilation installation",
                    "Full site cleanup & debris removal",
                    "10-year workmanship warranty",
                    "Final inspection & quality check"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
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

        {/* Ready to Get Started - Enhanced CTA Section */}
        <Card className="mb-8 shadow-2xl border-none overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">Ready for Your New Roof?</h2>
              <p className="text-xl text-blue-100 mb-6">Let's Turn This Estimate Into Reality</p>
              
              {/* Benefits Icons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { icon: Shield, text: "Licensed & Insured" },
                  { icon: DollarSign, text: "Financing Available" },
                  { icon: Zap, text: "Fast Scheduling" },
                  { icon: Star, text: "4.9/5 Stars on Google" }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <item.icon className="w-8 h-8 text-blue-200" />
                    <span className="text-sm font-medium text-blue-100">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* PRIMARY CTA - Schedule Free Inspection */}
              <Button
                size="lg"
                className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all md:col-span-2 lg:col-span-4"
                onClick={handleScheduleClick}
              >
                <Calendar className="w-6 h-6 mr-2" />
                Schedule Free Inspection
                <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded-full">
                  🔥 Same-Day Available
                </span>
              </Button>

              {/* Secondary Actions */}
              <Button
                size="lg"
                variant="secondary"
                className="w-full h-14 text-lg bg-white text-blue-900 hover:bg-blue-50"
                onClick={() => navigate(createPageUrl("FormPage"))}
              >
                <Home className="w-5 h-5 mr-2" />
                Measure Another Roof
              </Button>

              {/* Download Report Button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-lg border-2 border-white text-white hover:bg-white/10"
                onClick={handleDownloadClick}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Report
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-lg border-2 border-green-400 text-green-400 hover:bg-green-50 hover:text-green-700 md:col-span-2"
                asChild
                onClick={handleCallClick}
              >
                <a href="tel:+18502389727">
                  <Phone className="w-5 h-5 mr-2" />
                  Call: (850) 238-9727
                </a>
              </Button>
            </div>

            {/* Urgency Element */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                ⚡ 3 Spots Available This Week
              </div>
            </div>
          </div>
        </Card>

        {/* Testimonial */}
        <Card className="mb-8 shadow-lg border-l-4 border-l-yellow-400">
          <CardContent className="p-6">
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-lg text-slate-700 italic mb-4">
              "Aroof made getting my roof done so easy! The measurement was accurate and the team was professional from start to finish."
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Sarah J.</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Plano, TX
                  </p>
                </div>
              </div>
              <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified Customer
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Questions About Your Estimate?</h3>
            <p className="text-slate-600 mb-4">
              Our roofing experts are here to help with your project
            </p>
            <div className="space-y-2 text-sm text-slate-700">
              <a href="tel:+18502389727" className="flex items-center justify-center gap-2 hover:text-blue-600 transition-colors">
                <Phone className="w-4 h-4" />
                <strong>Phone:</strong> (850) 238-9727
              </a>
              <a href="mailto:contact@aroof.build" className="flex items-center justify-center gap-2 hover:text-blue-600 transition-colors">
                <strong>Email:</strong> contact@aroof.build
              </a>
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <div>
                  <strong>Address:</strong> 6810 Windrock Rd, Dallas, TX 75252
                </div>
              </div>
              <p><strong>Hours:</strong> Monday - Friday, 8:00 AM - 6:00 PM</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
