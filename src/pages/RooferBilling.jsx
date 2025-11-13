import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Settings as SettingsIcon,
  Crown,
  Check,
  Upload
} from "lucide-react";
import { format } from "date-fns";

export default function RooferBilling() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [customBranding, setCustomBranding] = useState({
    logo_url: "",
    company_name: "",
    address: "",
    phone: "",
    email: "",
    primary_color: "#3b82f6",
    footer_text: ""
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.custom_branding) {
        setCustomBranding(currentUser.custom_branding);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading user:', err);
      navigate(createPageUrl("RooferDashboard"));
    }
  };

  const handleSaveBranding = async () => {
    try {
      await base44.auth.updateMe({ custom_branding: customBranding });
      alert('✅ Branding settings saved!');
    } catch (err) {
      console.error('Error saving branding:', err);
      alert('Failed to save branding settings');
    }
  };

  const canCustomizeBranding = user?.subscription_plan === 'pro' || user?.subscription_plan === 'unlimited';

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      measurements: 20,
      features: ['20 measurements/month', 'Standard reports', 'Email support']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      measurements: 100,
      features: ['100 measurements/month', 'Custom branding', 'Priority support', 'API access'],
      popular: true
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: 199,
      measurements: 'Unlimited',
      features: ['Unlimited measurements', 'White label', 'Dedicated support', 'Full API']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("RooferDashboard")}>
              <Button variant="ghost">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Billing & Settings</h1>
              <p className="text-sm text-slate-600">Manage your subscription and preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Current Plan */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Plan</p>
                <p className="text-2xl font-bold text-slate-900">
                  {user.subscription_plan?.charAt(0).toUpperCase() + user.subscription_plan?.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Monthly Cost</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${plans.find(p => p.id === user.subscription_plan)?.price || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Next Billing</p>
                <p className="text-lg font-semibold text-slate-900">
                  {user.next_billing_date 
                    ? format(new Date(user.next_billing_date), 'MMM d, yyyy')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment Method
              </Button>
              <Button variant="outline" className="text-red-600 hover:bg-red-50">
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        {user.subscription_plan !== 'unlimited' && (
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
              <CardTitle>Upgrade Your Plan</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Get more measurements and premium features</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`border-2 ${
                      plan.id === user.subscription_plan 
                        ? 'border-blue-600 bg-blue-50' 
                        : plan.popular 
                        ? 'border-purple-400'
                        : 'border-slate-200'
                    }`}
                  >
                    <CardContent className="p-6">
                      {plan.popular && (
                        <Badge className="mb-3 bg-purple-600">Most Popular</Badge>
                      )}
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                      <p className="text-3xl font-bold text-blue-600 mb-4">
                        ${plan.price}
                        <span className="text-sm text-slate-600">/mo</span>
                      </p>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.id === user.subscription_plan ? (
                        <Badge className="w-full py-2 justify-center bg-blue-600">
                          Current Plan
                        </Badge>
                      ) : (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Upgrade to {plan.name}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Branding */}
        {canCustomizeBranding && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Custom Branding (Pro/Unlimited)
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Customize your PDF reports with your company branding
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Company Logo URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      placeholder="https://yoursite.com/logo.png"
                      value={customBranding.logo_url}
                      onChange={(e) => setCustomBranding({...customBranding, logo_url: e.target.value})}
                    />
                    <Button variant="outline">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Company Name</Label>
                  <Input 
                    className="mt-2"
                    placeholder="ABC Roofing LLC"
                    value={customBranding.company_name}
                    onChange={(e) => setCustomBranding({...customBranding, company_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input 
                    className="mt-2"
                    placeholder="123 Main St, City, State"
                    value={customBranding.address}
                    onChange={(e) => setCustomBranding({...customBranding, address: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input 
                    className="mt-2"
                    placeholder="(555) 123-4567"
                    value={customBranding.phone}
                    onChange={(e) => setCustomBranding({...customBranding, phone: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input 
                    className="mt-2"
                    type="email"
                    placeholder="info@abcroofing.com"
                    value={customBranding.email}
                    onChange={(e) => setCustomBranding({...customBranding, email: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Primary Brand Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      type="color"
                      value={customBranding.primary_color}
                      onChange={(e) => setCustomBranding({...customBranding, primary_color: e.target.value})}
                      className="w-20 h-10"
                    />
                    <Input 
                      value={customBranding.primary_color}
                      onChange={(e) => setCustomBranding({...customBranding, primary_color: e.target.value})}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>PDF Footer Text</Label>
                <Input 
                  className="mt-2"
                  placeholder="Licensed & Insured • Serving DFW Since 2010"
                  value={customBranding.footer_text}
                  onChange={(e) => setCustomBranding({...customBranding, footer_text: e.target.value})}
                />
              </div>

              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSaveBranding}
              >
                Save Branding Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {!canCustomizeBranding && (
          <Card className="shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-8 text-center">
              <Crown className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Unlock Custom Branding
              </h3>
              <p className="text-slate-600 mb-6">
                Upgrade to Pro or Unlimited to add your logo and company info to all PDF reports
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Upgrade to Pro - $99/month
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p>No invoices yet</p>
              <p className="text-sm mt-1">Your billing history will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}