import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Ruler, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  Users, 
  Award,
  ArrowRight,
  MapPin,
  Clock,
  FileText
} from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Aroof</h1>
                <p className="text-xs text-slate-500">Aroof.build</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-slate-600 hover:text-blue-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-900 transition-colors">Pricing</a>
              <Link to={createPageUrl("AdminDashboard")}>
                <Button variant="outline" size="sm">Admin</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Licensed & Insured • 15+ Years in Business
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Professional Roof
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600">
                Measurements & Instant Pricing
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Get accurate satellite-based roof measurements and instant cost estimates. 
              Perfect for homeowners planning projects or contractors serving clients.
            </p>

            {/* Main CTAs */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Link to={createPageUrl("UserTypeSelection?type=homeowner")} className="block">
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-900 cursor-pointer h-full">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">I'm a Homeowner</h3>
                    <p className="text-slate-600 mb-4">Get instant cost estimates from Aroof</p>
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-blue-900 mb-4">
                      <DollarSign className="w-8 h-8" />
                      <span>3</span>
                    </div>
                    <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white group-hover:bg-orange-500 transition-colors">
                      Measure My Roof
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link to={createPageUrl("UserTypeSelection?type=roofer")} className="block">
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-orange-500 cursor-pointer h-full">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <Ruler className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">I'm a Roofer</h3>
                    <p className="text-slate-600 mb-4">Professional measurements for your business</p>
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-orange-500 mb-4">
                      <DollarSign className="w-8 h-8" />
                      <span>5</span>
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      Get Professional Measurements
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Three simple steps to accurate measurements</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Enter Your Address",
                description: "Simply provide the property address you want to measure",
                step: "1"
              },
              {
                icon: Ruler,
                title: "Measure Your Roof",
                description: "Use our satellite-based tool to trace and measure roof sections",
                step: "2"
              },
              {
                icon: FileText,
                title: "Get Results",
                description: "Receive instant measurements and pricing (for homeowners)",
                step: "3"
              }
            ].map((item, index) => (
              <Card key={index} className="relative group hover:shadow-xl transition-all">
                <CardContent className="p-8">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                    <item.icon className="w-8 h-8 text-blue-900" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Aroof</h2>
            <p className="text-xl text-slate-600">Trusted by thousands of homeowners and contractors</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Licensed & Insured",
                description: "Full liability coverage"
              },
              {
                icon: Award,
                title: "15+ Years Experience",
                description: "Industry expertise"
              },
              {
                icon: Clock,
                title: "Instant Results",
                description: "Get measurements in minutes"
              },
              {
                icon: CheckCircle,
                title: "Accurate Measurements",
                description: "Satellite-based precision"
              }
            ].map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600">Pay once, get accurate results instantly</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-blue-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-900 text-white px-4 py-1 text-sm font-medium">
                Most Popular
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Homeowner</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-5xl font-bold text-blue-900">$3</span>
                  </div>
                  <p className="text-slate-600">Perfect for homeowners planning a roofing project</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Accurate roof measurements",
                    "Instant cost estimate from Aroof",
                    "Material recommendations",
                    "Direct booking available",
                    "24/7 access to results"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl("UserTypeSelection?type=homeowner")}>
                  <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-500">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Contractor</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-5xl font-bold text-orange-500">$5</span>
                  </div>
                  <p className="text-slate-600">Professional measurements for roofing businesses</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Precise satellite measurements",
                    "Detailed measurement reports",
                    "Downloadable PDF with data",
                    "Business use license",
                    "Priority support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl("UserTypeSelection?type=roofer")}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who trust Aroof for accurate roof measurements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("UserTypeSelection?type=homeowner")}>
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                I'm a Homeowner
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("UserTypeSelection?type=roofer")}>
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                I'm a Roofer
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Aroof</span>
              </div>
              <p className="text-slate-400">
                Professional roofing measurements and services you can trust.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Aroof.build</li>
                <li>Licensed & Insured</li>
                <li>15+ Years Experience</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Aroof. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}