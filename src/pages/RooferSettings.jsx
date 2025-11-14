
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Building2,
  Lock,
  CreditCard,
  Palette,
  Save,
  Upload,
  Loader2,
  Crown,
  ExternalLink,
  AlertCircle,
  Eye // Added Eye import
} from "lucide-react";

export default function RooferSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [showPreview, setShowPreview] = useState(false); // New state for preview

  const [profile, setProfile] = useState({
    company_name: '',
    full_name: '',
    email: '',
    phone: ''
  });

  const [branding, setBranding] = useState({
    logo_url: '',
    company_name: '',
    address: '',
    phone: '',
    email: '',
    primary_color: '#3b82f6',
    footer_text: ''
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();

      if (currentUser.aroof_role !== 'external_roofer') {
        alert('Access denied. External roofer account required.');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setUser(currentUser);

      setProfile({
        company_name: currentUser.company_name || '',
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });

      if (currentUser.custom_branding) {
        setBranding(currentUser.custom_branding);
      }

      setLoading(false);
    } catch (err) {
      console.error('Auth error:', err);
      navigate(createPageUrl("RooferSignup"));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        company_name: profile.company_name,
        full_name: profile.full_name,
        phone: profile.phone
      });

      alert('✅ Profile updated successfully!');
      await loadUser();
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    if (user.subscription_plan !== 'pro' && user.subscription_plan !== 'unlimited') {
      alert('Custom branding is only available on Pro and Unlimited plans');
      return;
    }

    setSaving(true);
    try {
      await base44.auth.updateMe({
        custom_branding: branding
      });

      alert('✅ Branding settings saved!');
      await loadUser();
    } catch (err) {
      console.error('Error saving branding:', err);
      alert('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenBillingPortal = () => {
    if (!user.stripe_customer_id) {
      alert('No billing information found. Please subscribe to a plan first.');
      return;
    }

    // In production, this would call backend to create Stripe portal session
    alert(
      '🔗 STRIPE BILLING PORTAL\n\n' +
      'This would open Stripe Customer Portal where you can:\n\n' +
      '• Update payment method\n' +
      '• View invoices & receipts\n' +
      '• Update billing info\n' +
      '• Cancel subscription\n\n' +
      'To integrate: Create backend endpoint that returns portal URL'
    );
  };

  const handleCancelSubscription = async () => {
    if (!user.stripe_subscription_id) {
      alert('No active subscription found');
      return;
    }

    const confirm = window.confirm(
      '⚠️ Cancel Subscription?\n\n' +
      'Your subscription will remain active until the end of your current billing period.\n' +
      'After that, you will be downgraded to the Free plan (3 measurements/month).\n\n' +
      'Are you sure you want to cancel?'
    );

    if (!confirm) return;

    setSaving(true);
    try {
      // In production, call backend to cancel Stripe subscription
      alert(
        '⚠️ STRIPE CANCELLATION\n\n' +
        'This would:\n' +
        '1. Cancel Stripe subscription\n' +
        '2. Keep access until period end\n' +
        '3. Then downgrade to Free plan\n\n' +
        'Requires backend integration'
      );

      // Temporary: Update status (remove in production)
      await base44.auth.updateMe({
        subscription_status: 'canceled'
      });

      alert('✅ Subscription canceled. Access until end of billing period.');
      await loadUser();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      alert('Failed to cancel subscription');
    } finally {
      setSaving(false);
    }
  };

  const canCustomizeBranding = user?.subscription_plan === 'pro' || user?.subscription_plan === 'unlimited';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("RooferDashboard")}>
              <Button variant="ghost">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">
                {user.subscription_plan?.toUpperCase() || 'FREE'}
              </Badge>
              <Link to={createPageUrl("RooferPlans")}>
                <Button variant="outline" size="sm">
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Account Settings</h1>
          <p className="text-slate-600">Manage your profile, branding, and subscription</p>
        </div>

        {/* Stripe Integration Alert */}
        {user.subscription_plan !== 'free' && !user.stripe_customer_id && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>⚠️ Payment Integration Pending:</strong> Your subscription is active but Stripe integration
              is not yet configured. Contact support for billing management.
            </AlertDescription>
          </Alert>
        )}

        {/* Company Profile */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={profile.company_name}
                  onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                  placeholder="ABC Roofing LLC"
                />
              </div>
              <div>
                <Label>Your Full Name *</Label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-slate-100 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Contact support to change email</p>
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Custom Branding */}
        {canCustomizeBranding ? (
          <Card className="shadow-lg border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Custom Branding ({user.subscription_plan.toUpperCase()})
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Customize your PDF reports with your company branding
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="border-purple-600 text-purple-600"
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Preview Section */}
              {showPreview && (
                <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Branding Preview
                  </h4>

                  {/* Mock PDF Header Preview */}
                  <div
                    className="rounded-lg p-6 mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${branding.primary_color} 0%, ${adjustBrightness(branding.primary_color, -15)} 100%)`,
                      color: 'white'
                    }}
                  >
                    {branding.logo_url && (
                      <img
                        src={branding.logo_url}
                        alt="Company Logo"
                        className="max-w-[150px] max-h-[60px] mb-3 bg-white/20 p-2 rounded"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.onerror = null; }}
                      />
                    )}
                    <h1 className="text-3xl font-bold mb-2">
                      {branding.company_name || 'Your Company Name'}
                    </h1>
                    <p className="text-sm opacity-90">
                      {branding.footer_text || 'Professional Roofing Services'}
                    </p>
                  </div>

                  {/* Contact Info Preview */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-700 mb-2">Contact Information on PDF:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">📞 Phone:</span>
                        <p className="font-medium">{branding.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">✉️ Email:</span>
                        <p className="font-medium">{branding.email || 'Not set'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">📍 Address:</span>
                        <p className="font-medium">{branding.address || 'Not set'}</p>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200 mt-4">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      This is how your branding will appear on PDF reports.
                      Make changes below and save to update.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Company Logo URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="https://yoursite.com/logo.png"
                      value={branding.logo_url}
                      onChange={(e) => setBranding({...branding, logo_url: e.target.value})}
                    />
                    <Button variant="outline" size="icon" title="Upload logo">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Max 150x60px, PNG or JPG
                  </p>
                </div>

                <div>
                  <Label>Company Name (on PDFs)</Label>
                  <Input
                    className="mt-2"
                    placeholder="ABC Roofing LLC"
                    value={branding.company_name}
                    onChange={(e) => setBranding({...branding, company_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    className="mt-2"
                    placeholder="123 Main St, City, State"
                    value={branding.address}
                    onChange={(e) => setBranding({...branding, address: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    className="mt-2"
                    placeholder="(555) 123-4567"
                    value={branding.phone}
                    onChange={(e) => setBranding({...branding, phone: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    className="mt-2"
                    type="email"
                    placeholder="info@abcroofing.com"
                    value={branding.email}
                    onChange={(e) => setBranding({...branding, email: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Primary Brand Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={branding.primary_color}
                      onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                      className="w-20 h-10"
                    />
                    <Input
                      value={branding.primary_color}
                      onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                      placeholder="#3b82f6"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Used for headers and accents
                  </p>
                </div>
              </div>

              <div>
                <Label>PDF Footer Text</Label>
                <Input
                  className="mt-2"
                  placeholder="Licensed & Insured • Serving DFW Since 2010"
                  value={branding.footer_text}
                  onChange={(e) => setBranding({...branding, footer_text: e.target.value})}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleSaveBranding}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Branding
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="border-purple-600 text-purple-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>

              <Alert className="bg-purple-50 border-purple-200">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-900">
                  <strong>Pro Tip:</strong> Use high-contrast colors for best readability.
                  Your logo should have a transparent background for best results.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-8 text-center">
              <Crown className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Unlock Custom Branding
              </h3>
              <p className="text-slate-600 mb-6">
                Upgrade to Pro or Unlimited to add your logo and company info to all PDF reports
              </p>
              <Link to={createPageUrl("RooferPlans")}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Crown className="w-4 h-4 mr-2" />
                  View Plans
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Current Subscription & Billing */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Plan</p>
                <p className="text-2xl font-bold text-slate-900">
                  {user.subscription_plan?.charAt(0).toUpperCase() + user.subscription_plan?.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Usage This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {user.measurements_used_this_month || 0}
                  <span className="text-lg text-slate-400">
                    /{user.measurements_limit === 999999 ? '∞' : user.measurements_limit}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <Badge className={
                  user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                  user.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                  user.subscription_status === 'canceled' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }>
                  {user.subscription_status?.toUpperCase() || 'ACTIVE'}
                </Badge>
              </div>
            </div>

            {/* Billing Portal Button */}
            {user.subscription_plan !== 'free' && (
              <div className="pt-4 border-t space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleOpenBillingPortal}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Billing Portal (Update Payment, View Invoices)
                </Button>

                <div className="flex gap-3">
                  <Link to={createPageUrl("RooferPlans")} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Change Plan
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={handleCancelSubscription}
                    disabled={saving}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            )}

            {user.subscription_plan === 'free' && (
              <Link to={createPageUrl("RooferPlans")}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Paid Plan
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({...password, current: e.target.value})}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword({...password, new: e.target.value})}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword({...password, confirm: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <Button variant="outline">
              Change Password
            </Button>

            <div className="pt-6 border-t">
              <Button variant="outline" className="text-red-600 hover:bg-red-50">
                Delete Account
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function for color brightness adjustment
function adjustBrightness(hex, percent) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
    // Return a default slightly darker color or original if the input is invalid
    return '#2b72e6'; 
  }
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));

  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B)
    .toString(16).slice(1);
}
