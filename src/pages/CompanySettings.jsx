import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import TeamManager from "../components/crm/TeamManager";

export default function CompanySettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    description: '',
    address_street: '',
    address_city: '',
    address_state: 'TX',
    address_zip: ''
  });

  const [newMember, setNewMember] = useState({
    email: '',
    full_name: '',
    aroof_role: 'estimator',
    job_title: '',
    phone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      
      if (!currentUser) {
        setError('Please log in to continue');
        setLoading(false);
        return;
      }

      setUser(currentUser);

      if (!currentUser.company_id) {
        // Don't show error - user can initialize company
        setLoading(false);
        return;
      }

      // Load company - DO NOT retry on failure
      try {
        const companies = await base44.entities.Company.list();
        const companyData = companies.find(c => c.id === currentUser.company_id);
        
        if (companyData) {
          setCompany(companyData);
          setCompanyForm({
            company_name: companyData.company_name || '',
            contact_name: companyData.contact_name || '',
            contact_email: companyData.contact_email || '',
            contact_phone: companyData.contact_phone || '',
            website_url: companyData.website_url || '',
            description: companyData.description || '',
            address_street: companyData.address_street || '',
            address_city: companyData.address_city || '',
            address_state: companyData.address_state || 'TX',
            address_zip: companyData.address_zip || ''
          });
        } else {
          console.error('Company not found for ID:', currentUser.company_id);
        }
      } catch (companyErr) {
        console.error('Company fetch error:', companyErr);
        // Don't retry - just log
      }

      // Load team - DO NOT retry on failure
      try {
        const allUsers = await base44.entities.User.list();
        const team = allUsers.filter(u => u.company_id === currentUser.company_id);
        setTeamMembers(team || []);
      } catch (teamErr) {
        console.error('Team fetch error:', teamErr);
        setTeamMembers([]);
        // Don't retry - just log
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load company settings. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setSaving(true);
      // Generate Stripe Link
      const { url } = await base44.stripe.createConnectAccountLink({
        refresh_url: window.location.href,
        return_url: window.location.href + '?success=true',
      });
      window.location.href = url; // Redirect user
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect Stripe");
      setSaving(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await base44.entities.Company.update(company.id, companyForm);
      toast.success('Company profile updated successfully!');
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeCompany = async () => {
    setSaving(true);
    try {
      const newCompany = await base44.entities.Company.create({
        company_name: `${user.full_name}'s Company` || 'My Company',
        contact_email: user.email,
        contact_name: user.full_name,
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        is_active: true
      });

      await base44.auth.updateMe({
        company_id: newCompany.id,
        company_name: newCompany.company_name,
        aroof_role: 'external_roofer',
        is_company_owner: true
      });

      toast.success('Company initialized! Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Failed to initialize company:', err);
      toast.error('Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await base44.users.inviteUser(newMember.email, 'user');
      
      setTimeout(async () => {
        try {
          const allUsers = await base44.entities.User.list();
          const newUser = allUsers.find(u => u.email === newMember.email);
          
          if (newUser) {
            await base44.entities.User.update(newUser.id, {
              full_name: newMember.full_name,
              company_id: company.id,
              company_name: company.company_name,
              aroof_role: newMember.aroof_role,
              job_title: newMember.job_title,
              phone: newMember.phone
            });
          }

          setSuccess(`Team member ${newMember.full_name} invited! They'll receive an email to set up their account.`);
          setNewMember({ email: '', full_name: '', aroof_role: 'estimator', job_title: '', phone: '' });
          
          const team = allUsers.filter(u => u.company_id === company.id);
          setTeamMembers(team);
        } catch (updateErr) {
          console.error('Error updating invited user:', updateErr);
        }
      }, 1000);

    } catch (err) {
      console.error('Error inviting team member:', err);
      toast.error('Failed to invite team member. Email may already exist.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      external_roofer: 'bg-blue-100 text-blue-800',
      company_owner: 'bg-purple-100 text-purple-800',
      estimator: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      dispatcher: 'bg-yellow-100 text-yellow-800',
      crew: 'bg-gray-100 text-gray-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // If no company, show initialization screen
  if (!company && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏢</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">No Company Found</h2>
            <p className="text-slate-600 mb-6">
              You need to initialize a company to access CRM features.
            </p>
            <Button 
              onClick={handleInitializeCompany} 
              disabled={saving}
              size="lg" 
              className="w-full"
            >
              {saving ? 'Creating...' : 'Initialize My Company'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate(createPageUrl("RooferDashboard"))}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-slate-900">Company Settings</h1>
              <p className="text-slate-600">{company?.company_name}</p>
            </div>
            {user?.is_company_owner && (
              <Badge className="bg-purple-100 text-purple-800 text-sm px-4 py-2">
                Company Owner
              </Badge>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 border-b overflow-x-auto">
          {['profile', 'team', 'service-areas', 'subscription'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'profile' && '🏢 Company Profile'}
              {tab === 'team' && '👥 Team Management'}
              {tab === 'service-areas' && '📍 Service Areas'}
              {tab === 'subscription' && '💳 Subscription'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="max-w-3xl">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Company Information</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Company Name *</Label>
                      <Input
                        required
                        value={companyForm.company_name}
                        onChange={(e) => setCompanyForm({...companyForm, company_name: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Contact Name</Label>
                      <Input
                        value={companyForm.contact_name}
                        onChange={(e) => setCompanyForm({...companyForm, contact_name: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Contact Email *</Label>
                      <Input
                        type="email"
                        required
                        value={companyForm.contact_email}
                        onChange={(e) => setCompanyForm({...companyForm, contact_email: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Contact Phone</Label>
                      <Input
                        type="tel"
                        value={companyForm.contact_phone}
                        onChange={(e) => setCompanyForm({...companyForm, contact_phone: e.target.value})}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Website URL</Label>
                      <Input
                        type="url"
                        placeholder="https://yourcompany.com"
                        value={companyForm.website_url}
                        onChange={(e) => setCompanyForm({...companyForm, website_url: e.target.value})}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Company Description</Label>
                      <textarea
                        rows={4}
                        value={companyForm.description}
                        onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                        placeholder="Tell customers about your company..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold mb-4">Business Address</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label>Street Address</Label>
                        <Input
                          value={companyForm.address_street}
                          onChange={(e) => setCompanyForm({...companyForm, address_street: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>City</Label>
                        <Input
                          value={companyForm.address_city}
                          onChange={(e) => setCompanyForm({...companyForm, address_city: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>ZIP Code</Label>
                        <Input
                          value={companyForm.address_zip}
                          onChange={(e) => setCompanyForm({...companyForm, address_zip: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(createPageUrl("RooferDashboard"))}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'team' && <TeamManager userProfile={user} />}

        {activeTab === 'service-areas' && (
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Service Areas</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📍 Service area configuration coming soon. Your company currently serves the entire DFW metroplex.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'subscription' && (
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Subscription & Billing</h2>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {company?.subscription_tier?.toUpperCase() || 'BASIC'} Plan
                    </h3>
                    <p className="text-slate-600">
                      Status: <span className="font-semibold">{company?.subscription_status || 'Active'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">$0/mo</p>
                    <p className="text-sm text-slate-600">During trial</p>
                  </div>
                </div>
                
                {company?.trial_end_date && (
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      ⏰ Trial ends: {new Date(company.trial_end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Payment Processing</h3>
                <p className="text-slate-600 mb-4">
                  Connect your Stripe account to receive payments for jobs and manage subscriptions.
                </p>
                <Button 
                  onClick={handleConnectStripe}
                  disabled={saving}
                  className="bg-[#635BFF] hover:bg-[#5851df] text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Stripe Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}