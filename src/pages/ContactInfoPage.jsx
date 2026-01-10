import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Loader2, CheckCircle, ArrowRight } from "lucide-react";

export default function ContactInfoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [measurement, setMeasurement] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    sms_consent: false
  });

  useEffect(() => {
    loadMeasurement();
  }, []);

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
      // Update measurement with customer details
      await base44.entities.Measurement.update(measurement.id, {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        sms_consent: formData.sms_consent
      });

      // Clear session storage
      sessionStorage.removeItem('pending_measurement_id');

      // Redirect to results
      navigate(createPageUrl(`Results?measurementid=${measurement.id}`));
    } catch (err) {
      alert("Failed to save information: " + err.message);
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
                    Processing...
                  </>
                ) : (
                  <>
                    See My Results
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                By continuing, you agree to receive information about your roof measurement.
                We respect your privacy and won't spam you.
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