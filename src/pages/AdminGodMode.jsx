import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, LogOut, BarChart3, Users, UserCheck, Phone, HardHat, Hammer, Calendar, DollarSign, Settings, Cloud, MessageSquare, MapPin } from "lucide-react";
import OverviewTab from "../components/admin/godmode/OverviewTab";
import LeadsGodModeTab from "../components/admin/godmode/LeadsGodModeTab";
import HomeownerLeadsGodModeTab from "../components/admin/godmode/HomeownerLeadsGodModeTab";
import EstimatorsGodModeTab from "../components/admin/godmode/EstimatorsGodModeTab";
import DispatchersGodModeTab from "../components/admin/godmode/DispatchersGodModeTab";
import CrewsGodModeTab from "../components/admin/godmode/CrewsGodModeTab";
import RoofersGodModeTab from "../components/admin/godmode/RoofersGodModeTab";
import AppointmentsGodModeTab from "../components/admin/godmode/AppointmentsGodModeTab";
import PricingGodModeTab from "../components/admin/godmode/PricingGodModeTab";
import SettingsGodModeTab from "../components/admin/godmode/SettingsGodModeTab";
import StormDataGodModeTab from "../components/admin/godmode/StormDataGodModeTab";
import CommunicationsGodModeTab from "../components/admin/godmode/CommunicationsGodModeTab";
import TerritoriesGodModeTab from "../components/admin/godmode/TerritoriesGodModeTab";
import FinancialsGodModeTab from "../components/admin/godmode/FinancialsGodModeTab";

export default function AdminGodMode() {
  // FORCE ADMIN IDENTITY - GHOST MODE ACTIVATED
  const user = { 
    id: 'override-admin-id',
    role: 'admin', 
    email: 'greenteamdallas@gmail.com', 
    full_name: 'Guy (Dev)',
    name: 'Guy (Dev)'
  };
  const isLoaded = true; // Fake the loading state
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // FORCE OVERRIDE: Use hardcoded admin user
  const adminUser = user;

  async function handleLogout() {
    console.log('[Logout] Clearing session');
    localStorage.clear();
    window.location.replace('/EmployeeLogin');
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'homeowner-leads', label: 'Homeowner Leads', icon: Users },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'territories', label: 'Territories', icon: MapPin },
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
            <p className="text-slate-600 mt-1">Welcome back, {adminUser?.full_name}</p>
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
        {activeTab === 'homeowner-leads' && <HomeownerLeadsGodModeTab key={refreshKey} />}
        {activeTab === 'leads' && <LeadsGodModeTab key={refreshKey} />}
        {activeTab === 'financials' && <FinancialsGodModeTab key={refreshKey} />}
        {activeTab === 'territories' && <TerritoriesGodModeTab key={refreshKey} />}
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