import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Home, X } from "lucide-react";

export default function RooferSignup() {
  const navigate = useNavigate();

  // State Management
  const [step, setStep] = useState("pricing"); // 'pricing' | 'register' | 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedPriceId, setSelectedPriceId] = useState(null);

  // Plans Configuration
  const plans = {
    starter: { name: "Starter", price: 19.95, priceId: "price_1Ss4y2ICVekHY0FRX1GMrOHC" },
    pro: { name: "Pro", price: 99, priceId: "price_1Ss4ykICVekHY0FRDjn5nL7h", popular: true },
    enterprise: { name: "Enterprise", price: 299, priceId: "price_1Ss4zSICVekHY0FRlQlfaYbM" }
  };

  // STEP 1: Register User
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !name || !companyName) {
      setError("Please fill in all required fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      console.log("📧 Registering user:", email);

      await base44.auth.signUp({
        username: email,
        password: password,
        attributes: {
          name: name,
          email: email,
          company_name: companyName
        }
      });

      console.log("✅ Registration successful. Moving to verification.");
      setStep("verify");
      toast.success("Verification code sent to your email!");
    } catch (err) {
      console.error("❌ Registration error:", err);
      const errorMsg = err.message || "Registration failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Email & Complete Signup
  const handleVerifyAndPay = async (e) => {
    e.preventDefault();
    setError("");

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    if (!selectedPriceId) {
      setError("No plan selected");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Confirming email verification...");

      // Step 1: Confirm SignUp
      await base44.auth.confirmSignUp(email, verificationCode);
      console.log("✅ Email confirmed");

      // Step 2: Sign In
      await base44.auth.signIn({
        username: email,
        password: password
      });
      console.log("✅ User signed in");

      // Step 3: Create Company
      const currentUser = await base44.auth.me();
      console.log("🏢 Creating company...");

      await base44.entities.Company.create({
        company_name: companyName,
        contact_name: name,
        contact_email: email,
        is_active: true,
        subscription_status: "trial"
      });
      console.log("✅ Company created");

      // Step 4: Create Checkout Session
      console.log("💳 Creating checkout session...");
      const { sessionId } = await base44.functions.invoke("createSubscriptionCheckout", {
        priceId: selectedPriceId,
        email: email,
        userId: currentUser.id
      });

      if (sessionId) {
        console.log("✅ Redirecting to Stripe checkout...");
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      console.error("❌ Verification/Payment error:", err);
      const errorMsg = err.message || "Verification failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (priceId) => {
    setSelectedPriceId(priceId);
    setStep("register");
  };

  const handleBack = () => {
    setStep("pricing");
    setEmail("");
    setPassword("");
    setName("");
    setCompanyName("");
    setVerificationCode("");
    setError("");
  };

  // ===== STEP 1: PRICING =====
  if (step === "pricing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">Aroof</span>
                <p className="text-xs text-blue-600 font-semibold">For Roofing Contractors</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Professional Roof Measurements
              <br />
              <span className="text-blue-400">In 60 Seconds</span>
            </h1>
            <p className="text-2xl text-blue-100 mb-4 max-w-3xl mx-auto">
              Get satellite measurements instantly. No site visit needed.
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-slate-900 mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-2xl text-slate-600 mb-4">
                Start your 7-Day Free Trial
              </p>
              <p className="text-lg text-slate-500">
                No credit card required. Cancel anytime.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-20">
              {Object.entries(plans).map(([key, plan]) => (
                <Card
                  key={key}
                  className={`relative flex flex-col border-2 hover:shadow-2xl transition-all ${
                    plan.popular ? "border-blue-600 shadow-xl scale-105 lg:scale-100" : "border-slate-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 text-sm font-bold rounded-full">
                        ⭐ MOST POPULAR
                      </div>
                    </div>
                  )}

                  <CardHeader className={plan.popular ? "bg-gradient-to-br from-blue-50 to-blue-100/50" : ""}>
                    <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-5xl font-bold text-slate-900">
                        ${plan.price}
                      </span>
                      <span className="text-xl text-slate-600">/month</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col space-y-6">
                    <Button
                      size="lg"
                      className={`w-full h-14 text-lg font-bold transition-all ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                      onClick={() => handleSelectPlan(plan.priceId)}
                    >
                      Start 7-Day Free Trial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ===== STEP 2: REGISTRATION =====
  if (step === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <button
              onClick={handleBack}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold">Full Name *</Label>
                <Input
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Company Name *</Label>
                <Input
                  type="text"
                  placeholder="ABC Roofing"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Email *</Label>
                <Input
                  type="email"
                  placeholder="john@abcroofing.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Password *</Label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-xs text-center text-slate-600">
                We'll send a verification code to your email
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== STEP 3: VERIFICATION & PAYMENT =====
  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <button
              onClick={handleBack}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyAndPay} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                Verification code sent to <strong>{email}</strong>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold">Verification Code *</Label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500 mt-2">Check your email for the code</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 h-12 font-semibold"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Start Trial"
                )}
              </Button>

              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="w-full text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                ← Back
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
}