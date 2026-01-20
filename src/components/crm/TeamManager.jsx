import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, Loader2, Mail, Phone, Briefcase, Shield, ArrowRight, Send } from 'lucide-react';

export default function TeamManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMagicLinkModal, setShowMagicLinkModal] = useState(false);
  const [magicLink, setMagicLink] = useState('');
  
  const [newMember, setNewMember] = useState({
    full_name: '',
    email: '',
    phone: '',
    aroof_role: 'estimator',
    password: ''
  });
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser?.company_id) {
        toast.error('No company associated with your account');
        setLoading(false);
        return;
      }

      // Load company - DO NOT retry on failure
      try {
        const companies = await base44.entities.Company.list();
        const companyData = companies.find(c => c.id === currentUser.company_id);
        if (companyData) {
          setCompany(companyData);
        } else {
          console.error('Company not found');
        }
      } catch (companyErr) {
        console.error('Company fetch error:', companyErr);
        // Don't retry - just log
      }

      // Load team members - DO NOT retry on failure
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
      toast.error('Failed to load team data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Invoke user with password and metadata
      await base44.users.inviteUser(newMember.email, 'user');

      // Wait a moment for the user to be created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the newly created user with full details
      const allUsers = await base44.entities.User.list();
      const createdUser = allUsers.find(u => u.email === newMember.email);

      if (createdUser) {
        await base44.entities.User.update(createdUser.id, {
          full_name: newMember.full_name,
          phone: newMember.phone,
          company_id: company.id,
          company_name: company.company_name,
          aroof_role: newMember.aroof_role,
          is_company_owner: false,
          password: newMember.password
        });
      }

      // Store credentials for display
      setCreatedCredentials({
        email: newMember.email,
        password: newMember.password,
        name: newMember.full_name
      });

      // Show success modal with credentials
      setShowMagicLinkModal(true);
      
      toast.success(`${newMember.full_name} created!`);
      
      // Close add modal and reload
      setShowAddModal(false);
      setNewMember({ full_name: '', email: '', phone: '', aroof_role: 'estimator', password: '' });
      loadData();

    } catch (err) {
      console.error('Error creating team member:', err);
      toast.error('Failed to create team member. Email may already exist.');
    } finally {
      setSaving(false);
    }
  };

  const resendInvite = (member) => {
    // Generate new magic link for existing employee
    const token = btoa(JSON.stringify({ 
      email: member.email, 
      user_id: member.id,
      timestamp: Date.now() 
    }));
    const loginUrl = `${window.location.origin}${createPageUrl('RooferLogin')}?token=${token}&type=magic_link`;

    setMagicLink(loginUrl);
    setShowMagicLinkModal(true);
    toast.success('Magic link generated!');
  };

  const copyMagicLink = () => {
    navigator.clipboard.writeText(magicLink);
    toast.success('Link copied to clipboard!');
  };

  const getRoleBadge = (role, isOwner) => {
    if (isOwner) {
      return <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" />Owner</Badge>;
    }
    
    const roleMap = {
      external_roofer: { label: 'External Roofer', color: 'bg-blue-100 text-blue-800' },
      estimator: { label: 'Estimator', color: 'bg-green-100 text-green-800' },
      dispatcher: { label: 'Dispatcher', color: 'bg-yellow-100 text-yellow-800' },
      crew: { label: 'Crew', color: 'bg-gray-100 text-gray-800' },
      company_owner: { label: 'Owner', color: 'bg-purple-100 text-purple-800' }
    };

    const roleInfo = roleMap[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={roleInfo.color}>{roleInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Security check - only owners can see this
  if (!user?.is_company_owner && user?.aroof_role !== 'company_owner') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-6">Only company owners can manage team members.</p>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate(createPageUrl('RooferDashboard'))}
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Team Management
            </h1>
            <p className="text-slate-600 mt-2">{company?.company_name || 'Your Company'}</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} size="lg">
            <UserPlus className="w-5 h-5 mr-2" />
            Add Employee
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Team Members ({teamMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">Name</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Phone</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Role</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map(member => (
                    <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-600">
                              {member.full_name?.[0]?.toUpperCase() || member.email[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{member.full_name || 'Unnamed'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          {member.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(member.aroof_role, member.is_company_owner)}
                      </td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvite(member)}
                          className="flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Resend Link
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Employee Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  required
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>

              <div>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label>Role *</Label>
                <select
                  required
                  value={newMember.aroof_role}
                  onChange={(e) => setNewMember({ ...newMember, aroof_role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="estimator">Estimator</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="crew">Crew Member</option>
                  <option value="external_roofer">External Roofer</option>
                </select>
              </div>

              <div>
                <Label>Assign Password *</Label>
                <Input
                  type="text"
                  required
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  placeholder="Create a password for this employee"
                />
                <p className="text-xs text-slate-500 mt-1">You'll be able to copy and text these credentials</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Credentials Modal */}
        <Dialog open={showMagicLinkModal} onOpenChange={setShowMagicLinkModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>🎉 User Created Successfully!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <p className="text-sm text-green-900 mb-4 font-bold">
                  📋 Copy these credentials now. Text them to your employee:
                </p>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-green-800">Email</Label>
                    <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm">
                      {createdCredentials?.email}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-green-800">Password</Label>
                    <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm font-bold">
                      {createdCredentials?.password}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-green-800">Login URL</Label>
                    <div className="bg-white border border-green-300 rounded p-3 font-mono text-xs">
                      {window.location.origin}{createPageUrl('RooferLogin')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-yellow-900 font-semibold">
                  ⚠️ Warning: Copy these details now. You won't see them again.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    const text = `Login Credentials:\n\nEmail: ${createdCredentials?.email}\nPassword: ${createdCredentials?.password}\n\nLogin at: ${window.location.origin}${createPageUrl('RooferLogin')}`;
                    navigator.clipboard.writeText(text);
                    toast.success('Credentials copied to clipboard!');
                  }} 
                  className="flex-1"
                >
                  📋 Copy All Credentials
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowMagicLinkModal(false);
                  setCreatedCredentials(null);
                }} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}