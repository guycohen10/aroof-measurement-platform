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
import { Users, UserPlus, Loader2, Mail, Phone, Shield, ArrowRight, Copy, CheckCircle } from 'lucide-react';

export default function TeamManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales',
    phone: ''
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

      try {
        const companies = await base44.entities.Company.list();
        const companyData = companies.find(c => c.id === currentUser.company_id);
        if (companyData) {
          setCompany(companyData);
        }
      } catch (companyErr) {
        console.error('Company fetch error:', companyErr);
      }

      try {
        const allUsers = await base44.entities.User.list();
        const team = allUsers.filter(u => u.company_id === currentUser.company_id);
        setTeamMembers(team || []);
      } catch (teamErr) {
        console.error('Team fetch error:', teamErr);
        setTeamMembers([]);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load team data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Invite user first
      await base44.users.inviteUser(newUser.email, 'user');

      // Wait for user creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user with full details including password
      const allUsers = await base44.entities.User.list();
      const createdUser = allUsers.find(u => u.email === newUser.email);

      if (createdUser) {
        await base44.entities.User.update(createdUser.id, {
          full_name: newUser.name,
          phone: newUser.phone,
          company_id: company.id,
          company_name: company.company_name,
          aroof_role: newUser.role,
          is_company_owner: false,
          password: newUser.password
        });
      }

      // Store credentials for modal
      setCreatedCredentials({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name
      });

      setShowCredentialsModal(true);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'sales', phone: '' });
      
      toast.success('Account created successfully!');
      loadData();

    } catch (err) {
      console.error('Error creating user:', err);
      toast.error('Failed to create account. Email may already exist.');
    } finally {
      setSaving(false);
    }
  };

  const copyCredentials = () => {
    const text = `Login Credentials:\n\nEmail: ${createdCredentials?.email}\nPassword: ${createdCredentials?.password}\n\nIMPORTANT: Check your email and click the verification link first!\n\nLogin at: https://aroof.build/login`;
    navigator.clipboard.writeText(text);
    toast.success('Credentials copied to clipboard!');
  };

  const getRoleBadge = (role, isOwner) => {
    if (isOwner) {
      return <Badge className="bg-purple-500 text-white"><Shield className="w-3 h-3 mr-1" />Owner</Badge>;
    }
    
    const roleMap = {
      sales: { label: 'Sales', color: 'bg-green-500 text-white' },
      estimator: { label: 'Estimator', color: 'bg-blue-500 text-white' },
      dispatcher: { label: 'Dispatcher', color: 'bg-yellow-500 text-white' },
      crew: { label: 'Crew', color: 'bg-gray-500 text-white' },
      external_roofer: { label: 'Roofer', color: 'bg-blue-500 text-white' }
    };

    const roleInfo = roleMap[role] || { label: role, color: 'bg-gray-500 text-white' };
    return <Badge className={roleInfo.color}>{roleInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Security check
  if (!user?.is_company_owner && user?.aroof_role !== 'company_owner' && user?.role !== 'admin') {
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

        {/* Team List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Team Members ({teamMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">
                        {member.full_name?.[0]?.toUpperCase() || member.email[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{member.full_name || 'Unnamed'}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  {getRoleBadge(member.aroof_role, member.is_company_owner)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Employee Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Employee Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Mike Roofer"
                  />
                </div>

                <div>
                  <Label>Email / Username *</Label>
                  <Input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="mike@roofing.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-800 font-bold">Assign Password *</Label>
                  <Input
                    type="text"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Create a password (e.g. Roof123!)"
                    className="border-2 border-blue-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">You'll copy and text these credentials</p>
                </div>

                <div>
                  <Label>Role *</Label>
                  <select
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sales">Sales Rep</option>
                    <option value="crew">Crew Lead</option>
                    <option value="estimator">Estimator</option>
                    <option value="dispatcher">Dispatcher</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {saving ? 'Creating Account...' : 'Create Employee Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Credentials Success Modal */}
        <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-orange-600" />
                User Created! Verification Required.
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-900 font-bold">
                  ⚠️ IMPORTANT: A confirmation email has been sent to <span className="underline">{createdCredentials?.email}</span>. The user MUST click the link in that email to activate this account before they can log in.
                </p>
              </div>

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
                      https://aroof.build/login
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
                  onClick={copyCredentials} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Credentials
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowCredentialsModal(false);
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