import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
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
  const [step, setStep] = useState(1); // 1 = registration, 2 = verification
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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
    starter: {
      name: "Starter",
      priceMonthly: 19.95,
      priceId: "price_1Ss4y2ICVekHY0FRX1GMrOHC",
      popular: false,
      tagline: "Essential CRM access. Pay per lead.",
      features: [
        "✅ Dashboard Access",
        "✅ Estimate Builder",
        "✅ Measurement Tools"
      ],
      description: "Perfect for small teams getting started"
    },
    pro: {
      name: "Pro",
      priceMonthly: 99,
      priceId: "price_1Ss4ykICVekHY0FRDjn5nL7h",
      popular: true,
      tagline: "The Growth Package.",
      features: [
        "✅ Includes 3 Verified Leads/mo",
        "✅ Priority Support",
        "✅ Advanced Reporting",
        "✅ All Starter Features"
      ],
      description: "Most popular. Recommended for growing companies"
    },
    enterprise: {
      name: "Enterprise",
      priceMonthly: 299,
      priceId: "price_1Ss4zSICVekHY0FRlQlfaYbM",
      popular: false,
      tagline: "Maximum Scale.",
      features: [
        "✅ Includes 12 Verified Leads/mo",
        "✅ Dedicated Account Manager",
        "✅ API Access",
        "✅ White-Glove Onboarding"
      ],
      description: "Enterprise support and resources"
    }
  };

  const handleStartTrial = async (planKey) => {
    try {
      const plan = plans[planKey];
      const user = await base44.auth.me();
      
      // If not logged in, show signup form
      if (!user) {
        setSelectedPlan(planKey);
        setShowSignupForm(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        return;
      }

      // Logged in user - create checkout session for subscription
      setLoading(true);
      
      const { sessionId } = await base44.functions.invoke('createSubscriptionCheckout', {
        price_id: plan.priceId,
        trial_period_days: 7,
        plan_name: plan.name
      });

      if (sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
    setShowSignupForm(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSignup = async () => {
    // Validation
    if (!formData.companyName || !formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Registering account...');

      // CRITICAL FIX: Generate company_id BEFORE registration
      const newCompanyId = `cmp_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
      console.log('🏢 Generated company_id:', newCompanyId);

      // Register user with Base44
      await base44.auth.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        company_id: newCompanyId,
        company_name: formData.companyName,
        company_phone: formData.companyPhone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        aroof_role: 'external_roofer',
        subscription_plan: selectedPlan || 'free',
        measurements_used_this_month: 0
      });

      console.log('✅ Registration successful');
      console.log('📧 Verification code sent to:', formData.email);

      // Save credentials and move to verification step
      setRegisteredEmail(formData.email);
      setPassword(formData.password);
      setStep(2);

      toast.success('Check your email for a verification code');
      
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.message?.includes('already exists') || err.message?.includes('duplicate') || err.message?.includes('already registered')) {
        toast.error('An account with this email already exists. Please try logging in instead.');
        navigate(createPageUrl("RooferLogin"));
      } else {
        toast.error('Registration failed: ' + (err.message || 'Please try again or contact support.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e?.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔵 ═══════════════════════════════════');
      console.log('🔵 DIRECT API CALL - BYPASSING SDK');
      console.log('🔵 Email:', registeredEmail);
      console.log('🔵 Code:', verificationCode);
      console.log('🔵 ═══════════════════════════════════');

      // BYPASS THE BROKEN SDK - Call API directly
      const response = await fetch(`https://base44.app/api/apps/${import.meta.env.VITE_BASE44_APP_ID}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registeredEmail,
          otp_code: verificationCode
        })
      });

      const data = await response.json();

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response data:', data);

      if (!response.ok) {
        console.error('❌ Verification failed');
        console.error('Error details:', data);
        throw new Error(data.detail || 'Verification failed');
      }

      console.log('✅ Verification successful!');
      console.log('✅ Response:', data);

      // Store auth tokens
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
      }

      // Create company entity using the pre-generated ID
      try {
        console.log('🏢 Creating company entity...');
        
        // Get the company_id from the registered user
        const currentUser = await base44.auth.me();
        const companyId = currentUser.company_id;
        
        // Create Company entity with the same ID
        const newCompany = await base44.entities.Company.create({
          id: companyId,
          company_name: formData.companyName,
          contact_name: formData.fullName,
          contact_email: formData.email,
          contact_phone: formData.companyPhone || formData.phone || '',
          address_street: formData.address || '',
          address_city: formData.city || 'Dallas',
          address_state: formData.state || 'TX',
          address_zip: formData.zip || '',
          service_area_zips: [],
          is_active: true,
          subscription_tier: 'starter',
          subscription_status: 'trial',
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          owner_user_id: currentUser.id
        });
        
        console.log('✅ Company created:', newCompany.id);
        
      } catch (err) {
        console.error('⚠️ Company/User setup error:', err);
        // Continue anyway - user can complete setup in dashboard
      }

      // Auto-redirect to dashboard
      console.log('✅ Redirecting to dashboard...');
      toast.success('Welcome to Aroof!');
      setTimeout(() => {
        navigate(createPageUrl("RooferDashboard"));
      }, 1500);

    } catch (err) {
      console.error('❌ VERIFICATION ERROR:', err);
      setError(err.message || 'Verification failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Resending verification code to:', registeredEmail);
      
      const response = await fetch(`https://base44.app/api/apps/${import.meta.env.VITE_BASE44_APP_ID}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registeredEmail
        })
      });
      
      const data = await response.json();
      console.log('📡 Resend response:', response.status, data);
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend verification code');
      }
      
      toast.success('New verification code sent! Check your email.');
      console.log('✅ Verification code resent successfully');
    } catch (err) {
      console.error('❌ Resend error:', err);
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
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
              onClick={() => handleStartTrial('pro')}
            >
              Start 7-Day Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-16 px-10 text-xl border-2 border-white text-white hover:bg-white/10"
              onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
            >
              View All Plans
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
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Professional Roof Measurements in 60 Seconds
            </h2>
            <p className="text-2xl text-slate-600 mb-4">
              Start your 7-Day Free Trial
            </p>
            <p className="text-lg text-slate-500">
              No credit card required for trial. Cancel anytime.
            </p>
          </div>

          {/* Pricing Grid - 3 Columns */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {Object.entries(plans).map(([key, plan]) => (
              <Card 
                key={key} 
                className={`relative flex flex-col border-2 hover:shadow-2xl transition-all ${
                  plan.popular ? 'border-blue-600 shadow-xl scale-105 lg:scale-100' : 'border-slate-200'
                }`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 text-sm font-bold">
                      ⭐ MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                <CardHeader className={`pb-6 ${plan.popular ? 'bg-gradient-to-br from-blue-50 to-blue-100/50' : ''}`}>
                  <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <p className="text-lg text-slate-700 font-semibold mb-6">
                    {plan.tagline}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-slate-900">
                        ${plan.priceMonthly}
                      </span>
                      <span className="text-xl text-slate-600">/month</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Billed monthly. Cancel anytime.
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col space-y-6">
                  {/* Features List */}
                  <ul className="space-y-4 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl text-green-600 flex-shrink-0">✓</span>
                        <span className="text-base text-slate-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    className={`w-full h-14 text-lg font-bold transition-all ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    onClick={() => handleStartTrial(key)}
                    disabled={loading}
                  >
                    Start 7-Day Free Trial
                  </Button>

                  <p className="text-xs text-center text-slate-500">
                    No credit card required
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
            <p className="text-center text-slate-600 mb-8 text-lg font-semibold">
              Trusted by 150+ roofing contractors
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">5,000+</p>
                <p className="text-slate-700 font-medium">Measurements Completed</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">98%</p>
                <p className="text-slate-700 font-medium">Customer Satisfaction</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">±2-5%</p>
                <p className="text-slate-700 font-medium">Measurement Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">Trusted by 150+ Roofers</h3>
            <p className="text-xl text-slate-600">See what contractors are saying about Aroof</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "Mike Rodriguez",
                company: "Rodriguez Roofing",
                text: "Cut my estimate time in half. I close 30% more leads every month since switching to Aroof.",
                rating: 5
              },
              {
                name: "Sarah Chen",
                company: "Premium Roofing Co",
                text: "The accuracy is incredible. Used it on 50+ jobs—always within 2-3% of final measurements.",
                rating: 5
              },
              {
                name: "Tom Anderson",
                company: "Anderson Brothers Roofing",
                text: "Best investment. The Pro plan pays for itself with just 2 extra jobs closed per month.",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-slate-200 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 italic text-lg">"{testimonial.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      {showSignupForm && (
        <section className="py-20 bg-white border-t-4 border-blue-600">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {step === 1 ? (
              // STEP 1: REGISTRATION
              <>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-slate-900 mb-4">
                    Create Your Account
                  </h2>
                  <p className="text-xl text-slate-600">
                    Selected Plan: <strong>{plans[selectedPlan]?.name}</strong> - 
                    ${getPrice(plans[selectedPlan])}/month
                  </p>
                  {selectedPlan === 'starter' && (
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      7-Day Free Trial Included
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
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password (min 8 characters)"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label>Confirm Password *</Label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
                   disabled={loading}
                 >
                   {loading ? 'Creating Account...' : (selectedPlan === 'starter' ? 'Start 7-Day Free Trial' : `Start Trial - $${plans[selectedPlan]?.priceMonthly}/mo`)}
                 </Button>

                 <p className="text-center text-sm text-slate-600">
                   You won't be charged during your 7-day trial
                 </p>
                </CardContent>
                </Card>
                </>
                ) : (
                // STEP 2: EMAIL VERIFICATION
                <>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-slate-900 mb-4">
                    Verify Your Email
                  </h2>
                  <p className="text-xl text-slate-600">
                    We sent a verification code to:<br />
                    <strong>{registeredEmail}</strong>
                  </p>
                </div>

                <Card className="shadow-xl max-w-md mx-auto">
                  <CardContent className="p-8 space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                        {error}
                      </div>
                    )}

                    <div>
                      <Label>Verification Code *</Label>
                      <Input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        disabled={loading}
                      />
                      <p className="text-xs text-slate-500 mt-2">Check your email for the 6-digit code</p>
                    </div>

                    <Button
                      className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                      onClick={handleVerification}
                      disabled={loading || !verificationCode}
                    >
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </Button>

                    <div className="text-center space-y-3">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:underline block w-full"
                      >
                        Didn't receive the code? Resend
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setVerificationCode("");
                        }}
                        disabled={loading}
                        className="text-sm text-slate-600 hover:underline block w-full"
                      >
                        ← Back to registration
                      </button>
                    </div>
                  </CardContent>
                </Card>
                </>
                )}
                </div>
                </section>
                )}



      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Close More Roofing Deals?
          </h2>
          <p className="text-2xl text-blue-100 mb-10">
            Join 150+ roofing companies using Aroof
          </p>
          <Button
            size="lg"
            className="h-16 px-12 text-xl bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => handleStartTrial('pro')}
          >
            Start 7-Day Free Trial
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