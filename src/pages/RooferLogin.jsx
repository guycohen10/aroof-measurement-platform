import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Building2, ArrowRight, Shield, Zap, Star, Loader2 } from "lucide-react";

export default function RooferLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingMagicLink, setProcessingMagicLink] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false); // New state for password setup

  useEffect(() => {
    // 1. Check for Magic Link (Legacy/Custom)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');

    if (token && type === 'magic_link') {
      handleMagicLinkLogin(token);
      return;
    }

    // 2. Check for Standard Invite/Recovery Token (Hash)
    // The Base44/Supabase SDK will detect the hash token and auto-login the user.
    // We need to detect "type=invite" or "type=recovery" to show the "Set Password" UI.
    const hash = window.location.hash;
    if (hash && (hash.includes('type=invite') || hash.includes('type=recovery'))) {
      console.log('Invite/Recovery token detected in hash. Switching to Password Setup mode.');
      setIsSettingPassword(true);
      // Wait for SDK to initialize session, then we can confirm user is logged in
    }

    // 3. Auth Check
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        
        // If user is logged in BUT we are in "Setting Password" mode (from invite), DO NOT redirect yet.
        // Let them set the password.
        if (window.location.hash.includes('type=invite') || window.location.hash.includes('type=recovery')) {
           setIsSettingPassword(true);
           return; 
        }

        if (user && user.aroof_role) {
          navigate(createPageUrl('RooferDashboard'));
        }
      } catch (err) {
        // User not logged in, stay on login page
      }
    };
    checkAuth();
  }, [navigate]);

  // Handle Setting New Password
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!password) throw new Error('Password is required');
      
      // Update user password
      await base44.auth.updateMe({ password: password });
      
      toast.success('Password set successfully! Logging you in...');
      
      // Navigate to dashboard after short delay
      setTimeout(() => navigate(createPageUrl("RooferDashboard")), 1000);
    } catch (err) {
      console.error('Password set error:', err);
      setError(err.message || 'Failed to set password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkLogin = async (token) => {
    setProcessingMagicLink(true);
    try {
      // Decode the token
      const decoded = JSON.parse(atob(token));
      const { email: userEmail, user_id, timestamp } = decoded;

      // Check if token is expired (24 hours)
      const tokenAge = Date.now() - timestamp;
      if (tokenAge > 24 * 60 * 60 * 1000) {
        toast.error('Magic link has expired. Please request a new one.');
        setProcessingMagicLink(false);
        return;
      }

      // Check if user exists and has a password
      try {
        const users = await base44.entities.User.list();
        const existingUser = users.find(u => u.email === userEmail);
        
        if (existingUser && existingUser.password) {
          // User has password, just show login form
          setEmail(userEmail);
          toast.success(`Welcome back! Please enter your password.`);
          setProcessingMagicLink(false);
        } else {
          // First time login - auto-fill email and prompt for password
          setEmail(userEmail);
          toast.success(`Welcome! Please set a password for your account.`);
          setProcessingMagicLink(false);
        }
      } catch (userErr) {
        // If we can't check user, just show login form
        setEmail(userEmail);
        toast.success(`Welcome! Please enter your password to continue.`);
        setProcessingMagicLink(false);
      }

    } catch (err) {
      console.error('Magic link error:', err);
      toast.error('Invalid magic link. Please try logging in normally.');
      setProcessingMagicLink(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Logging in:', email);

      // Login with email and password
      await base44.auth.loginViaEmailPassword(email, password);

      console.log('✅ Login successful');

      // Get user data and migrate legacy users
      try {
        const user = await base44.auth.me();
        console.log('👤 User data:', user);

        // Legacy user migration: create company if missing
        if (!user.company_id && user.aroof_role === 'external_roofer') {
          console.log('⚠️ Legacy user detected, creating company...');
          
          try {
            const newCompany = await base44.entities.Company.create({
              company_name: user.company_name || 'My Roofing Company',
              contact_email: user.email,
              contact_phone: user.phone || '',
              address_city: 'Dallas',
              address_state: 'TX',
              is_active: true,
              subscription_tier: 'basic',
              subscription_status: 'active'
            });

            await base44.entities.User.update('me', {
              company_id: newCompany.id
            });

            console.log('✅ Company created and user migrated');
          } catch (migrationErr) {
            console.error('Migration error:', migrationErr);
          }
        }

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
      console.log('Full error object:', JSON.stringify(err, null, 2));
      
      // Detailed error display for debugging
      const errorMessage = err.message || 'Unknown error';
      const errorStatus = err.status || err.code || 'N/A';
      const errorDetails = err.details || err.error_description || '';
      
      setError(`Error: ${errorMessage} (Status: ${errorStatus})${errorDetails ? ` - ${errorDetails}` : ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (processingMagicLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
          <p className="text-xl">Processing magic link...</p>
        </div>
      </div>
    );
  }

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
                {isSettingPassword ? 'Set Password' : 'Contractor Login'}
              </CardTitle>
              <p className="text-slate-600 text-lg">
                {isSettingPassword ? 'Create your secure password' : 'Sign in to your contractor account'}
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {isSettingPassword ? (
                /* SET PASSWORD FORM */
                <form onSubmit={handleSetPassword} className="space-y-5">
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
                    <strong>Welcome!</strong> Please set a password to activate your account.
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-12 text-base pr-12"
                        placeholder="Create a password (min 6 chars)"
                        disabled={isLoading}
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base bg-green-600 hover:bg-green-700 font-semibold text-white"
                  >
                    {isLoading ? 'Activating...' : 'Activate Account & Login'}
                  </Button>
                </form>
              ) : (
                /* STANDARD LOGIN FORM */
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 text-base pr-12"
                        placeholder="Enter your password"
                        disabled={isLoading}
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 font-semibold"
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              )}

              <div className="mt-4 text-center">
                <Link to={createPageUrl("RooferForgotPassword")} className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                  Forgot Password?
                </Link>
              </div>

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