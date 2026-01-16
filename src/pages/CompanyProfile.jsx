import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, Loader2, Save, Building2, Zap } from "lucide-react";
import LogoUploader from "../components/LogoUploader";
import PortfolioManager from "../components/PortfolioManager";
import ReviewImporter from "../components/ReviewImporter";

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_phone: "",
    contact_email: "",
    contact_name: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: ""
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (!currentUser.company_id) {
        alert('No company associated with your account');
        navigate(createPageUrl("RooferDashboard"));
        return;
      }

      setUser(currentUser);

      const companies = await base44.entities.Company.list();
      const userCompany = companies.find(c => c.id === currentUser.company_id);

      if (!userCompany) {
        alert('Company not found');
        navigate(createPageUrl("RooferDashboard"));
        return;
      }

      setCompany(userCompany);
      setFormData({
        company_name: userCompany.company_name || "",
        contact_phone: userCompany.contact_phone || "",
        contact_email: userCompany.contact_email || "",
        contact_name: userCompany.contact_name || "",
        address_street: userCompany.address_street || "",
        address_city: userCompany.address_city || "",
        address_state: userCompany.address_state || "",
        address_zip: userCompany.address_zip || ""
      });

      setLoading(false);
    } catch (err) {
      console.error('Error loading company:', err);
      alert('Failed to load company data');
      navigate(createPageUrl("RooferDashboard"));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await base44.entities.Company.update(company.id, {
        company_name: formData.company_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        contact_name: formData.contact_name,
        address_street: formData.address_street,
        address_city: formData.address_city,
        address_state: formData.address_state,
        address_zip: formData.address_zip
      });

      // Update user's company_name field as well
      await base44.auth.updateMe({
        company_name: formData.company_name
      });

      alert('✅ Company information updated successfully!');
      navigate(createPageUrl("RooferDashboard"));
    } catch (err) {
      console.error('Error saving company:', err);
      alert('❌ Failed to save changes: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
            </div>
            <Link to={createPageUrl("RooferDashboard")}>
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Company Settings</CardTitle>
            <p className="text-sm text-slate-600">Manage your company information</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Company Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Your Roofing Company LLC"
                    />
                  </div>

                  <div>
                    <Label>Company Phone *</Label>
                    <Input
                      required
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="contact@yourcompany.com"
                    />
                  </div>

                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      placeholder="Primary contact person"
                    />
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="border-t pt-6">
                <LogoUploader company={company} onUpdate={setCompany} />
              </div>

              {/* Address */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Company Address</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Street Address</Label>
                    <Input
                      value={formData.address_street}
                      onChange={(e) => setFormData({...formData, address_street: e.target.value})}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={formData.address_city}
                        onChange={(e) => setFormData({...formData, address_city: e.target.value})}
                        placeholder="Dallas"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>State</Label>
                        <Input
                          maxLength="2"
                          value={formData.address_state}
                          onChange={(e) => setFormData({...formData, address_state: e.target.value.toUpperCase()})}
                          placeholder="TX"
                        />
                      </div>
                      <div>
                        <Label>ZIP</Label>
                        <Input
                          maxLength="5"
                          value={formData.address_zip}
                          onChange={(e) => setFormData({...formData, address_zip: e.target.value})}
                          placeholder="75201"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Link to={createPageUrl("RooferDashboard")} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Enhanced Profile Section */}
        {company?.enhanced_profile && (
          <>
            <Card className="shadow-lg mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Enhanced Profile Active
                  </span>
                  <Badge className="bg-purple-600">Premium</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  You have access to portfolio management and review imports. Manage them below.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6 mt-6">
              <PortfolioManager company={company} onUpdate={setCompany} />
              <ReviewImporter company={company} onUpdate={setCompany} />
            </div>
          </>
        )}

        {!company?.enhanced_profile && (
          <Card className="shadow-lg mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">Upgrade to Enhanced Profile</h3>
                  <p className="text-slate-600 text-sm">Showcase your portfolio and import reviews for $20/month</p>
                </div>
                <Link to={createPageUrl("UpgradeProfile")}>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Stats */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600">Subscription Tier</p>
                <p className="text-lg font-bold text-slate-900">
                  {company?.subscription_tier?.toUpperCase() || 'BASIC'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-lg font-bold text-green-600">
                  {company?.subscription_status?.toUpperCase() || 'TRIAL'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Account Active</p>
                <p className="text-lg font-bold text-slate-900">
                  {company?.is_active ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}