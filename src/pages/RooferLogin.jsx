import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, ArrowLeft, Loader2, AlertCircle, Building2, Lock, Mail } from "lucide-react";

export default function RooferLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  useEffect(() => {
    checkIfAlreadyLoggedIn();
  }, []);

  const checkIfAlreadyLoggedIn = async () => {
    try {
      const user = await base44.auth.me();
      if (user.aroof_role === 'external_roofer') {
        navigate(createPageUrl("RooferDashboard"));
      }
    } catch (err) {
      // Not logged in, stay on login page
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Base44 login - this will set the auth session
      await base44.auth.login(formData.email, formData.password);

      // Verify user is external roofer
      const user = await base44.auth.me();
      
      if (user.aroof_role !== 'external_roofer') {
        setError("This login is for roofing contractors only. Please use the main login.");
        await base44.auth.logout();
        setLoading(false);
        return;
      }

      // Success - redirect to dashboard
      navigate(createPageUrl("RooferDashboard"));
      
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.message.includes('Invalid credentials') || err.message.includes('401')) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes('User not found')) {
        setError("No account found with this email. Please sign up first.");
      } else {
        setError("Login failed. Please try again or contact support.");
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">Aroof</span>
                <p className="text-xs text-blue-600 font-semibold">Contractor Portal</p>
              </div>
            </Link>
            <Link to={createPageUrl("Homepage")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Banner */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">Sign in to your contractor account</p>
        </div>

        <Card className="shadow-2xl border-2 border-slate-100">
          <CardHeader className="text-center border-b bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="text-2xl">Contractor Login</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-2 h-12 text-lg"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-base font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-2 h-12 text-lg"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked }))}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-600 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to={createPageUrl("ForgotPassword")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Don't have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link to={createPageUrl("RooferSignup")}>
              <Button
                variant="outline"
                className="w-full h-12 text-base border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Create Contractor Account
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="mt-6 space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-blue-900 text-center">
                <strong>🏗️ For Contractors:</strong> Access your measurement dashboard, 
                manage subscriptions, and customize your PDF reports.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Homeowner?</strong> You don't need an account.
              </p>
              <Link to={createPageUrl("FormPage")}>
                <Button variant="link" className="text-blue-600 font-semibold p-0 h-auto">
                  Get FREE roof measurement →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Need help?{' '}
            <a href="mailto:support@aroof.build" className="text-blue-600 hover:underline font-medium">
              Contact Support
            </a>
            {' '}or call{' '}
            <a href="tel:+18502389727" className="text-blue-600 hover:underline font-medium">
              (850) 238-9727
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}