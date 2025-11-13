import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Building2, 
  Lock, 
  CreditCard, 
  Palette,
  Save,
  Upload,
  Loader2,
  Crown
} from "lucide-react";

export default function RooferSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

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
      
      // Set profile data
      setProfile({
        company_name: currentUser.company_name || '',
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });

      // Set branding data if exists
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
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Custom Branding (Pro/Unlimited)
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Customize your PDF reports with your company branding
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Company Logo URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="https://yoursite.com/logo.png"
                      value={branding.logo_url}
                      onChange={(e) => setBranding({...branding, logo_url: e.target.value})}
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
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

              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleSaveBranding}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Branding
              </Button>
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

        {/* Current Subscription */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <Badge className="bg-green-100 text-green-800">
                  {user.subscription_status?.toUpperCase() || 'ACTIVE'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Link to={createPageUrl("RooferPlans")} className="flex-1">
                <Button variant="outline" className="w-full">
                  Change Plan
                </Button>
              </Link>
              {user.subscription_plan !== 'free' && (
                <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50">
                  Cancel Subscription
                </Button>
              )}
            </div>
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