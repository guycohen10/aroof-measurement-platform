import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Phone, MapPin, CheckCircle, FileText, Clock, Shield, Star, ChevronRight, Award, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RoofInspection() {
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
            <span className="text-slate-900 font-medium">Roof Inspection</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white rounded-full px-6 py-2 mb-6">
                <span className="text-2xl font-bold">100% FREE INSPECTION</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                FREE Professional Roof Inspection in Dallas-Fort Worth
              </h1>
              <p className="text-xl text-green-100 mb-6 leading-relaxed">
                Comprehensive roof assessment by licensed professionals. Get a detailed inspection report, high-resolution photos, and honest recommendations—absolutely free, no obligation.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "100% FREE",
                  "No Obligation",
                  "Same-Week Appointments",
                  "Detailed Written Report"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link to={createPageUrl("Booking")}>
                  <Button size="lg" className="h-14 px-8 bg-white text-green-700 hover:bg-green-50 text-lg font-bold w-full sm:w-auto shadow-2xl">
                    Schedule FREE Inspection
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 text-lg font-bold w-full sm:w-auto" asChild>
                  <a href="tel:+18502389727">
                    <Phone className="w-5 h-5 mr-2" />
                    Call (850) 238-9727
                  </a>
                </Button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-green-100">
                  <strong className="text-white">Our Promise:</strong> Honest assessment. No pressure. No hidden fees. Just professional advice you can trust.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2">
              <div className="aspect-[4/3] bg-gradient-to-br from-green-300 to-green-400 rounded-xl flex items-center justify-center">
                <div className="text-center text-slate-700 p-8">
                  <FileText className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-lg font-medium">Inspector examining roof with clipboard in Dallas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE Highlight Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 border-2 border-green-600 rounded-full px-6 py-2 mb-6">
              <Award className="w-6 h-6 text-green-600" />
              <span className="text-2xl font-bold text-green-900">100% FREE - NO COST EVER</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why We Offer FREE Roof Inspections</h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Unlike many Dallas roofing companies that charge $150-300 for inspections, we provide comprehensive roof assessments at no cost. Why? Because we believe homeowners deserve honest, professional advice before making any roofing decisions. Our FREE inspections have no strings attached—even if you choose another contractor, you'll have valuable information about your roof's condition.
            </p>
          </div>

          <Card className="shadow-2xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="text-2xl text-center">Your FREE Inspection Includes:</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  "Complete exterior roof examination",
                  "Attic and interior inspection",
                  "High-resolution photos of all issues",
                  "Detailed written report",
                  "Honest condition assessment",
                  "Written estimate if repairs needed",
                  "No obligation or pressure",
                  "Expert recommendations"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2 bg-white rounded-lg p-4 border-2 border-green-100 hover:border-green-300 transition-all">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-900">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Professional Roof Inspections in Dallas-Fort Worth</h2>
          
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              Regular roof inspections are the key to extending your roof's lifespan and preventing expensive emergency repairs. At Aroof, our licensed roofing professionals conduct thorough roof assessments that identify current problems, potential issues, and maintenance needs before they become costly disasters.
            </p>
            <p>
              Our comprehensive Dallas roof inspections examine all roofing components including shingles or roofing material condition, flashing around chimneys, vents, and skylights, roof valleys and drainage systems, ventilation adequacy, attic insulation and moisture, structural integrity, and signs of pest or animal damage. We provide the same detailed inspection whether you're considering a purchase, planning to sell, need insurance documentation, experienced storm damage, or simply want peace of mind about your roof's condition.
            </p>
            <p>
              Every inspection includes a detailed written report with photos, honest assessment of remaining roof life, prioritized list of any repairs needed, and transparent pricing if work is required. We never pressure homeowners into unnecessary work—if your roof is fine, we'll tell you. If it needs attention, we explain exactly why and what your options are.
            </p>
          </div>
        </div>
      </section>

      {/* When to Get Inspection */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">When Should Dallas Homeowners Get a Roof Inspection?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Don't wait for visible leaks to check your roof. Here are the situations when professional roof inspection is essential:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🏠",
                title: "Before Buying a Home",
                description: "A pre-purchase roof inspection reveals the true condition and remaining lifespan of a home's roof before you commit. Discover if you'll need replacement in 2 years or 20 years. Use findings to negotiate price or request repairs from sellers. Avoid buying expensive roofing problems—roof replacement costs $10,000-25,000 in Dallas.",
                timing: "During inspection contingency period"
              },
              {
                icon: "💰",
                title: "Before Selling Your Home",
                description: "Pre-listing roof inspection lets you address issues proactively before buyers discover them. Provide inspection report to buyers showing roof condition transparency. Address minor repairs that could kill deals. Get accurate remaining lifespan to confidently answer buyer questions. Homes with documented roof conditions sell faster and at higher prices.",
                timing: "2-3 months before listing"
              },
              {
                icon: "🌪️",
                title: "After Dallas Storms",
                description: "Storm damage isn't always obvious from ground level. Professional inspection identifies hail dents, wind damage to shingles, compromised flashing, and hidden damage that could void warranties if not addressed. Necessary for insurance claims—adjusters require professional documentation. Time-sensitive: most insurance policies require claims within 1 year of damage.",
                timing: "Within days after severe weather"
              },
              {
                icon: "📋",
                title: "For Insurance Purposes",
                description: "Many insurance companies require roof inspections for policy renewals, especially roofs 15+ years old. Documentation needed for claims after storm damage. Some insurers offer discounts for roofs in excellent condition. Inspection report can prevent policy non-renewal by showing roof is well-maintained.",
                timing: "When requested by insurer or before claim"
              },
              {
                icon: "📅",
                title: "Annual Maintenance",
                description: "Regular inspections catch small issues before they become expensive repairs. Recommended for roofs 10+ years old or after each storm season. Prolongs roof life by addressing minor problems early. Documents roof condition for warranty compliance. Small repairs cost $200-500 vs. emergency repairs costing $2,000+.",
                timing: "Spring (post-winter) or Fall (pre-winter)"
              },
              {
                icon: "⚠️",
                title: "When You Notice Warning Signs",
                description: "Don't ignore these red flags: water stains on ceilings, missing or damaged shingles, granules in gutters, sagging roof sections, daylight through roof boards, or increasing energy bills. Early detection prevents minor issues from becoming major disasters. What costs $300 to repair today could cost $15,000 in water damage if ignored.",
                timing: "Immediately upon noticing issues"
              },
              {
                icon: "🏗️",
                title: "Before Major Renovations",
                description: "Planning additions, solar panels, or major home improvements? Inspect your roof first to ensure it's structurally sound enough to support changes. Avoid the expense of removing solar panels later for roof replacement (costs $3,000-8,000). Coordinate roofing work with other projects for efficiency.",
                timing: "During planning phase, before quotes"
              },
              {
                icon: "⏰",
                title: "Every 3-5 Years",
                description: "Even without visible problems, roofs should be professionally inspected every 3-5 years. Texas weather is harsh on roofs—heat, storms, and UV exposure cause gradual deterioration. Professional eye catches what homeowners miss. Maintains warranty compliance. Preventive maintenance is always cheaper than reactive repairs.",
                timing: "Set recurring calendar reminder"
              }
            ].map((situation, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{situation.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{situation.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{situation.description}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <p className="text-xs font-bold text-blue-900">Timing: {situation.timing}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Break */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Schedule Your FREE Inspection?</h3>
          <p className="text-xl mb-6">Most appointments available within 2-3 days</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-14 px-8 bg-white text-green-700 hover:bg-green-50 font-bold text-lg">
                Schedule Now
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

      {/* Inspection Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Happens During Your Roof Inspection</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our comprehensive Dallas roof inspection follows a systematic 45-60 minute process that examines every aspect of your roofing system:
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "Exterior Roof Examination (30 minutes)",
                content: "Our licensed inspector safely accesses your roof to conduct a hands-on examination. We inspect shingle condition (curling, cracking, missing granules), flashing around chimneys, vents, and skylights, roof valleys and drainage patterns, ridge and hip condition, fascia and soffit condition, gutter system, and ventilation components. We take high-resolution photos documenting every area, especially any problems discovered.",
                items: [
                  "Shingle integrity and remaining life assessment",
                  "All penetrations and flashings examined",
                  "Drainage and valley inspection",
                  "Structural issues identified",
                  "Photos of all findings"
                ]
              },
              {
                number: 2,
                title: "Attic & Interior Inspection (15 minutes)",
                content: "We examine your attic for signs of leaks, proper ventilation, adequate insulation, moisture or water stains, mold or mildew, animal intrusion, and structural integrity of decking and rafters. Interior inspection catches problems not visible from outside. We use moisture meters and thermal imaging when needed to detect hidden leaks. Proper ventilation assessment is critical—poor ventilation shortens roof life by 40%.",
                items: [
                  "Leak detection from interior",
                  "Ventilation adequacy assessment",
                  "Insulation condition check",
                  "Structural evaluation from inside",
                  "Moisture and water damage detection"
                ]
              },
              {
                number: 3,
                title: "Ground-Level Assessment (10 minutes)",
                content: "From ground level, we examine overall roof appearance and symmetry, visible damage or irregularities, gutter condition and drainage, fascia and soffit condition, exterior wall moisture stains, and landscaping impact on roof (overhanging branches). We look at your roof from multiple angles using binoculars and our experience to spot issues homeowners typically miss.",
                items: []
              },
              {
                number: 4,
                title: "Detailed Report & Recommendations (10 minutes)",
                content: "After inspection, we review findings with you immediately. You receive a detailed written report including all photos with annotations, condition assessment of every component, estimated remaining roof life, prioritized list of any repairs needed, honest recommendation (repair, maintain, or replace), and written estimate for any recommended work. No pressure—just facts and professional guidance to help you make informed decisions.",
                items: []
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-6 bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border-l-4 border-green-600 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-700 leading-relaxed mb-4">{step.content}</p>
                  {step.items.length > 0 && (
                    <div className="space-y-2">
                      {step.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Alert className="mt-8 bg-blue-50 border-blue-200">
            <Shield className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Our Inspection Guarantee:</strong> If we inspect your roof and don't find any issues, we'll tell you your roof is fine—even though it means no work for us. We've earned 4.9/5 stars and 500+ reviews by being honest, not by pushing unnecessary work. Many Dallas homeowners use us for second opinions because they trust our integrity.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Inspection Checklist */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Complete Dallas Roof Inspection Checklist</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our comprehensive inspection examines 30+ critical roof components to give you a complete picture of your roof's health:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "🏠 Roofing Materials",
                items: [
                  "Shingle condition and integrity",
                  "Missing or damaged shingles",
                  "Curling, cupping, or buckling",
                  "Granule loss assessment",
                  "Algae or moss growth",
                  "Blistering or bubbling",
                  "Nail pops or exposed fasteners",
                  "Remaining material life estimate"
                ]
              },
              {
                title: "💧 Flashing & Waterproofing",
                items: [
                  "Chimney flashing condition",
                  "Vent pipe boot integrity",
                  "Skylight flashing and seals",
                  "Valley flashing condition",
                  "Step flashing along walls",
                  "Drip edge presence and condition",
                  "Counter-flashing evaluation",
                  "Penetration seals (TV antennas, etc.)"
                ]
              },
              {
                title: "🏗️ Structural Components",
                items: [
                  "Roof decking condition",
                  "Sagging or uneven areas",
                  "Rafter and truss integrity",
                  "Ridge beam condition",
                  "Structural support adequacy",
                  "Weight load assessment",
                  "Foundation settlement impact",
                  "Wall attachment integrity"
                ]
              },
              {
                title: "🌊 Drainage Systems",
                items: [
                  "Gutter condition and attachment",
                  "Downspout functionality",
                  "Proper water flow and drainage",
                  "Standing water or ponding",
                  "Valley water channeling",
                  "Gutter slope and alignment",
                  "Debris accumulation",
                  "Underground drainage connections"
                ]
              },
              {
                title: "🌡️ Ventilation & Insulation",
                items: [
                  "Attic ventilation adequacy",
                  "Ridge vent condition",
                  "Soffit vent functionality",
                  "Gable vent assessment",
                  "Insulation R-value and condition",
                  "Moisture barriers",
                  "Attic temperature evaluation",
                  "Condensation issues"
                ]
              },
              {
                title: "⚠️ Damage & Defects",
                items: [
                  "Storm and hail damage",
                  "Wind damage assessment",
                  "Water intrusion evidence",
                  "Mold or mildew presence",
                  "Animal or pest damage",
                  "Tree damage or risks",
                  "Previous repair quality",
                  "Warranty compliance issues"
                ]
              }
            ].map((category, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Roof Inspection Cost in Dallas</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <Card className="border-2 border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b text-center">
                <CardTitle className="text-2xl text-slate-900">Industry Standard</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className="text-5xl font-bold text-slate-600 mb-4">$150 - $400</div>
                <p className="text-slate-700">What most Dallas roofing companies charge for professional roof inspection</p>
              </CardContent>
            </Card>

            <Card className="border-4 border-green-600 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                BEST VALUE
              </div>
              <CardHeader className="bg-gradient-to-br from-green-50 to-green-100 border-b text-center">
                <div className="inline-block bg-green-600 text-white px-8 py-3 rounded-full text-3xl font-bold mb-4">
                  100% FREE
                </div>
                <CardTitle className="text-2xl text-green-900">Aroof Inspection</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-bold text-green-600 mb-4">$0</div>
                <p className="text-green-900 font-medium">Comprehensive professional inspection at no cost, no obligation</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-200 mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Our Inspections Are FREE:</h3>
            <p className="text-lg text-slate-700 leading-relaxed">
              We believe homeowners should have access to professional roof assessments without financial barriers. Our FREE inspections serve multiple purposes: they help homeowners make informed decisions, build trust in our expertise and integrity, identify problems early before they become emergencies, and establish relationships with DFW homeowners. If your roof needs work and you choose us, great. If not, you still have valuable information about your roof's condition—and you'll remember our honesty when you do need a roofer.
            </p>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <Award className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>The Value of Regular Inspections:</strong> A $0 inspection that catches a $300 repair prevents a $15,000 interior water damage disaster. Annual inspections extend roof life by 3-5 years, saving Dallas homeowners $10,000+ in premature replacement costs.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Benefits of Professional Roof Inspection</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💰",
                title: "Prevents Expensive Repairs",
                description: "Catch small $200-500 repairs before they become $10,000-25,000 roof replacements or interior water damage disasters"
              },
              {
                icon: "📈",
                title: "Extends Roof Lifespan",
                description: "Regular maintenance and early issue detection can extend your roof's life by 5-10 years—a huge return on investment"
              },
              {
                icon: "🏠",
                title: "Protects Home Value",
                description: "Documented roof maintenance increases home value and appeal to buyers. Well-maintained roofs sell homes faster"
              },
              {
                icon: "📋",
                title: "Insurance Documentation",
                description: "Professional inspection reports are essential for insurance claims and policy renewals, especially for storm damage"
              },
              {
                icon: "🛡️",
                title: "Maintains Warranties",
                description: "Many roof warranties require regular inspections. Professional documentation keeps your warranty coverage intact"
              },
              {
                icon: "😌",
                title: "Peace of Mind",
                description: "Know the true condition of your roof. Sleep better during Dallas storms knowing your roof is sound—or needs addressed"
              }
            ].map((benefit, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6 text-center">FREE Roof Inspections Throughout Dallas-Fort Worth</h2>
          <p className="text-lg text-slate-700 mb-12 max-w-4xl mx-auto text-center leading-relaxed">
            We provide complimentary professional roof inspections to homeowners across the entire DFW metroplex:
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Dallas County", cities: "Dallas, Plano, Irving, Garland, Grand Prairie, Mesquite, Richardson, Carrollton, Rowlett, DeSoto, Lancaster, Cedar Hill, Duncanville" },
              { title: "Tarrant County", cities: "Fort Worth, Arlington, Euless, Bedford, Hurst, Keller, Southlake, Colleyville, Grapevine, North Richland Hills, Mansfield" },
              { title: "Collin County", cities: "Plano, Frisco, McKinney, Allen, Wylie, Murphy, Prosper, Celina, The Colony" },
              { title: "Denton County", cities: "Denton, Lewisville, Flower Mound, Coppell, Highland Village, Little Elm" }
            ].map((county, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-br from-green-600 to-green-700 text-white">
                  <CardTitle className="text-lg">{county.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{county.cities}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">What Dallas Homeowners Say About Our Inspections</h2>
          
          <div className="space-y-6">
            {[
              {
                stars: 5,
                text: "Aroof did a pre-purchase inspection on a house we were considering in Plano. They found significant storm damage the seller's inspection missed. Saved us from buying a house needing a $15,000 roof! The FREE inspection was incredibly thorough with tons of photos. Worth every penny—which was $0!",
                name: "Jessica K.",
                location: "Plano, TX"
              },
              {
                stars: 5,
                text: "I was worried my 18-year-old roof needed replacement after seeing some damaged shingles. Aroof came out, did a complete inspection, and said I have 5-7 good years left with just $400 in minor repairs. Other companies tried to sell me a $22,000 replacement. This honesty earned my business forever.",
                name: "Tom R.",
                location: "Dallas, TX"
              },
              {
                stars: 5,
                text: "FREE inspection revealed a small leak we hadn't noticed yet. They fixed it for $350 before it caused interior damage. The inspector spent an hour examining everything and explained every finding. Professional, thorough, and genuinely helpful. Highly recommend for any Dallas homeowner.",
                name: "Maria S.",
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
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
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
              Read All Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white rounded-full px-8 py-3 mb-6">
            <span className="text-3xl font-bold text-white">100% FREE INSPECTION</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Schedule Your FREE Roof Inspection Today
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Get professional assessment of your Dallas roof's condition with no cost and no obligation. Most appointments available within 2-3 days.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            {[
              { number: "100% FREE", label: "No Cost Ever" },
              { number: "45-60 Min", label: "Comprehensive Inspection" },
              { number: "30+ Points", label: "Detailed Checklist" },
              { number: "Written Report", label: "With Photos" }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-green-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-16 px-10 bg-white text-green-700 hover:bg-green-50 font-bold text-xl shadow-2xl">
                <Calendar className="w-6 h-6 mr-2" />
                Schedule FREE Inspection
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white text-white hover:bg-white/10 font-bold text-xl" asChild>
              <a href="tel:+18502389727">
                <Phone className="w-6 h-6 mr-2" />
                Call (850) 238-9727
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
              "100% Free - No Hidden Costs",
              "No Obligation - No Pressure",
              "Licensed & Insured",
              "Honest Assessment Guaranteed"
            ].map((guarantee, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white font-medium">{guarantee}</span>
              </div>
            ))}
          </div>

          <p className="text-green-100">
            <strong>Monday-Friday 8am-6pm | Saturday 9am-3pm</strong><br />
            Same-week appointments typically available
          </p>
        </div>
      </section>
    </div>
  );
}