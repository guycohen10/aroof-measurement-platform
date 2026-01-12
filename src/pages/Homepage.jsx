import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ChatWidget from "../components/chat/ChatWidget";
import {
  Home,
  MapPin,
  FileCheck,
  Zap,
  Shield,
  Award,
  Clock,
  DollarSign,
  Star,
  Users,
  CheckCircle,
  ArrowRight,
  Phone,
  Wrench,
  Mail,
  ChevronDown,
  Building2 } from
"lucide-react";

export default function Homepage() {
  const navigate = useNavigate();
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  return (
    <>
      {/* SEO: Local Business Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RoofingContractor",
          "name": "Aroof",
          "image": "https://aroof.build/logo.png",
          "description": "DFW's #1 roofing company offering instant satellite roof measurements and professional roofing services.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "6810 Windrock Rd",
            "addressLocality": "Dallas",
            "addressRegion": "TX",
            "postalCode": "75252",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 32.9537,
            "longitude": -96.8236
          },
          "telephone": "+1-850-238-9727",
          "email": "contact@aroof.build",
          "url": "https://aroof.build",
          "priceRange": "$3-$5",
          "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:00",
            "closes": "18:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "09:00",
            "closes": "15:00"
          }],

          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "500",
            "bestRating": "5",
            "worstRating": "1"
          },
          "areaServed": [
          "Dallas, TX",
          "Fort Worth, TX",
          "Plano, TX",
          "Frisco, TX",
          "McKinney, TX",
          "Allen, TX",
          "Richardson, TX",
          "Irving, TX",
          "Arlington, TX",
          "Garland, TX"],

          "serviceType": [
          "Roof Measurement",
          "Roof Replacement",
          "Roof Repair",
          "Roof Inspection",
          "Satellite Roof Analysis"]

        }) }} />

      {/* SEO: Service Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Roof Measurement Service",
          "provider": {
            "@type": "RoofingContractor",
            "name": "Aroof",
            "telephone": "+1-850-238-9727",
            "email": "contact@aroof.build",
            "url": "https://aroof.build"
          },
          "areaServed": {
            "@type": "City",
            "name": "Dallas-Fort Worth Metroplex"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Roof Measurement Services",
            "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Homeowner Roof Measurement",
                "description": "Instant satellite roof measurement with professional PDF report"
              },
              "price": "3.00",
              "priceCurrency": "USD"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Professional Roofer Measurement",
                "description": "Advanced measurement tools for roofing contractors"
              },
              "price": "5.00",
              "priceCurrency": "USD"
            }]

          }
        }) }} />

      <div className="min-h-screen bg-white">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-3" aria-label="Aroof Home">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Aroof</div>
                <p className="text-xs text-blue-600 font-semibold">DFW's #1 Roofing Company</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {/* Services Dropdown */}
              <div
                  className="relative"
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  onMouseLeave={() => setServicesDropdownOpen(false)}>

                <button className="flex items-center gap-1 text-slate-600 hover:text-blue-900 font-medium transition-colors">
                  Services
                  <ChevronDown className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {servicesDropdownOpen &&
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Column 1: Roofing Services */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-sm">Roofing Services</h4>
                        <div className="space-y-2">
                          <Link to={createPageUrl("RoofReplacement")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Roof Replacement
                          </Link>
                          <Link to={createPageUrl("RoofRepair")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Roof Repair
                          </Link>
                          <Link to={createPageUrl("RoofInspection")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Roof Inspection
                          </Link>
                          <Link to={createPageUrl("EmergencyRoofing")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Emergency Roofing
                          </Link>
                          <Link to={createPageUrl("StormDamage")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Storm Damage
                          </Link>
                        </div>
                      </div>
                      
                      {/* Column 2: Exterior Services */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-sm">Exterior Services</h4>
                        <div className="space-y-2">
                          <Link to={createPageUrl("Gutters")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Gutter Installation
                          </Link>
                          <Link to={createPageUrl("Siding")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Siding Installation
                          </Link>
                          <Link to={createPageUrl("Windows")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Window Replacement
                          </Link>
                        </div>
                      </div>
                      
                      {/* Column 3: Specialized */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-sm">Specialized</h4>
                        <div className="space-y-2">
                          <Link to={createPageUrl("Commercial")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Commercial Roofing
                          </Link>
                          <Link to={createPageUrl("Insurance")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                            Insurance Claims
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* View All Services Link */}
                    <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                      <Link to={createPageUrl("Services")} className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center gap-1">
                        View All Services
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  }
              </div>
              
              <a href="#how-it-works" className="text-slate-600 hover:text-blue-900 font-medium">How It Works</a>
              <a href="#benefits" className="text-slate-600 hover:text-blue-900 font-medium">Why Aroof</a>
              <a href="#reviews" className="text-slate-600 hover:text-blue-900 font-medium">Reviews</a>
              
              {/* Contractor Links */}
              <Link to={createPageUrl("RooferLogin")} className="text-blue-600 hover:text-blue-900 font-semibold flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Contractors
              </Link>
              
              <a href="tel:+18502389727" className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                <Phone className="w-4 h-4" />
                (850) 238-9727
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Award className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            <span className="text-white text-sm font-semibold">Rated #1 Roofing Service in DFW</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            Get Your Roof Measured for FREE
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto">
            Instant satellite measurements • Accurate pricing • DFW's most trusted roofing company
          </p>
          
          <p className="text-lg text-green-300 mb-12 font-semibold">📄 Download detailed PDF report for just $3 (optional)

            </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
                size="lg"
                className="h-16 px-10 text-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-2xl shadow-green-500/50 hover:shadow-green-500/75 transition-all duration-300 transform hover:scale-105"
                aria-label="Get free roof measurement now"
                onClick={async () => {
                  try {
                    const user = await base44.auth.me();
                    if (user && user.aroof_role === 'external_roofer') {
                      navigate(createPageUrl("RooferDashboard"));
                    } else {
                       navigate(createPageUrl("AddressMethodSelector"));
                     }
                    } catch {
                     navigate(createPageUrl("AddressMethodSelector"));
                    }
                }}
              >
              <Zap className="w-6 h-6 mr-2" aria-hidden="true" />
              Get FREE Measurement Now
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, text: "5000+ Roofs Measured", color: "text-green-400" },
              { icon: Shield, text: "Licensed in Texas", color: "text-blue-400" },
              { icon: Award, text: "A+ BBB Rating", color: "text-yellow-400" },
              { icon: Star, text: "4.9/5 Star Rating", color: "text-orange-400" }].
              map((badge, index) =>
              <div key={index} className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                <badge.icon className={`w-8 h-8 ${badge.color}`} aria-hidden="true" />
                <p className="text-sm font-semibold text-white text-center">{badge.text}</p>
              </div>
              )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </header>

      <main>
        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 to-white" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="how-it-works-heading" className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get professional roof measurements in three simple steps - completely FREE
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
                {
                  step: "1",
                  icon: MapPin,
                  title: "Enter Your Address",
                  description: "Type your property address and we'll locate it instantly using satellite imagery - no payment required",
                  color: "from-blue-600 to-blue-700"
                },
                {
                  step: "2",
                  icon: Home,
                  title: "Measure Your Roof",
                  description: "Our advanced tool lets you outline your roof precisely with just a few clicks - 100% FREE",
                  color: "from-orange-600 to-orange-700"
                },
                {
                  step: "3",
                  icon: FileCheck,
                  title: "View Results Instantly",
                  description: "See accurate measurements and pricing. Download detailed PDF report for just $3 (optional)",
                  color: "from-green-600 to-green-700"
                }].
                map((step, index) =>
                <Card key={index} className="relative overflow-hidden border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${step.color}`}></div>
                <CardContent className="p-8 relative">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center opacity-50">
                    <span className="text-6xl font-bold text-slate-300">{step.step}</span>
                  </div>
                  
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
                )}
          </div>
        </div>
      </section>

      {/* Why Choose Aroof Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-blue-900 to-slate-900" aria-labelledby="benefits-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="benefits-heading" className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Aroof?
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Texas's most trusted roofing company with unmatched quality and service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                { icon: Shield, title: "Licensed & Insured", description: "Fully licensed in Texas with comprehensive insurance coverage" },
                { icon: Award, title: "10-Year Warranty", description: "Industry-leading workmanship warranty on all installations" },
                { icon: Clock, title: "Same-Day Service", description: "Emergency repairs and fast scheduling for your convenience" },
                { icon: DollarSign, title: "Financing Available", description: "Flexible payment options to fit any budget" },
                { icon: Star, title: "5-Star Reviews", description: "Rated 4.9/5 by over 500 satisfied DFW homeowners" },
                { icon: Users, title: "Texas Family Owned", description: "Local business serving our DFW community since 2010" }].
                map((benefit, index) =>
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group">

                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-blue-900" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-blue-200 leading-relaxed">{benefit.description}</p>
              </div>
                )}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-gradient-to-br from-slate-50 to-white" aria-labelledby="reviews-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="reviews-heading" className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) =>
                  <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                  )}
            </div>
            <p className="text-xl text-slate-600">4.9/5 from 500+ verified reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
                {
                  name: "Sarah Johnson",
                  location: "Plano, TX",
                  rating: 5,
                  text: "Aroof made the entire process so easy! The satellite measurement was incredibly accurate, and their team was professional from start to finish. My new roof looks amazing!"
                },
                {
                  name: "Michael Chen",
                  location: "Frisco, TX",
                  rating: 5,
                  text: "Best roofing company in DFW! Got my measurement in under a minute, received a fair quote, and they completed the job in two days. Highly recommend!"
                },
                {
                  name: "Emily Rodriguez",
                  location: "Dallas, TX",
                  rating: 5,
                  text: "The measurement tool is genius! I was able to get an accurate estimate without anyone coming to my house first. The final price matched their estimate perfectly."
                }].
                map((review, index) =>
                <Card key={index} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) =>
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      )}
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed italic">"{review.text}"</p>
                  <div className="flex items-center gap-3 border-t pt-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{review.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{review.name}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {review.location}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                        Verified
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                )}
          </div>
        </div>
      </section>

      {/* Projects Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-slate-100 to-white" aria-labelledby="projects-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="projects-heading" className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Recent Projects
            </h2>
            <p className="text-xl text-slate-600">
              See the quality of our work across the DFW metroplex
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
                { location: "Plano, TX", sqft: "2,850 sq ft" },
                { location: "Frisco, TX", sqft: "3,200 sq ft" },
                { location: "Dallas, TX", sqft: "2,400 sq ft" }].
                map((project, index) =>
                <div key={index} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center" role="img" aria-label={`Completed roofing project in ${project.location} - ${project.sqft}`}>
                  <Home className="w-20 h-20 text-slate-500" aria-hidden="true" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-bold">{project.location}</span>
                  </div>
                  <p className="text-blue-200 text-sm">{project.sqft}</p>
                </div>
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Completed
                </div>
              </div>
                )}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGllbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 id="cta-heading" className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of satisfied DFW homeowners who trust Aroof
          </p>
          
          <Button
                size="lg"
                className="h-20 px-12 text-2xl bg-white text-blue-900 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                aria-label="Measure your roof for free now"
                onClick={async () => {
                  try {
                    const user = await base44.auth.me();
                    if (user && user.aroof_role === 'external_roofer') {
                      navigate(createPageUrl("RooferDashboard"));
                    } else {
                       navigate(createPageUrl("AddressMethodSelector"));
                     }
                    } catch {
                     navigate(createPageUrl("AddressMethodSelector"));
                    }
                }}
              >
            <Zap className="w-8 h-8 mr-3" aria-hidden="true" />
            Measure My Roof FREE
            <ArrowRight className="w-6 h-6 ml-3" aria-hidden="true" />
          </Button>

          <p className="text-blue-200 mt-8">
            Quick • Accurate • FREE • Optional $3 PDF download
          </p>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <span className="text-2xl font-bold">Aroof</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                DFW's most trusted roofing company. Licensed, insured, and committed to excellence.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-slate-400">Texas Licensed Roofing Contractor</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="#how-it-works" className="block hover:text-white">How It Works</a>
                <a href="#benefits" className="block hover:text-white">Why Aroof</a>
                <a href="#reviews" className="block hover:text-white">Reviews</a>
                <Link to={createPageUrl("Services")} className="block hover:text-white">Services</Link>
                <Link to={createPageUrl("MeasurementPage")} className="block hover:text-white">Get Started FREE</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <a href="tel:+18502389727" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  (850) 238-9727
                </a>
                <a href="mailto:contact@aroof.build" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  contact@aroof.build
                </a>
                <div className="flex items-start gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>6810 Windrock Rd</p>
                    <p>Dallas, TX 75252</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Service Areas</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <p>Dallas, TX</p>
                <p>Plano, TX</p>
                <p>Frisco, TX</p>
                <p>McKinney, TX</p>
                <p>Allen, TX</p>
                <p className="pt-2 font-semibold text-slate-300">Proudly serving the entire Dallas-Fort Worth area</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-400 text-center sm:text-left">
                <p>© {new Date().getFullYear()} Aroof. All rights reserved. Licensed & Insured in Texas.</p>
                <div className="flex gap-6 mt-4 text-xs justify-center sm:justify-start">
                  <a href="#" className="hover:text-white">Privacy Policy</a>
                  <a href="#" className="hover:text-white">Terms of Service</a>
                  <a href="#" className="hover:text-white">Contact</a>
                </div>
              </div>
              <div>
                <Link
                    to={createPageUrl("EmployeeLogin")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all">

                  👤 Company Employee Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget currentPage="homepage" measurement={null} />
    </div>
    </>);

}