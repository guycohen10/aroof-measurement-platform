import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Loader2, AlertCircle, Building2 } from "lucide-react";

export default function RooferLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('📧 Requesting OTP for login:', email);

      // First, check if user exists and request OTP
      const response = await fetch(`https://base44.app/api/apps/${import.meta.env.VITE_BASE44_APP_ID}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await response.json();
      console.log('📡 Request OTP response:', response.status, data);

      if (!response.ok) {
        // If resend-otp fails, user might not exist or account not verified
        if (response.status === 404 || response.status === 400) {
          throw new Error('Account not found or not verified. Please sign up first.');
        }
        throw new Error(data.detail || data.message || 'Failed to send verification code');
      }

      console.log('✅ OTP sent successfully');
      setShowVerification(true);
      alert('Verification code sent to your email!');

    } catch (err) {
      console.error('❌ Send OTP error:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndLogin = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Verifying OTP for:', email);

      // Verify OTP
      const response = await fetch(`https://base44.app/api/apps/${import.meta.env.VITE_BASE44_APP_ID}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp_code: verificationCode
        })
      });

      const data = await response.json();
      console.log('📡 Verify OTP response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid verification code');
      }

      console.log('✅ Verification successful!');

      // Store auth tokens
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        base44.setAccessToken(data.access_token);
      }

      // Verify user is a roofer
      try {
        const user = await base44.auth.me();
        console.log('👤 User data:', user);

        if (user.aroof_role !== 'external_roofer') {
          throw new Error('This login is for roofers only. Homeowners should use the main site.');
        }

        console.log('✅ User verified as roofer');
        alert('Login successful! Redirecting to dashboard...');
        navigate(createPageUrl("RooferDashboard"));

      } catch (userErr) {
        console.error('❌ User verification error:', userErr);
        throw new Error('Failed to verify user account');
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      console.log('🔄 Resending OTP to:', email);

      const response = await fetch(`https://base44.app/api/apps/${import.meta.env.VITE_BASE44_APP_ID}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await response.json();
      console.log('📡 Resend OTP response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend code');
      }

      alert('New verification code sent!');

    } catch (err) {
      console.error('❌ Resend error:', err);
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}

            {!showVerification ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 h-12 text-lg"
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndLogin} className="space-y-6">
                <div>
                  <Label htmlFor="code" className="text-base font-medium">
                    Verification Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="mt-2 h-12 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    Resend Code
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationCode('');
                      setError('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Change Email
                  </Button>
                </div>
              </form>
            )}

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
              <Link to={createPageUrl("AddressMethodSelector")}>
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