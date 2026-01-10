import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Home, MapPin, Loader2, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function EnrollMaintenance() {
  const navigate = useNavigate();
  const addressInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [planTier, setPlanTier] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [formData, setFormData] = useState({
    property_address: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    billing_cycle: 'annual'
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('tier') || window.location.pathname.split('/').pop();
    setPlanTier(tier);
  }, []);

  useEffect(() => {
    if (!addressInputRef.current) return;
    if (!window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setSelectedPlace({
          formatted_address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
        setFormData({...formData, property_address: place.formatted_address});
      }
    });
  }, [step]);

  const plans = {
    basic: { name: 'Basic', monthly: 49, annual: 499 },
    premium: { name: 'Premium', monthly: 89, annual: 899 },
    elite: { name: 'Elite', monthly: 149, annual: 1499 }
  };

  const plan = plans[planTier];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      const user = await base44.auth.me().catch(() => null);
      
      // For now, create subscription without Stripe (mock)
      const subscription = await base44.entities.Subscription.create({
        company_id: user?.company_id || 'demo_company',
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        property_address: formData.property_address,
        plan_tier: planTier,
        monthly_price: plan.monthly,
        billing_cycle: formData.billing_cycle,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        inspections_remaining: planTier === 'basic' ? 1 : planTier === 'premium' ? 2 : 4,
        cleanings_remaining: planTier === 'basic' ? 1 : planTier === 'premium' ? 2 : 4
      });

      toast.success('Successfully enrolled in ' + plan.name + ' plan!');
      navigate(createPageUrl(`CustomerPortal/${subscription.id}`));
    } catch (err) {
      toast.error('Failed to enroll: ' + err.message);
      setLoading(false);
    }
  };

  if (!plan) {
    return <div>Invalid plan</div>;
  }

  const price = formData.billing_cycle === 'monthly' ? plan.monthly : plan.annual;
  const savings = formData.billing_cycle === 'annual' ? (plan.monthly * 12 - plan.annual) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl("MaintenancePlans")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Aroof</span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Enroll in {plan.name} Plan
          </h1>
          <p className="text-slate-600">
            ${price}{formData.billing_cycle === 'monthly' ? '/month' : '/year'}
            {savings > 0 && <span className="text-green-600 font-semibold ml-2">Save ${savings}!</span>}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'
            }`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="font-semibold">Details</span>
          </div>
          <div className="h-0.5 w-16 bg-slate-300"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'
            }`}>
              2
            </div>
            <span className="font-semibold">Payment</span>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div>
                    <Label htmlFor="address" className="text-base font-semibold">
                      Property Address *
                    </Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        ref={addressInputRef}
                        id="address"
                        required
                        placeholder="Start typing your address..."
                        value={formData.property_address}
                        onChange={(e) => setFormData({...formData, property_address: e.target.value})}
                        className="h-12 pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-base font-semibold">Your Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      className="h-12 mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.customer_email}
                        onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                        className="h-12 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-base font-semibold">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                        className="h-12 mt-2"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700">
                    Continue to Payment
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Billing Cycle</Label>
                    <RadioGroup value={formData.billing_cycle} onValueChange={(v) => setFormData({...formData, billing_cycle: v})}>
                      <div className="flex items-center space-x-2 p-4 border-2 border-slate-200 rounded-lg hover:border-blue-300 cursor-pointer">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                          <div className="font-semibold">Monthly</div>
                          <div className="text-sm text-slate-600">${plan.monthly}/month</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border-2 border-green-300 rounded-lg hover:border-green-400 cursor-pointer bg-green-50">
                        <RadioGroupItem value="annual" id="annual" />
                        <Label htmlFor="annual" className="flex-1 cursor-pointer">
                          <div className="font-semibold">Annual <span className="text-green-600 text-sm">(Save ${savings}!)</span></div>
                          <div className="text-sm text-slate-600">${plan.annual}/year</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-blue-900">
                        <CreditCard className="w-5 h-5" />
                        <span className="font-semibold">Payment processing via Stripe</span>
                      </div>
                      <p className="text-sm text-blue-800 mt-2">
                        Note: Stripe payment integration will be enabled once configured
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 h-14 text-lg">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Complete Enrollment'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}