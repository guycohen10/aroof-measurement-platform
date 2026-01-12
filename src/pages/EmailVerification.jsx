import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerification = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      console.log('🔵 Verifying OTP...');

      await base44.auth.verifyOtp({
        email: email,
        otp_code: verificationCode
      });

      console.log('✅ Email verified');
      setVerified(true);
      
      setTimeout(() => {
        navigate(createPageUrl('RooferLogin'));
      }, 2000);

    } catch (err) {
      console.error('❌ Verification error:', err);
      alert('Verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await base44.auth.resendOtp({ email: email });
      alert('✅ Verification code resent to ' + email);
    } catch (err) {
      alert('❌ Failed to resend code: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-600 mb-6">
              Your email has been successfully verified. Redirecting to login...
            </p>
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <Card className="max-w-md w-full border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">Verify Your Email</CardTitle>
          <p className="text-slate-600 text-sm">
            Enter the verification code we sent to your email
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="code" className="text-sm font-medium">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                disabled={loading}
                className="mt-1 text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-slate-500 mt-1">Check your email for the code</p>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || !verificationCode}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div className="space-y-3 text-center">
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
                onClick={() => navigate(createPageUrl('RooferLogin'))}
                disabled={loading}
                className="text-sm text-slate-600 hover:underline flex items-center justify-center gap-1 w-full"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}