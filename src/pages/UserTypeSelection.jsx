
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, User, Briefcase, CheckCircle, ArrowRight, Sparkles, Phone, MapPin } from "lucide-react";

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleSelectType = (type) => {
    navigate(createPageUrl(`FormPage?usertype=${type}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Aroof</span>
              <p className="text-xs text-blue-300 font-semibold">DFW's #1 Roofing</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-sm font-semibold">Choose Your Path</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get Started with Aroof
          </h1>
          <p className="text-2xl text-blue-200 max-w-3xl mx-auto">
            Select the option that best describes you to get accurate roof measurements
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Homeowner Card */}
          <div
            onMouseEnter={() => setHoveredCard('homeowner')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleSelectType('homeowner')}
            className="cursor-pointer"
          >
            <Card className={`h-full border-none shadow-2xl transition-all duration-500 transform ${
              hoveredCard === 'homeowner' ? 'scale-105 shadow-blue-500/50' : 'hover:scale-102'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-blue-700"></div>
              
              <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-6 pt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform transition-transform duration-300 group-hover:rotate-6">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-4xl text-center text-slate-900">I'm a Homeowner</CardTitle>
                <p className="text-center text-slate-600 text-xl mt-3">
                  Get instant measurements and cost estimates for your home
                </p>
              </CardHeader>
              
              <CardContent className="p-10">
                {/* Price */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 mb-8 text-center shadow-xl">
                  <p className="text-blue-100 text-base mb-2 font-semibold">One-Time Fee</p>
                  <p className="text-7xl font-bold mb-2">$3</p>
                  <p className="text-blue-100 text-lg">per measurement</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-10">
                  {[
                    { title: "Instant Satellite Measurement", desc: "Accurate roof area within minutes" },
                    { title: "Cost Estimate Included", desc: "Get pricing ranges for your project" },
                    { title: "Downloadable Report", desc: "Professional PDF with all details" },
                    { title: "Expert Consultation", desc: "Connect with Aroof roofing experts" }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{feature.title}</p>
                        <p className="text-sm text-slate-600">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-16 text-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={() => handleSelectType('homeowner')}
                >
                  Continue as Homeowner
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Roofer Card */}
          <div
            onMouseEnter={() => setHoveredCard('roofer')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleSelectType('roofer')}
            className="cursor-pointer"
          >
            <Card className={`h-full border-none shadow-2xl transition-all duration-500 transform ${
              hoveredCard === 'roofer' ? 'scale-105 shadow-orange-500/50' : 'hover:scale-102'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-600 to-orange-700"></div>
              
              <CardHeader className="bg-gradient-to-br from-orange-50 to-white pb-6 pt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform transition-transform duration-300 group-hover:rotate-6">
                  <Briefcase className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-4xl text-center text-slate-900">I'm a Roofer</CardTitle>
                <p className="text-center text-slate-600 text-xl mt-3">
                  Professional measurement tools for contractors and roofers
                </p>
              </CardHeader>
              
              <CardContent className="p-10">
                {/* Price */}
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-2xl p-8 mb-8 text-center shadow-xl">
                  <p className="text-orange-100 text-base mb-2 font-semibold">One-Time Fee</p>
                  <p className="text-7xl font-bold mb-2">$5</p>
                  <p className="text-orange-100 text-lg">per measurement</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-10">
                  {[
                    { title: "Professional Measurement Tool", desc: "Advanced tools for accurate quotes" },
                    { title: "Material Calculations", desc: "Shingles, underlayment, and more" },
                    { title: "Client-Ready Reports", desc: "Branded PDFs for your business" },
                    { title: "No Aroof Branding", desc: "Professional tool for your business" }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{feature.title}</p>
                        <p className="text-sm text-slate-600">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-16 text-xl bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={() => handleSelectType('roofer')}
                >
                  Continue as Roofer
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-blue-200 text-lg mb-8 font-semibold">Trusted by professionals and homeowners across DFW</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
            {[
              { icon: CheckCircle, text: "Secure Payment" },
              { icon: CheckCircle, text: "256-bit Encryption" },
              { icon: CheckCircle, text: "Instant Access" },
              { icon: CheckCircle, text: "Money-back Guarantee" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <item.icon className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          {/* Contact Info */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-blue-200 text-sm">
            <a href="tel:+18502389727" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              (850) 238-9727
            </a>
            <span className="text-blue-400">•</span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dallas-Fort Worth Area
            </span>
            <span className="text-blue-400">•</span>
            <span>Texas Licensed Contractor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
