import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('unverified_email');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      console.log('📧 Sending verification code to:', email);

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
      console.log('📡 Send code response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send verification code');
      }

      setSuccessMessage('✅ Verification code sent! Check your email.');
      console.log('✅ Code sent successfully');

    } catch (err) {
      console.error('❌ Send code error:', err);
      setError(err.message || 'Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Verifying code for:', email);

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
      console.log('📡 Verify response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid verification code');
      }

      console.log('✅ Verification successful!');

      // Store auth tokens
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
      }

      // Update user role
      try {
        await base44.entities.User.update('me', {
          aroof_role: 'external_roofer'
        });
        console.log('✅ User profile updated');
      } catch (err) {
        console.error('⚠️ Profile update error:', err);
      }

      sessionStorage.removeItem('unverified_email');

      alert('✅ Email verified! Redirecting to dashboard...');
      setTimeout(() => {
        navigate(createPageUrl("RooferDashboard"));
      }, 1000);

    } catch (err) {
      console.error('❌ Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={createPageUrl("Homepage")} className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Home className="w-7 h-7 text-blue-900" />
            </div>
            <span className="text-3xl font-bold text-white">Aroof</span>
          </Link>
        </div>

        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
              <p className="text-gray-600">Enter the verification code sent to your email</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={verificationCode ? handleVerify : handleSendCode} className="space-y-6">
              <div>
                <Label className="mb-2 block">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>

              {successMessage && (
                <div>
                  <Label className="mb-2 block">Verification Code</Label>
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="h-14 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">Enter the 6-digit code from your email</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || (!email && !successMessage)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Processing...' : verificationCode ? 'Verify Email' : 'Send Verification Code'}
              </Button>

              {successMessage && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <Link to={createPageUrl("RooferLogin")} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                ← Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}