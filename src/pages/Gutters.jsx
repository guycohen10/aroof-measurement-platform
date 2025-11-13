import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Phone, MapPin, CheckCircle, Star, ChevronRight, Shield, DollarSign, Award } from "lucide-react";

export default function Gutters() {
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

      {/* Breadcrumbs */}
      <nav className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link to={createPageUrl("Homepage")} className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={createPageUrl("Services")} className="hover:text-blue-600">Services</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Gutter Installation</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Professional Gutter Installation in Dallas-Fort Worth
              </h1>
              <p className="text-xl text-cyan-100 mb-6 leading-relaxed">
                Custom seamless gutters, gutter guards, and complete drainage solutions. Protect your Dallas home's foundation, landscaping, and exterior with properly installed gutters.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "Seamless Gutters",
                  "Gutter Guards Available",
                  "Licensed & Insured",
                  "5-Year Warranty"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("Booking")}>
                  <Button size="lg" className="h-14 px-8 bg-white text-cyan-700 hover:bg-cyan-50 text-lg font-bold w-full sm:w-auto shadow-2xl">
                    Get FREE Estimate
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 text-lg font-bold w-full sm:w-auto" asChild>
                  <a href="tel:+18502389727">
                    <Phone className="w-5 h-5 mr-2" />
                    Call (850) 238-9727
                  </a>
                </Button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2">
              <div className="aspect-[4/3] bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-xl flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Home className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-lg font-medium">Installing seamless gutters on Dallas home</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Expert Gutter Installation Services in Dallas</h2>
          
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              Properly functioning gutters are essential for protecting your Dallas home from water damage. Gutters channel thousands of gallons of water away from your foundation, prevent soil erosion around your home, protect landscaping from water damage, prevent basement flooding, protect siding and exterior paint, and prevent ice dams in winter. Without proper gutters or with damaged/clogged systems, you risk expensive foundation repairs ($5,000-20,000), basement water damage, landscape erosion, and exterior deterioration.
            </p>
            <p>
              At Aroof, we've installed and replaced gutter systems throughout Dallas-Fort Worth since 2010. We specialize in custom seamless gutters manufactured on-site to exact specifications, professionally engineered downspout placement and drainage solutions, gutter guard installation to eliminate cleaning, and complete gutter replacement for damaged or undersized systems. Every installation includes proper pitch for optimal water flow, secure fascia attachment, high-quality materials rated for Texas weather, and professional appearance that enhances curb appeal.
            </p>
            <p>
              Whether you're building new, replacing old gutters, or adding gutter guards to existing systems, we provide expert installation with 5-year workmanship warranty. Many homeowners coordinate gutter installation with roof replacement—we can handle both projects efficiently, saving time and ensuring perfect integration between roofing and drainage systems.
            </p>
          </div>
        </div>
      </section>

      {/* Gutter Types */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Gutter Options for Dallas Homes</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Seamless Aluminum Gutters",
                price: "$8-12 per linear foot",
                description: "Custom-fabricated on-site to exact home dimensions, seamless gutters have no joints or seams except at corners—eliminating leak points. Available in 20+ colors to match any home exterior. Aluminum won't rust, lightweight yet durable, and handles Dallas weather excellently.",
                features: [
                  "No leaks at seams (only corners)",
                  "Custom fit to your home",
                  "20+ color options",
                  "Rust-proof aluminum",
                  "30-40 year lifespan",
                  "Low maintenance",
                  "5\" or 6\" widths available"
                ],
                bestFor: "Most Dallas homes, best combination of performance and value",
                featured: true
              },
              {
                title: "Copper Gutters",
                price: "$25-40 per linear foot",
                description: "Premium copper gutters offer distinctive appearance and exceptional longevity. Copper develops beautiful patina over time, never needs painting, and can last 50-100 years. Perfect for upscale homes and historic properties where appearance matters as much as function.",
                features: [
                  "50-100 year lifespan",
                  "Beautiful natural patina develops",
                  "Never needs painting",
                  "Premium curb appeal",
                  "Antimicrobial properties",
                  "Increases home value",
                  "Environmentally friendly (recyclable)"
                ],
                bestFor: "Luxury homes, historic properties, premium aesthetics",
                featured: false
              },
              {
                title: "Steel Gutters",
                price: "$10-15 per linear foot",
                description: "Galvanized or stainless steel gutters offer maximum strength and durability. Ideal for homes with large roof areas or heavy water flow. Steel handles impact better than aluminum and works well in high-wind areas. Requires periodic maintenance to prevent rust.",
                features: [
                  "Strongest gutter material",
                  "Handles heavy water volume",
                  "Impact resistant",
                  "Wind resistant",
                  "20-30 year lifespan",
                  "Paintable"
                ],
                bestFor: "Large homes, heavy rainfall areas, wind-prone locations",
                featured: false
              },
              {
                title: "Vinyl Gutters",
                price: "$4-8 per linear foot",
                description: "Budget-friendly vinyl gutters work well for smaller homes or temporary solutions. Won't rust or dent, lightweight and easy to work with. However, Texas heat can cause expansion/contraction issues, and vinyl becomes brittle over time.",
                features: [
                  "Most economical option",
                  "Won't rust or corrode",
                  "Lightweight",
                  "DIY-friendly",
                  "10-20 year lifespan",
                  "Limited color options"
                ],
                bestFor: "Budget projects, small homes, rental properties",
                featured: false
              }
            ].map((option, index) => (
              <Card key={index} className={`${option.featured ? 'border-4 border-cyan-600 shadow-2xl' : 'border-2 border-slate-200 shadow-lg'} relative`}>
                {option.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b">
                  <CardTitle className="text-2xl text-slate-900">{option.title}</CardTitle>
                  <div className="text-lg font-bold text-cyan-600 mt-2">Starting at {option.price} installed</div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700 mb-4 leading-relaxed">{option.description}</p>
                  
                  <h4 className="font-bold text-slate-900 mb-3">Features:</h4>
                  <div className="space-y-2 mb-4">
                    {option.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-bold text-blue-900">Best For: {option.bestFor}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gutter Guards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Gutter Guards & Protection Systems</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Tired of cleaning gutters 2-4 times per year? Gutter guards dramatically reduce maintenance while ensuring proper water flow. In Dallas, falling leaves from oak, pecan, and other trees quickly clog gutters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {[
              {
                title: "Micro-Mesh Gutter Guards",
                price: "$8-12 per linear foot",
                description: "Fine stainless steel mesh (surgical-grade) blocks everything except water. Handles heavy Dallas rainstorms perfectly. Virtually maintenance-free—just occasional hosing. Most effective guard system available.",
                effectiveness: "99% debris blocked"
              },
              {
                title: "Screen/Filter Gutter Guards",
                price: "$4-7 per linear foot",
                description: "Perforated aluminum or plastic screens fit over gutters. Blocks large debris (leaves, twigs) while allowing water through. Requires occasional cleaning of debris sitting on top. Good balance of cost and effectiveness.",
                effectiveness: "85-90% debris blocked"
              },
              {
                title: "Reverse Curve Guards",
                price: "$6-10 per linear foot",
                description: "Surface tension design where water flows over curved edge into gutter while debris falls off. Works well in moderate rain but can overflow in heavy Dallas downpours.",
                effectiveness: "80-85% debris blocked"
              },
              {
                title: "Foam Insert Guards",
                price: "$2-4 per linear foot",
                description: "Porous foam blocks inserted into gutters. Water flows through while debris stays on top. Eventually needs replacement as foam degrades. Budget option but requires maintenance.",
                effectiveness: "70-75% debris blocked"
              }
            ].map((guard, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-br from-cyan-50 to-blue-50 border-b">
                  <CardTitle className="text-xl text-slate-900">{guard.title}</CardTitle>
                  <div className="text-lg font-bold text-cyan-600 mt-1">{guard.price}</div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700 mb-4">{guard.description}</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-bold text-green-900">Effectiveness: {guard.effectiveness}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Benefits of Gutter Guards:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { bold: "Eliminate Dangerous Ladder Work:", text: "No more climbing ladders 3-4 times per year" },
                  { bold: "Prevent Clogs:", text: "Reduce overflow and foundation water damage" },
                  { bold: "Extend Gutter Life:", text: "Less debris means less weight and corrosion" },
                  { bold: "Prevent Pest Issues:", text: "Mosquitoes and birds can't nest in covered gutters" },
                  { bold: "Reduce Fire Risk:", text: "Dry debris in gutters is a fire hazard in droughts" },
                  { bold: "Save Money:", text: "Professional cleaning costs $150-300. Guards pay for themselves in 3-5 years" }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700">
                      <strong>{benefit.bold}</strong> {benefit.text}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Installation Process */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Our Gutter Installation Process</h2>

          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "FREE Consultation & Measurement",
                content: "We visit your Dallas home to assess current gutters (if any), measure your roofline precisely, evaluate drainage needs based on roof size and pitch, identify optimal downspout locations, discuss color and material options, and provide detailed written estimate. No obligation—just professional recommendations."
              },
              {
                number: 2,
                title: "Custom Fabrication",
                content: "For seamless gutters, we bring our specialized equipment to your home and fabricate gutters on-site to exact measurements. This ensures perfect fit with no seams or joints (except corners). Custom colors matched to your home. Gutters cut to precise lengths needed for each section of your roofline."
              },
              {
                number: 3,
                title: "Professional Installation",
                content: "Our experienced crew removes old gutters if needed, installs fascia brackets at proper spacing (every 24-30 inches), hangs gutters with correct pitch for drainage (1/4 inch slope per 10 feet), seals all corners and end caps, installs downspouts with secure attachments, adds extensions to direct water away from foundation, and tests water flow throughout system."
              },
              {
                number: 4,
                title: "Quality Inspection & Cleanup",
                content: "After installation, we conduct water flow testing, inspect all seals and connections, verify secure attachment to fascia, check proper pitch throughout system, and perform complete property cleanup. Your yard is left cleaner than we found it. All old gutters and debris hauled away."
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-6 bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border-l-4 border-cyan-600 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-700 leading-relaxed">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Gutter Installation Cost in Dallas</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { item: "Seamless Aluminum Gutters (per linear foot)", cost: "$8 - $12" },
              { item: "Downspouts (each)", cost: "$100 - $150" },
              { item: "Gutter Guards (per linear foot)", cost: "$4 - $12" },
              { item: "Old Gutter Removal & Disposal", cost: "$1 - $2/ft" },
              { item: "Fascia Board Repair/Replacement", cost: "$6 - $20/ft" }
            ].map((row, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-medium text-slate-900">{row.item}</span>
                <span className="text-lg font-bold text-cyan-600">{row.cost}</span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Average Single-Story Home",
                details: "150 linear feet",
                description: "Seamless aluminum gutters, 6 downspouts, standard installation",
                total: "$1,800 - $2,400"
              },
              {
                title: "Two-Story Home",
                details: "200 linear feet",
                description: "Seamless aluminum gutters, 8 downspouts, includes fascia repairs",
                total: "$2,800 - $3,800",
                featured: true
              },
              {
                title: "Complete System with Guards",
                details: "180 linear feet",
                description: "Seamless gutters, micro-mesh guards, 7 downspouts, extensions",
                total: "$3,600 - $4,800"
              }
            ].map((example, index) => (
              <Card key={index} className={`${example.featured ? 'border-4 border-cyan-600 shadow-2xl' : 'border-2 border-slate-200 shadow-lg'} relative`}>
                {example.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                    MOST COMMON
                  </div>
                )}
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b text-center">
                  <CardTitle className="text-xl text-slate-900">{example.title}</CardTitle>
                  <div className="text-sm text-slate-600 mt-1">{example.details}</div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-700 mb-4">{example.description}</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-900">{example.total}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signs You Need New Gutters */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Signs Your Dallas Home Needs New Gutters</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              "Cracks, holes, or rust spots",
              "Gutters pulling away from house",
              "Sagging or uneven sections",
              "Water overflowing during rain",
              "Fascia damage or staining",
              "Soil erosion around foundation",
              "Exterior wall mildew/stains",
              "Basement flooding issues",
              "Peeling paint near gutters",
              "Gutters older than 20 years"
            ].map((sign, index) => (
              <div key={index} className="flex items-start gap-2 bg-white border-2 border-red-200 rounded-lg p-4 hover:border-red-400 transition-all">
                <span className="text-red-600 font-bold text-xl">❌</span>
                <span className="text-sm font-medium text-slate-900">{sign}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Gutter Installation Reviews</h2>
          
          <Card className="border-l-4 border-l-yellow-400 shadow-lg">
            <CardContent className="p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-slate-700 italic mb-6 leading-relaxed">
                "Aroof replaced our old leaking gutters with seamless aluminum and added gutter guards. The crew was professional, installation took one day, and they matched the color perfectly to our trim. Haven't had to clean gutters once in 2 years—the guards work great! Highly recommend."
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">— Susan K.</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Allen, TX
                    </p>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Verified Customer
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for New Gutters?
          </h2>
          <p className="text-xl text-cyan-100 mb-12">
            Get a FREE estimate for seamless gutter installation with optional gutter guards
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-16 px-10 bg-white text-cyan-700 hover:bg-cyan-50 font-bold text-xl shadow-2xl">
                📅 Get FREE Estimate
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white text-white hover:bg-white/10 font-bold text-xl" asChild>
              <a href="tel:+18502389727">
                <Phone className="w-6 h-6 mr-2" />
                Call (850) 238-9727
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Custom Seamless Gutters",
              "5-Year Warranty",
              "Licensed & Insured",
              "FREE Estimates"
            ].map((guarantee, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white font-medium">{guarantee}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}