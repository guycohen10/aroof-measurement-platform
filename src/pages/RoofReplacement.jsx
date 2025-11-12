import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Phone, MapPin, CheckCircle, Award, Shield, Star, DollarSign, Clock, ChevronRight, AlertCircle } from "lucide-react";

export default function RoofReplacement() {
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
            <span className="text-slate-900 font-medium">Roof Replacement</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Professional Roof Replacement in Dallas-Fort Worth
              </h1>
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                Expert roof installation with premium materials, licensed contractors, and industry-leading warranties. Serving DFW homeowners since 2010.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "Licensed & Insured",
                  "10-Year Warranty",
                  "0% Financing",
                  "A+ BBB Rating"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("Booking")}>
                  <Button size="lg" className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white text-lg w-full sm:w-auto">
                    Get FREE Estimate
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 text-lg w-full sm:w-auto" asChild>
                  <a href="tel:+18502389727">
                    <Phone className="w-5 h-5 mr-2" />
                    Call (850) 238-9727
                  </a>
                </Button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2">
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl flex items-center justify-center">
                <div className="text-center text-slate-600 p-8">
                  <Home className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-lg font-medium">Professional crew installing new roof in Dallas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Dallas's Most Trusted Roof Replacement Company</h2>
          
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              When your roof reaches the end of its lifespan, choosing the right Dallas roofing contractor makes all the difference between a roof that lasts 20+ years and one that fails prematurely. At Aroof, we've been providing expert roof replacement services throughout Dallas-Fort Worth since 2010, completing over 5,000 successful installations with an A+ BBB rating and 4.9-star customer reviews.
            </p>
            <p>
              Our comprehensive roof replacement process includes complete tear-off of your old roofing materials, thorough inspection and repair of roof decking, professional installation of premium underlayment and shingles, and meticulous cleanup that leaves your property pristine. Every Dallas roof replacement project comes with our industry-leading 10-year workmanship warranty, manufacturer material warranties up to lifetime, and financing options with 0% interest for qualified homeowners.
            </p>
            <p>
              Whether you need asphalt shingle replacement, metal roofing installation, tile roofing, or flat roof systems, our licensed and insured team has the expertise to handle residential and commercial projects of any size throughout Dallas, Fort Worth, Plano, Frisco, McKinney, and all surrounding DFW communities.
            </p>
          </div>
        </div>
      </section>

      {/* When to Replace Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">When Does Your Dallas Roof Need Replacement?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Texas weather is tough on roofs. Between intense summer heat, severe storms, and occasional ice, Dallas roofs face unique challenges. Here are the clear signs that indicate you need roof replacement rather than repair:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "⏰",
                title: "Roof Age Over 20 Years",
                description: "Most asphalt shingle roofs in Dallas last 20-25 years due to our intense UV exposure and temperature extremes. If your roof was installed before 2005, it's time to consider replacement. An aging roof becomes increasingly expensive to maintain, and replacement becomes more cost-effective than ongoing repairs."
              },
              {
                icon: "📉",
                title: "Widespread Shingle Damage",
                description: "Missing, cracked, curling, or buckling shingles across multiple areas of your roof indicate your roofing system has reached the end of its useful life. While isolated damage can be repaired, widespread deterioration requires complete roof replacement to ensure proper protection for your Dallas home."
              },
              {
                icon: "💧",
                title: "Multiple Leak Locations",
                description: "If you're experiencing water intrusion in several rooms or areas of your home, the underlying roof structure and waterproofing have likely failed. Multiple leaks indicate systemic failure that cannot be adequately addressed with spot repairs—complete roof replacement is necessary."
              },
              {
                icon: "🏚️",
                title: "Sagging or Drooping Sections",
                description: "A sagging roof deck is a serious structural concern indicating water damage to the underlying plywood or wood boards. This requires immediate attention with complete roof replacement including new decking installation to restore structural integrity and prevent collapse."
              },
              {
                icon: "🔍",
                title: "Excessive Granule Loss",
                description: "Finding granules in your gutters is normal initially, but excessive accumulation indicates advanced shingle deterioration. Granules protect shingles from UV damage—once they're gone, shingles rapidly deteriorate. Heavy granule loss throughout your roof signals the need for replacement."
              },
              {
                icon: "☀️",
                title: "Daylight Through Roof Boards",
                description: "If you can see sunlight through your attic ceiling boards, your roof has developed holes or severe gaps. This level of deterioration allows water, pests, and energy loss. Immediate roof replacement is essential to prevent further damage to your home's interior and structure."
              },
              {
                icon: "🌡️",
                title: "High Energy Bills",
                description: "A failing roof allows heat transfer that makes your HVAC system work harder. If your energy bills have increased significantly in Dallas's hot summers, your roof may be the culprit. Modern energy-efficient roofing materials can reduce cooling costs by 15-20%."
              },
              {
                icon: "🌪️",
                title: "Storm Damage Throughout",
                description: "After major Dallas storms or hail events, if your insurance adjuster identifies widespread damage affecting 30% or more of your roof, full replacement is typically more cost-effective than extensive repairs. Insurance often covers complete replacement in these situations."
              }
            ].map((sign, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{sign.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{sign.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{sign.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Break */}
      <section className="py-12 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Not Sure If You Need Roof Replacement?</h3>
          <p className="text-xl mb-6">Get a FREE professional roof inspection and honest assessment</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-14 px-8 bg-white text-orange-600 hover:bg-slate-50 font-bold text-lg">
                Schedule FREE Inspection
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 font-bold text-lg" asChild>
              <a href="tel:+18502389727">
                <Phone className="w-5 h-5 mr-2" />
                Call (850) 238-9727
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Proven 7-Step Roof Replacement Process</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We follow a systematic approach that ensures your new Dallas roof is installed correctly and built to withstand Texas weather for decades. Here's exactly what happens during your roof replacement:
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "FREE Inspection & Detailed Estimate",
                content: "Our licensed roofing professionals conduct a comprehensive inspection of your entire roofing system including shingles, flashing, ventilation, gutters, and attic. We take photos and measurements, then provide a detailed written estimate with transparent pricing, material options, and timeline. No pressure, no hidden fees—just honest recommendations for your Dallas home."
              },
              {
                number: 2,
                title: "Material Selection & Planning",
                content: "We help you choose the best roofing materials for your budget, aesthetic preferences, and Dallas climate. Options include architectural shingles (most popular), 3-tab shingles (budget-friendly), metal roofing (longest-lasting), or tile roofing (premium). We explain the pros, cons, warranties, and expected lifespan of each option so you can make an informed decision."
              },
              {
                number: 3,
                title: "Permits & Scheduling",
                content: "We handle all permit applications with the City of Dallas or your local municipality—you don't have to deal with any paperwork or city offices. Once permits are approved, we schedule your installation at your convenience, typically within 1-2 weeks. We coordinate material delivery and crew scheduling for maximum efficiency."
              },
              {
                number: 4,
                title: "Property Protection Setup",
                content: "Before starting work, our crew protects your entire property. We cover plants and landscaping with tarps, protect AC units and outdoor features, set up ground protection for foot traffic, and place magnetic rollers throughout your yard to catch any nails. Your property is treated with the same care we'd give our own homes."
              },
              {
                number: 5,
                title: "Complete Roof Tear-Off",
                content: "Our experienced crew removes all old roofing materials down to the wooden decking. We carefully inspect every section of roof decking and replace any water-damaged, rotted, or compromised boards with new plywood or OSB. This ensures your new roof has a solid, reliable foundation. All old materials are immediately loaded into our trucks to keep your property clean."
              },
              {
                number: 6,
                title: "Professional Installation",
                content: "We install your new roof following strict manufacturer specifications and exceeding Texas building codes. This includes: ice & water shield in valleys and along eaves, high-quality synthetic underlayment across the entire roof, new drip edge and flashing, proper ventilation installation or upgrades, and your chosen roofing material installed with precision. Every shingle, nail, and component is placed correctly for maximum performance and longevity."
              },
              {
                number: 7,
                title: "Inspection, Cleanup & Final Walkthrough",
                content: "After installation, we conduct a thorough quality control inspection of every detail. We run magnetic sweepers across your entire property multiple times to collect any metal debris. All materials and equipment are removed, and your property is left cleaner than we found it. Finally, we do a complete walkthrough with you, answer all your questions, and ensure you're 100% satisfied with your new Dallas roof."
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-6 bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border-l-4 border-blue-600 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
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

      {/* Materials Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Roofing Materials We Install in Dallas</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We offer premium roofing materials from industry-leading manufacturers, each backed by comprehensive warranties. Here are the options for your Dallas roof replacement:
            </p>
          </div>

          <div className="space-y-8">
            {/* Architectural Shingles */}
            <Card className="border-2 border-blue-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-3xl text-slate-900">Architectural Shingles</CardTitle>
                  <div className="bg-green-100 border border-green-600 rounded-lg px-4 py-2">
                    <span className="text-2xl font-bold text-green-900">Starting at $7/sq ft</span>
                    <p className="text-sm text-green-700">installed</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <div className="aspect-video bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl flex items-center justify-center mb-6">
                      <div className="text-center text-slate-600 p-4">
                        <p className="font-medium">Architectural shingles installed on Dallas home</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed mb-6">
                      Our most popular choice for Dallas homeowners, architectural (dimensional) shingles offer superior durability, attractive depth and texture, and exceptional wind resistance up to 130 mph—critical for Texas storms. These premium shingles feature multiple layers for enhanced protection and typically last 30-50 years in Dallas's climate.
                    </p>
                    
                    <h4 className="text-xl font-bold text-slate-900 mb-3">Key Features:</h4>
                    <div className="grid gap-2">
                      {[
                        "Lifetime limited warranty (25-50 years)",
                        "Class A fire rating",
                        "15+ color options to match any home style",
                        "Wind resistance rated up to 130 mph",
                        "Impact-resistant options available (insurance discounts)",
                        "Algae-resistant granules for Texas humidity",
                        "Energy Star rated options available"
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-bold text-blue-900 mb-2">Top Brands We Install:</p>
                      <p className="text-sm text-blue-800">Owens Corning Duration, GAF Timberline HDZ, CertainTeed Landmark, Malarkey Vista</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3-Tab Shingles */}
            <Card className="border-2 border-slate-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-3xl text-slate-900">3-Tab Shingles</CardTitle>
                  <div className="bg-green-100 border border-green-600 rounded-lg px-4 py-2">
                    <span className="text-2xl font-bold text-green-900">Starting at $5/sq ft</span>
                    <p className="text-sm text-green-700">installed</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <div className="aspect-video bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl flex items-center justify-center mb-6">
                      <div className="text-center text-slate-600 p-4">
                        <p className="font-medium">3-tab shingles on Dallas property</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed mb-6">
                      Budget-conscious option that still provides reliable protection for Dallas homes. 3-tab shingles feature a flat, uniform appearance and are ideal for rental properties, investment homes, or homeowners seeking economical roof replacement without sacrificing quality.
                    </p>
                    
                    <h4 className="text-xl font-bold text-slate-900 mb-3">Key Features:</h4>
                    <div className="grid gap-2">
                      {[
                        "25-30 year warranty",
                        "Class A fire rating",
                        "Clean, traditional appearance",
                        "Cost-effective solution",
                        "Multiple color choices available",
                        "Meets all Dallas building codes"
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                      <p className="text-sm font-bold text-slate-900 mb-1">Best For:</p>
                      <p className="text-sm text-slate-700">Budget-conscious homeowners, rental properties, homes being sold soon</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metal Roofing */}
            <Card className="border-2 border-orange-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-3xl text-slate-900">Metal Roofing</CardTitle>
                  <div className="bg-orange-100 border border-orange-600 rounded-lg px-4 py-2">
                    <span className="text-2xl font-bold text-orange-900">Starting at $12/sq ft</span>
                    <p className="text-sm text-orange-700">installed</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <div className="aspect-video bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl flex items-center justify-center mb-6">
                      <div className="text-center text-slate-600 p-4">
                        <p className="font-medium">Standing seam metal roof in Dallas</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed mb-6">
                      Premium metal roofing delivers exceptional longevity (50+ years), outstanding energy efficiency (reduces cooling costs by 20-25% in Dallas), and modern aesthetics that increase home value. Metal roofs are virtually maintenance-free and resist fire, insects, rot, and mildew—perfect for Texas conditions.
                    </p>
                    
                    <h4 className="text-xl font-bold text-slate-900 mb-3">Key Features:</h4>
                    <div className="grid gap-2">
                      {[
                        "50+ year lifespan (may outlast your home)",
                        "Energy Star rated - reflects solar heat",
                        "Fire resistant (Class A rating)",
                        "Impact resistant (stands up to hail)",
                        "Increases home resale value",
                        "Environmentally friendly (100% recyclable)",
                        "Low maintenance - no shingle replacement needed",
                        "Available in multiple colors and styles"
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm font-bold text-orange-900 mb-2">Metal Roofing Options:</p>
                      <p className="text-sm text-orange-800">Standing seam (most popular), metal shingles (traditional look), stone-coated steel (luxury appearance)</p>
                    </div>
                    
                    <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                      <p className="text-sm font-bold text-slate-900 mb-1">Best For:</p>
                      <p className="text-sm text-slate-700">Long-term homeowners, energy-conscious buyers, modern architectural styles, high-wind areas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Roof Replacement Cost in Dallas: What to Expect</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The average cost for complete roof replacement in Dallas-Fort Worth ranges from $7,000 to $30,000 depending on several factors. Here's what homeowners typically invest for quality roof replacement:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Small Home",
                size: "1,000 - 1,500 sq ft",
                price: "$7,000 - $12,000",
                includes: [
                  "Architectural shingles",
                  "Complete tear-off",
                  "New underlayment",
                  "Standard pitch roof",
                  "1-2 day installation",
                  "Full cleanup"
                ],
                featured: false
              },
              {
                title: "Average Home",
                size: "2,000 - 2,500 sq ft",
                price: "$14,000 - $20,000",
                includes: [
                  "Premium architectural shingles",
                  "Complete tear-off",
                  "Synthetic underlayment",
                  "New flashing & drip edge",
                  "2-3 day installation",
                  "Full cleanup & disposal"
                ],
                featured: true
              },
              {
                title: "Large Home",
                size: "3,000+ sq ft",
                price: "$21,000 - $35,000",
                includes: [
                  "Premium or specialty materials",
                  "Complex roof design",
                  "Multiple stories/steep pitch",
                  "Extensive flashing work",
                  "3-5 day installation",
                  "Complete professional service"
                ],
                featured: false
              }
            ].map((tier, index) => (
              <Card key={index} className={`${tier.featured ? 'border-4 border-blue-600 shadow-2xl scale-105' : 'border-2 border-slate-200 shadow-lg'} relative`}>
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                    Most Common
                  </div>
                )}
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b text-center pb-6">
                  <CardTitle className="text-2xl text-slate-900 mb-2">{tier.title}</CardTitle>
                  <div className="text-sm font-medium text-slate-600 mb-4">{tier.size}</div>
                  <div className="text-4xl font-bold text-blue-600">{tier.price}</div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="font-bold text-slate-900 mb-3">Includes:</p>
                  <div className="space-y-2">
                    {tier.includes.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing Factors */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Factors That Affect Your Roof Replacement Cost:</h3>
            <div className="space-y-4">
              {[
                {
                  title: "Roof Size:",
                  text: "Measured in \"squares\" (100 sq ft). Larger roofs require more materials and labor, increasing total cost."
                },
                {
                  title: "Roof Pitch/Slope:",
                  text: "Steeper roofs (8/12 pitch or greater) require additional safety equipment and take longer to install, adding 10-20% to costs."
                },
                {
                  title: "Material Choice:",
                  text: "Architectural shingles ($7/sq ft), 3-tab shingles ($5/sq ft), metal roofing ($12+/sq ft), or tile ($15+/sq ft)."
                },
                {
                  title: "Decking Repairs:",
                  text: "Replacing damaged plywood or OSB decking adds $75-150 per sheet typically needed on older Dallas roofs."
                },
                {
                  title: "Number of Layers:",
                  text: "Removing multiple old roof layers increases labor time and disposal costs. Texas code allows maximum 2 layers."
                },
                {
                  title: "Roof Complexity:",
                  text: "Multiple valleys, dormers, skylights, chimneys, or complex angles increase installation time and material waste."
                },
                {
                  title: "Accessibility:",
                  text: "Difficult access, steep driveways, or obstacles that complicate material delivery can add to costs."
                },
                {
                  title: "Permit Fees:",
                  text: "Dallas requires permits for roof replacement, typically $50-200 depending on project value."
                }
              ].map((factor, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-700">
                    <strong className="text-slate-900">{factor.title}</strong> {factor.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Financing */}
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">💳 Flexible Financing Options</h3>
              <p className="text-lg text-slate-700 mb-6 max-w-2xl mx-auto">
                Don't let budget concerns delay protecting your Dallas home. We offer financing options including 0% interest for 12 months for qualified homeowners. Multiple lenders available to fit your financial situation.
              </p>
              <Link to={createPageUrl("Booking")}>
                <Button size="lg" className="h-14 px-8 bg-green-600 hover:bg-green-700 text-lg">
                  Get Your Free Estimate
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Roof Replacement FAQs - Dallas Homeowners</h2>
          
          <div className="space-y-6">
            {[
              {
                question: "How long does roof replacement take in Dallas?",
                answer: "Most residential roof replacements in Dallas are completed in 1-3 days depending on size, complexity, and weather. A typical 2,000 sq ft home takes 2 days: day one for tear-off and decking inspection/repair, day two for installation and cleanup. Larger homes (3,000+ sq ft) or complex roof designs may require 3-5 days. Weather delays can extend timelines, especially during Dallas's spring storm season (March-May). We provide a specific timeline estimate during your free inspection."
              },
              {
                question: "Do I need to be home during roof replacement?",
                answer: "No, you don't need to be home during the actual installation work. However, we recommend being available for the initial morning walkthrough (15 minutes) and final inspection walkthrough (30 minutes). We communicate progress throughout the day via text/phone with photos. You should plan for noise during installation—many homeowners work from elsewhere during the project or arrange for pets/children to be away from home."
              },
              {
                question: "What's the best time of year for roof replacement in Dallas?",
                answer: "Spring (March-May) and fall (September-November) offer ideal conditions with moderate temperatures and lower chance of rain. However, we install quality roofs year-round in Dallas. Summer heat (June-August) doesn't affect shingle installation quality or warranty—modern materials are designed to be installed in high temperatures. Winter installations are possible on days above 40°F. We monitor weather forecasts closely and only work in safe, appropriate conditions."
              },
              {
                question: "Will my homeowners insurance cover roof replacement?",
                answer: "Insurance coverage depends on the cause of damage. Storm damage (hail, wind) is typically covered minus your deductible. Age-related wear and tear is generally not covered—insurance views this as maintenance. If you've had recent storm damage, we offer free insurance inspections and can document damage for your claim. We work with all major insurance companies (State Farm, Allstate, USAA, Farmers, etc.) and can meet with adjusters."
              },
              {
                question: "How long will my new Dallas roof last?",
                answer: "Lifespan depends on materials and Dallas's harsh climate: Architectural shingles last 25-30 years, premium architectural shingles last 30-50 years, metal roofing lasts 50+ years, and tile roofing lasts 50+ years. Texas's intense UV exposure and temperature extremes (100°F+ summers, occasional ice storms) reduce lifespan compared to moderate climates. Proper ventilation, regular maintenance, and quality installation significantly extend roof life. Our 10-year workmanship warranty and manufacturer material warranties protect your investment."
              },
              {
                question: "Can you install solar panels during roof replacement?",
                answer: "Yes! Roof replacement is the perfect time to prepare for solar panels. We can install reinforced decking in solar panel areas, add proper mounting attachments, and coordinate with solar installers. We strongly recommend replacing your roof before adding solar panels—removing and reinstalling solar panels for future roof work costs $3,000-8,000. If you're considering solar within the next 10 years, address your roof first."
              },
              {
                question: "What happens if it rains during my roof replacement?",
                answer: "We monitor weather forecasts closely before starting any project. If rain is forecasted during your scheduled installation, we'll reschedule to protect your home. If unexpected rain occurs during work, we immediately deploy tarps to cover any exposed areas—your home remains protected. We don't leave any home exposed overnight. Our experienced crew can quickly secure and weatherproof work-in-progress areas within 15-20 minutes if storms approach."
              },
              {
                question: "Do you handle permits for roof replacement in Dallas?",
                answer: "Yes, we handle all permit applications and coordination with the City of Dallas or your local municipality. Roof replacement permits in Dallas typically cost $50-200 depending on project value. The permit process takes 3-5 business days. We ensure all work meets or exceeds current Dallas building codes and pass all required inspections. You never have to visit city offices or deal with paperwork—we manage everything."
              },
              {
                question: "What makes Aroof different from other Dallas roofers?",
                answer: "We've been serving DFW since 2010 with over 5,000 satisfied customers and maintain an A+ BBB rating with 4.9/5 stars across 500+ reviews. We're fully licensed and insured with $2M liability coverage. Every project includes a 10-year workmanship warranty (most competitors offer 1-2 years) plus manufacturer warranties up to lifetime. We use only premium materials from top brands, employ experienced W-2 employees (not subcontractors), and provide transparent pricing with no hidden fees."
              },
              {
                question: "Do you offer payment plans or financing?",
                answer: "Yes! We offer multiple financing options to make roof replacement affordable. Qualified homeowners can access 0% interest for 12 months, low-interest extended plans up to 10 years, and same-day approvals available. We work with several lenders to find terms that fit your budget. Apply during your free estimate consultation. We also accept all major credit cards, checks, and can work with insurance claim payments."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-l-4 border-l-blue-600 shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{faq.question}</h3>
                  <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6 text-center">Roof Replacement Services Throughout Dallas-Fort Worth</h2>
          <p className="text-lg text-slate-700 mb-12 max-w-4xl mx-auto text-center leading-relaxed">
            Aroof proudly serves homeowners across the entire DFW metroplex with professional roof replacement services. As a locally owned and operated Dallas company since 2010, we understand Texas building codes, climate challenges, and homeowner needs better than national chains.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Dallas County",
                cities: "Dallas, Plano, Irving, Garland, Grand Prairie, Mesquite, Richardson, Carrollton, Rowlett, DeSoto, Lancaster, Cedar Hill, Duncanville, Farmers Branch, Addison, University Park, Highland Park, Balch Springs, Sachse"
              },
              {
                title: "Tarrant County",
                cities: "Fort Worth, Arlington, Euless, Bedford, Hurst, Keller, Southlake, Colleyville, Grapevine, North Richland Hills, Mansfield, Burleson, Haltom City, Watauga, Saginaw, Benbrook, White Settlement, Azle"
              },
              {
                title: "Collin County",
                cities: "Plano, Frisco, McKinney, Allen, Wylie, Murphy, Prosper, Celina, The Colony, Little Elm, Princeton, Anna, Fairview, Lucas, Parker, Lowry Crossing"
              },
              {
                title: "Denton County",
                cities: "Denton, Lewisville, Flower Mound, Coppell, Highland Village, Little Elm, Corinth, Lake Dallas, Hickory Creek, Double Oak, Bartonville, Copper Canyon"
              },
              {
                title: "Rockwall County",
                cities: "Rockwall, Rowlett, Heath, Royse City, Fate, McLendon-Chisholm"
              },
              {
                title: "Ellis County",
                cities: "Waxahachie, Midlothian, Red Oak, Cedar Hill, Ennis, Ferris"
              }
            ].map((county, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                  <CardTitle className="text-xl">{county.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-700 leading-relaxed">{county.cities}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 mb-2">🏠 Local Dallas Company</p>
                  <p className="text-slate-700 leading-relaxed">
                    When you call Aroof, you speak with our local DFW team—not a national call center. We live and work in the same communities we serve. Our crews are familiar with Dallas neighborhoods, HOA requirements, and local building codes. We're available for follow-up service years after installation because we're here to stay.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Why 5,000+ Dallas Homeowners Trust Aroof</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🏆",
                title: "A+ BBB Rating",
                description: "Accredited business with Better Business Bureau and consistent 5-star reviews demonstrating our commitment to customer satisfaction"
              },
              {
                icon: "✓",
                title: "Licensed & Insured",
                description: "Texas Roofing Contractor, fully insured with $2M liability coverage and workers' compensation for all crew members"
              },
              {
                icon: "🛡️",
                title: "10-Year Workmanship Warranty",
                description: "Industry-leading warranty on installation quality—5x longer than most Dallas roofing companies who offer only 1-2 years"
              },
              {
                icon: "⭐",
                title: "4.9/5 Star Rating",
                description: "Over 500 verified customer reviews across Google, Facebook, and HomeAdvisor with consistent excellence since 2010"
              },
              {
                icon: "👷",
                title: "Experienced Crews",
                description: "All installers are W-2 employees (not subcontractors) with average 10+ years roofing experience and ongoing training on latest techniques"
              },
              {
                icon: "💰",
                title: "Transparent Pricing",
                description: "Detailed written estimates with line-by-line breakdowns, no hidden fees, no pressure sales tactics—just honest recommendations"
              }
            ].map((item, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">What Dallas Homeowners Say About Our Roof Replacement</h2>
          
          <div className="space-y-6">
            {[
              {
                stars: 5,
                text: "Aroof replaced our entire roof in Plano after hail damage last spring. Their team was professional from start to finish - the estimate was detailed and fair, they handled all the insurance paperwork, and the installation crew was incredibly efficient. Our new roof looks amazing and we've had zero issues through this summer's heat. Highly recommend!",
                name: "Sarah M.",
                location: "Plano, TX"
              },
              {
                stars: 5,
                text: "We got quotes from 4 different Dallas roofing companies and Aroof wasn't the cheapest, but they were the most thorough and honest. They explained exactly what our 22-year-old roof needed and why. The 10-year warranty sealed the deal. Installation took 2 days and they cleaned up everything perfectly. Worth every penny for the quality and peace of mind.",
                name: "Michael T.",
                location: "Dallas, TX"
              },
              {
                stars: 5,
                text: "Best decision we made for our Frisco home. The crew arrived exactly on time, protected our landscaping and AC units, and worked incredibly hard in the Texas heat. They replaced some damaged decking at no extra charge because it was the right thing to do. The project manager sent us photos and updates throughout both days. This is how roofing should be done!",
                name: "Jennifer L.",
                location: "Frisco, TX"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-l-4 border-l-yellow-400 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg text-slate-700 italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{testimonial.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">— {testimonial.name}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      ✓ Verified Customer
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Read All 500+ Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for Your New Dallas Roof?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Get started today with a FREE, no-obligation roof inspection and detailed estimate. Our licensed professionals will assess your roof, answer all your questions, and provide transparent pricing with multiple options.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            {[
              { number: "5,000+", label: "Roofs Installed" },
              { number: "15+", label: "Years Experience" },
              { number: "4.9/5", label: "Star Rating" },
              { number: "10-Year", label: "Warranty" }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-16 px-10 bg-white text-blue-900 hover:bg-slate-50 font-bold text-xl shadow-2xl">
                📅 Schedule FREE Inspection
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white text-white hover:bg-white/10 font-bold text-xl" asChild>
              <a href="tel:+18502389727">
                📞 Call (850) 238-9727
              </a>
            </Button>
            <Link to={createPageUrl("FormPage")}>
              <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white text-white hover:bg-white/10 font-bold text-xl">
                📏 Get Instant Roof Measurement
              </Button>
            </Link>
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {[
              "No Obligation",
              "Same-Day Response",
              "Licensed & Insured",
              "0% Financing Available"
            ].map((guarantee, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">{guarantee}</span>
              </div>
            ))}
          </div>

          <p className="text-blue-200">
            <strong>Available Monday-Friday 8am-6pm, Saturday 9am-3pm</strong><br />
            Emergency services available 24/7
          </p>
        </div>
      </section>
    </div>
  );
}