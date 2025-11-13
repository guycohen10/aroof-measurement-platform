import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Phone, MapPin, CheckCircle, Star, ChevronRight, Thermometer, DollarSign, Shield } from "lucide-react";

export default function Windows() {
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
            <span className="text-slate-900 font-medium">Window Replacement</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Energy-Efficient Window Replacement in Dallas-Fort Worth
              </h1>
              <p className="text-xl text-indigo-100 mb-6 leading-relaxed">
                Professional window installation and replacement. Double-pane, triple-pane, and Energy Star certified windows. Lower your energy bills while improving comfort and home value.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "Energy Star Certified",
                  "Professional Installation",
                  "Licensed & Insured",
                  "Lifetime Warranty"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-indigo-300 flex-shrink-0" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("Booking")}>
                  <Button size="lg" className="h-14 px-8 bg-white text-indigo-700 hover:bg-indigo-50 text-lg font-bold w-full sm:w-auto shadow-2xl">
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
              <div className="aspect-[4/3] bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-xl flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Home className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-lg font-medium">Energy-efficient windows installed in Dallas home</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Professional Window Replacement in Dallas-Fort Worth</h2>
          
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              Windows are critical to your Dallas home's energy efficiency, comfort, security, and appearance. Old, inefficient windows are responsible for 25-30% of residential heating and cooling costs in Texas. Single-pane windows, drafty seals, and outdated glass technology literally pour money out of your home—especially during brutal Dallas summers when air conditioning runs constantly. Beyond energy waste, old windows compromise security, allow exterior noise, fade carpets and furniture from UV exposure, and detract from curb appeal.
            </p>
            <p>
              At Aroof, we install high-performance replacement windows throughout Dallas-Fort Worth that dramatically improve home comfort and reduce energy bills. We specialize in Energy Star certified double-pane and triple-pane windows, Low-E glass coating for maximum UV and heat rejection, argon or krypton gas fills for superior insulation, vinyl, fiberglass, and wood frame options, and custom sizes for any opening. Every installation includes proper insulation and sealing, secure and weathertight installation, manufacturer lifetime warranties, and professional interior/exterior finishing.
            </p>
            <p>
              Whether you're replacing a few problem windows or doing whole-house replacement, we provide expert installation that pays for itself through energy savings. Dallas homeowners typically see 20-35% reduction in energy costs after window replacement. Combined with our roofing and siding services, we can handle complete exterior home improvements with one trusted contractor, ensuring cohesive design and professional results throughout your project.
            </p>
          </div>
        </div>
      </section>

      {/* Window Types */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Window Options for Dallas Homes</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Double-Pane Vinyl Windows",
                price: "$450-750 per window",
                description: "Most popular choice for Dallas homeowners. Two panes of glass with argon gas fill and Low-E coating. Vinyl frames won't rot, warp, or need painting. Excellent energy efficiency at affordable price point. Available in multiple styles including double-hung, casement, sliding, and picture windows.",
                features: [
                  "Energy Star certified",
                  "Low-E glass coating",
                  "Argon gas insulation",
                  "Lifetime frame warranty",
                  "20+ year glass warranty",
                  "Reduces energy bills 20-30%",
                  "Virtually maintenance-free",
                  "Multiple color options"
                ],
                bestFor: "Most Dallas homes seeking efficiency and value",
                featured: true
              },
              {
                title: "Triple-Pane Windows",
                price: "$650-1,000 per window",
                description: "Premium energy efficiency with three panes of glass and dual krypton gas fills. Provides superior insulation—ideal for rooms facing west (afternoon sun exposure) or homes prioritizing maximum energy savings. Noticeably quieter than double-pane windows—reduces outside noise by 50%.",
                features: [
                  "Maximum energy efficiency",
                  "Krypton gas fills (better than argon)",
                  "40% better insulation than double-pane",
                  "Significant noise reduction",
                  "Lifetime warranties",
                  "Best for extreme climates",
                  "Reduces energy bills 30-40%",
                  "Pays for itself faster in Dallas heat"
                ],
                bestFor: "Maximum efficiency, west-facing rooms, noise reduction",
                featured: false
              },
              {
                title: "Fiberglass Windows",
                price: "$550-900 per window",
                description: "Premium frame material offering exceptional strength and durability. Fiberglass is stronger than vinyl, doesn't expand/contract in Texas temperature extremes, can be painted any color, and provides superior insulation. More expensive than vinyl but longer-lasting with better performance.",
                features: [
                  "Strongest window frame material",
                  "Minimal expansion/contraction",
                  "Paintable to any color",
                  "Energy efficient",
                  "50+ year lifespan",
                  "Low maintenance",
                  "Superior weather resistance",
                  "Narrow frames (more glass area)"
                ],
                bestFor: "Premium homes, extreme durability needs, custom colors",
                featured: false
              },
              {
                title: "Wood/Clad Windows",
                price: "$700-1,200 per window",
                description: "Traditional wood windows with exterior aluminum or vinyl cladding. Classic wood interior beauty with low-maintenance exterior protection. Premium option for historic homes or homeowners wanting authentic wood aesthetics inside. Requires more maintenance than vinyl but offers unmatched beauty.",
                features: [
                  "Beautiful wood interior",
                  "Protected exterior (aluminum/vinyl clad)",
                  "Traditional authentic appearance",
                  "Excellent insulation properties",
                  "Paintable or stainable interior",
                  "Adds significant home value",
                  "30-40 year lifespan",
                  "Premium aesthetics"
                ],
                bestFor: "Historic homes, luxury properties, wood interior preference",
                featured: false
              }
            ].map((window, index) => (
              <Card key={index} className={`${window.featured ? 'border-4 border-indigo-600 shadow-2xl' : 'border-2 border-slate-200 shadow-lg'} relative`}>
                {window.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b">
                  <CardTitle className="text-2xl text-slate-900">{window.title}</CardTitle>
                  <div className="text-lg font-bold text-indigo-600 mt-2">{price} installed</div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700 mb-4 leading-relaxed">{window.description}</p>
                  
                  <h4 className="font-bold text-slate-900 mb-3">Key Features:</h4>
                  <div className="space-y-2 mb-4">
                    {window.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-bold text-blue-900">Best For: {window.bestFor}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Window Styles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Window Styles Available</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { style: "Double-Hung", description: "Both sashes slide up/down. Most common style. Easy cleaning—tilts inward.", price: "$450-750" },
              { style: "Casement", description: "Hinged on side, cranks open. Best ventilation. Excellent seal when closed.", price: "$500-850" },
              { style: "Sliding", description: "Slides horizontally. Great for wide openings. Simple operation.", price: "$400-700" },
              { style: "Picture", description: "Non-opening. Maximum view and light. Most energy-efficient.", price: "$350-600" },
              { style: "Bay/Bow", description: "Projects outward. Adds space and dimension. Premium architectural feature.", price: "$1,500-3,500" },
              { style: "Awning", description: "Hinged at top, opens outward. Can stay open in rain. Good for ventilation.", price: "$500-800" },
              { style: "Garden", description: "Large window extending out. Creates interior shelf. Perfect for plants.", price: "$800-1,500" },
              { style: "Specialty Shapes", description: "Circles, triangles, arches. Custom architectural details.", price: "$600-1,500" }
            ].map((style, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-br from-indigo-50 to-blue-50 border-b">
                  <CardTitle className="text-lg text-slate-900">{style.style}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-700 mb-4">{style.description}</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <p className="text-sm font-bold text-green-900">{style.price}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Energy Savings */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Thermometer className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Energy Savings with New Windows</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Replace old windows and see immediate impact on your Dallas energy bills:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Old Single-Pane Windows",
                bills: "$250-350/month",
                description: "Typical summer cooling costs for 2,000 sq ft Dallas home with old windows",
                efficiency: "Very inefficient"
              },
              {
                title: "After Double-Pane Replacement",
                bills: "$175-250/month",
                description: "Same home with Energy Star double-pane windows",
                efficiency: "Save 20-30%",
                featured: true
              },
              {
                title: "After Triple-Pane Replacement",
                bills: "$150-210/month",
                description: "Same home with premium triple-pane windows",
                efficiency: "Save 30-40%"
              }
            ].map((scenario, index) => (
              <Card key={index} className={`${scenario.featured ? 'border-4 border-green-600 shadow-2xl scale-105' : 'border-2 border-slate-200 shadow-lg'}`}>
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b text-center">
                  <CardTitle className="text-xl text-slate-900">{scenario.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{scenario.bills}</div>
                  <p className="text-sm text-slate-700 mb-4">{scenario.description}</p>
                  <div className={`rounded-lg p-3 ${scenario.featured ? 'bg-green-100 border border-green-600' : 'bg-red-100 border border-red-300'}`}>
                    <p className={`font-bold ${scenario.featured ? 'text-green-900' : 'text-red-900'}`}>
                      {scenario.efficiency}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 bg-white border-2 border-green-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">💰 Annual Savings Example:</h3>
              <p className="text-lg text-slate-700 text-center mb-6">
                Replacing 15 old single-pane windows with Energy Star double-pane windows in Dallas:
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">$900-1,200</div>
                  <p className="text-sm text-slate-600">Annual energy waste (old windows)</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">$600-900</div>
                  <p className="text-sm text-slate-600">Annual savings with new windows</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">8-12 years</div>
                  <p className="text-sm text-slate-600">Payback period through savings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Installation Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Our Window Installation Process</h2>

          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "FREE In-Home Consultation",
                content: "We visit your Dallas home to assess current windows, measure each opening precisely, discuss style preferences and energy goals, review frame material options (vinyl, fiberglass, wood), explain glass options (double vs. triple pane, Low-E coatings), and provide detailed written estimate. We bring window samples so you can see and feel quality differences."
              },
              {
                number: 2,
                title: "Custom Window Ordering",
                content: "After you select materials and styles, we order windows custom-manufactured to your exact measurements. Each window is built specifically for your home—no \"one size fits all.\" Lead time is typically 3-4 weeks for custom manufacturing. We coordinate delivery with your installation schedule."
              },
              {
                number: 3,
                title: "Professional Installation Day",
                content: "Our experienced installers protect your home's interior with drop cloths, carefully remove old windows, inspect and prepare rough openings (repair wood rot if found), install new windows level and square, insulate gaps with low-expansion foam, seal exterior with weatherproof caulking, and test operation and locking mechanisms. Installation is typically 2-4 windows per day depending on size and complexity."
              },
              {
                number: 4,
                title: "Interior/Exterior Finishing",
                content: "We install interior trim and casing to match existing woodwork, caulk and paint trim as needed, install exterior trim and brick mold, ensure weathertight seals, clean all glass inside and out, remove all debris and old windows, and conduct final walkthrough with you. Your home is left clean with beautiful, professionally finished windows."
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border-l-4 border-indigo-600 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
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
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Window Replacement Cost in Dallas</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Single Window Replacement",
                details: "One standard double-hung",
                material: "Vinyl double-pane with installation",
                total: "$450 - $750",
                featured: false
              },
              {
                title: "Whole-House Package",
                details: "12-15 windows typical home",
                material: "Vinyl double-pane, Energy Star",
                total: "$6,500 - $11,000",
                featured: true
              },
              {
                title: "Premium Whole-House",
                details: "12-15 windows",
                material: "Fiberglass or triple-pane",
                total: "$10,000 - $18,000",
                featured: false
              }
            ].map((example, index) => (
              <Card key={index} className={`${example.featured ? 'border-4 border-indigo-600 shadow-2xl' : 'border-2 border-slate-200 shadow-lg'} relative`}>
                {example.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                    MOST COMMON
                  </div>
                )}
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b text-center">
                  <CardTitle className="text-xl text-slate-900">{example.title}</CardTitle>
                  <div className="text-sm text-slate-600 mt-1">{example.details}</div>
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

      {/* Signs You Need Replacement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Signs Your Dallas Home Needs Window Replacement</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "High energy bills in summer",
              "Drafts around window frames",
              "Condensation between panes",
              "Difficulty opening or closing",
              "Cracked or broken glass",
              "Rotting wood frames",
              "Fading furniture/carpets (UV damage)",
              "Excessive outside noise",
              "Single-pane windows",
              "Windows older than 20 years",
              "Peeling paint on frames",
              "Visible daylight around closed windows"
            ].map((sign, index) => (
              <div key={index} className="flex items-start gap-2 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 hover:border-red-400 transition-all">
                <span className="text-red-600 font-bold text-xl">❌</span>
                <span className="text-sm font-medium text-slate-900">{sign}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Benefits of New Energy-Efficient Windows</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "💰", title: "Lower Energy Bills", description: "Save 20-40% on heating/cooling costs—$600-900 annually in Dallas" },
              { icon: "🏠", title: "Increased Home Value", description: "Window replacement ROI is 70-80% at resale—great investment" },
              { icon: "🌡️", title: "Improved Comfort", description: "Eliminate drafts, reduce hot spots, maintain consistent temperature" },
              { icon: "🔇", title: "Noise Reduction", description: "Double/triple pane windows reduce outside noise by 40-60%" },
              { icon: "☀️", title: "UV Protection", description: "Low-E glass blocks 99% of UV rays—prevents fading furniture/carpets" },
              { icon: "🔒", title: "Enhanced Security", description: "Modern locks and impact-resistant glass improve home security" }
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

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Window Replacement Reviews</h2>
          
          <Card className="border-l-4 border-l-yellow-400 shadow-lg">
            <CardContent className="p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-slate-700 italic mb-6 leading-relaxed">
                "We replaced all 18 windows in our Frisco home with Aroof. The difference is incredible—our master bedroom is actually comfortable now even in July! Energy bill dropped by $80/month. Installation was professional, crew was respectful of our home, and the windows look beautiful. Best home improvement we've made."
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">— Carol T.</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Frisco, TX
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
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for Energy-Efficient Windows?
          </h2>
          <p className="text-xl text-indigo-100 mb-12">
            Get a FREE estimate and start saving on energy bills
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-16 px-10 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xl shadow-2xl">
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
              "Energy Star Certified",
              "Lifetime Warranty",
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