import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MessageSquare, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function SalesWorkspace() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activityType, setActivityType] = useState('call');
  const [activityContent, setActivityContent] = useState('');
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Fetch leads assigned to this user
      const myLeads = await base44.entities.Measurement.filter({
        assigned_to: userData.id
      }, '-created_date', 50);
      
      setLeads(myLeads);
    } catch (err) {
      toast.error("Failed to load leads");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openLogActivity = (lead, type) => {
    setSelectedLead(lead);
    setActivityType(type);
    setActivityContent('');
    setShowLogModal(true);
  };

  const saveActivity = async () => {
    if (!activityContent.trim()) {
      toast.error("Please enter activity details");
      return;
    }

    setLogging(true);
    try {
      await base44.entities.ActivityLog.create({
        type: activityType,
        content: activityContent,
        user_id: user.id,
        lead_id: selectedLead.id,
        timestamp: new Date().toISOString()
      });
      
      toast.success("Activity logged!");
      setShowLogModal(false);
      setActivityContent('');
    } catch (err) {
      toast.error("Failed to log activity");
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const createJob = async (lead) => {
    if (!confirm('Convert this Lead to a Job?')) return;
    
    try {
      const job = await base44.entities.Job.create({
        customer_name: lead.customer_name,
        customer_email: lead.customer_email,
        customer_phone: lead.customer_phone,
        property_address: lead.property_address,
        source_lead_id: lead.id,
        company_id: user.company_id,
        crew_id: user.id,
        status: 'scheduled',
        scheduled_date: new Date().toISOString()
      });
      
      await base44.entities.Measurement.update(lead.id, { 
        lead_status: 'booked' 
      });
      
      toast.success('Job created!');
      window.location.href = createPageUrl(`JobDetail?id=${job.id}`);
    } catch (err) {
      toast.error('Failed to create job');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statusColors = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'quoted': 'bg-purple-100 text-purple-800',
    'booked': 'bg-green-100 text-green-800',
    'completed': 'bg-slate-100 text-slate-800',
    'lost': 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Leads</h2>
          <p className="text-slate-600">Leads assigned to you: {leads.length}</p>
        </div>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600">No leads assigned to you yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leads.map(lead => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link 
                      to={createPageUrl(`CustomerDetail?id=${lead.id}`)}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                    >
                      {lead.customer_name || 'Unnamed Lead'}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <p className="text-sm text-slate-600 mt-1">{lead.property_address}</p>
                  </div>
                  <Badge className={statusColors[lead.lead_status] || 'bg-slate-100 text-slate-800'}>
                    {lead.lead_status || 'new'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2 text-sm text-slate-700">
                    <span className="font-semibold">Email:</span>
                    <span>{lead.customer_email || 'N/A'}</span>
                  </div>
                  <div className="flex gap-2 text-sm text-slate-700">
                    <span className="font-semibold">Phone:</span>
                    <span>{lead.customer_phone || 'N/A'}</span>
                  </div>
                  <div className="flex gap-2 text-sm text-slate-700">
                    <span className="font-semibold">Area:</span>
                    <span>{lead.total_sqft ? `${lead.total_sqft.toFixed(0)} sqft` : 'N/A'}</span>
                  </div>

                  <div className="pt-3 border-t flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openLogActivity(lead, 'call')}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openLogActivity(lead, 'email')}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openLogActivity(lead, 'note')}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Note
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => createJob(lead)}
                    >
                      🔨 Create Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity - {activityType}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Lead: {selectedLead?.customer_name}</p>
              <p className="text-xs text-slate-600">{selectedLead?.property_address}</p>
            </div>
            <Textarea
              placeholder={`What happened during this ${activityType}?`}
              value={activityContent}
              onChange={(e) => setActivityContent(e.target.value)}
              rows={4}
            />
            <Button 
              onClick={saveActivity} 
              disabled={logging}
              className="w-full"
            >
              {logging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Log Activity
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}