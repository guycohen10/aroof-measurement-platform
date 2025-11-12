import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Phone, MapPin, CheckCircle, AlertTriangle, Clock, Shield, Star, ChevronRight, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EmergencyRoofing() {
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
            <a href="tel:+18502389727" className="flex items-center gap-2 text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all animate-pulse">
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
            <span className="text-slate-900 font-medium">Emergency Roofing</span>
          </div>
        </div>
      </nav>

      {/* Emergency Alert - Sticky */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white py-6 sticky top-[73px] z-40 shadow-2xl border-b-4 border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
              <h2 className="text-3xl font-bold">🚨 Have a Roof Emergency Right Now?</h2>
            </div>
            <p className="text-xl mb-4">Don't wait—active leaks and storm damage worsen quickly. Call our emergency line immediately for rapid response.</p>
            <Button size="lg" className="h-16 px-12 bg-white text-red-600 hover:bg-red-50 font-bold text-2xl shadow-2xl mb-2" asChild>
              <a href="tel:+18502389727">
                CALL NOW: (850) 238-9727
              </a>
            </Button>
            <p className="text-red-100 font-semibold">Available 24/7/365 - Including Weekends & Holidays</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-red-600 text-white px-6 py-3 rounded-full text-xl font-bold mb-6 animate-pulse border-2 border-white">
                🚨 24/7 EMERGENCY SERVICE
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Emergency Roof Repair in Dallas-Fort Worth
              </h1>
              <p className="text-xl text-slate-200 mb-6 leading-relaxed">
                Immediate response to roof emergencies. Active leaks, storm damage, and urgent repairs. Available 24 hours a day, 7 days a week throughout DFW.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "24/7 Available",
                  "2-4 Hour Response",
                  "Licensed & Insured",
                  "Emergency Tarping"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 mb-6">
                <Button size="lg" className="h-16 px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-2xl font-bold shadow-2xl" asChild>
                  <a href="tel:+18502389727">
                    🚨 EMERGENCY: (850) 238-9727
                  </a>
                </Button>
                <Link to={createPageUrl("Booking")}>
                  <Button size="lg" variant="outline" className="h-12 w-full border-2 border-white text-white hover:bg-white/10 text-lg">
                    Schedule Non-Emergency Service
                  </Button>
                </Link>
              </div>

              <div className="bg-orange-600/30 backdrop-blur-sm rounded-lg p-4 border border-orange-400">
                <p className="text-orange-100">
                  <strong className="text-white">⏰ Average Response Time:</strong> 2-4 hours during business hours | 4-6 hours after hours
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2">
              <div className="aspect-[4/3] bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Zap className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-lg font-medium">Emergency crew tarping damaged roof at night</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">24/7 Emergency Roofing Services in Dallas</h2>
          
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              Roof emergencies don't wait for business hours. When disaster strikes—whether it's an active leak during a Dallas thunderstorm, severe storm damage, fallen tree puncturing your roof, or sudden structural failure—you need immediate professional help. At Aroof, we've provided 24/7 emergency roofing services throughout Dallas-Fort Worth since 2010, responding to hundreds of urgent situations with fast, effective solutions.
            </p>
            <p>
              Our emergency roofing team is on call around the clock to handle urgent situations including active roof leaks with water entering your home, storm damage requiring immediate weatherproofing, emergency tarping to prevent further damage, fallen tree or debris removal and temporary repairs, fire or accident damage to roofing systems, and structural issues requiring immediate attention. We understand that roof emergencies create stress and potential property damage—our goal is rapid response to stop the problem and protect your Dallas home.
            </p>
            <p>
              Every emergency call receives immediate attention. We dispatch licensed professionals equipped with emergency supplies, tarps, and tools needed for temporary repairs and weatherproofing. Once your home is secured, we provide a complete damage assessment and plan for permanent repairs. All emergency work is backed by our 5-year warranty and performed by experienced technicians, even at 2am on a Sunday.
            </p>
          </div>
        </div>
      </section>

      {/* What Qualifies as Emergency */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Qualifies as a Roofing Emergency?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Not sure if your situation requires emergency service? Here are the scenarios that warrant immediate professional response:
            </p>
          </div>

          <div className="space-y-6">
            {/* Critical */}
            <Card className="border-4 border-red-600 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-red-900">Critical Emergencies</CardTitle>
                  <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                    CALL IMMEDIATELY
                  </div>
                </div>
                <p className="text-red-700 font-semibold mt-2">2-4 Hour Response Time</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    { bold: "Active water leaking into living spaces", text: "- Water pouring through ceiling during rain requires immediate response" },
                    { bold: "Major storm damage with exposed interior", text: "- Missing large sections of roof exposing attic/rooms to weather" },
                    { bold: "Structural collapse or severe sagging", text: "- Immediate safety hazard requiring urgent stabilization" },
                    { bold: "Fallen tree through roof", text: "- Punctured roof with structural damage and weather exposure" },
                    { bold: "Fire damage to roofing system", text: "- Fire-damaged roof needing emergency weatherproofing" },
                    { bold: "Severe hail/wind damage during storm", text: "- Multiple areas compromised requiring emergency tarping" }
                  ].map((item, idx) => (
                    <p key={idx} className="text-slate-700">
                      <strong className="text-red-900">{item.bold}</strong> {item.text}
                    </p>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="font-bold text-red-900">Action: Call emergency line immediately. Don't wait.</p>
                </div>
              </CardContent>
            </Card>

            {/* Urgent */}
            <Card className="border-4 border-orange-500 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-orange-900">Urgent Issues</CardTitle>
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                    SAME/NEXT DAY
                  </div>
                </div>
                <p className="text-orange-700 font-semibold mt-2">4-24 Hour Response Time</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    { bold: "Significant leak in attic (not yet in rooms)", text: "- Active leak requiring prompt attention before spreading" },
                    { bold: "Missing shingles with exposed underlayment", text: "- Weather exposure that will cause damage with next rain" },
                    { bold: "Damaged flashing around chimney", text: "- Compromised waterproofing needing quick repair" },
                    { bold: "Broken or dislodged roof vent", text: "- Opening allowing water/pest entry" },
                    { bold: "Separated valley flashing", text: "- Major water channeling area compromised" },
                    { bold: "Post-storm damage assessment needed", text: "- Recent storm requiring inspection and potential repairs" }
                  ].map((item, idx) => (
                    <p key={idx} className="text-slate-700">
                      <strong className="text-orange-900">{item.bold}</strong> {item.text}
                    </p>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-orange-100 border border-orange-300 rounded-lg">
                  <p className="font-bold text-orange-900">Action: Call during business hours or leave after-hours message for next-day response.</p>
                </div>
              </CardContent>
            </Card>

            {/* Standard */}
            <Card className="border-2 border-slate-300 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-slate-900">Non-Emergency Issues</CardTitle>
                  <div className="bg-slate-600 text-white px-4 py-2 rounded-full font-bold text-sm">
                    SCHEDULE NORMALLY
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {[
                    "Small leak only visible in heavy rain (no active dripping)",
                    "Minor shingle damage in isolated area",
                    "Moss or algae growth concerns",
                    "General maintenance needs",
                    "Preventive inspection requests",
                    "Gutter issues without active leaking"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-bold text-blue-900">
                    Action: <Link to={createPageUrl("Booking")} className="underline hover:text-blue-700">Schedule regular service appointment</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Emergency Response Process</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              When you call our emergency line, here's exactly what happens:
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "Immediate Call Answer (Within 2 Rings)",
                content: "Our emergency line is answered by a real person 24/7—never voicemail. You'll speak with someone who can immediately dispatch help. We gather essential information: nature of emergency, your location, safety concerns, and contact details. If you're in immediate danger, we advise calling 911 first, then us.",
                timeline: "Time: 2-3 minutes"
              },
              {
                number: 2,
                title: "Rapid Dispatch & En Route",
                content: "Within 15 minutes of your call, a licensed emergency technician is dispatched to your Dallas location. They're equipped with emergency tarps, temporary repair materials, safety equipment, and diagnostic tools. You'll receive a text with technician name, photo, estimated arrival time, and direct phone number.",
                timeline: "Arrival Time: 2-4 hours business hours | 4-6 hours after hours"
              },
              {
                number: 3,
                title: "Emergency Assessment",
                content: "Upon arrival, our technician conducts a rapid safety and damage assessment. First priority is identifying and stopping active water intrusion. We assess structural safety, extent of damage, immediate risks, and best temporary solution. You'll receive honest communication about what needs to happen immediately vs. what can wait.",
                timeline: "Time: 15-30 minutes"
              },
              {
                number: 4,
                title: "Emergency Repairs & Weatherproofing",
                content: "We implement immediate solutions to stop damage and secure your home. This includes emergency tarping of exposed areas, temporary patching of leaks, structural stabilization if needed, water diversion, and debris removal/securing. Our goal is protecting your property until permanent repairs can be completed during normal hours.",
                timeline: "Time: 1-3 hours depending on damage extent"
              },
              {
                number: 5,
                title: "Documentation & Next Steps",
                content: "After securing your home, we document all damage with photos for your records and insurance. You receive a detailed written assessment, emergency work performed, estimated cost for permanent repairs, and next steps/timeline. We schedule follow-up inspection and permanent repairs at your convenience. All documentation is insurance-claim ready.",
                timeline: "Time: 20-30 minutes"
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-6 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border-l-4 border-red-600 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-700 leading-relaxed mb-3">{step.content}</p>
                  <div className="bg-white border border-red-200 rounded px-3 py-2 inline-block">
                    <p className="text-sm font-bold text-red-900">{step.timeline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Alert className="mt-8 bg-green-50 border-green-200">
            <Shield className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Our Emergency Response Guarantee:</strong> If we tell you we'll be there in 4 hours and arrive in 5, your emergency tarping service is free. We take our response commitments seriously because we understand the stress and urgency of roof emergencies.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Emergency Services List */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Emergency Roofing Services We Provide</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🏠", title: "Emergency Tarping", description: "Heavy-duty tarp installation to protect exposed roof areas and prevent water damage until permanent repairs possible", price: "$300-600" },
              { icon: "💧", title: "Active Leak Repair", description: "Immediate leak location and temporary/permanent repair to stop water intrusion into your home", price: "$400-800" },
              { icon: "🌳", title: "Tree Damage Response", description: "Tree/debris removal, structural assessment, temporary repairs, and securing of damaged areas", price: "$800-2,000" },
              { icon: "🏗️", title: "Structural Stabilization", description: "Emergency shoring and support for compromised roof structures to prevent collapse", price: "$1,000+" },
              { icon: "🌪️", title: "Storm Damage Securing", description: "Securing loose materials, temporary repairs, waterproofing, and damage documentation", price: "$500-1,500" },
              { icon: "🔥", title: "Fire Damage Weatherproofing", description: "Emergency securing of fire-damaged roofing to prevent weather-related secondary damage", price: "$600-1,200" }
            ].map((service, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{service.description}</p>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg px-3 py-2">
                    <p className="text-sm font-bold text-green-900">Starting at {service.price}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Emergency Roofing Service Costs</h2>
          <p className="text-lg text-slate-700 mb-12 leading-relaxed">
            Emergency roofing services include premium charges for after-hours availability and immediate response. Here's what Dallas homeowners can expect:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              { title: "Emergency Service Call Fee", price: "$150-250", description: "Covers dispatch, travel, and initial assessment. Applied toward repair cost if you proceed with work." },
              { title: "After-Hours Premium", price: "1.5x - 2x rates", description: "Weeknights after 6pm, weekends, and holidays include premium for emergency availability." },
              { title: "Emergency Tarping", price: "$300-600", description: "Professional tarping with heavy-duty materials to protect your home until permanent repairs." },
              { title: "Temporary Repairs", price: "$400-1,500", description: "Immediate repairs to stop damage, stabilize structures, and weatherproof affected areas." }
            ].map((item, index) => (
              <Card key={index} className="border-2 border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b">
                  <CardTitle className="text-xl text-slate-900">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-red-600 mb-3">{item.price}</div>
                  <p className="text-slate-700">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Insurance Coverage:</strong> Most emergency roofing services are covered by homeowners insurance when related to storm damage or sudden emergencies. We provide detailed documentation for your claim and can work directly with your insurance company.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* What to Do */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">What To Do During a Roofing Emergency</h2>
          <p className="text-xl text-slate-600 mb-12 text-center max-w-3xl mx-auto">
            While waiting for emergency roofing service, take these steps to minimize damage and ensure safety:
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                number: "1",
                title: "Ensure Safety First",
                items: [
                  "Move family/pets away from affected area",
                  "Avoid standing water near electrical outlets",
                  "Don't go on roof in storms or if unstable",
                  "If structural collapse risk, evacuate and call 911"
                ]
              },
              {
                number: "2",
                title: "Contain Water Damage",
                items: [
                  "Place buckets under active leaks",
                  "Move furniture/valuables from affected rooms",
                  "Use towels to soak up standing water",
                  "Place tarps over belongings if needed"
                ]
              },
              {
                number: "3",
                title: "Document Everything",
                items: [
                  "Take photos/videos of all damage",
                  "Document water intrusion locations",
                  "Note time damage occurred",
                  "Keep records for insurance claim"
                ]
              },
              {
                number: "4",
                title: "Call Emergency Line",
                items: [
                  "Contact Aroof: (850) 238-9727",
                  "Describe situation clearly",
                  "Provide location and contact info",
                  "Ask about estimated arrival time"
                ]
              }
            ].map((step, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-br from-red-600 to-orange-600 text-white">
                  <div className="text-4xl font-bold mb-2">{step.number}</div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {step.items.map((item, idx) => (
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

          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription>
              <strong>❌ DON'T Do These Things:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Don't attempt roof access in storms or if unsafe</li>
                <li>• Don't try DIY repairs in dangerous conditions</li>
                <li>• Don't ignore structural warning signs (sagging, cracking sounds)</li>
                <li>• Don't delay calling professionals—damage worsens quickly</li>
                <li>• Don't accept offers from storm chasers who knock on your door</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Service Area with Response Times */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">24/7 Emergency Roofing Throughout DFW</h2>
          <p className="text-xl text-slate-600 mb-12 text-center max-w-3xl mx-auto">
            Our emergency roofing crews serve the entire Dallas-Fort Worth metroplex with rapid response times:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Central Dallas/Fort Worth", time: "2-3 hours", cities: "Dallas, Fort Worth, Arlington, Irving, Grand Prairie" },
              { title: "Northern Suburbs", time: "2-4 hours", cities: "Plano, Frisco, McKinney, Allen, Richardson, Carrollton" },
              { title: "Eastern Areas", time: "3-4 hours", cities: "Garland, Mesquite, Rockwall, Rowlett" },
              { title: "Western/Southern Areas", time: "3-5 hours", cities: "Mansfield, Burleson, DeSoto, Cedar Hill, Duncanville" }
            ].map((area, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-br from-red-600 to-orange-600 text-white">
                  <CardTitle className="text-xl">{area.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-bold">Average Response: {area.time}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700">{area.cities}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Emergency Service Reviews</h2>
          
          <div className="space-y-6">
            {[
              {
                stars: 5,
                text: "Called Aroof at 11pm during a terrible storm with water pouring through our bedroom ceiling. They answered immediately, arrived by 2am, and had our roof tarped within an hour. The technician was professional, explained everything, and calmed us down during a stressful situation. This is what emergency service should be!",
                name: "Rachel B.",
                location: "Plano, TX"
              },
              {
                stars: 5,
                text: "Tree fell on our roof during a Saturday night storm. Aroof's emergency crew was there within 3 hours, even on a weekend. They secured everything, removed the tree branches safely, and tarped the damaged area. Permanent repairs were done Monday. Responsive, professional, and fairly priced even for emergency service.",
                name: "James L.",
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
                      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center">
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
                    <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                      ✓ Emergency Customer
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
      <section className="py-20 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS3OS00LTQtNC00IDEuNzktNCA0em0tNiAwYzAgMi4yMSAxLjc5IDQgNCA0czQtMS43OSA0LTQtMS43OS00LTQtNC00IDEuNzktNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white rounded-full px-8 py-3 mb-6 animate-pulse">
            <span className="text-3xl font-bold text-white">🚨 EMERGENCY SERVICE AVAILABLE NOW</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Need Emergency Roofing Help Right Now?
          </h2>
          <p className="text-2xl text-orange-100 mb-8">
            Don't wait—every minute counts during a roofing emergency
          </p>

          <Button size="lg" className="h-24 px-16 bg-white text-red-600 hover:bg-red-50 font-bold text-3xl shadow-2xl mb-8" asChild>
            <a href="tel:+18502389727">
              CALL EMERGENCY LINE: (850) 238-9727
            </a>
          </Button>

          <p className="text-xl text-white font-bold mb-2">Available 24 Hours | 7 Days a Week | 365 Days a Year</p>
          <p className="text-lg text-orange-200">Average Response: 2-4 hours | We'll be there when you need us most</p>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white">
              Not an emergency? <Link to={createPageUrl("Booking")} className="underline font-bold hover:text-orange-200">Schedule regular service</Link> or call during business hours
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}