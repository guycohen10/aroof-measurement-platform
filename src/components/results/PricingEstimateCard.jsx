import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Shield, Award, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MATERIAL_LABELS = {
  asphalt_shingles: "Asphalt Shingles (Standard)",
  architectural_shingles: "Architectural Shingles (+20%)",
  metal_roofing: "Metal Roofing (+50%)",
  tile_roofing: "Tile Roofing (+80%)"
};

export default function PricingEstimateCard({ 
  estimate, 
  totalArea, 
  selectedMaterial, 
  setSelectedMaterial,
  loading 
}) {
  if (loading) {
    return (
      <Card className="border-none shadow-xl">
        <CardContent className="p-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-slate-600">Calculating estimate...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!estimate) {
    return (
      <Card className="border-none shadow-xl">
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>
              Unable to calculate estimate at this time. Please contact Aroof for a custom quote at (555) 123-4567.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl border-2 border-blue-900">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-2xl lg:text-3xl flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-blue-900" />
            Your Aroof Estimate
          </CardTitle>
          
          {/* Material Selector */}
          <div className="w-full sm:w-auto">
            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MATERIAL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 lg:p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pricing Breakdown */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Pricing Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-slate-600">Roof Area</span>
                <span className="font-medium text-slate-900">{totalArea.toLocaleString()} sq ft</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-slate-600">Material Cost</span>
                <span className="font-medium text-slate-900">
                  ${estimate.material_cost.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-slate-600">Labor Cost</span>
                <span className="font-medium text-slate-900">
                  ${estimate.labor_cost.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-slate-600">Waste Factor (10%)</span>
                <span className="font-medium text-slate-900">
                  ${estimate.waste_factor.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-slate-600">Permits & Fees</span>
                <span className="font-medium text-slate-900">
                  ${estimate.additional_fees.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-3">
                <span className="text-lg font-bold text-slate-900">Subtotal</span>
                <span className="text-lg font-bold text-slate-900">
                  ${estimate.subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Estimated Range */}
            <div className="mt-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <p className="text-blue-100 text-sm mb-2">Estimated Total Range</p>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl lg:text-5xl font-bold">
                  ${estimate.low_estimate.toLocaleString()}
                </p>
                <span className="text-2xl text-blue-100">to</span>
                <p className="text-4xl lg:text-5xl font-bold">
                  ${estimate.high_estimate.toLocaleString()}
                </p>
              </div>
              <p className="text-blue-100 text-sm mt-3">
                Final price may vary based on roof complexity and material selection
              </p>
            </div>

            {/* What's Included */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-bold text-slate-900 mb-3">What's Included:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  "All materials",
                  "Professional installation",
                  "Complete cleanup",
                  "Warranty included",
                  "Permits & inspections",
                  "Quality guarantee"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Elements */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 mb-1">Licensed & Insured</h4>
                <p className="text-sm text-slate-600">
                  Full liability coverage for your peace of mind
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <Award className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 mb-1">15+ Years Experience</h4>
                <p className="text-sm text-slate-600">
                  Trusted by thousands of homeowners
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 mb-1">Quality Guarantee</h4>
                <p className="text-sm text-slate-600">
                  Comprehensive warranty on all work
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Note:</strong> This estimate is based on {MATERIAL_LABELS[selectedMaterial]}. 
                Change material type above to see updated pricing.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}