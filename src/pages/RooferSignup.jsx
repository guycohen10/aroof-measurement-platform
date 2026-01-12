import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Check, 
  Zap, 
  Clock, 
  Shield, 
  Star,
  Users,
  TrendingUp,
  FileText,
  Ruler,
  DollarSign
} from "lucide-react";

export default function RooferSignup() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSignupForm, setShowSignupForm] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    companyPhone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const plans = {
    free: {
      name: "Free",
      priceMonthly: 0,
      priceAnnual: 0,
      measurements: 3,
      features: [
        "3 measurements/month",
        "Basic PDF reports",
        "Satellite imagery",
        "Area calculations",
        "Email support"
      ],
      limitations: [
        "No custom branding",
        "Standard reports only"
      ]
    },
    starter: {
      name: "Starter",
      priceMonthly: 49,
      priceAnnual: 470,
      measurements: 20,
      popular: false,
      features: [
        "20 measurements/month",
        "Standard PDF reports",
        "All measurement tools",
        "Line measurements",
        "Email support",
        "14-day free trial"
      ]
    },
    pro: {
      name: "Pro",
      priceMonthly: 99,
      priceAnnual: 950,
      measurements: 100,
      popular: true,
      features: [
        "100 measurements/month",
        "Custom branded PDFs",
        "Priority support",
        "API access",
        "Advanced reports",
        "Waste calculations",
        "14-day free trial"
      ]
    },
    unlimited: {
      name: "Unlimited",
      priceMonthly: 199,
      priceAnnual: 1910,
      measurements: "Unlimited",
      features: [
        "Unlimited measurements",
        "White label PDFs",
        "Dedicated support",
        "Full API access",
        "Custom integrations",
        "Priority processing",
        "14-day free trial"
      ]
    }
  };

  const getPrice = (plan) => {
    return billingCycle === "monthly" ? plan.priceMonthly : Math.floor(plan.priceAnnual / 12);
  };

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
    setShowSignupForm(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSignup = async () => {
    // Validation
    if (!formData.companyName || !formData.fullName || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      // Call backend function to create account
      const response = await base44.functions.invoke('createRooferAccount', {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        companyData: {
          companyName: formData.companyName,
          companyPhone: formData.companyPhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        },
        selectedPlan: selectedPlan
      });

      const result = response.data;

      if (result.success) {
        alert(`✅ Account created successfully!\n\nCompany: ${formData.companyName}\nPlan: ${plans[selectedPlan].name}\n\nCheck ${formData.email} for your account setup link. After clicking the link and setting your password, you can log in.`);
        navigate(createPageUrl("RooferLogin"));
      } else {
        throw new Error(result.error || 'Failed to create account');
      }
      
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.message?.includes('already exists') || err.message?.includes('duplicate') || err.message?.includes('already registered') || err.message?.includes('already invited')) {
        alert('❌ An account with this email already exists.\n\nPlease try logging in instead or contact support.');
        navigate(createPageUrl("RooferLogin"));
      } else if (err.message?.includes('permission') || err.message?.includes('denied')) {
        alert('❌ Unable to create account - permission denied.\n\nThis likely means you need to enable user invitations or be logged in as an admin to create accounts.\n\nPlease contact support.');
      } else {
        alert('❌ Failed to create account.\n\n' + (err.message || 'Please try again or contact support.'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
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
            <Link to={createPageUrl("Homepage")}>
              <Button variant="outline">Back to Site</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-green-500 text-white px-4 py-2 text-base">
            Join 150+ Roofing Companies
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Professional Roof Measurements
            <br />
            <span className="text-blue-400">In 60 Seconds</span>
          </h1>
          <p className="text-2xl text-blue-100 mb-4 max-w-3xl mx-auto">
            Get satellite measurements instantly. No site visit needed.
          </p>
          <p className="text-xl text-blue-200 mb-10">
            Save 2+ hours per estimate. Close more deals faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="h-16 px-10 text-xl bg-green-600 hover:bg-green-700 shadow-2xl"
              onClick={() => handleSelectPlan('free')}
            >
              Start Free - No Credit Card Required
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-16 px-10 text-xl border-2 border-white text-white hover:bg-white/10"
              onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
            >
              View Pricing
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
            <div>
              <p className="text-4xl font-bold text-green-400">5,000+</p>
              <p className="text-blue-200">Measurements Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-400">150+</p>
              <p className="text-blue-200">Roofing Companies</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-400">2+ hrs</p>
              <p className="text-blue-200">Saved Per Estimate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Measure Roofs
            </h2>
            <p className="text-xl text-slate-600">
              Professional-grade tools used by roofing contractors nationwide
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Measurements",
                description: "Get accurate measurements in 60 seconds using satellite imagery"
              },
              {
                icon: Ruler,
                title: "Complete Calculations",
                description: "Total area, line measurements, waste factors, material estimates"
              },
              {
                icon: FileText,
                title: "Professional PDFs",
                description: "Generate branded reports for customers and insurance companies"
              },
              {
                icon: Clock,
                title: "Save Time",
                description: "Skip the site visit. Measure from your office or truck"
              },
              {
                icon: DollarSign,
                title: "Close More Deals",
                description: "Respond to leads faster with instant quotes"
              },
              {
                icon: Shield,
                title: "Industry Leading",
                description: "±2-5% accuracy. Trusted by top roofing companies"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border-2 hover:border-blue-400 transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Start free. Upgrade anytime. Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-semibold ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-slate-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  billingCycle === 'annual' ? 'bg-green-600' : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : ''
                }`} />
              </button>
              <span className={`font-semibold ${billingCycle === 'annual' ? 'text-green-600' : 'text-slate-500'}`}>
                Annual
              </span>
              {billingCycle === 'annual' && (
                <Badge className="bg-green-100 text-green-800">Save 20%</Badge>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(plans).map(([key, plan]) => (
              <Card 
                key={key} 
                className={`relative border-2 hover:shadow-xl transition-all ${
                  plan.popular ? 'border-blue-600 shadow-lg' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1 text-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-slate-900">
                      ${getPrice(plan)}
                    </span>
                    <span className="text-slate-600">/month</span>
                  </div>
                  {billingCycle === 'annual' && plan.priceAnnual > 0 && (
                    <p className="text-sm text-green-600">
                      ${plan.priceAnnual}/year (save ${(plan.priceMonthly * 12) - plan.priceAnnual})
                    </p>
                  )}
                  <p className="text-lg font-semibold text-blue-600 mt-2">
                    {plan.measurements === "Unlimited" ? "Unlimited" : `${plan.measurements} measurements`}/month
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
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
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                    onClick={() => handleSelectPlan(key)}
                  >
                    {key === 'free' ? 'Start Free' : 'Start 14-Day Trial'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-slate-600 mt-8">
            All paid plans include a 14-day free trial. No credit card required for Free plan.
          </p>
        </div>
      </section>

      {/* Signup Form */}
      {showSignupForm && (
        <section className="py-20 bg-white border-t-4 border-blue-600">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Create Your Account
              </h2>
              <p className="text-xl text-slate-600">
                Selected Plan: <strong>{plans[selectedPlan]?.name}</strong> - 
                ${getPrice(plans[selectedPlan])}/month
              </p>
              {selectedPlan !== 'free' && (
                <Badge className="mt-2 bg-green-100 text-green-800">
                  14-Day Free Trial Included
                </Badge>
              )}
            </div>

            <Card className="shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Section 1: Company Information</h3>
                  <p className="text-sm text-slate-600">Tell us about your roofing business</p>
                </div>

                <div>
                  <Label>Company Name *</Label>
                  <Input 
                    placeholder="ABC Roofing LLC"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Company Phone *</Label>
                  <Input 
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData({...formData, companyPhone: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Company Address</Label>
                  <Input 
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input 
                      placeholder="Dallas"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>State</Label>
                      <Input 
                        placeholder="TX"
                        maxLength="2"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div>
                      <Label>ZIP</Label>
                      <Input 
                        placeholder="75201"
                        maxLength="5"
                        value={formData.zip}
                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Section 2: Your Account</h3>
                  <p className="text-sm text-slate-600 mb-4">Create your admin login</p>
                </div>

                <div>
                  <Label>Your Full Name *</Label>
                  <Input 
                    placeholder="John Smith"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Email Address *</Label>
                  <Input 
                    type="email"
                    placeholder="john@abcroofing.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Password *</Label>
                  <Input 
                    type="password"
                    placeholder="Create a secure password (min 8 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Confirm Password *</Label>
                  <Input 
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked})}
                  />
                  <label className="text-sm text-slate-700">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>

                <Button
                  className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                  onClick={handleSignup}
                >
                  {selectedPlan === 'free' ? 'Create Free Account' : 'Start 14-Day Free Trial'}
                </Button>

                <p className="text-center text-sm text-slate-600">
                  {selectedPlan === 'free' 
                    ? 'No credit card required for Free plan'
                    : 'You won\'t be charged until after your 14-day trial ends'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Roofing Professionals</h2>
            <p className="text-xl text-slate-300">See what other contractors are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Mike Rodriguez",
                company: "Rodriguez Roofing",
                text: "This tool has cut my estimate time in half. I can respond to leads within minutes now instead of scheduling site visits for days later."
              },
              {
                name: "Sarah Chen",
                company: "Premium Roofing Co",
                text: "The accuracy is impressive. We've used it for 50+ jobs and it's always within 2-3% of our final measurements."
              },
              {
                name: "Tom Anderson",
                company: "Anderson Brothers Roofing",
                text: "Best $99 I spend every month. The Pro plan pays for itself with just 2 extra jobs closed per month."
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-200 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Measure Faster?
          </h2>
          <p className="text-2xl text-blue-100 mb-10">
            Join 150+ roofing companies using Aroof
          </p>
          <Button
            size="lg"
            className="h-16 px-12 text-xl bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => handleSelectPlan('free')}
          >
            Start Free Today - No Credit Card Required
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            © 2025 Aroof. All rights reserved. • 
            <Link to={createPageUrl("Homepage")} className="hover:text-white ml-2">
              Terms
            </Link> • 
            <Link to={createPageUrl("Homepage")} className="hover:text-white ml-2">
              Privacy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}