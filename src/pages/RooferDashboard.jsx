import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ProposalWizard from "../components/leads/ProposalWizard";
import SecuritySettings from "../components/auth/SecuritySettings";
import RooferSidebar from "../components/crm/RooferSidebar";
import RoleGuard from "../components/crm/RoleGuard";
import SalesWorkspace from "../components/crm/workspaces/SalesWorkspace";
import CrewWorkspace from "../components/crm/workspaces/CrewWorkspace";
import TeamActivityFeed from "../components/crm/TeamActivityFeed";
import ActionCenter from "../components/crm/ActionCenter";
import { 
  Home,
  Zap,
  TrendingUp,
  Calendar,
  CreditCard,
  Settings,
  Download,
  Eye,
  AlertCircle,
  Crown,
  LogOut,
  Loader2,
  Users,
  Calculator
} from "lucide-react";
import { format } from "date-fns";

export default function RooferDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [user, setUser] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [activeTab, setActiveTab] = useState('purchased');
  const [purchasedLeadsCount, setPurchasedLeadsCount] = useState(0);
  const [showTakeoffModal, setShowTakeoffModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assigningLead, setAssigningLead] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const createAdminCompany = async (user) => {
    try {
      console.log('🔧 Auto-creating Admin HQ company...');
      
      // Create company
      const newCompany = await base44.entities.Company.create({
        company_name: 'Admin HQ',
        contact_email: user.email,
        contact_name: user.full_name || 'Admin',
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        is_active: true
      });

      console.log('✅ Admin HQ created:', newCompany.id);

      // Update user profile
      await base44.auth.updateMe({
        company_id: newCompany.id,
        company_name: 'Admin HQ',
        aroof_role: 'external_roofer',
        is_company_owner: true
      });

      console.log('✅ User profile updated with company_id');
      
      toast.success('Admin company created! Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Failed to create admin company:', err);
      toast.error('Failed to auto-create company. Please contact support.');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setHasError(false);
    
    try {
      const currentUser = await base44.auth.me();
      
      console.log('🔍 RooferDashboard - Current user loaded');
      console.log('🏢 Company ID:', currentUser.company_id);
      console.log('🎭 Aroof Role:', currentUser.aroof_role);
      
      if (currentUser.aroof_role !== 'external_roofer' && currentUser.role !== 'admin') {
        console.warn('⚠️ Access denied - user is not external_roofer or admin');
        toast.error('Access denied. This dashboard is for external roofers only.');
        navigate(createPageUrl("Homepage"));
        return;
      }

      // Ghost Check: Auto-fix for god_admin without company
      if (currentUser.role === 'admin' && !currentUser.company_id) {
        console.warn('⚠️ God admin without company_id - triggering auto-repair');
        await createAdminCompany(currentUser);
        return; // Stop here, page will reload
      }

      setUser(currentUser);

      const companyId = currentUser.company_id;
      if (!companyId) {
        console.warn('No company_id found for user');
        setLoading(false);
        return;
      }

      // Load measurements - DO NOT retry on failure
      try {
        const allMeasurements = await base44.entities.Measurement.list('-created_date', 100);
        
        // Filter to measurements that belong to this roofer
        const relevantMeasurements = allMeasurements.filter(m => 
          m.company_id === companyId || 
          m.purchased_by_companies?.includes(companyId)
        );
        
        setMeasurements(relevantMeasurements || []);
        
        // Count purchased leads
        const purchased = relevantMeasurements.filter(m => 
          m.purchased_by_companies?.includes(companyId) && m.user_type === 'homeowner'
        );
        setPurchasedLeadsCount(purchased.length);
      } catch (measurementErr) {
        console.error('Measurement fetch error:', measurementErr);
        setMeasurements([]);
        setPurchasedLeadsCount(0);
      }

      // Load team members for assignment
      try {
        const allUsers = await base44.entities.User.list();
        const companyTeam = allUsers.filter(u => u.company_id === companyId);
        setTeamMembers(companyTeam);
      } catch (userErr) {
        console.error('Team fetch error:', userErr);
        setTeamMembers([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Dashboard error:', err);
      setLoading(false);
      
      // Handle 429 Rate Limit errors gracefully
      if (err.message?.includes('429') || err.message?.includes('Too Many Requests')) {
        toast.error('System Busy - Please Wait 10 Seconds', { duration: 10000 });
        setHasError(true);
        return;
      }
      
      setHasError(true);
      
      // DO NOT navigate away on error - just show error state
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        navigate(createPageUrl("RooferLogin"));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      navigate(createPageUrl("RooferLogin"));
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = createPageUrl("RooferLogin");
    }
  };

  const handleNewMeasurement = async () => {
    // Check if user can create measurement
    const limit = getLimit(user.subscription_plan);
    const used = user.measurements_used_this_month || 0;

    if (user.subscription_plan !== 'unlimited' && used >= limit) {
      toast.error(`You've reached your monthly limit of ${limit} measurements. Upgrade to ${getNextPlan(user.subscription_plan)} for more!`);
      return;
    }

    // Redirect to NewLeadForm (correct roofer flow)
    navigate(createPageUrl("NewLeadForm"));
  };

  const getLimit = (plan) => {
    const limits = { free: 3, starter: 20, pro: 100, unlimited: 999999 };
    return limits[plan] || 3;
  };

  const getNextPlan = (currentPlan) => {
    const upgrades = { free: 'Starter', starter: 'Pro', pro: 'Unlimited' };
    return upgrades[currentPlan] || 'Pro';
  };

  const getPlanBadge = (plan) => {
    const colors = {
      free: 'bg-slate-100 text-slate-800',
      starter: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      unlimited: 'bg-yellow-100 text-yellow-800'
    };
    return colors[plan] || colors.free;
  };

  const getPlanPrice = (plan) => {
    const prices = { free: 0, starter: 49, pro: 99, unlimited: 199 };
    return prices[plan] || 0;
  };

  const getFilteredMeasurements = () => {
    if (!user?.company_id) return [];
    
    if (activeTab === 'own') {
      return measurements.filter(m => m.company_id === user.company_id);
    } else {
      return measurements.filter(m => 
        m.purchased_by_companies?.includes(user.company_id) && 
        m.user_type === 'homeowner'
      );
    }
  };

  const handleAssignLead = async (measurementId, userId) => {
    setAssigningLead(measurementId);
    try {
      await base44.entities.Measurement.update(measurementId, {
        assigned_to: userId
      });
      
      // Refresh measurements
      await loadDashboardData();
      toast.success("Lead assigned successfully!");
    } catch (err) {
      toast.error("Failed to assign lead");
      console.error(err);
    } finally {
      setAssigningLead(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-slate-900">System Error</h2>
            <p className="text-slate-600 mb-6">Failed to load dashboard. Please refresh the page.</p>
            <Button onClick={() => window.location.reload()} size="lg" className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const limit = getLimit(user.subscription_plan);
  const used = user.measurements_used_this_month || 0;
  const remaining = user.subscription_plan === 'unlimited' ? '∞' : Math.max(0, limit - used);
  const usagePercent = user.subscription_plan === 'unlimited' ? 0 : Math.min(100, (used / limit) * 100);
  const nearLimit = usagePercent > 80;

  // ROLE-BASED WORKSPACE ROUTING
  const userRole = user.aroof_role || user.role;
  const isOwner = userRole === 'admin' || userRole === 'external_roofer';
  const isSales = userRole === 'sales' || userRole === 'estimator';
  const isCrew = userRole === 'crew';

  // Route to specialized workspaces
  if (isSales) {
    return (
      <RoleGuard>
        <SalesWorkspace />
      </RoleGuard>
    );
  }

  if (isCrew) {
    return (
      <RoleGuard>
        <CrewWorkspace />
      </RoleGuard>
    );
  }

  // Owner/Admin sees full dashboard
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <RooferSidebar className="w-64 flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Home className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.company_name || user.full_name || 'Your Dashboard'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getPlanBadge(user.subscription_plan)}>
                      {user.subscription_plan?.toUpperCase() || 'FREE'}
                    </Badge>
                    <span className="text-sm text-blue-200">
                      {remaining === '∞' ? 'Unlimited measurements' : `${remaining} measurements left`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/10" 
                  size="sm"
                  onClick={() => setShowTakeoffModal(true)}
                >
                  <Calculator className="w-4 h-4 mr-1" />
                  AI Estimator
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="px-6 py-8">
          {/* Action Center */}
          <div className="mb-8">
            <ActionCenter userId={user.id} companyId={user.company_id} />
          </div>

          {/* Company Header */}
          {user?.company_id && (
          <Card className="shadow-lg mb-8 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">🏢</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{user.company_name}</h2>
                    <p className="text-slate-600 text-sm">Company ID: {user.company_id.slice(0, 8)}...</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {user.aroof_role?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="font-medium"
                  onClick={() => navigate(createPageUrl("CompanySettings"))}
                >
                  Company Settings →
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Admin Quick Actions - Direct Access to Management */}
          {(user?.aroof_role?.includes('roofer') || user?.aroof_role?.includes('owner') || user?.role === 'admin') && (
          <Card className="shadow-lg mb-8 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Company Management</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  size="lg"
                  className="h-16 bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate(createPageUrl("TeamManager"))}
                >
                  <div className="text-left w-full">
                    <div className="font-bold text-lg">👥 Manage Team</div>
                    <div className="text-sm opacity-90">View and manage team members</div>
                  </div>
                </Button>
                <Button 
                  size="lg"
                  className="h-16 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate(createPageUrl("CompanySettings"))}
                >
                  <div className="text-left w-full">
                    <div className="font-bold text-lg">⚙️ Company Settings</div>
                    <div className="text-sm opacity-90">Configure your company profile</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Usage Alert */}
          {nearLimit && user.subscription_plan !== 'unlimited' && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 mb-2">
                    You're running low on measurements!
                  </h3>
                  <p className="text-orange-800 mb-4">
                    You've used {used} out of {limit} measurements this month. 
                    Upgrade to get more measurements.
                  </p>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Top Row - Quick Actions */}
          <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Quick Measure */}
          <Card className="lg:col-span-2 shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Ready to Measure a Roof?
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Enter customer info first, then measure their roof
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    size="lg"
                    className="h-20 bg-green-600 hover:bg-green-700"
                    onClick={() => navigate(createPageUrl("NewLeadForm"))}
                  >
                    <div className="text-left w-full">
                      <div className="font-bold text-lg mb-1">📝 Measure New Roof</div>
                      <div className="text-sm opacity-90">Enter customer info & measure</div>
                    </div>
                  </Button>

                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-20 border-2 border-blue-400 hover:bg-blue-50"
                    onClick={() => navigate(createPageUrl("ExistingLeadSelector"))}
                  >
                    <div className="text-left w-full">
                      <div className="font-bold text-lg mb-1">📋 Existing Lead</div>
                      <div className="text-sm opacity-90">Add measurement to lead</div>
                    </div>
                  </Button>
                </div>
            </CardContent>
          </Card>

          {/* Browse Leads */}
          <Card className="shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate(createPageUrl("RooferBrowseLeads"))}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">Browse</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Available Leads</h3>
              <p className="text-sm text-purple-100">
                Purchase qualified homeowner leads
              </p>
            </CardContent>
          </Card>

          {/* Purchased Leads Stats */}
          <Card className="shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-4xl font-bold">{purchasedLeadsCount || 0}</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">My Purchased Leads</h3>
              <p className="text-sm text-green-100">
                Leads you've purchased
              </p>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Usage This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {used}
                  <span className="text-2xl text-slate-400">
                    /{user.subscription_plan === 'unlimited' ? '∞' : limit}
                  </span>
                </div>
                <p className="text-slate-600">measurements used</p>
              </div>

              {user.subscription_plan !== 'unlimited' && (
                <>
                  <Progress value={usagePercent} className="h-3" />
                  <div className="text-center">
                    <p className="text-sm text-slate-500">
                      {remaining} measurements remaining
                    </p>
                  </div>
                </>
              )}

              {user.next_billing_date && (
                <div className="pt-4 border-t text-center">
                  <p className="text-xs text-slate-500 mb-1">Resets on</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {format(new Date(user.next_billing_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>

          {/* Team Activity Feed */}
          <div className="mb-8">
            <TeamActivityFeed />
          </div>

          {/* Recent Measurements */}
          <Card className="shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Measurements & Leads</CardTitle>
              <Badge variant="outline">{measurements.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
              <button
                onClick={() => setActiveTab('purchased')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'purchased'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Purchased Leads ({purchasedLeadsCount})
              </button>
              <button
                onClick={() => setActiveTab('own')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'own'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Measurements ({measurements.filter(m => m.company_id === user?.company_id).length})
              </button>
            </div>

            {getFilteredMeasurements().length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-4">No measurements yet</p>
                <Button onClick={handleNewMeasurement}>
                  <Zap className="w-4 h-4 mr-2" />
                  Create Your First Measurement
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Date</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Property</th>
                      {activeTab === 'purchased' && (
                        <th className="text-left p-3 font-semibold text-slate-700 text-sm">Customer</th>
                      )}
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Area</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Type</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Assigned To</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Status</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredMeasurements().slice(0, 10).map((measurement) => (
                      <tr key={measurement.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 text-sm text-slate-600">
                          {format(new Date(measurement.created_date), 'MMM d, yyyy')}
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-900">{measurement.property_address}</p>
                        </td>
                        {activeTab === 'purchased' && (
                          <td className="p-3">
                            <p className="text-sm font-medium text-slate-900">{measurement.customer_name || 'N/A'}</p>
                            <p className="text-xs text-slate-600">{measurement.customer_email}</p>
                            <p className="text-xs text-slate-600">{measurement.customer_phone}</p>
                          </td>
                        )}
                        <td className="p-3 font-semibold text-slate-900">
                          {Math.round(measurement.total_adjusted_sqft || measurement.total_sqft || 0).toLocaleString()} sq ft
                        </td>
                        <td className="p-3">
                          {measurement.measurement_type === 'quick_estimate' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                              ⚡ Quick Est
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                              📐 Detailed
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={measurement.assigned_to || ''}
                            onChange={(e) => handleAssignLead(measurement.id, e.target.value)}
                            disabled={assigningLead === measurement.id}
                            className="text-sm border rounded px-2 py-1 min-w-[120px]"
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map(member => (
                              <option key={member.id} value={member.id}>
                                {member.full_name || member.email}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            measurement.lead_status === 'new' ? 'bg-slate-100 text-slate-800' :
                            measurement.lead_status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            measurement.lead_status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                            measurement.lead_status === 'booked' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {measurement.lead_status || 'New'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(createPageUrl(`Results?measurementid=${measurement.id}`))}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <div className="mb-8">
            <SecuritySettings />
          </div>

          {/* Billing Card */}
          <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing & Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-slate-900">
                  {user.subscription_plan?.charAt(0).toUpperCase() + user.subscription_plan?.slice(1) || 'Free'}
                </p>
                <p className="text-sm text-slate-500">
                  ${getPlanPrice(user.subscription_plan)}/month
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Next Billing Date</p>
                <p className="text-lg font-semibold text-slate-900">
                  {user.next_billing_date 
                    ? format(new Date(user.next_billing_date), 'MMM d, yyyy')
                    : 'N/A'
                  }
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
              <Link to={createPageUrl("RooferBilling")} className="flex-1">
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </Link>
              {user.subscription_plan !== 'unlimited' && (
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardContent>
          </Card>

          {showTakeoffModal && (
            <ProposalWizard
              lead={null}
              onClose={() => setShowTakeoffModal(false)}
              onSave={null}
            />
          )}
        </div>
      </div>
    </div>
  );
}