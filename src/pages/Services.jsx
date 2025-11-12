import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Phone, MapPin, Shield, Award, DollarSign, Clock, Star, ArrowRight, CheckCircle } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: "🏠",
      title: "Roof Replacement",
      description: "Complete tear-off and new roof installation with premium materials and 10-year warranty.",
      price: "Starting at $7/sq ft",
      link: "services/RoofReplacement"
    },
    {
      icon: "🔧",
      title: "Roof Repair",
      description: "Fast, reliable roof leak repair and storm damage restoration.",
      price: "Starting at $300",
      link: "services/RoofRepair"
    },
    {
      icon: "🔍",
      title: "Roof Inspection",
      description: "Comprehensive roof assessment with detailed report and recommendations.",
      price: "FREE with estimate",
      link: "services/RoofInspection"
    },
    {
      icon: "⚡",
      title: "Emergency Roofing",
      description: "24/7 emergency response for urgent roof damage and leaks.",
      price: "Available 24/7",
      link: "services/EmergencyRoofing"
    },
    {
      icon: "🌪️",
      title: "Storm Damage Repair",
      description: "Hail and wind damage repair with insurance claim assistance.",
      price: "Insurance approved",
      link: "services/StormDamage"
    },
    {
      icon: "🌊",
      title: "Gutter Installation",
      description: "Seamless gutter systems with leaf guards and drainage solutions.",
      price: "Starting at $8/ft",
      link: "services/Gutters"
    },
    {
      icon: "🏗️",
      title: "Siding Installation",
      description: "Quality siding in vinyl, fiber cement, and wood options.",
      price: "Starting at $6/sq ft",
      link: "services/Siding"
    },
    {
      icon: "🪟",
      title: "Window Replacement",
      description: "Energy-efficient replacement windows for lower utility bills.",
      price: "Starting at $450/window",
      link: "services/Windows"
    },
    {
      icon: "🏢",
      title: "Commercial Roofing",
      description: "Flat roof systems, TPO, EPDM, and metal for commercial properties.",
      price: "Custom pricing",
      link: "services/Commercial"
    },
    {
      icon: "📋",
      title: "Insurance Claims",
      description: "Expert assistance with storm damage insurance claims.",
      price: "FREE help",
      link: "services/Insurance"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">Aroof</span>
                <p className="text-xs text-blue-600 font-semibold">DFW's #1 Roofing Company</p>
              </div>
            </Link>
            <a href="tel:+18502389727" className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
              <Phone className="w-4 h-4" />
              (850) 238-9727
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-semibold">Licensed & Insured in Texas</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Professional Roofing Services
          </h1>
          <p className="text-2xl text-blue-100 mb-4 max-w-3xl mx-auto">
            Complete roofing solutions for residential and commercial properties in Dallas-Fort Worth
          </p>
          <p className="text-lg text-blue-200">
            Serving Dallas, Fort Worth, Plano, Frisco, McKinney & All DFW
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-slate-600">
              Comprehensive roofing and exterior solutions for every need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardHeader className="bg-gradient-to-br from-blue-50 to-white border-b">
                  <div className="text-6xl mb-4">{service.icon}</div>
                  <CardTitle className="text-2xl text-slate-900">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-600 mb-4 min-h-[60px]">{service.description}</p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center">
                    <p className="text-lg font-bold text-green-900">{service.price}</p>
                  </div>

                  <div className="space-y-2">
                    <Link to={createPageUrl(service.link)}>
                      <Button variant="outline" className="w-full">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link to={createPageUrl("Booking")}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Get Free Estimate
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                      asChild
                    >
                      <a href="tel:+18502389727">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Aroof */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">
            Why Choose Aroof for Your Roofing Needs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Licensed & Insured", description: "Texas licensed contractor with full insurance coverage" },
              { icon: Award, title: "15+ Years Experience", description: "Over 5,000 roofs installed in DFW since 2010" },
              { icon: Clock, title: "10-Year Warranty", description: "Industry-leading workmanship warranty" },
              { icon: DollarSign, title: "0% Financing", description: "Flexible payment options available" }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-8">
            Serving All of Dallas-Fort Worth
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              "Dallas", "Fort Worth", "Plano", "Frisco", "McKinney", "Allen",
              "Richardson", "Irving", "Arlington", "Garland", "Mesquite", "Carrollton"
            ].map((city, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all">
                <p className="font-semibold text-slate-900">{city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Get a free estimate for any of our services
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-16 px-10 text-xl bg-white text-blue-900 hover:bg-blue-50 shadow-2xl">
                Schedule Free Estimate
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="h-16 px-10 text-xl border-2 border-white text-white hover:bg-white/10"
              asChild
            >
              <a href="tel:+18502389727">
                <Phone className="w-5 h-5 mr-2" />
                Call (850) 238-9727
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}