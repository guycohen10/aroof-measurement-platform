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
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.company_id) {
        setError('No company associated with your account');
        setTimeout(() => navigate(createPageUrl("RooferDashboard")), 2000);
        return;
      }

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
      }

      const allUsers = await base44.entities.User.list();
      const team = allUsers.filter(u => u.company_id === currentUser.company_id);
      setTeamMembers(team);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load company settings');
    } finally {
      setLoading(false);
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

        {activeTab === 'team' && (
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Add Team Member</h2>
                <form onSubmit={handleAddTeamMember} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        required
                        value={newMember.full_name}
                        onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Email Address *</Label>
                      <Input
                        type="email"
                        required
                        value={newMember.email}
                        onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Role *</Label>
                      <select
                        required
                        value={newMember.aroof_role}
                        onChange={(e) => setNewMember({...newMember, aroof_role: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="estimator">Estimator</option>
                        <option value="sales">Sales Rep</option>
                        <option value="dispatcher">Dispatcher</option>
                        <option value="crew">Crew Member</option>
                      </select>
                    </div>

                    <div>
                      <Label>Job Title</Label>
                      <Input
                        value={newMember.job_title}
                        onChange={(e) => setNewMember({...newMember, job_title: e.target.value})}
                        placeholder="e.g. Senior Estimator"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        value={newMember.phone}
                        onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={saving} className="w-full md:w-auto">
                    {saving ? 'Inviting...' : 'Invite Team Member'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Team Members ({teamMembers.length})</h2>
                
                <div className="space-y-4">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-600">
                            {member.full_name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{member.full_name || member.email}</h3>
                            {member.is_company_owner && (
                              <Badge className="bg-purple-100 text-purple-800">OWNER</Badge>
                            )}
                            <Badge className={getRoleBadgeColor(member.aroof_role)}>
                              {member.aroof_role?.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{member.email}</p>
                          {member.job_title && (
                            <p className="text-sm text-slate-500">{member.job_title}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  💳 Full subscription management coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}