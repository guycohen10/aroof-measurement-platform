import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FileText, Calendar, DollarSign } from "lucide-react";
import RooferSidebar from '../components/crm/RooferSidebar';
import SalesWorkspace from '../components/crm/workspaces/SalesWorkspace';
import CrewWorkspace from '../components/crm/workspaces/CrewWorkspace';
import ActionCenter from '../components/crm/ActionCenter';
import NotificationBell from '../components/crm/NotificationBell';

export default function RooferDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, activeJobs: 0, winRate: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Only load leads if we are the owner
      if (currentUser?.aroof_role === 'external_roofer' || currentUser?.role === 'admin') {
        const leadData = await base44.entities.Lead.list();
        const filtered = leadData.filter(l => l.assigned_company_id === currentUser.company_id);
        setLeads(filtered || []);
        
        // Mock Stats for the dashboard
        setStats({ revenue: 125000, activeJobs: 4, winRate: 35 });

        // Load appointments for today's schedule
        try {
          const appts = await base44.entities.Appointment.list('-created_date', 10);
          const todayAppts = appts.filter(a => 
            new Date(a.appointment_date).toDateString() === new Date().toDateString()
          ).slice(0, 5);
          setAppointments(todayAppts);
        } catch (e) {
          console.log("Appointments not available");
        }
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in</p>
          <Button onClick={() => navigate(createPageUrl("RooferLogin"))}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // ROLE ROUTING - If Sales/Crew, show their workspace
  if (['sales', 'estimator'].includes(user.aroof_role)) {
    return <SalesWorkspace />;
  }

  if (user.aroof_role === 'crew') {
    return <CrewWorkspace />;
  }

  // OWNER COMMAND CENTER
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. SIDEBAR */}
      <RooferSidebar user={user} />
      
      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center z-10">
          <h1 className="text-2xl font-bold text-gray-800">Your Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationBell userId={user.id} />
            <span className="text-sm font-bold text-gray-600">{user.company_name || 'My Company'}</span>
            <div className="h-8 w-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold">
              {user.full_name?.[0] || user.email?.[0] || 'U'}
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">

          {/* 3. STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to={createPageUrl('Financials')} className="block">
              <div className="bg-white p-4 rounded shadow border-l-4 border-green-500 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                <div className="text-gray-500 text-xs font-bold uppercase">Monthly Revenue</div>
                <div className="text-2xl font-bold text-gray-800">${stats.revenue.toLocaleString()}</div>
              </div>
            </Link>
            <Link to={createPageUrl('JobBoard')} className="block">
              <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                <div className="text-gray-500 text-xs font-bold uppercase">Active Jobs</div>
                <div className="text-2xl font-bold text-gray-800">{stats.activeJobs}</div>
              </div>
            </Link>
            <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
              <div className="text-gray-500 text-xs font-bold uppercase">Win Rate</div>
              <div className="text-2xl font-bold text-gray-800">{stats.winRate}%</div>
            </div>
            <div className="bg-white p-4 rounded shadow flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                 onClick={() => navigate(createPageUrl('TeamManager'))}>
              <div className="text-center">
                <div className="text-2xl">👥</div>
                <div className="text-blue-600 font-bold text-sm">Manage Team</div>
              </div>
            </div>
          </div>

          {/* 4. QUICK ACTIONS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to={createPageUrl('NewLeadForm')} className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12">
                <Plus className="w-5 h-5" />
                New Lead
              </Button>
            </Link>
            <Link to={createPageUrl('QuoteBuilder')} className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-12">
                <FileText className="w-5 h-5" />
                New Estimate
              </Button>
            </Link>
            <Link to={createPageUrl('JobScheduling')} className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 h-12">
                <Calendar className="w-5 h-5" />
                Calendar
              </Button>
            </Link>
            <Link to={createPageUrl('InvoiceManager')} className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2 h-12">
                <DollarSign className="w-5 h-5" />
                Invoices
              </Button>
            </Link>
          </div>

          {/* 4. WIDGETS AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Action Center (Tasks/Followups) */}
            <div className="lg:col-span-2 space-y-6">
              <section>
                <h2 className="text-lg font-bold mb-3 text-gray-700">✅ Action Items</h2>
                <ActionCenter userId={user.id} companyId={user.company_id} />
              </section>

              <section>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-gray-700">🚀 Leads Pipeline</h2>
                  <button 
                    onClick={() => navigate(createPageUrl('NewLeadForm'))} 
                    className="text-blue-600 text-sm font-bold hover:underline"
                  >
                    + Add Lead
                  </button>
                </div>
                <div className="bg-white rounded shadow overflow-hidden">
                  {leads.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">No active leads.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="p-3">Name</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {leads.slice(0, 5).map(lead => (
                          <tr key={lead.id} className="hover:bg-blue-50">
                            <td className="p-3 font-medium">{lead.name}</td>
                            <td className="p-3">
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">
                                {lead.lead_status || 'New'}
                              </span>
                            </td>
                            <td className="p-3">
                              <Link 
                                to={createPageUrl(`CustomerDetail?id=${lead.id}`)} 
                                className="text-blue-600 font-bold text-sm hover:underline"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </div>

            {/* Right: Team Feed */}
            <div>
              <h2 className="text-lg font-bold mb-3 text-gray-700">📡 Team Activity</h2>
              <TeamActivityFeed companyId={user.company_id} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}