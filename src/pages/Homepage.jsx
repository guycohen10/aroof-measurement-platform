import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ChatWidget from "../components/chat/ChatWidget";
import ReviewCarousel from "../components/ReviewCarousel";
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
  const [audienceTab, setAudienceTab] = useState('homeowner');

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
          "email": "support@aroof.build",
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
            "email": "support@aroof.build",
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
              <Link to={createPageUrl("RoofingTypesIndex")} className="text-slate-600 hover:text-blue-900 font-medium">Materials</Link>
              
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
      <header className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden pt-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-800 bg-opacity-50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-semibold text-blue-100">Trusted Platform for DFW Roofing</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Get Your Roof Measured<br />
              <span className="text-blue-300">Free in 60 Seconds</span>
            </h1>

            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              AI-powered measurements + instant pricing. See your home with a new roof.
            </p>

            <Button
              size="lg"
              className="h-16 px-12 text-xl bg-white text-blue-600 hover:bg-blue-50 shadow-2xl font-bold"
              onClick={() => navigate(createPageUrl("Start"))}
            >
              Start Free Measurement <ArrowRight className="w-6 h-6 ml-2" />
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-blue-200">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span className="text-sm">5,000+ Roofs Measured</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                <span className="text-sm">50+ Verified Roofers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span className="text-sm">4.9★ Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm">$2M+ Projects</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </header>

      <main>
        {/* Platform Stats */}
        <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
                <div className="text-slate-600">Roofs Measured</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-slate-600">Verified Roofers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">4.9★</div>
                <div className="text-slate-600">Average Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">$2M+</div>
                <div className="text-slate-600">Projects Connected</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Dual Audience */}
        <section id="how-it-works" className="py-20 bg-white" aria-labelledby="how-it-works-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="how-it-works-heading" className="text-4xl font-bold text-center mb-4">How Aroof Works</h2>
            <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
              Simple, transparent process for homeowners and roofers
            </p>



            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📍</span>
                </div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
                <h3 className="text-xl font-bold mb-3">Enter Your Address</h3>
                <p className="text-slate-600">
                  Type your address and we'll load satellite imagery of your roof
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🏠</span>
                </div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
                <h3 className="text-xl font-bold mb-3">See AI Visualization</h3>
                <p className="text-slate-600">
                  View your home with 3 different roof styles in seconds
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📐</span>
                </div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
                <h3 className="text-xl font-bold mb-3">Get Instant Measurement</h3>
                <p className="text-slate-600">
                  Accurate roof area and material costs calculated automatically
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🤝</span>
                </div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">4</div>
                <h3 className="text-xl font-bold mb-3">Connect with Roofers</h3>
                <p className="text-slate-600">
                  Browse verified contractors and get free quotes
                </p>
              </div>
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
                onClick={() => navigate(createPageUrl("Start"))}
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
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            {/* For Homeowners */}
            <div>
              <h4 className="font-bold mb-4 text-lg">For Homeowners</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl("Start")} className="block hover:text-white">Measure Your Roof</Link>
                <Link to={createPageUrl("RooferDirectory")} className="block hover:text-white">Find Roofers</Link>
                <Link to={createPageUrl("RoofingTypesIndex")} className="block hover:text-white">Roofing Materials</Link>
                <Link to={createPageUrl("BlogHome")} className="block hover:text-white">Blog & Guides</Link>
              </div>
            </div>

            {/* For Roofers */}
            <div>
              <h4 className="font-bold mb-4 text-lg">For Roofers</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl("RooferSignup")} className="block hover:text-white">Join Platform</Link>
                <Link to={createPageUrl("RooferLogin")} className="block hover:text-white">Roofer Login</Link>
                <Link to={createPageUrl("RooferDirectory")} className="block hover:text-white">Directory</Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Support</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="mailto:support@aroof.build" className="block hover:text-white">Contact Us</a>
                <a href="tel:+18502389727" className="block hover:text-white">(850) 238-9727</a>
                <p className="text-slate-500">Dallas, TX</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-400">
                <p>© {new Date().getFullYear()} Aroof. All rights reserved.</p>
                <div className="flex gap-6 mt-4 text-xs">
                  <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white">Privacy Policy</Link>
                  <a href="#" className="hover:text-white">Terms of Service</a>
                  <a 
                    href={createPageUrl("EmployeeLogin")}
                    onClick={(e) => {
                      e.preventDefault();
                      localStorage.removeItem('token');
                      localStorage.removeItem('sb-access-token');
                      sessionStorage.clear();
                      window.location.href = createPageUrl("EmployeeLogin");
                    }}
                    className="text-slate-300 opacity-50 hover:opacity-100 transition-opacity"
                  >
                    Admin Access
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget currentPage="homepage" measurement={null} />
    </div>
    </>);

}