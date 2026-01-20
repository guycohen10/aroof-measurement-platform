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
    aroof_role: 'estimator'
  });

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
      // Create user directly in the User entity
      const newUserData = {
        full_name: newMember.full_name,
        email: newMember.email,
        phone: newMember.phone,
        company_id: company.id,
        company_name: company.company_name,
        aroof_role: newMember.aroof_role,
        is_company_owner: false,
        role: 'user'
      };

      const createdUser = await base44.entities.User.create(newUserData);

      // Generate magic login link
      const token = btoa(JSON.stringify({ 
        email: createdUser.email, 
        user_id: createdUser.id,
        timestamp: Date.now() 
      }));
      const loginUrl = `${window.location.origin}${createPageUrl('RooferLogin')}?token=${token}&type=magic_link`;
      
      // CRITICAL: Show modal IMMEDIATELY after user creation
      setMagicLink(loginUrl);
      setShowMagicLinkModal(true);
      
      toast.success(`${newMember.full_name} created!`);
      
      // Close add modal and reload
      setShowAddModal(false);
      setNewMember({ full_name: '', email: '', phone: '', aroof_role: 'estimator' });
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

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Inviting...' : 'Send Invite'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Magic Link Modal */}
        <Dialog open={showMagicLinkModal} onOpenChange={setShowMagicLinkModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>🎉 Employee Created Successfully!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900 mb-2">
                  <strong>Share this magic login link with your new employee:</strong>
                </p>
                <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm break-all">
                  {magicLink}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Instructions for the employee:</strong>
                </p>
                <ol className="list-decimal list-inside text-sm text-blue-800 mt-2 space-y-1">
                  <li>Click the link to open the login page</li>
                  <li>Set a password for their account</li>
                  <li>They'll be logged in automatically</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button onClick={copyMagicLink} className="flex-1">
                  📋 Copy Link
                </Button>
                <Button variant="outline" onClick={() => setShowMagicLinkModal(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}