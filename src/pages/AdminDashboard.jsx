
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, LogOut, BarChart3, Users, Settings, FileText, Loader2, Building2 } from "lucide-react";
import OverviewTab from "../components/admin/OverviewTab";
import LeadsTab from "../components/admin/LeadsTab";
import UsersTab from "../components/admin/UsersTab";
import SettingsTab from "../components/admin/SettingsTab";
import ExternalRoofersTab from "../components/admin/ExternalRoofersTab";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);
  
  // Data state
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [roofers, setRoofers] = useState([]);
  const [stats, setStats] = useState({});
  const [leadsData, setLeadsData] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [settings, setSettings] = useState({});

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const user = await base44.auth.me();
      
      if (user.role !== 'admin') {
        alert('Access denied. Admin role required.');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setCurrentUser(user);
      await loadAllData();
    } catch (err) {
      console.error('Auth error:', err);
      alert('Please log in to access admin dashboard');
      navigate(createPageUrl("Homepage"));
    }
  };

  const loadAllData = async () => {
    try {
      // Load all data in parallel
      const [allLeads, allUsers] = await Promise.all([
        base44.entities.Measurement.list('-created_date', 1000),
        base44.entities.User.list('-created_date', 1000)
      ]);

      setLeads(allLeads);
      setUsers(allUsers);
      
      // Filter external roofers
      const externalRoofers = allUsers.filter(u => u.aroof_role === 'external_roofer');
      setRoofers(externalRoofers);
      
      // Calculate stats
      calculateStats(allLeads, allUsers);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      alert('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const calculateStats = (allLeads, allUsers) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // This month's leads
    const leadsThisMonth = allLeads.filter(l => {
      const d = new Date(l.created_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const leadsLastMonth = allLeads.filter(l => {
      const d = new Date(l.created_date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const leadsChangePercent = leadsLastMonth.length > 0
      ? Math.round(((leadsThisMonth.length - leadsLastMonth.length) / leadsLastMonth.length) * 100)
      : 0;

    // Active quotes
    const activeQuotes = allLeads.filter(l => l.lead_status === 'quoted').length;
    
    // Conversion rate
    const completedLeads = allLeads.filter(l => l.lead_status === 'completed');
    const conversionRate = allLeads.length > 0 
      ? Math.round((completedLeads.length / allLeads.length) * 100)
      : 0;

    // Revenue this month
    const revenueThisMonth = leadsThisMonth
      .filter(l => l.lead_status === 'completed')
      .reduce((sum, l) => sum + (l.quote_amount || 0), 0);

    const revenueLastMonth = leadsLastMonth
      .filter(l => l.lead_status === 'completed')
      .reduce((sum, l) => sum + (l.quote_amount || 0), 0);

    const revenueChangePercent = revenueLastMonth > 0
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
      : 0;

    // Team stats
    const estimatorCount = allUsers.filter(u => u.aroof_role === 'estimator').length;

    // Timeline data (last 30 days)
    const timelineData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const leadsOnDate = allLeads.filter(l => {
        const leadDate = new Date(l.created_date);
        return leadDate.toDateString() === date.toDateString();
      }).length;

      timelineData.push({ date: dateStr, leads: leadsOnDate });
    }

    // Leads by status
    const statusCounts = {
      new: allLeads.filter(l => l.lead_status === 'new').length,
      contacted: allLeads.filter(l => l.lead_status === 'contacted').length,
      quoted: allLeads.filter(l => l.lead_status === 'quoted').length,
      booked: allLeads.filter(l => l.lead_status === 'booked').length,
      completed: allLeads.filter(l => l.lead_status === 'completed').length,
      lost: allLeads.filter(l => l.lead_status === 'lost').length
    };

    const byStatusData = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));

    // Revenue by estimator
    const estimators = allUsers.filter(u => u.aroof_role === 'estimator');
    const revenueByEstimator = estimators.map(est => {
      const estimatorLeads = allLeads.filter(l => l.assigned_to === est.id && l.lead_status === 'completed');
      const revenue = estimatorLeads.reduce((sum, l) => sum + (l.quote_amount || 0), 0);
      return {
        name: est.full_name || est.email,
        revenue
      };
    }).filter(e => e.revenue > 0);

    // Estimator performance
    const estimatorPerformance = estimators.map(est => {
      const assigned = allLeads.filter(l => l.assigned_to === est.id);
      const completed = assigned.filter(l => l.lead_status === 'completed');
      const convRate = assigned.length > 0 ? Math.round((completed.length / assigned.length) * 100) : 0;
      
      return {
        name: est.full_name || est.email.split('@')[0],
        conversionRate: convRate,
        totalLeads: assigned.length,
        closedLeads: completed.length
      };
    });

    // Recent activity
    const recentActivity = allLeads.slice(0, 20).map(lead => ({
      description: `New lead from ${lead.customer_name || 'Unknown'} - ${lead.property_address}`,
      timestamp: lead.created_date,
      user: lead.created_by || 'System'
    }));

    setStats({
      leadsThisMonth: leadsThisMonth.length,
      leadsChangePercent,
      activeQuotes,
      conversionRate,
      revenueThisMonth,
      revenueChangePercent,
      totalUsers: allUsers.length,
      estimatorCount,
      estimatorPerformance,
      recentActivity
    });

    setLeadsData({
      timeline: timelineData,
      byStatus: byStatusData
    });

    setRevenueData({
      byEstimator: revenueByEstimator
    });
  };

  const handleCreateUser = async (userData) => {
    try {
      // In Base44, users are invited through the platform
      // This is a placeholder - actual implementation would use Base44's user invitation system
      alert('User invitation system: Please invite users through Dashboard → Users → Invite User');
      
      // Refresh data
      await loadAllData();
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await base44.entities.User.update(userId, updates);
      alert('User updated successfully!');
      await loadAllData();
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user');
    }
  };

  const handleSaveSettings = async (newSettings) => {
    try {
      // Save settings to admin user's profile
      await base44.auth.updateMe({ admin_settings: newSettings });
      setSettings(newSettings);
      alert('✅ Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Aroof Admin</h1>
                <p className="text-sm text-slate-300">Complete Business Control Center</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold">{currentUser?.full_name || currentUser?.email}</p>
                <p className="text-xs text-slate-300">Administrator</p>
              </div>
              
              <Link to={createPageUrl("Homepage")}>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Home className="w-4 h-4 mr-2" />
                  Public Site
                </Button>
              </Link>
              
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5 h-12">
            <TabsTrigger value="overview" className="text-base">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="leads" className="text-base">
              <FileText className="w-4 h-4 mr-2" />
              All Leads
            </TabsTrigger>
            <TabsTrigger value="users" className="text-base">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roofers" className="text-base">
              <Building2 className="w-4 h-4 mr-2" />
              Roofers
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-base">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab 
              stats={stats} 
              leadsData={leadsData}
              revenueData={revenueData}
            />
          </TabsContent>

          <TabsContent value="leads">
            <LeadsTab 
              leads={leads}
              users={users}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab 
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={(userId) => handleUpdateUser(userId, { is_active: false })}
            />
          </TabsContent>

          <TabsContent value="roofers">
            <ExternalRoofersTab roofers={roofers} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab 
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
