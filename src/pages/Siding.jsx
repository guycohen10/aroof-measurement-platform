import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Phone, MapPin, CheckCircle, Star, ChevronRight, Shield, Thermometer } from "lucide-react";

export default function Siding() {
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
            <span className="text-slate-900 font-medium">Siding Installation</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-700 via-orange-700 to-amber-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Professional Siding Installation in Dallas-Fort Worth
              </h1>
              <p className="text-xl text-amber-100 mb-6 leading-relaxed">
                Quality siding installation and replacement. Vinyl, fiber cement, and wood siding options. Transform your home's appearance while improving energy efficiency and protection.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "Multiple Material Options",
                  "Energy Efficient",
                  "Licensed & Insured",
                  "5-Year Warranty"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("Booking")}>
                  <Button size="lg" className="h-14 px-8 bg-white text-amber-700 hover:bg-amber-50 text-lg font-bold w-full sm:w-auto shadow-2xl">
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
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-300 to-amber-500 rounded-xl flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Home className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-lg font-medium">New fiber cement siding on Dallas home</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Expert Siding Installation in Dallas-Fort Worth</h2>
          
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              Your home's siding is the first line of defense against Texas weather while defining your home's curb appeal and value. Quality siding protects against rain, wind, UV damage, and temperature extremes, provides insulation that reduces energy costs, prevents moisture intrusion and structural damage, resists pest and insect entry, and significantly impacts home appearance and resale value. Old, damaged, or inadequate siding leads to high energy bills, interior moisture and mold issues, structural wood rot, and decreased property value.
            </p>
            <p>
              At Aroof, we've installed siding on hundreds of Dallas-Fort Worth homes since 2010, specializing in vinyl siding installation (most popular and cost-effective), fiber cement siding (James Hardie and similar premium brands), wood siding for traditional aesthetics, engineered wood alternatives, and complete siding replacement including moisture barrier upgrades. Every installation follows manufacturer specifications, exceeds Texas building codes, and includes proper insulation, moisture barriers, and professional finishing details.
            </p>
            <p>
              Whether you're updating your home's appearance, replacing damaged siding, or improving energy efficiency, we provide expert installation with 5-year workmanship warranty. Many homeowners coordinate siding installation with roof replacement—we can handle both projects efficiently with one contractor, ensuring cohesive design and proper integration of all exterior systems.
            </p>
          </div>
        </div>
      </section>

      {/* Siding Types */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Siding Options for Dallas Homes</h2>

          <div className="space-y-8">
            {[
              {
                title: "Vinyl Siding",
                price: "$6-10 per square foot",
                description: "Most popular choice for Dallas homeowners offering excellent value, low maintenance, and wide design variety. Vinyl siding resists moisture, doesn't rot or attract insects, never needs painting, and handles Texas heat well. Available in dozens of colors and styles including traditional lap, board & batten, and shakes.",
                features: [
                  "30-40 year lifespan",
                  "Never needs painting",
                  "Won't rot, warp, or corrode",
                  "Insect and moisture resistant",
                  "Wide color and style selection",
                  "Low maintenance (wash once yearly)",
                  "Affordable and durable",
                  "Insulated options available"
                ],
                bestFor: "Most Dallas homes seeking value, variety, and low maintenance",
                featured: true
              },
              {
                title: "Fiber Cement Siding (James Hardie)",
                price: "$10-18 per square foot",
                description: "Premium siding offering superior durability and fire resistance. Fiber cement (cement, sand, and cellulose fibers) resists fire, insects, rot, and impact damage. Holds paint exceptionally well—factory-finished options come with 15-year paint warranty. Ideal for Dallas climate—won't expand/contract like vinyl in temperature extremes.",
                features: [
                  "50+ year lifespan",
                  "Fire resistant (non-combustible)",
                  "Impact and hail resistant",
                  "Won't rot, crack, or split",
                  "Holds paint for decades",
                  "Authentic wood appearance",
                  "Increases home value significantly",
                  "30-year transferable warranty"
                ],
                bestFor: "Upscale homes, fire-prone areas, long-term investment",
                featured: false
              },
              {
                title: "Wood Siding (Cedar/Redwood)",
                price: "$8-15 per square foot",
                description: "Traditional wood siding offers authentic beauty and natural insulation properties. Cedar and redwood naturally resist insects and decay. Requires regular maintenance (staining/sealing every 3-5 years) but delivers timeless appearance unmatched by synthetic alternatives.",
                features: [
                  "20-40 year lifespan (with maintenance)",
                  "Beautiful natural grain patterns",
                  "Natural insulation properties",
                  "Can be painted or stained any color",
                  "Eco-friendly renewable material",
                  "Authentic traditional appearance",
                  "Repairable and refinishable"
                ],
                bestFor: "Historic homes, traditional aesthetics, homeowners willing to maintain",
                featured: false
              },
              {
                title: "Engineered Wood Siding",
                price: "$5-9 per square foot",
                description: "Engineered wood combines wood fibers with resins for improved performance. Looks like real wood but more stable and rot-resistant. Less expensive than natural wood while maintaining wood appearance. Good middle ground between vinyl and solid wood.",
                features: [
                  "25-30 year lifespan",
                  "Wood appearance at lower cost",
                  "More stable than solid wood",
                  "Rot and insect resistant treatment",
                  "Can be painted or stained",
                  "Easier installation than solid wood",
                  "50-year limited warranty available"
                ],
                bestFor: "Budget-conscious homeowners wanting wood look",
                featured: false
              }
            ].map((siding, index) => (
              <Card key={index} className={`${siding.featured ? 'border-4 border-amber-600 shadow-2xl' : 'border-2 border-slate-200 shadow-lg'} relative`}>
                {siding.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-3xl text-slate-900">{siding.title}</CardTitle>
                    <div className="bg-green-100 border border-green-600 rounded-lg px-4 py-2">
                      <span className="text-xl font-bold text-green-900">{siding.price}</span>
                      <p className="text-xs text-green-700">installed</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-lg text-slate-700 mb-6 leading-relaxed">{siding.description}</p>
                  
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Key Features:</h4>
                  <div className="grid md:grid-cols-2 gap-3 mb-6">
                    {siding.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-bold text-blue-900">Best For: {siding.bestFor}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Our Siding Installation Process</h2>

          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "FREE Consultation & Assessment",
                content: "We visit your Dallas home to inspect existing siding condition, measure square footage precisely, assess insulation and moisture barrier needs, discuss material and color options, review energy efficiency upgrades, and provide detailed written estimate with material samples. No pressure—just professional guidance."
              },
              {
                number: 2,
                title: "Material Selection & Ordering",
                content: "Once you choose materials, we order from trusted manufacturers with precise quantities accounting for waste factor. For vinyl and fiber cement, we coordinate delivery timing with installation schedule. Custom colors are ordered to your specifications. Materials typically arrive within 1-2 weeks."
              },
              {
                number: 3,
                title: "Preparation & Old Siding Removal",
                content: "Our crew carefully removes old siding, inspects sheathing and structure for damage or rot, repairs any wood rot or structural issues discovered, installs new moisture barrier (house wrap), ensures proper flashing around windows and doors, and prepares surface for new siding installation. Any structural concerns are addressed before proceeding."
              },
              {
                number: 4,
                title: "Professional Siding Installation",
                content: "We install siding following strict manufacturer specifications including proper starter strips and channels, correct overlap and fastening techniques, expansion gaps for temperature changes (critical in Texas), proper J-channel around windows/doors, corner posts and trim pieces, and soffit and fascia coordination. Every piece is level, straight, and professionally finished."
              },
              {
                number: 5,
                title: "Trim, Finishing & Cleanup",
                content: "Final details make the difference: install all trim boards, corner pieces, and decorative elements, caulk and seal all penetrations and gaps, install soffit ventilation if needed, final inspection of all work, complete property cleanup, and haul away all debris. Your home looks stunning with professional finishing touches."
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-6 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border-l-4 border-amber-600 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
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
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Siding Installation Cost in Dallas</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Average Single-Story",
                size: "1,500 sq ft siding area",
                material: "Vinyl siding, standard colors",
                total: "$9,000 - $15,000",
                featured: false
              },
              {
                title: "Average Two-Story",
                size: "2,500 sq ft siding area",
                material: "Vinyl or fiber cement",
                total: "$15,000 - $35,000",
                featured: true
              },
              {
                title: "Large/Premium Home",
                size: "3,500+ sq ft",
                material: "Fiber cement or wood",
                total: "$35,000 - $60,000",
                featured: false
              }
            ].map((example, index) => (
              <Card key={index} className={`${example.featured ? 'border-4 border-amber-600 shadow-2xl' : 'border-2 border-slate-200 shadow-lg'} relative`}>
                {example.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                    MOST COMMON
                  </div>
                )}
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b text-center">
                  <CardTitle className="text-2xl text-slate-900">{example.title}</CardTitle>
                  <div className="text-sm text-slate-600 mt-1">{example.size}</div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-700 mb-4">{example.material}</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-3xl font-bold text-green-900">{example.total}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Benefits of New Siding</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🏠", title: "Increased Home Value", description: "New siding ROI is 75-85%—you recoup most costs at resale" },
              { icon: "💰", title: "Lower Energy Bills", description: "Insulated siding reduces heating/cooling costs by 15-25%" },
              { icon: "🛡️", title: "Weather Protection", description: "Modern materials resist Dallas heat, storms, and moisture" },
              { icon: "🎨", title: "Enhanced Curb Appeal", description: "Transform your home's appearance instantly with new siding" },
              { icon: "🔧", title: "Low Maintenance", description: "Modern siding requires minimal upkeep—no yearly painting" },
              { icon: "🌡️", title: "Better Insulation", description: "Improved R-value keeps your home comfortable year-round" }
            ].map((benefit, index) => (
              <Card key={index} className="border-none shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signs You Need Siding */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Signs Your Dallas Home Needs New Siding</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Warped or buckled siding",
              "Cracks or holes in siding",
              "Fading or peeling paint",
              "Rot or soft spots",
              "Mold or mildew growth",
              "High energy bills",
              "Interior moisture issues",
              "Siding older than 25 years"
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
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Siding Installation Reviews</h2>
          
          <Card className="border-l-4 border-l-yellow-400 shadow-lg">
            <CardContent className="p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-slate-700 italic mb-6 leading-relaxed">
                "Aroof replaced all the siding on our Plano home with James Hardie fiber cement. The transformation is incredible—looks like a brand new house! Crew was professional, project took 5 days, and they coordinated perfectly with our new roof installation. Energy bills have dropped noticeably. Worth every penny."
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">D</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">— David M.</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Plano, TX
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
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Home?
          </h2>
          <p className="text-xl text-amber-100 mb-12">
            Get a FREE estimate for professional siding installation
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-16 px-10 bg-white text-amber-700 hover:bg-amber-50 font-bold text-xl shadow-2xl">
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
              "Multiple Material Options",
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