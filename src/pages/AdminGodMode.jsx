import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, LogOut, BarChart3, Users, UserCheck, Phone, HardHat, Hammer, Calendar, DollarSign, Settings, Cloud, MessageSquare } from "lucide-react";
import OverviewTab from "../components/admin/godmode/OverviewTab";
import LeadsGodModeTab from "../components/admin/godmode/LeadsGodModeTab";
import EstimatorsGodModeTab from "../components/admin/godmode/EstimatorsGodModeTab";
import DispatchersGodModeTab from "../components/admin/godmode/DispatchersGodModeTab";
import CrewsGodModeTab from "../components/admin/godmode/CrewsGodModeTab";
import RoofersGodModeTab from "../components/admin/godmode/RoofersGodModeTab";
import AppointmentsGodModeTab from "../components/admin/godmode/AppointmentsGodModeTab";
import PricingGodModeTab from "../components/admin/godmode/PricingGodModeTab";
import SettingsGodModeTab from "../components/admin/godmode/SettingsGodModeTab";
import StormDataGodModeTab from "../components/admin/godmode/StormDataGodModeTab";
import CommunicationsGodModeTab from "../components/admin/godmode/CommunicationsGodModeTab";

export default function AdminGodMode() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only check auth once on mount
    let mounted = true;
    
    if (mounted && !isRedirecting) {
      checkAuth();
    }
    
    return () => {
      mounted = false;
    };
  }, []); // Empty deps - runs only once

  async function checkAuth() {
    if (isRedirecting) return; // Prevent multiple redirects
    
    try {
      const authToken = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');

      console.log('[Auth Check] Starting - ONE TIME ONLY');

      // Check authentication
      if (!authToken || !userRole || !userName || !userEmail) {
        console.log('[Auth Check] Missing credentials');
        redirectToLogin();
        return;
      }

      // Validate token format
      if (authToken.length < 10) {
        console.log('[Auth Check] Invalid token');
        redirectToLogin();
        return;
      }

      // Check admin role
      if (userRole !== 'admin') {
        console.log('[Auth Check] Not admin');
        redirectToLogin();
        return;
      }

      // Success - set user and stop loading
      console.log('[Auth Check] Authenticated as admin');
      setUser({
        full_name: userName,
        email: userEmail,
        role: userRole
      });
      setLoading(false);
      
    } catch (err) {
      console.error('[Auth Check] Error:', err);
      redirectToLogin();
    }
  }

  function redirectToLogin() {
    if (isRedirecting) return; // Already redirecting
    
    console.log('[Auth] Redirecting to login...');
    setIsRedirecting(true);
    localStorage.clear();
    
    // Use replace to prevent back button issues
    setTimeout(() => {
      window.location.replace('/EmployeeLogin');
    }, 300);
  }

  async function handleLogout() {
    console.log('[Logout] Clearing session');
    localStorage.clear();
    window.location.replace('/EmployeeLogin');
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'estimators', label: 'Estimators', icon: UserCheck },
    { id: 'dispatchers', label: 'Dispatchers', icon: Phone },
    { id: 'crews', label: 'Crews', icon: HardHat },
    { id: 'roofers', label: 'External Roofers', icon: Hammer },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'storm', label: 'Storm Data', icon: Cloud },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-screen overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <div className="text-4xl mb-2">👑</div>
            <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
            <p className="text-xs text-slate-400">God Mode Access</p>
          </div>

          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 font-semibold'
                    : 'hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full mt-8 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-left flex items-center gap-3 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <p className="text-slate-600 mt-1">Welcome back, {user?.full_name}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🔄 Refresh
          </button>
        </header>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab key={refreshKey} />}
        {activeTab === 'leads' && <LeadsGodModeTab key={refreshKey} />}
        {activeTab === 'estimators' && <EstimatorsGodModeTab key={refreshKey} />}
        {activeTab === 'dispatchers' && <DispatchersGodModeTab key={refreshKey} />}
        {activeTab === 'crews' && <CrewsGodModeTab key={refreshKey} />}
        {activeTab === 'roofers' && <RoofersGodModeTab key={refreshKey} />}
        {activeTab === 'appointments' && <AppointmentsGodModeTab key={refreshKey} />}
        {activeTab === 'storm' && <StormDataGodModeTab key={refreshKey} />}
        {activeTab === 'communications' && <CommunicationsGodModeTab key={refreshKey} />}
        {activeTab === 'pricing' && <PricingGodModeTab key={refreshKey} />}
        {activeTab === 'settings' && <SettingsGodModeTab key={refreshKey} />}
      </main>
    </div>
  );
}