import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CommunicationLogger from "../components/crm/CommunicationLogger";
import ActivityTimeline from "../components/crm/ActivityTimeline";
import { ArrowLeft, Phone, Mail, MapPin, Home, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomerDetail() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const leadId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogger, setShowLogger] = useState(false);

  useEffect(() => {
    if (leadId) loadData();
  }, [leadId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const leadData = await base44.entities.Measurement.list();
      const foundLead = leadData.find(l => l.id === leadId);
      
      if (!foundLead) {
        toast.error('Lead not found');
        navigate(createPageUrl("RooferDashboard"));
        return;
      }

      setLead(foundLead);
    } catch (err) {
      toast.error('Failed to load customer details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Lead not found</p>
          <Button onClick={() => navigate(createPageUrl("RooferDashboard"))}>
            Go Back
          </Button>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Badge className={statusColors[lead.lead_status] || 'bg-slate-100'}>
              {lead.lead_status || 'new'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Customer Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    {lead.customer_name || 'Unnamed Lead'}
                  </p>
                  <p className="text-slate-600">{lead.property_address}</p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-500 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-medium">{lead.customer_phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-500 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-medium">{lead.customer_email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-500 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500">Roof Area</p>
                      <p className="font-medium">
                        {lead.total_sqft ? `${lead.total_sqft.toFixed(0)} sq ft` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    className="w-full"
                    onClick={() => setShowLogger(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href={`tel:${lead.customer_phone}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Customer
                  </Button>
                </a>
                <a href={`mailto:${lead.customer_email}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </a>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.property_address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity Timeline */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline 
                  leadId={lead.id} 
                  companyId={user?.company_id}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Communication Logger Modal */}
      {showLogger && (
        <CommunicationLogger
          lead={lead}
          onClose={() => setShowLogger(false)}
          onSaved={() => {
            setShowLogger(false);
            loadData(); // Refresh to show new activity
          }}
        />
      )}
    </div>
  );
}