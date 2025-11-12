import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Phone, MapPin, CheckCircle, AlertTriangle, Clock, Shield, Star, ChevronRight, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RoofRepair() {
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
            <a href="tel:+18502389727" className="flex items-center gap-2 text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
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
            <span className="text-slate-900 font-medium">Roof Repair</span>
          </div>
        </div>
      </nav>

      {/* Emergency Alert */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 sticky top-[73px] z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-bold text-lg">Have a Roof Emergency?</p>
                <p className="text-sm text-orange-100">24/7 emergency service • Same-day repairs available</p>
              </div>
            </div>
            <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 font-bold shadow-xl" asChild>
              <a href="tel:+18502389727">
                <Phone className="w-5 h-5 mr-2" />
                Call Now: (850) 238-9727
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Fast & Reliable Roof Repair in Dallas-Fort Worth
              </h1>
              <p className="text-xl text-slate-200 mb-6 leading-relaxed">
                Expert roof leak repair, storm damage restoration, and emergency roofing services. Same-day response available throughout DFW.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "Same-Day Service",
                  "Licensed & Insured",
                  "5-Year Warranty",
                  "24/7 Emergency"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("Booking")}>
                  <Button size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white text-lg w-full sm:w-auto">
                    Schedule Repair Now
                  </Button>
                </Link>
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-lg w-full sm:w-auto" asChild>
                  <a href="tel:+18502389727">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Emergency: (850) 238-9727
                  </a>
                </Button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2">
              <div className="aspect-[4/3] bg-gradient-to-br from-red-300 to-orange-300 rounded-xl flex items-center justify-center">
                <div className="text-center text-slate-700 p-8">
                  <Home className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-lg font-medium">Technician repairing roof leak in Dallas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Professional Roof Repair Services in Dallas</h2>
          
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              When your Dallas roof develops a leak or suffers storm damage, quick response prevents minor issues from becoming expensive disasters. At Aroof, we've been providing fast, reliable roof repair services throughout Dallas-Fort Worth since 2010, fixing over 3,000 roofs with same-day service available for emergencies.
            </p>
            <p>
              Our licensed roofing professionals handle all types of roof repairs including leak detection and repair, storm and hail damage restoration, missing or damaged shingle replacement, flashing repairs around chimneys and vents, valley repairs, and emergency tarping services. We work on all roofing materials—asphalt shingles, metal roofing, tile, flat roofs, and commercial systems.
            </p>
            <p>
              Every roof repair comes with our 5-year workmanship warranty and transparent upfront pricing. Most repairs are completed in one day, and we never recommend replacement unless truly necessary. Whether you're dealing with an active leak during a Dallas rainstorm or noticed damage after recent hail, our experienced crew responds quickly to protect your home and restore your roof's integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Common Repairs Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Common Roof Repairs We Handle in Dallas</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Texas weather is tough on roofs. Here are the most frequent roof repair issues we fix for DFW homeowners:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "💧",
                title: "Roof Leak Repair",
                price: "Starting at $300",
                description: "Roof leaks rarely fix themselves—they only get worse. We use advanced leak detection to find the exact source (often not where water appears inside), then provide permanent repairs. Common leak sources include damaged flashing, cracked shingles, worn pipe boots, valley issues, and compromised penetrations.",
                features: [
                  "Thermal imaging leak detection",
                  "Interior and exterior inspection",
                  "Permanent waterproof repairs",
                  "Same-day service available"
                ]
              },
              {
                icon: "🌪️",
                title: "Storm & Hail Damage",
                price: "Starting at $500",
                description: "Dallas experiences severe storms with high winds and hail that damage roofs. We provide rapid storm damage assessment, document damage for insurance claims, perform emergency repairs or tarping, and complete permanent restoration.",
                features: [
                  "Free storm damage inspection",
                  "Insurance documentation",
                  "Emergency tarping service",
                  "Meet with adjusters"
                ]
              },
              {
                icon: "📐",
                title: "Missing Shingles",
                price: "Starting at $250",
                description: "Wind can lift and remove shingles, leaving your roof vulnerable to water damage. We replace missing shingles with matching materials, repair wind-damaged areas, secure loose shingles, and seal exposed nail holes.",
                features: [
                  "Color-matched replacement",
                  "Secure loose shingles",
                  "Seal exposed areas",
                  "Prevent further damage"
                ]
              },
              {
                icon: "🔥",
                title: "Flashing Repairs",
                price: "Starting at $350",
                description: "Flashing around chimneys, vents, skylights, and valleys is the most common source of roof leaks. We replace deteriorated flashing, reseal separated joints, repair rust holes, and install proper step flashing where missing.",
                features: [
                  "Chimney flashing repair",
                  "Vent pipe boot replacement",
                  "Valley flashing restoration",
                  "Skylight resealing"
                ]
              },
              {
                icon: "🏚️",
                title: "Sagging Sections",
                price: "Starting at $800",
                description: "A sagging roof indicates structural damage requiring immediate attention. We assess the extent of damage, replace compromised roof decking, repair or reinforce rafters/trusses if needed, and restore proper roof structure.",
                features: [
                  "Structural assessment",
                  "Decking replacement",
                  "Rafter/truss repair",
                  "Safety-focused approach"
                ]
              },
              {
                icon: "🌊",
                title: "Valley Repairs",
                price: "Starting at $450",
                description: "Roof valleys channel large volumes of water and are prone to wear and damage. We repair or replace valley flashing, reseal valley joints, address shingle deterioration, and ensure proper water flow.",
                features: [
                  "Valley flashing replacement",
                  "Proper water channeling",
                  "Ice & water shield",
                  "Long-lasting waterproofing"
                ]
              },
              {
                icon: "❄️",
                title: "Ice Dam Damage",
                price: "Starting at $400",
                description: "While rare in Dallas, ice storms do occur and can cause ice dam damage. We repair water damage from ice dams, improve attic ventilation to prevent future issues, and install ice & water shield protection.",
                features: [
                  "Water damage restoration",
                  "Ventilation improvements",
                  "Preventive measures",
                  "Insulation assessment"
                ]
              },
              {
                icon: "🦝",
                title: "Animal Damage",
                price: "Starting at $350",
                description: "Squirrels, raccoons, and birds can damage roofs seeking entry to attics. We repair holes and entry points, install protective screening or covers, address chewed fascia or soffits, and seal penetrations.",
                features: [
                  "Hole and damage repair",
                  "Entry point sealing",
                  "Protective screening",
                  "Prevention solutions"
                ]
              }
            ].map((repair, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{repair.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{repair.title}</h3>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
                    <p className="text-sm font-bold text-green-900">{repair.price}</p>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{repair.description}</p>
                  <div className="space-y-1">
                    {repair.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Break */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Need Roof Repair Today?</h3>
          <p className="text-xl mb-6">We offer same-day service for urgent repairs throughout Dallas-Fort Worth</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-slate-50 font-bold text-lg">
                Schedule Repair
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

      {/* Warning Signs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Warning Signs Your Dallas Roof Needs Repair</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Don't wait for a major leak to address roof problems. Watch for these warning signs that indicate your roof needs professional repair:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              {
                title: "🏠 Interior Warning Signs",
                signs: [
                  { bold: "Water stains on ceilings or walls", text: "- Brown or yellow discoloration indicates active or past leaks" },
                  { bold: "Dripping water during rain", text: "- Active leaks require immediate repair" },
                  { bold: "Musty odors in attic", text: "- Indicates moisture problems from roof leaks" },
                  { bold: "Peeling paint near roof line", text: "- Suggests moisture infiltration" },
                  { bold: "Visible daylight through roof boards", text: "- Serious structural issues" },
                  { bold: "Sagging ceiling sections", text: "- Water damage to drywall/structure" }
                ]
              },
              {
                title: "🔍 Exterior Warning Signs",
                signs: [
                  { bold: "Missing or damaged shingles", text: "- Especially after Dallas storms" },
                  { bold: "Curling or buckling shingles", text: "- Indicates age or poor ventilation" },
                  { bold: "Cracked or broken shingles", text: "- Allows water penetration" },
                  { bold: "Granules in gutters", text: "- Excessive loss means deteriorating shingles" },
                  { bold: "Damaged flashing", text: "- Rust, gaps, or separation around penetrations" },
                  { bold: "Sagging roof sections", text: "- Structural damage requiring immediate attention" },
                  { bold: "Moss or algae growth", text: "- Can trap moisture and damage shingles" }
                ]
              },
              {
                title: "⚠️ Storm Damage Indicators",
                signs: [
                  { bold: "Dented or dinged shingles", text: "- Hail impact damage" },
                  { bold: "Shingle granule loss", text: "- Reveals black asphalt underneath" },
                  { bold: "Cracked or split shingles", text: "- Wind or impact damage" },
                  { bold: "Lifted shingle tabs", text: "- High winds breaking seal strips" },
                  { bold: "Damaged roof vents", text: "- Bent or broken components" },
                  { bold: "Dented metal flashing", text: "- Hail impact on valleys, ridges" }
                ]
              },
              {
                title: "🌡️ Performance Issues",
                signs: [
                  { bold: "Higher energy bills", text: "- Poor roof condition affects insulation" },
                  { bold: "Uneven heating/cooling", text: "- Air leakage through roof damage" },
                  { bold: "Ice dams in winter", text: "- Ventilation or insulation problems" },
                  { bold: "Excessive attic heat", text: "- Ventilation issues need addressing" }
                ]
              }
            ].map((category, index) => (
              <Card key={index} className="border-l-4 border-l-orange-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {category.signs.map((sign, idx) => (
                      <p key={idx} className="text-sm text-slate-700">
                        <strong>{sign.bold}</strong> {sign.text}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-900">
              <strong>⚠️ Don't Wait:</strong> Small roof problems become expensive disasters quickly in Dallas's weather. A $300 repair today prevents a $10,000+ replacement tomorrow. Schedule a free inspection at first signs of trouble.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Repair Process */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Roof Repair Process</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We follow a systematic approach to ensure your roof repair is done right the first time:
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "Emergency Response & Inspection",
                content: "For urgent repairs, we respond within 2-4 hours during business hours. Our licensed technician conducts a thorough roof inspection from both inside (attic) and outside to identify all damage, not just visible symptoms. We use thermal imaging for hidden leak detection when needed. You receive photos and a detailed assessment of all issues found."
              },
              {
                number: 2,
                title: "Transparent Estimate",
                content: "We provide a detailed written estimate explaining exactly what needs repair, why it's necessary, and itemized pricing. No hidden fees or surprise charges. We offer options when available (economy vs. premium materials) and never pressure you into unnecessary work. If insurance may cover damage, we help document for your claim."
              },
              {
                number: 3,
                title: "Fast Scheduling",
                content: "Most repairs are scheduled within 24-48 hours. Emergency repairs (active leaks, exposed areas) are prioritized for same-day or next-day service. We work around your schedule and provide accurate arrival windows. Weather permitting, we begin work as scheduled—no last-minute cancellations."
              },
              {
                number: 4,
                title: "Quality Repair Work",
                content: "Our experienced technicians use premium materials that match your existing roof. We don't just patch—we identify and fix root causes. All work exceeds manufacturer specifications and Dallas building codes. We protect your property during work and clean up thoroughly afterward. Most repairs are completed in 2-4 hours."
              },
              {
                number: 5,
                title: "Quality Check & Warranty",
                content: "After completion, we perform a quality inspection and water test if applicable. We document all work with photos for your records. Every repair includes our 5-year workmanship warranty covering both materials and labor. We follow up after the next rain to ensure the repair is performing as expected."
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

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Roof Repair Cost in Dallas: What to Expect</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Roof repair costs vary based on damage extent, materials needed, and accessibility. Here's what Dallas homeowners typically invest for common repairs:
            </p>
          </div>

          <Card className="shadow-xl mb-8">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200">
                {[
                  { repair: "Minor Leak Repair (single source)", price: "$250 - $500" },
                  { repair: "Flashing Repair/Replacement", price: "$350 - $800" },
                  { repair: "Missing Shingle Replacement (5-10 shingles)", price: "$250 - $450" },
                  { repair: "Valley Repair", price: "$450 - $900" },
                  { repair: "Vent Boot/Pipe Flashing Replacement", price: "$200 - $400" },
                  { repair: "Storm Damage Repair (moderate)", price: "$500 - $2,000" },
                  { repair: "Sagging Roof Section Repair", price: "$800 - $3,000" },
                  { repair: "Emergency Tarping Service", price: "$300 - $600" }
                ].map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                    <span className="font-medium text-slate-900">{item.repair}</span>
                    <span className="text-lg font-bold text-green-600">{item.price}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-200 mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Factors Affecting Roof Repair Cost:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Damage Extent:", text: "Small isolated damage costs less than widespread issues" },
                { title: "Roof Accessibility:", text: "Steep pitch or multi-story adds labor complexity" },
                { title: "Materials Needed:", text: "Specialty materials or discontinued shingles cost more" },
                { title: "Emergency Service:", text: "After-hours or urgent repairs may include premium" },
                { title: "Hidden Damage:", text: "Discovering structural issues during repair adds cost" },
                { title: "Location on Roof:", text: "Hard-to-reach areas require more time/safety equipment" }
              ].map((factor, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-700">
                    <strong className="text-slate-900">{factor.title}</strong> {factor.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">📋 FREE Roof Inspection & Estimate</h3>
              <p className="text-lg text-slate-700 mb-6 max-w-2xl mx-auto">
                We provide free detailed inspections and written estimates for all roof repairs. No obligation, no pressure—just honest assessment and fair pricing.
              </p>
              <Link to={createPageUrl("Booking")}>
                <Button size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-lg">
                  Schedule Free Inspection
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Repair vs Replace */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Roof Repair vs. Replacement: When to Choose Each</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Not sure if your roof needs repair or full replacement? Here's how we help Dallas homeowners make the right decision:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="border-4 border-green-500 shadow-xl">
              <CardHeader className="bg-gradient-to-br from-green-50 to-green-100 border-b">
                <CardTitle className="text-2xl text-green-900 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Repair Makes Sense When:
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    "Roof is less than 15 years old",
                    "Damage is localized to small area",
                    "Most of roof is in good condition",
                    "Leak source is identifiable and fixable",
                    "Storm damage to limited section",
                    "Missing shingles from isolated wind damage",
                    "Flashing issues around penetrations",
                    "Budget requires phased approach"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <p className="font-bold text-green-900">Typical Investment: $250 - $3,000</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-red-500 shadow-xl">
              <CardHeader className="bg-gradient-to-br from-red-50 to-red-100 border-b">
                <CardTitle className="text-2xl text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Replacement Better When:
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    "Roof is 20+ years old",
                    "Widespread shingle deterioration",
                    "Multiple leak locations",
                    "Extensive storm damage (30%+ of roof)",
                    "Sagging or structural issues",
                    "Previous repairs failed repeatedly",
                    "Selling home soon (buyers expect new roof)",
                    "Energy bills increasing significantly"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-red-100 rounded-lg">
                  <p className="font-bold text-red-900">Typical Investment: $7,000 - $25,000</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Our Promise:</strong> We never recommend replacement unless it's truly the best option. Many Dallas roofers push expensive replacements for simple repairs. We earn your trust by doing what's right, not what's most profitable. If repair extends your roof's life by 5-10 years for a fraction of replacement cost, we'll recommend repair every time.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">24/7 Emergency Roof Repair in Dallas</h2>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Roof emergencies don't wait for business hours. We offer 24/7 emergency response for:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: "🌧️", title: "Active Leaks", text: "Water pouring into your home during rainstorms requires immediate response. We'll stop the water intrusion and prevent interior damage." },
              { icon: "🌪️", title: "Storm Damage", text: "After severe Dallas storms, missing shingles or damaged areas need emergency tarping and temporary weatherproofing until permanent repairs." },
              { icon: "🌳", title: "Tree Damage", text: "Fallen trees or large branches that puncture roofs create urgent safety and water intrusion issues requiring immediate professional attention." },
              { icon: "🔥", title: "Fire Damage", text: "Fire damage to roofing systems requires emergency securing and weatherproofing to prevent additional weather-related damage." }
            ].map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-red-100 leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center">Our Emergency Response Times:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Business Hours", time: "2-4 hour response", subtitle: "Mon-Fri 8am-6pm, Sat 9am-3pm" },
                { title: "After Hours/Weekends", time: "4-6 hour response", subtitle: "Evenings and weekends" },
                { title: "Overnight", time: "Next morning response", subtitle: "Late night emergencies" }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl font-bold mb-2">{item.time}</div>
                  <div className="text-lg font-semibold mb-1">{item.title}</div>
                  <div className="text-sm text-red-200">{item.subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold mb-6">🚨 Roof Emergency Right Now?</h3>
            <Button size="lg" className="h-20 px-12 bg-white text-red-600 hover:bg-red-50 font-bold text-2xl shadow-2xl" asChild>
              <a href="tel:+18502389727">
                <Phone className="w-8 h-8 mr-3" />
                Call Emergency Line: (850) 238-9727
              </a>
            </Button>
            <p className="text-red-100 mt-4 text-lg">Available 24/7 for emergencies throughout Dallas-Fort Worth</p>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6 text-center">Roof Repair Services Throughout Dallas-Fort Worth</h2>
          <p className="text-lg text-slate-700 mb-12 max-w-4xl mx-auto text-center leading-relaxed">
            Fast response roof repair services available throughout the entire DFW metroplex. As a local Dallas company, we reach most locations within 30-45 minutes for emergency repairs.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Dallas County", cities: "Dallas, Plano, Irving, Garland, Grand Prairie, Mesquite, Richardson, Carrollton, Rowlett, DeSoto, Lancaster, Cedar Hill, Duncanville, Farmers Branch" },
              { title: "Tarrant County", cities: "Fort Worth, Arlington, Euless, Bedford, Hurst, Keller, Southlake, Colleyville, Grapevine, North Richland Hills, Mansfield, Burleson" },
              { title: "Collin County", cities: "Plano, Frisco, McKinney, Allen, Wylie, Murphy, Prosper, Celina, The Colony, Little Elm" },
              { title: "Denton County", cities: "Denton, Lewisville, Flower Mound, Coppell, Highland Village, Corinth, Lake Dallas" }
            ].map((county, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
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
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">What Dallas Homeowners Say About Our Roof Repairs</h2>
          
          <div className="space-y-6">
            {[
              {
                stars: 5,
                text: "Had a leak during heavy rain at 11pm. Called Aroof's emergency line and they had someone out by 8am the next morning. Found and fixed the issue (bad flashing) in under 2 hours. Price was exactly what they quoted—no surprises. It's been 6 months and zero issues. Highly recommend for Dallas roof repairs!",
                name: "David R.",
                location: "Richardson, TX"
              },
              {
                stars: 5,
                text: "After a hailstorm, we had several roofers tell us we needed full replacement ($18,000). Aroof came out, honestly assessed the damage, and said repair would work fine ($1,200). They were right—roof has been perfect for 2 years since. This is the kind of honesty that earns lifetime customers.",
                name: "Amanda S.",
                location: "Frisco, TX"
              },
              {
                stars: 5,
                text: "Missing shingles after windstorm. Aroof came same day, replaced all damaged shingles and did a full inspection finding a couple other small issues we didn't know about. Fixed everything in one visit. Fair pricing, professional crew, and they cleaned up perfectly. This is our go-to roofer now.",
                name: "Robert M.",
                location: "Dallas, TX"
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
              Read All Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Need Roof Repair in Dallas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Don't let small problems become expensive disasters. Get expert roof repair with same-day service available.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            {[
              { number: "3,000+", label: "Repairs Completed" },
              { number: "2-4 Hours", label: "Emergency Response" },
              { number: "5-Year", label: "Repair Warranty" },
              { number: "4.9/5", label: "Star Rating" }
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
                📅 Schedule Repair Now
              </Button>
            </Link>
            <Button size="lg" className="h-16 px-10 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xl shadow-2xl" asChild>
              <a href="tel:+18502389727">
                🚨 Emergency: (850) 238-9727
              </a>
            </Button>
            <Link to={createPageUrl("FormPage")}>
              <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white text-white hover:bg-white/10 font-bold text-xl">
                📏 Get Free Roof Measurement
              </Button>
            </Link>
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {[
              "Same-Day Service Available",
              "5-Year Warranty",
              "Licensed & Insured",
              "Transparent Pricing"
            ].map((guarantee, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">{guarantee}</span>
              </div>
            ))}
          </div>

          <p className="text-blue-200">
            <strong>Business Hours: Monday-Friday 8am-6pm, Saturday 9am-3pm</strong><br />
            24/7 Emergency Service Available
          </p>
        </div>
      </section>
    </div>
  );
}