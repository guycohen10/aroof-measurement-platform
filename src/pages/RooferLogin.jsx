import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Building2, ArrowRight, Shield, Zap, Star } from "lucide-react";

export default function RooferLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Logging in:', email);

      // Login with email and password
      await base44.auth.loginViaEmailPassword(email, password);

      console.log('✅ Login successful');

      // Get user data and set role if needed
      try {
        const user = await base44.auth.me();
        console.log('👤 User data:', user);

        // If role not set, set it now
        if (!user.aroof_role || user.aroof_role !== 'external_roofer') {
          console.log('⚠️ Role not set, updating now...');
          try {
            await base44.entities.User.update('me', {
              aroof_role: 'external_roofer'
            });
            console.log('✅ Role updated');
          } catch (roleErr) {
            console.warn('Could not update role:', roleErr);
          }
        }
      } catch (userErr) {
        console.warn('Could not fetch user data:', userErr);
        // Continue anyway
      }

      console.log('✅ Login complete, redirecting...');
      navigate(createPageUrl("RooferDashboard"));

    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Aroof</span>
                <p className="text-xs text-blue-300 font-semibold">For Contractors</p>
              </div>
            </Link>
            <Link to={createPageUrl("Homepage")}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <Card className="shadow-2xl border-none">
            <CardHeader className="text-center pb-8 pt-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                Contractor Login
              </CardTitle>
              <p className="text-slate-600 text-lg">
                Sign in to your contractor account
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                    placeholder="your@company.com"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-center text-slate-600 mb-3">
                  Don't have an account?
                </p>
                <Link to={createPageUrl("RooferSignup")}>
                  <Button variant="outline" className="w-full h-11 font-semibold">
                    Create Contractor Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="mt-8 space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-900 mb-1">For Contractors</p>
                    <p className="text-sm text-blue-800">
                      Access your measurement dashboard, manage subscriptions, and customize your PDF reports.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 mb-1">Homeowner?</p>
                    <p className="text-sm text-slate-700 mb-3">
                      You don't need an account. Get instant FREE roof measurements.
                    </p>
                    <Link to={createPageUrl("Homepage")}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Get FREE Measurement
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Link to={createPageUrl("Homepage")} className="text-white/80 hover:text-white text-sm">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">Instant Measurements</h3>
              <p className="text-blue-200 text-sm">Get accurate measurements in 60 seconds</p>
            </div>
            <div>
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">Professional Reports</h3>
              <p className="text-blue-200 text-sm">Branded PDFs with your company logo</p>
            </div>
            <div>
              <Star className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">Trusted by 150+ Companies</h3>
              <p className="text-blue-200 text-sm">Join top roofing contractors nationwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}