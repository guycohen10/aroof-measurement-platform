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

  // Step state
  const [step, setStep] = useState("pricing"); // 'pricing' | 'register' | 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedPriceId, setSelectedPriceId] = useState(null);

  // Plans
  const plans = {
    starter: { name: "Starter", price: 19.95, priceId: "price_1Ss4y2ICVekHY0FRX1GMrOHC" },
    pro: { name: "Pro", price: 99, priceId: "price_1Ss4ykICVekHY0FRDjn5nL7h", popular: true },
    enterprise: { name: "Enterprise", price: 299, priceId: "price_1Ss4zSICVekHY0FRlQlfaYbM" }
  };

  // Step 1: Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !companyName || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      console.log("📧 Registering user with base44.auth.signUp");

      await base44.auth.signUp({
        username: email,
        password: password,
        attributes: {
          name: name,
          email: email,
          company_name: companyName
        }
      });

      console.log("✅ SignUp successful, moving to verification step");
      setStep("verify");
      toast.success("Verification code sent to your email!");
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.message || "Registration failed");
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify & Complete Signup
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
      console.log("🔐 Confirming email with base44.auth.confirmSignUp");
      
      // Confirm signup
      await base44.auth.confirmSignUp(email, verificationCode);
      console.log("✅ Email confirmed");

      console.log("🔑 Signing in with base44.auth.signIn");
      
      // Sign in
      await base44.auth.signIn({
        username: email,
        password: password
      });
      console.log("✅ User signed in");

      // Create company
      console.log("🏢 Creating company with base44.entities.Company.create");
      const currentUser = await base44.auth.me();

      await base44.entities.Company.create({
        company_name: companyName,
        contact_name: name,
        contact_email: email,
        is_active: true,
        subscription_status: "trial"
      });
      console.log("✅ Company created");

      // Create checkout session
      console.log("💳 Creating checkout session with base44.functions.invoke");
      const response = await base44.functions.invoke("createSubscriptionCheckout", {
        priceId: selectedPriceId,
        email: email,
        userId: currentUser.id
      });

      if (response.data?.sessionId) {
        console.log("✅ Redirecting to Stripe checkout");
        window.location.href = `https://checkout.stripe.com/pay/${response.data.sessionId}`;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      console.error("❌ Verification/Payment error:", err);
      setError(err.message || "Verification failed");
      toast.error(err.message || "Verification failed");
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
    setName("");
    setCompanyName("");
    setEmail("");
    setPassword("");
    setVerificationCode("");
    setError("");
  };

  // ===== PRICING STEP =====
  if (step === "pricing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
          </div>
        </header>

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

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-slate-900 mb-6">Simple, Transparent Pricing</h2>
              <p className="text-2xl text-slate-600 mb-4">Start your 7-Day Free Trial</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
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
                      <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-xl text-slate-600">/month</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col space-y-6">
                    <Button
                      size="lg"
                      className={`w-full h-14 text-lg font-bold ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                      onClick={() => handleSelectPlan(plan.priceId)}
                    >
                      Start Free Trial
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

  // ===== REGISTRATION STEP =====
  if (step === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <button onClick={handleBack} className="text-slate-400 hover:text-slate-600">
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

  // ===== VERIFICATION STEP =====
  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <button onClick={handleBack} className="text-slate-400 hover:text-slate-600">
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
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500 mt-2">Check your email for the 6-digit code</p>
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
                ← Back to Pricing
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
}