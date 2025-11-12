import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Phone, MapPin, CheckCircle, AlertTriangle, FileText, Shield, Star, ChevronRight, CloudRain } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StormDamage() {
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
            <span className="text-slate-900 font-medium">Storm Damage Repair</span>
          </div>
        </div>
      </nav>

      {/* Storm Alert Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <CloudRain className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold">⚠️ Recent Storm in Your Area?</h3>
                <p className="text-purple-100">
                  Schedule a FREE inspection to identify damage before it causes leaks. Most storm damage is covered by insurance.
                </p>
              </div>
            </div>
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 font-bold">
                Get FREE Storm Inspection
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Storm Damage Roof Repair in Dallas-Fort Worth
              </h1>
              <p className="text-xl text-purple-100 mb-6 leading-relaxed">
                Expert repair of hail damage, wind damage, and storm-related roofing issues. FREE storm damage inspection and insurance claims assistance throughout DFW.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "FREE Storm Inspection",
                  "Insurance Claims Help",
                  "Same-Week Service",
                  "All Storm Types"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("Booking")}>
                  <Button size="lg" className="h-14 px-8 bg-white text-purple-700 hover:bg-purple-50 text-lg font-bold w-full sm:w-auto shadow-2xl">
                    Schedule FREE Storm Inspection
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
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <CloudRain className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-lg font-medium">Hail-damaged roof shingles in Dallas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Professional Storm Damage Roof Repair in Dallas</h2>
          
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              Dallas-Fort Worth experiences some of the most severe weather in the United States. Spring and summer bring damaging hailstorms with stones up to golf-ball size. Powerful thunderstorms generate straight-line winds exceeding 70 mph. Occasional tornadoes cause catastrophic damage. All of these weather events can severely damage your roof, and that damage isn't always immediately visible from the ground.
            </p>
            <p>
              At Aroof, we've repaired thousands of storm-damaged roofs throughout DFW since 2010. We understand how Dallas storms damage roofs, how to properly document damage for insurance claims, and how to restore your roof to full protection. Our storm damage services include FREE comprehensive storm damage inspection, detailed documentation with photos for insurance, assistance with insurance claims process, emergency tarping if needed, complete repair or replacement as required, and working directly with insurance adjusters.
            </p>
            <p>
              Time is critical after storms—insurance companies require claims within 1 year of damage, and unrepaired storm damage voids manufacturer warranties. Small hail dents that seem minor can shorten your roof's lifespan by 10+ years. We provide honest assessments: if your damage is minor and doesn't warrant a claim, we'll tell you. If you need significant repairs or replacement covered by insurance, we'll help maximize your claim and restore your roof properly.
            </p>
          </div>
        </div>
      </section>

      {/* Types of Storm Damage */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Types of Storm Damage We Repair</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🧊",
                title: "Hail Damage",
                description: "Dallas hailstorms are notorious for roof damage. Hail creates dents in shingles that may not be obvious but compromise their protective layer. Even small hail (penny-size) can damage older roofs. Large hail (quarter-size or bigger) typically causes significant damage requiring replacement.",
                signs: [
                  "Dents or dimples in shingles",
                  "Cracked or split shingles",
                  "Exposed black asphalt where granules removed",
                  "Dented metal flashing, vents, or gutters",
                  "Damaged or cracked skylights",
                  "Dents in AC unit or metal components"
                ],
                action: "Inspect within days of hailstorm. Document for insurance claim even if not filing immediately."
              },
              {
                icon: "💨",
                title: "Wind Damage",
                description: "High winds during Dallas thunderstorms and tornadoes can lift, tear, or completely remove shingles. Wind damage often occurs in specific patterns—edges, ridges, and corners are most vulnerable. Even if most of your roof looks fine, missing shingles create entry points for water.",
                signs: [
                  "Missing shingles (check yard/gutters)",
                  "Lifted or creased shingle tabs",
                  "Torn or ripped shingles",
                  "Exposed underlayment or roof deck",
                  "Damaged or missing ridge caps",
                  "Debris from neighbor's roof"
                ],
                action: "Inspect immediately after high winds. Exposed areas need rapid repair to prevent water damage."
              },
              {
                icon: "🌳",
                title: "Tree & Debris Damage",
                description: "Dallas storms bring down tree limbs and debris that puncture roofs or cause impact damage. Even small branches falling repeatedly can wear away protective granules. Large limbs or entire trees can create catastrophic damage requiring emergency response and extensive repairs.",
                signs: [
                  "Punctures or holes in roof",
                  "Broken or cracked shingles from impact",
                  "Dented or damaged flashing",
                  "Granule loss from repeated branch contact",
                  "Scratches or scrapes on shingles",
                  "Structural damage from large trees"
                ],
                action: "Large tree damage is an emergency. Small impacts should be inspected to assess cumulative damage."
              },
              {
                icon: "🌧️",
                title: "Heavy Rain & Water Damage",
                description: "Dallas can receive 3-6 inches of rain in hours during severe storms. This overwhelms drainage systems and can exploit even small roof weaknesses. Prolonged saturation can cause underlayment failure, decking rot, and attic moisture problems.",
                signs: [
                  "Water stains on ceilings or walls",
                  "Active leaks during/after storms",
                  "Musty odors in attic",
                  "Mold or mildew growth",
                  "Sagging ceiling sections",
                  "Peeling paint near roof line"
                ],
                action: "Any water intrusion needs immediate inspection to identify source and prevent ongoing damage."
              },
              {
                icon: "⚡",
                title: "Lightning Strike Damage",
                description: "Direct lightning strikes to roofs or nearby trees can cause fire damage, explosive damage to shingles and decking, electrical system damage, and structural cracking. Even near-strikes can damage roofing materials through electrical surges.",
                signs: [
                  "Burned or charred shingles",
                  "Blown-out shingles in circular pattern",
                  "Cracked or split roof decking",
                  "Electrical system issues",
                  "Visible scorch marks",
                  "Hole or penetration in roof"
                ],
                action: "Immediate inspection for safety and structural integrity. Contact insurance immediately."
              },
              {
                icon: "❄️",
                title: "Ice Storm Damage",
                description: "While rare, Dallas ice storms cause significant damage. Heavy ice accumulation adds immense weight to roofs (up to 60 pounds per square foot). Ice dams can form at eaves, causing water backup under shingles and into the home.",
                signs: [
                  "Sagging or collapsed sections from weight",
                  "Cracked or broken shingles",
                  "Damaged or torn-off gutters",
                  "Water stains from ice dam backup",
                  "Loose or separated flashing",
                  "Structural stress indicators"
                ],
                action: "Inspect after ice melts to assess damage. Address any structural concerns immediately."
              }
            ].map((damage, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{damage.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{damage.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{damage.description}</p>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-purple-900 mb-2 text-sm">Signs of {damage.title}:</h4>
                    <div className="space-y-1">
                      {damage.signs.map((sign, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-purple-800">{sign}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-orange-900">Action Required: {damage.action}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Break */}
      <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Had Recent Storm Damage?</h3>
          <p className="text-xl mb-6">Get a FREE professional inspection to identify all damage and document for insurance</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-14 px-8 bg-white text-purple-600 hover:bg-purple-50 font-bold text-lg">
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

      {/* Insurance Claims Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Storm Damage Insurance Claims Assistance</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Navigating insurance claims can be overwhelming. We've worked with every major insurance company and know exactly how to document storm damage, what adjusters look for, and how to ensure you receive fair compensation.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "FREE Storm Damage Inspection",
                content: "We conduct a comprehensive inspection documenting every area of damage. We take extensive photos (50-100+ images) from multiple angles, note all affected areas with measurements, identify both obvious and hidden damage, and assess whether damage meets insurance claim thresholds. You receive a complete written report with photos organized for insurance submission."
              },
              {
                number: 2,
                title: "Damage Documentation Package",
                content: "We prepare a professional documentation package including annotated photos showing each area of damage, detailed written description of all issues, estimate of repair/replacement costs, affected square footage calculations, and comparison with similar storm claims. This package significantly strengthens your claim submission."
              },
              {
                number: 3,
                title: "Filing Your Claim",
                content: "You contact your insurance company to open a claim. Provide them with the date of storm damage and our inspection report. Request an adjuster visit. We can assist with this process, but as the policyholder, you must initiate the claim. Most insurance companies respond within 3-5 business days to schedule adjuster inspection."
              },
              {
                number: 4,
                title: "Adjuster Meeting",
                content: "We meet with your insurance adjuster on your property—this is critical. Adjusters often miss damage or minimize claims. Our presence ensures all damage is identified and documented. We point out issues the adjuster might overlook, provide technical expertise on damage assessment, explain why certain repairs are necessary, and ensure nothing is missed. Having a professional roofer present increases claim approval rates by 40% and average settlements by 20-30%."
              },
              {
                number: 5,
                title: "Claim Review & Negotiation",
                content: "After inspection, the adjuster sends an estimate. We review it line by line comparing against our assessment, identifying underestimated items or missed damage, and explaining any discrepancies. If the insurance estimate is inadequate, we help you negotiate by providing supplemental documentation and working toward fair settlement."
              },
              {
                number: 6,
                title: "Approved Repairs",
                content: "Once your claim is approved, we schedule repairs. You typically receive payment in two installments: initial payment (usually 50-75%) and final payment after work completion. We work with your insurance company's requirements and complete all repairs to code. All work is documented with photos for insurance records."
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-6 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-600 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
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

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl">Important Insurance Claim Information:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {[
                    { bold: "Time Limits:", text: "Most policies require claims within 1 year of damage. Don't delay!" },
                    { bold: "Deductible:", text: "You pay your deductible (typically $500-$2,500). Insurance covers the rest." },
                    { bold: "Depreciation:", text: "Initial payment may be depreciated. You receive full replacement cost after completion." },
                    { bold: "Claim Impact:", text: "Storm damage claims typically don't raise rates significantly" },
                    { bold: "Denied Claims:", text: "We can help you appeal with additional documentation" },
                    { bold: "Code Upgrades:", text: "Insurance usually covers bringing roof to current codes" }
                  ].map((info, idx) => (
                    <p key={idx} className="text-blue-900">
                      <strong>{info.bold}</strong> {info.text}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>
                <strong className="block mb-2">⚠️ Warning About Storm Chasers</strong>
                <p className="text-sm mb-2">
                  After major Dallas storms, out-of-state "storm chasers" flood neighborhoods offering free inspections. Many are unlicensed, uninsured, provide poor workmanship, and disappear after receiving insurance payments.
                </p>
                <p className="text-sm font-bold">
                  Protect yourself: Only work with local, licensed Dallas roofing companies. We've been serving DFW since 2010 and will be here long after your roof is repaired.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Storm Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Storm Damage Repair Costs</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Storm damage repair costs depend on extent and type of damage. Here's what Dallas homeowners typically see:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Minor Storm Damage",
                level: "Isolated areas affected",
                price: "$500 - $2,000",
                description: "Small sections of missing shingles, minor flashing damage, isolated hail dents. Usually repaired rather than replaced. May not meet insurance deductible.",
                featured: false
              },
              {
                title: "Moderate Storm Damage",
                level: "Multiple areas impacted",
                price: "$2,000 - $8,000",
                description: "Widespread shingle damage, significant flashing issues, multiple leak points, some structural concerns. Often partial replacement or extensive repair. Usually meets insurance deductible.",
                featured: false
              },
              {
                title: "Severe Storm Damage",
                level: "Full roof affected",
                price: "$8,000 - $25,000",
                description: "Extensive hail damage across entire roof, major wind damage, tree impact, or structural compromise. Typically requires complete roof replacement. Almost always covered by insurance minus deductible.",
                featured: true
              },
              {
                title: "Catastrophic Damage",
                level: "Severe structural damage",
                price: "$25,000+",
                description: "Tornado damage, large tree through roof, major structural collapse, or extensive interior water damage. Requires full replacement plus structural repairs. Fully covered by insurance (minus deductible).",
                featured: false
              }
            ].map((scenario, index) => (
              <Card key={index} className={`${scenario.featured ? 'border-4 border-purple-600 shadow-2xl' : 'border-2 border-slate-200 shadow-lg'} relative`}>
                {scenario.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                    MOST COMMON
                  </div>
                )}
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b text-center">
                  <CardTitle className="text-2xl text-slate-900 mb-2">{scenario.title}</CardTitle>
                  <div className="text-sm font-medium text-slate-600 mb-3">{scenario.level}</div>
                  <div className="text-4xl font-bold text-purple-600">{scenario.price}</div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700 leading-relaxed">{scenario.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">💰 Insurance Typically Covers:</h3>
              <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                Most homeowners insurance policies cover sudden storm damage including complete roof replacement if needed, emergency tarping, structural repairs, interior water damage restoration, code upgrade requirements, and debris removal. You pay only your deductible (typically $500-$2,500).
              </p>
              <div className="bg-white border-2 border-green-300 rounded-lg p-4">
                <p className="font-bold text-green-900">
                  Example: $18,000 storm damage repair with $1,500 deductible = You pay $1,500, insurance pays $16,500
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Storm Damage Repair Timeline</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Understanding the timeline from storm to completed repairs helps you plan:
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-blue-600"></div>
            
            <div className="space-y-8">
              {[
                { day: "Day 0", title: "Storm Event", description: "Storm damages your Dallas roof" },
                { day: "Days 1-7", title: "Initial Assessment", description: "Schedule and complete FREE storm damage inspection with Aroof. Receive detailed damage report with photos." },
                { day: "Days 1-3", title: "File Insurance Claim", description: "Contact your insurance company to open claim. Provide storm date and our inspection report." },
                { day: "Days 7-14", title: "Adjuster Inspection", description: "Insurance adjuster inspects property. Aroof representative meets with adjuster to ensure all damage documented." },
                { day: "Days 14-21", title: "Claim Approval", description: "Insurance company sends approval and estimate. We review and negotiate if needed." },
                { day: "Days 21-30", title: "Scheduling & Materials", description: "We order materials and schedule your repair/replacement (typically 1-2 weeks out)." },
                { day: "Days 30-35", title: "Repair/Replacement", description: "Complete roof repair (1-2 days) or replacement (2-4 days) depending on damage extent." },
                { day: "Days 35-40", title: "Final Insurance Payment", description: "Submit completion documentation to insurance for final payment (if applicable)." }
              ].map((item, index) => (
                <div key={index} className="relative pl-24">
                  <div className="absolute left-0 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <div className="bg-purple-100 border border-purple-300 rounded-lg px-3 py-1 inline-block mb-3">
                        <span className="font-bold text-purple-900">{item.day}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-700">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Alert className="bg-blue-50 border-blue-200 inline-block">
              <AlertDescription className="text-blue-900">
                <strong>Total Timeline:</strong> 4-6 weeks from storm to completed repairs. Delays can occur during peak storm season when many homes are damaged simultaneously.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Storm Damage Repair Throughout Dallas-Fort Worth</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Dallas County", cities: "Dallas, Plano, Irving, Garland, Grand Prairie, Mesquite, Richardson, Carrollton, Rowlett, DeSoto, Lancaster, Cedar Hill" },
              { title: "Tarrant County", cities: "Fort Worth, Arlington, Euless, Bedford, Hurst, Keller, Southlake, Colleyville, Grapevine, North Richland Hills, Mansfield" },
              { title: "Collin County", cities: "Plano, Frisco, McKinney, Allen, Wylie, Murphy, Prosper, Celina, The Colony" },
              { title: "Denton County", cities: "Denton, Lewisville, Flower Mound, Coppell, Highland Village, Little Elm" }
            ].map((county, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
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
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Storm Damage Customer Reviews</h2>
          
          <div className="space-y-6">
            {[
              {
                stars: 5,
                text: "After a major hailstorm hit Frisco, Aroof provided a FREE inspection that found damage we never would have seen from the ground. They met with our insurance adjuster, helped us get approved for full replacement, and completed the work perfectly. Insurance covered everything except our $1,500 deductible. Couldn't have navigated this without them!",
                name: "Patricia W.",
                location: "Frisco, TX"
              },
              {
                stars: 5,
                text: "Tornado touched down near our Dallas home causing significant roof damage. Aroof's emergency crew tarped everything same day, then handled the entire insurance process. They dealt with the adjuster, handled all paperwork, and rebuilt our roof in 3 days. Professional, honest, and genuinely helpful during a stressful time.",
                name: "Kevin H.",
                location: "Dallas, TX"
              },
              {
                stars: 5,
                text: "Wind storm blew off about 20 shingles. Aroof inspected, documented everything with photos, and worked with State Farm to get our claim approved. Repairs were completed in one day, matched our existing roof perfectly, and cost us only our $500 deductible. Local, trustworthy, and expert at insurance claims.",
                name: "Lisa M.",
                location: "Plano, TX"
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
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
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
                    <div className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                      ✓ Storm Damage Customer
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Schedule Your FREE Storm Damage Inspection
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Don't let storm damage go undetected. Get a professional inspection and proper documentation for your insurance claim—completely free, no obligation.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            {[
              { number: "100% FREE", label: "Storm Inspection" },
              { number: "Insurance", label: "Claims Help" },
              { number: "15+ Years", label: "Experience" },
              { number: "1,000+", label: "Claims Processed" }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-purple-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to={createPageUrl("Booking")}>
              <Button size="lg" className="h-16 px-10 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xl shadow-2xl">
                📅 Schedule FREE Storm Inspection
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white text-white hover:bg-white/10 font-bold text-xl" asChild>
              <a href="tel:+18502389727">
                <Phone className="w-6 h-6 mr-2" />
                Call (850) 238-9727
              </a>
            </Button>
            <Link to={createPageUrl("Insurance")}>
              <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white text-white hover:bg-white/10 font-bold text-xl">
                Learn About Insurance Claims
              </Button>
            </Link>
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "FREE Inspection & Documentation",
              "Insurance Claims Assistance",
              "Licensed & Insured",
              "Local Dallas Company Since 2010"
            ].map((guarantee, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">{guarantee}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}