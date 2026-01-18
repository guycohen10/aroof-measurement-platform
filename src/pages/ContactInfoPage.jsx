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
  const [measurement, setMeasurement] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    smsOptIn: false
  });

  useEffect(() => {
    checkIfRooferAndRedirect();
    
    // Check for measurement ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const measurementId = urlParams.get('id');
    
    if (measurementId) {
      loadMeasurementById(measurementId);
    }
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

  const loadMeasurementById = async (measurementId) => {
    try {
      const meas = await base44.entities.Measurement.get(measurementId);
      setMeasurement(meas);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load measurement:", err);
      navigate(createPageUrl("Start"));
    }
  };

  const loadMeasurement = async () => {
    try {
      const measurementId = sessionStorage.getItem('pending_measurement_id');
      
      if (!measurementId) {
        // No pending measurement - redirect to start
        navigate(createPageUrl("Start"));
        return;
      }

      const measurements = await base44.entities.Measurement.filter({ id: measurementId });
      
      if (measurements.length === 0) {
        navigate(createPageUrl("Start"));
        return;
      }

      setMeasurement(measurements[0]);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load measurement:", err);
      navigate(createPageUrl("Start"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('📝 Saving homeowner lead...');
      
      const urlParams = new URLSearchParams(window.location.search);
      const measurementIdFromUrl = urlParams.get('id');
      const pendingMeasurementId = measurementIdFromUrl || sessionStorage.getItem('pending_measurement_id');
      
      if (!pendingMeasurementId) {
        alert('No measurement found. Please start over.');
        navigate(createPageUrl('Start'));
        return;
      }

      // Update the measurement with customer info
      const agreeToQuotes = true; // Homeowners automatically agree to get quotes
      
      await base44.entities.Measurement.update(pendingMeasurementId, {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        user_type: 'homeowner',
        lead_status: 'new',
        lead_source: 'website',
        sms_opt_in: formData.smsOptIn,
        measurement_completed: true,
        agrees_to_quotes: agreeToQuotes,
        available_for_purchase: agreeToQuotes,
        lead_price: 25.00
      });

      console.log('✅ Lead saved:', pendingMeasurementId);

      // Send confirmation email to homeowner
      try {
        await base44.integrations.Core.SendEmail({
          to: formData.email,
          subject: 'Your Roof Measurement is Complete!',
          body: `
Hello ${formData.name},

Thank you for using Aroof! Your roof measurement is complete.

Property: ${measurement.property_address}
Roof Area: ${measurement.total_sqft ? Math.round(measurement.total_sqft).toLocaleString() : 'Calculating...'} sq ft

What happens next?
✅ Top roofing contractors in your area will be notified
📞 A qualified roofer will contact you within 24 hours
💰 You'll receive competitive quotes for your project

You can view your measurement results anytime at:
https://aroof.build/results?measurementid=${pendingMeasurementId}

Best regards,
The Aroof Team
          `
        });
        console.log('✅ Homeowner confirmation email sent');
      } catch (emailErr) {
        console.error('Failed to send homeowner confirmation:', emailErr);
      }

      // Notify all active roofers
      try {
        const zipMatch = measurement.property_address?.match(/\b\d{5}\b/);
        const city = measurement.property_address?.split(',')[1]?.trim().split(/\s+\d/)[0] || '';
        
        await base44.functions.invoke('NotifyRoofersNewLead', {
          measurementId: pendingMeasurementId,
          address: measurement.property_address,
          city: city,
          sqft: measurement.total_sqft,
          leadPrice: 25.00
        });
        
        console.log('✅ Roofer notifications sent');
      } catch (notifyErr) {
        console.error('Failed to notify roofers:', notifyErr);
      }

      // Extract ZIP from address
      const zipMatch = measurement.property_address?.match(/\b\d{5}\b/);
      const zipCode = zipMatch ? zipMatch[0] : '';
      
      // Clear session data
      sessionStorage.removeItem('pending_measurement_id');
      sessionStorage.removeItem('selectedAddress');
      sessionStorage.removeItem('homeowner_lat');
      sessionStorage.removeItem('homeowner_lng');
      sessionStorage.removeItem('homeowner_address');
      sessionStorage.removeItem('measurement_method');

      console.log('✅ Navigating to results');
      window.location.href = `/results?id=${pendingMeasurementId}`;

    } catch (err) {
      console.error('❌ Error saving lead:', err);
      alert('Failed to save your information. Please try again.');
    } finally {
      setSaving(false);
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
                  checked={formData.smsOptIn}
                  onChange={(e) => setFormData({...formData, smsOptIn: e.target.checked})}
                  className="mt-1 w-5 h-5"
                  id="sms-opt-in"
                />
                <label htmlFor="sms-opt-in" className="text-sm text-slate-700 cursor-pointer">
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
                    Saving...
                  </>
                ) : (
                  <>
                    View My Results
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                🔒 Your information is secure and will never be shared
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