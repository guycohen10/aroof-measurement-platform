import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Loader2, CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ContactInfoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [measurement, setMeasurement] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    sms_consent: false
  });

  useEffect(() => {
    checkIfRooferAndRedirect();
  }, []);

  const checkIfRooferAndRedirect = async () => {
    try {
      const user = await base44.auth.me();
      console.log('🔴 ContactInfoPage loaded!');
      console.log('🔴 User role:', user?.aroof_role);
      console.log('🔴 active_lead_id in session:', sessionStorage.getItem('active_lead_id'));
      console.log('🔴 pending_measurement_id in session:', sessionStorage.getItem('pending_measurement_id'));
      
      if (user && user.aroof_role === 'external_roofer') {
        // Roofer should NEVER reach this page
        console.error('❌ ROOFER TRIED TO ACCESS CONTACTINFOPAGE - THIS IS THE BUG!');
        alert('You already entered customer info. Going to results...');
        
        // Get measurement ID from session
        const measurementId = sessionStorage.getItem('active_lead_id') || 
                             sessionStorage.getItem('pending_measurement_id');
        
        console.log('🔴 Redirecting roofer with measurementId:', measurementId);
        
        if (measurementId) {
          navigate(createPageUrl(`Results?measurementid=${measurementId}`));
        } else {
          navigate(createPageUrl("RooferDashboard"));
        }
        return;
      } else {
        // Not a roofer - load measurement for homeowner
        console.log('🔴 Loading measurement for homeowner');
        loadMeasurement();
      }
    } catch {
      // Not logged in - proceed normally for homeowners
      console.log('🔴 User not logged in - loading measurement for homeowner');
      loadMeasurement();
    }
  };

  const loadMeasurement = async () => {
    try {
      const measurementId = sessionStorage.getItem('pending_measurement_id');
      
      if (!measurementId) {
        // No pending measurement - redirect to start
        navigate(createPageUrl("AddressEntry"));
        return;
      }

      const measurements = await base44.entities.Measurement.filter({ id: measurementId });
      
      if (measurements.length === 0) {
        navigate(createPageUrl("AddressEntry"));
        return;
      }

      setMeasurement(measurements[0]);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load measurement:", err);
      navigate(createPageUrl("AddressEntry"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save code and customer data to session
      sessionStorage.setItem('verification_code', code);
      sessionStorage.setItem('customer_data', JSON.stringify(formData));
      
      // Send verification email
      await base44.integrations.Core.SendEmail({
        to: formData.email,
        subject: 'Verify your email - Aroof Roof Measurement',
        body: `Hi ${formData.name},\n\nYour verification code is: ${code}\n\nEnter this code to access your roof measurement report.\n\nBest regards,\nAroof Team`
      });
      
      setEmailSent(true);
      setSaving(false);
      
    } catch (err) {
      alert("Failed to send verification email: " + err.message);
      setSaving(false);
    }
  };

  const handleVerifyCode = async () => {
    const savedCode = sessionStorage.getItem('verification_code');
    
    if (verificationCode !== savedCode) {
      alert('Invalid verification code. Please try again.');
      return;
    }
    
    setSaving(true);
    
    try {
      const measurementId = sessionStorage.getItem('pending_measurement_id');
      const customerData = JSON.parse(sessionStorage.getItem('customer_data'));
      
      // Update measurement with customer info
      await base44.entities.Measurement.update(measurementId, {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        email_verified: true,
        sms_consent: customerData.sms_consent
      });
      
      // Clear session
      sessionStorage.removeItem('verification_code');
      sessionStorage.removeItem('customer_data');
      sessionStorage.removeItem('pending_measurement_id');
      
      // Redirect to results
      navigate(createPageUrl(`Results?measurementid=${measurementId}`));
      
    } catch (err) {
      alert('Failed to verify: ' + err.message);
      setSaving(false);
    }
  };

  const handleResendCode = async () => {
    const customerData = JSON.parse(sessionStorage.getItem('customer_data'));
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    sessionStorage.setItem('verification_code', code);
    
    try {
      await base44.integrations.Core.SendEmail({
        to: customerData.email,
        subject: 'Verify your email - Aroof Roof Measurement',
        body: `Hi ${customerData.name},\n\nYour new verification code is: ${code}\n\nEnter this code to access your roof measurement report.\n\nBest regards,\nAroof Team`
      });
      
      alert('✅ New verification code sent!');
    } catch (err) {
      alert('Failed to resend code: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalArea = measurement?.total_adjusted_sqft || measurement?.total_sqft || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Home className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Aroof</h1>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Almost Done!</h2>
            </div>
            <p className="text-xl text-blue-100 mb-2">
              Your roof measurement is ready
            </p>
            <div className="text-5xl font-bold text-white">
              {totalArea.toLocaleString()} sq ft
            </div>
          </div>

          <p className="text-lg text-blue-200">
            To see your detailed results and pricing estimate,<br />
            we just need a few quick details:
          </p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardContent className="p-8">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-base font-semibold text-slate-900 mb-2 block">
                    Your Name *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-14 text-lg"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-base font-semibold text-slate-900 mb-2 block">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-14 text-lg"
                  />
                </div>

                <div>
                  <label className="text-base font-semibold text-slate-900 mb-2 block">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    required
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="h-14 text-lg"
                  />
                </div>

                <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4">
                  <input
                    type="checkbox"
                    checked={formData.sms_consent}
                    onChange={(e) => setFormData({...formData, sms_consent: e.target.checked})}
                    className="mt-1 w-5 h-5"
                    id="sms-consent"
                  />
                  <label htmlFor="sms-consent" className="text-sm text-slate-700 cursor-pointer">
                    <strong>Text me updates about my roof project</strong>
                    <span className="block text-xs text-slate-600 mt-1">
                      Get appointment reminders and status updates via SMS
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-16 text-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <Mail className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-900">
                    <strong>Verification code sent!</strong>
                    <p className="text-sm mt-1">Check your email: {JSON.parse(sessionStorage.getItem('customer_data')).email}</p>
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="text-base font-semibold text-slate-900 mb-2 block">
                    Enter 6-Digit Code *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-14 text-2xl text-center tracking-widest font-bold"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleVerifyCode}
                  disabled={saving || verificationCode.length !== 6}
                  className="w-full h-16 text-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 mr-3" />
                      Verify & See Results
                    </>
                  )}
                </Button>

                <Button
                  variant="link"
                  onClick={handleResendCode}
                  className="w-full"
                  disabled={saving}
                >
                  Didn't receive code? Resend
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                  className="w-full"
                  disabled={saving}
                >
                  ← Change Email Address
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                {!emailSent ? (
                  'By continuing, you agree to receive information about your roof measurement. We respect your privacy and won\'t spam you.'
                ) : (
                  '🔒 Your information is secure. Check your spam folder if you don\'t see the email.'
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            🔒 Your information is secure and will never be shared
          </p>
        </div>
      </div>
    </div>
  );
}