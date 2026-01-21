import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommunicationLogger from '../CommunicationLogger';

export default function SalesWorkspace() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [showLogger, setShowLogger] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allLeads = await base44.entities.Lead.list();
      const myLeads = allLeads.filter(l => l.assigned_user_id === currentUser.id);
      setLeads(myLeads);
    } catch (err) {
      console.error(err);
    }
  };

  const createJob = async (lead) => {
    if (!confirm('Convert this Lead to a Job?')) return;
    
    try {
      const job = await base44.entities.Job.create({
        customer_name: lead.name,
        customer_email: lead.email,
        customer_phone: lead.phone,
        property_address: lead.address,
        source_lead_id: lead.id,
        company_id: user.company_id,
        assigned_to: user.id,
        status: 'scheduled',
        scheduled_date: new Date().toISOString()
      });

      await base44.entities.Lead.update(lead.id, { lead_status: 'Sold' });
      navigate(createPageUrl(`JobDetail?id=${job.id}`));
    } catch (e) {
      alert(e.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sales Workspace</h1>

        <Card>
          <CardHeader>
            <CardTitle>My Assigned Leads ({leads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No leads assigned to you yet.</p>
            ) : (
              <div className="space-y-4">
                {leads.map(lead => (
                  <div key={lead.id} className="border rounded p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{lead.name}</h3>
                      <p className="text-sm text-gray-600">{lead.address}</p>
                      <p className="text-sm text-gray-600">{lead.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowLogger(true);
                        }}
                      >
                        Log Call
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => createJob(lead)}
                      >
                        Create Job
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {showLogger && selectedLead && (
          <CommunicationLogger
            lead={selectedLead}
            onClose={() => {
              setShowLogger(false);
              setSelectedLead(null);
            }}
            onSaved={() => {
              loadData();
              setShowLogger(false);
              setSelectedLead(null);
            }}
          />
        )}
      </div>
    </div>
  );
}