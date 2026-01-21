import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import SalesWorkspace from '../components/crm/workspaces/SalesWorkspace';
import CrewWorkspace from '../components/crm/workspaces/CrewWorkspace';
import ActionCenter from '../components/crm/ActionCenter';
import TeamActivityFeed from '../components/crm/TeamActivityFeed';

export default function RooferDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Action Center Widget */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-700">✅ Action Items</h2>
          <ActionCenter userId={user.id} companyId={user.company_id} />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Live Activity Feed */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-gray-700">📡 Live Activity</h2>
            <TeamActivityFeed />
          </div>

          {/* Recent Leads */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-700">🚀 Recent Leads</h2>
              <Button onClick={() => navigate(createPageUrl("NewLeadForm"))}>
                + New Lead
              </Button>
            </div>
            
            <div className="bg-white rounded shadow overflow-hidden">
              {leads.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No leads yet.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-sm text-gray-600 uppercase">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.slice(0, 5).map(lead => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50 last:border-0">
                        <td className="p-4 font-medium">{lead.name}</td>
                        <td className="p-4">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold uppercase">
                            {lead.lead_status || 'New'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => navigate(createPageUrl(`CustomerDetail?id=${lead.id}`))}
                            className="text-blue-600 font-bold hover:underline text-sm"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}