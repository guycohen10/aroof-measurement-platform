import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Check, 
  MapPin, 
  FileText, 
  Clock, 
  DollarSign, 
  Zap,
  Star,
  Building2,
  Users,
  TrendingUp
} from "lucide-react";

const PLANS = {
  free: {
    name: "FREE",
    price: 0,
    measurements: 3,
    features: [
      "3 measurements per month",
      "Basic PDF reports",
      "Email support",
      "Standard calculations"
    ],
    limitations: [
      "No branding customization",
      "Standard support"
    ]
  },
  starter: {
    name: "STARTER",
    price: 49,
    measurements: 20,
    popular: false,
    features: [
      "20 measurements per month",
      "Standard PDF reports",
      "Email support",
      "Detailed calculations",
      "Save measurement history"
    ]
  },
  pro: {
    name: "PRO",
    price: 99,
    measurements: 100,
    popular: true,
    features: [
      "100 measurements per month",
      "Custom branded PDFs",
      "Priority email support",
      "Advanced calculations",
      "API access",
      "Unlimited history storage"
    ]
  },
  unlimited: {
    name: "UNLIMITED",
    price: 199,
    measurements: "Unlimited",
    features: [
      "Unlimited measurements",
      "White label PDFs",
      "Dedicated support",
      "Full API access",
      "Custom integrations",
      "Advanced analytics"
    ]
  }
};

export default function RooferSignup() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [step, setStep] = useState(1); // 1: Select Plan, 2: Account Info, 3: Payment
  
  const [formData, setFormData] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    termsAccepted: false
  });

  const getPrice = (planKey) => {
    const basePrice = PLANS[planKey].price;
    if (billingPeriod === "annual") {
      return Math.round(basePrice * 12 * 0.8); // 20% discount
    }
    return basePrice;
  };

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    setStep(2);
  };

  const handleSignup = async () => {
    // Validation
    if (!formData.companyName || !formData.fullName || !formData.email || !formData.password) {
      alert("Please fill in all required fields");
      return;
    }

    if (!formData.termsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }

    if (selectedPlan === "free") {
      // Free plan - create account directly
      alert("✅ Free account created! (In production, this would create the user via Base44)");
      navigate(createPageUrl("RooferDashboard"));
    } else {
      // Paid plan - go to payment
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">Aroof</span>
                <p className="text-xs text-blue-600 font-semibold">For Roofing Contractors</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Homepage")}>
                <Button variant="ghost">Back to Main Site</Button>
              </Link>
              <Button variant="outline">Already have an account? Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {step === 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full mb-4 font-semibold text-sm">
              🚀 Professional Roof Measurement Tool
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Measure Roofs in 60 Seconds
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Without Site Visits
              </span>
            </h1>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto mb-8">
              Satellite-powered measurements for roofing contractors. Get accurate sq ft, line measurements, and professional reports instantly.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">5,000+ Measurements Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">150+ Roofing Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Save 2+ Hours Per Estimate</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: MapPin,
                title: "Satellite Measurements",
                description: "Precise measurements from high-resolution satellite imagery"
              },
              {
                icon: FileText,
                title: "Professional PDFs",
                description: "Generate branded reports for your customers instantly"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Complete measurements in under 60 seconds"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border-2 hover:border-blue-300 transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-600"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  billingPeriod === "annual"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-600"
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {Object.entries(PLANS).map(([key, plan]) => (
              <Card
                key={key}
                className={`relative ${
                  plan.popular
                    ? "border-4 border-blue-600 shadow-2xl scale-105"
                    : "border-2 border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl mb-4">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold">
                      ${billingPeriod === "annual" ? Math.round(plan.price * 12 * 0.8 / 12) : plan.price}
                    </span>
                    <span className="text-slate-600">
                      /{billingPeriod === "annual" ? "mo" : "month"}
                    </span>
                  </div>
                  {billingPeriod === "annual" && plan.price > 0 && (
                    <p className="text-sm text-green-600 font-semibold">
                      Billed ${Math.round(plan.price * 12 * 0.8)} annually
                    </p>
                  )}
                  <p className="text-slate-600 font-semibold">
                    {typeof plan.measurements === "number"
                      ? `${plan.measurements} measurements/month`
                      : plan.measurements}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                    onClick={() => handlePlanSelect(key)}
                  >
                    {key === "free" ? "Start Free" : "Start 14-Day Trial"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonials */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-center mb-8">
              Trusted by Roofing Professionals
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Mike Johnson",
                  company: "Summit Roofing",
                  text: "Cut our estimating time by 70%. This tool pays for itself with the first job."
                },
                {
                  name: "Sarah Chen",
                  company: "Elite Roofing Co",
                  text: "Professional reports that impress our clients. The accuracy is incredible."
                },
                {
                  name: "David Martinez",
                  company: "Pro Roof Solutions",
                  text: "Scaled our business without adding estimators. Best investment we've made."
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>
                    <div>
                      <p className="font-bold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Create Your Account</CardTitle>
              <p className="text-center text-slate-600 mt-2">
                Selected Plan: <strong>{PLANS[selectedPlan].name}</strong> - $
                {getPrice(selectedPlan)}/{billingPeriod === "annual" ? "year" : "month"}
              </p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <Label>Company Name *</Label>
                <Input
                  placeholder="ABC Roofing Company"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Your Full Name *</Label>
                <Input
                  placeholder="John Smith"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="john@abcroofing.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Checkbox
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, termsAccepted: checked })
                  }
                  id="terms"
                />
                <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                  I agree to the Terms of Service and Privacy Policy. I understand that I can
                  cancel anytime.
                </label>
              </div>

              {selectedPlan === "free" && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-semibold">
                    ✓ No credit card required for free plan
                  </p>
                </div>
              )}

              {selectedPlan !== "free" && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 font-semibold mb-2">
                    🎉 14-Day Free Trial Included
                  </p>
                  <p className="text-sm text-blue-800">
                    Your card will be charged $
                    {getPrice(selectedPlan)} after 14 days. Cancel anytime before then at no
                    charge.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back to Plans
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSignup}>
                  {selectedPlan === "free" ? "Create Account" : "Continue to Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Payment Information</CardTitle>
              <p className="text-center text-slate-600 mt-2">
                Secure checkout powered by Stripe
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center mb-8">
                <p className="text-2xl font-bold text-blue-900 mb-2">
                  ${getPrice(selectedPlan)}/{billingPeriod === "annual" ? "year" : "month"}
                </p>
                <p className="text-blue-800">
                  {PLANS[selectedPlan].name} Plan • 14-Day Free Trial
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-center text-slate-600">
                  In production, Stripe Checkout would load here
                </p>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <p className="text-slate-500 mb-4">🔒 Stripe Checkout Component</p>
                  <p className="text-sm text-slate-400">
                    This would display Stripe's secure payment form
                  </p>
                </div>
              </div>

              <Button
                className="w-full h-12 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  alert("✅ Payment processed! (In production, Stripe would handle this)");
                  navigate(createPageUrl("RooferDashboard"));
                }}
              >
                Complete Signup & Start Trial
              </Button>

              <p className="text-center text-xs text-slate-500 mt-4">
                By completing signup, you agree to our Terms of Service
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}