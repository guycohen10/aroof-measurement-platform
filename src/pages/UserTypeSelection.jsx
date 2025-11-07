import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Ruler, DollarSign, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const [preselectedType, setPreselectedType] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type === 'homeowner' || type === 'roofer') {
      setPreselectedType(type);
    }
  }, []);

  const handleSelection = (type) => {
    if (type === 'homeowner') {
      navigate(createPageUrl("HomeownerForm"));
    } else {
      navigate(createPageUrl("RooferForm"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
            <Link to={createPageUrl("Homepage")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Who Are You?
          </h1>
          <p className="text-xl text-slate-600">
            Choose your path to get started with accurate roof measurements
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Homeowner Card */}
          <Card 
            className={`group hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer ${
              preselectedType === 'homeowner' ? 'border-blue-900 ring-4 ring-blue-100' : 'hover:border-blue-900'
            }`}
            onClick={() => handleSelection('homeowner')}
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Home className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Homeowner</h2>
                
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-5xl font-bold text-blue-900">$3</span>
                </div>

                <p className="text-slate-600 mb-8">
                  Get accurate roof measurements plus instant cost estimates from Aroof's professional roofing team
                </p>

                <div className="space-y-3 mb-8 text-left">
                  {[
                    "Satellite-based measurements",
                    "Instant Aroof cost estimate",
                    "Material recommendations",
                    "Easy appointment booking",
                    "Professional consultation available"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white group-hover:bg-orange-500 transition-colors"
                  size="lg"
                >
                  Continue as Homeowner
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-slate-500 mt-4">
                  By proceeding, you agree to receive quotes from Aroof
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Roofer Card */}
          <Card 
            className={`group hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer ${
              preselectedType === 'roofer' ? 'border-orange-500 ring-4 ring-orange-100' : 'hover:border-orange-500'
            }`}
            onClick={() => handleSelection('roofer')}
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Ruler className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Roofer / Contractor</h2>
                
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-5xl font-bold text-orange-500">$5</span>
                </div>

                <p className="text-slate-600 mb-8">
                  Professional measurements for your roofing business. Get detailed reports without Aroof pricing
                </p>

                <div className="space-y-3 mb-8 text-left">
                  {[
                    "Precise satellite measurements",
                    "Detailed measurement reports",
                    "Downloadable PDF with watermark",
                    "Business use license",
                    "Priority support"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  size="lg"
                >
                  Continue as Roofer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-slate-500 mt-4">
                  This measurement is for your roofing business
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-slate-600">
            Have questions? <a href="#" className="text-blue-900 font-medium hover:underline">Contact us</a> or view our <a href="#" className="text-blue-900 font-medium hover:underline">FAQ</a>
          </p>
        </div>
      </div>
    </div>
  );
}