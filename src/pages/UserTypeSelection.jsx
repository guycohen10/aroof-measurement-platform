import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, User, Briefcase, CheckCircle, ArrowRight } from "lucide-react";

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  const handleSelectType = (type) => {
    setSelectedType(type);
    // Navigate to form with user type
    navigate(createPageUrl(`FormPage?usertype=${type}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Get Started with Aroof
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose your option to get accurate roof measurements in minutes
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Homeowner Card */}
          <Card 
            className="shadow-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => handleSelectType('homeowner')}
          >
            <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl text-center">I'm a Homeowner</CardTitle>
              <p className="text-center text-slate-600 text-lg mt-2">
                Get instant roof measurements and cost estimates
              </p>
            </CardHeader>
            <CardContent className="p-8">
              
              {/* Price */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-6 text-center">
                <p className="text-blue-100 text-sm mb-1">One-Time Fee</p>
                <p className="text-6xl font-bold mb-1">$3</p>
                <p className="text-blue-100">per measurement</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Instant Satellite Measurement</p>
                    <p className="text-sm text-slate-600">Accurate roof area within minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Cost Estimate Included</p>
                    <p className="text-sm text-slate-600">Get pricing ranges for your project</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Downloadable Report</p>
                    <p className="text-sm text-slate-600">Professional PDF with all details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Expert Consultation</p>
                    <p className="text-sm text-slate-600">Connect with Aroof roofing experts</p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                onClick={() => handleSelectType('homeowner')}
              >
                Continue as Homeowner
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Roofer Card */}
          <Card 
            className="shadow-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => handleSelectType('roofer')}
          >
            <CardHeader className="bg-gradient-to-br from-orange-50 to-white pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl text-center">I'm a Roofer</CardTitle>
              <p className="text-center text-slate-600 text-lg mt-2">
                Professional measurement tool for contractors
              </p>
            </CardHeader>
            <CardContent className="p-8">
              
              {/* Price */}
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl p-6 mb-6 text-center">
                <p className="text-orange-100 text-sm mb-1">One-Time Fee</p>
                <p className="text-6xl font-bold mb-1">$5</p>
                <p className="text-orange-100">per measurement</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Professional Measurement Tool</p>
                    <p className="text-sm text-slate-600">Advanced tools for accurate quotes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Material Calculations</p>
                    <p className="text-sm text-slate-600">Shingles, underlayment, and more</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Client-Ready Reports</p>
                    <p className="text-sm text-slate-600">Branded PDFs for your business</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">No Aroof Branding</p>
                    <p className="text-sm text-slate-600">Professional tool for your business</p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700"
                onClick={() => handleSelectType('roofer')}
              >
                Continue as Roofer
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-6">Trusted by homeowners and professionals</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Money-back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}