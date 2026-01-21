import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, FileText, Calendar, DollarSign, Flame, MapPin, ExternalLink, Zap, X } from "lucide-react";
import RooferSidebar from '../components/crm/RooferSidebar';
import SalesWorkspace from '../components/crm/workspaces/SalesWorkspace';
import CrewWorkspace from '../components/crm/workspaces/CrewWorkspace';
import ActionCenter from '../components/crm/ActionCenter';
import NotificationBell from '../components/crm/NotificationBell';
import AIEstimatorChat from '../components/leads/AIEstimatorChat';

export default function RooferDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, activeJobs: 0, winRate: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [hotLeads, setHotLeads] = useState([]);
  const [showAIEstimator, setShowAIEstimator] = useState(false);

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

        // Load hot marketplace leads
        try {
          const marketplaceLeads = await base44.entities.MarketplaceLead.filter({
            status: 'available'
          });
          // Get 3 random leads
          const shuffled = marketplaceLeads.sort(() => 0.5 - Math.random()).slice(0, 3);
          setHotLeads(shuffled);
        } catch (e) {
          console.log("Hot leads not available");
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <Button
              onClick={() => setShowAIEstimator(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-12"
            >
              <Zap className="w-5 h-5" />
              AI Estimate
            </Button>
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
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-700 mb-3">🚀 Leads Pipeline</h2>
                  {/* Status Filter Bar */}
                  <div className="bg-white rounded shadow p-3 flex gap-2 flex-wrap border-b">
                    {[
                      { key: 'all', label: 'All', count: leads.length },
                      { key: 'New', label: 'New', count: leads.filter(l => l.lead_status === 'New').length },
                      { key: 'Contacted', label: 'Contacted', count: leads.filter(l => l.lead_status === 'Contacted').length },
                      { key: 'Quoted', label: 'Quoted', count: leads.filter(l => l.lead_status === 'Quoted').length },
                      { key: 'Sold', label: 'Sold', count: leads.filter(l => l.lead_status === 'Sold').length }
                    ].map(status => (
                      <button
                        key={status.key}
                        onClick={() => setStatusFilter(status.key)}
                        className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${
                          statusFilter === status.key 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.label} ({status.count})
                      </button>
                    ))}
                  </div>
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
                        {leads
                          .filter(l => statusFilter === 'all' || l.lead_status === statusFilter)
                          .slice(0, 5)
                          .map(lead => (
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

            {/* Right: Today's Schedule + Hot Leads */}
            <div className="space-y-6">
              {/* Schedule */}
              <div>
                <h2 className="text-lg font-bold mb-3 text-gray-700">📅 Today's Schedule</h2>
                <div className="bg-white rounded shadow overflow-hidden">
                  {appointments.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No appointments today</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {appointments.map((apt, i) => (
                        <div key={i} className="p-4 hover:bg-blue-50 transition-colors border-l-4 border-blue-500">
                          <div className="font-bold text-sm text-gray-900">{apt.appointment_time}</div>
                          <div className="text-sm text-gray-700 mt-1">{apt.customer_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{apt.property_address}</div>
                          <div className="text-xs text-blue-600 font-bold mt-2">
                            {apt.status === 'confirmed' ? '✓ Confirmed' : '○ Pending'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Hot Leads */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-gray-700">Hot Leads</h2>
                </div>
                <div className="space-y-2">
                  {hotLeads.length === 0 ? (
                    <Card>
                      <CardContent className="p-4 text-center text-gray-400 text-sm">
                        No hot leads available
                      </CardContent>
                    </Card>
                  ) : (
                    hotLeads.map(lead => (
                      <Card key={lead.id} className="border-l-4 border-orange-500 hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <span className="font-bold text-sm text-gray-900">{lead.zip_code}</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{lead.service_needed}</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-green-600">${lead.price.toFixed(2)}</span>
                                <span className="text-xs text-gray-500">lead</span>
                              </div>
                            </div>
                            <Link to={createPageUrl('RooferBrowseLeads')}>
                              <Button size="sm" variant="outline" className="gap-1 flex-shrink-0">
                                <ExternalLink className="w-3 h-3" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* AI Estimator Modal */}
          {showAIEstimator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-4 sticky top-0 bg-white border-b">
                  <CardTitle>AI Roof Estimator</CardTitle>
                  <button
                    onClick={() => setShowAIEstimator(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </CardHeader>
                <CardContent className="p-6">
                  <AIEstimatorChat />
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}