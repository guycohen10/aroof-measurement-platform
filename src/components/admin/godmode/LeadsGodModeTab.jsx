import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Home, Trash2, Eye, Loader2, MapPin, User, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function LeadsGodModeTab() {
  const [allLeads, setAllLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingLead, setViewingLead] = useState(null);
  const [activeTab, setActiveTab] = useState("full");

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const data = await base44.entities.Measurement.list('-created_date', 1000);
      setAllLeads(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load leads:', err);
      toast.error('Failed to load leads');
      setLoading(false);
    }
  };

  // Split logic: Gold Leads (Actionable) vs Ghost Leads (Address Only)
  const goldLeads = allLeads.filter(lead => 
    lead.customer_email || lead.customer_phone
  );

  const ghostLeads = allLeads.filter(lead => 
    lead.property_address && !lead.customer_email && !lead.customer_phone
  );

  const handleDelete = async (leadId) => {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) {
      return;
    }

    try {
      await base44.entities.Measurement.delete(leadId);
      toast.success("Lead deleted successfully");
      loadLeads();
    } catch (err) {
      console.error('Failed to delete lead:', err);
      toast.error("Failed to delete lead");
    }
  };

  const handleViewDetails = (lead) => {
    setViewingLead(lead);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{allLeads.length}</div>
            <div className="text-sm text-slate-600">Total Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{goldLeads.length}</div>
            <div className="text-sm text-slate-600">🥇 Gold Leads (Actionable)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-600">{ghostLeads.length}</div>
            <div className="text-sm text-slate-600">👻 Ghost Leads (Address Only)</div>
          </CardContent>
        </Card>
      </div>

      {/* Split View Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="full">
            🥇 Gold Leads ({goldLeads.length})
          </TabsTrigger>
          <TabsTrigger value="address">
            👻 Ghost Leads ({ghostLeads.length})
          </TabsTrigger>
        </TabsList>

        {/* Section A: Gold Leads (Actionable) */}
        <TabsContent value="full">
          <Card className="border-t-4 border-t-yellow-600">
            <CardHeader className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white">
              <CardTitle className="flex items-center gap-2">
                🥇 Gold Leads - Full Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-sm">Address</th>
                      <th className="text-left p-3 font-semibold text-sm">Name</th>
                      <th className="text-left p-3 font-semibold text-sm">Phone</th>
                      <th className="text-left p-3 font-semibold text-sm">Email</th>
                      <th className="text-left p-3 font-semibold text-sm">Status</th>
                      <th className="text-left p-3 font-semibold text-sm">Assigned Roofer</th>
                      <th className="text-left p-3 font-semibold text-sm">Date</th>
                      <th className="text-left p-3 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goldLeads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium">{lead.property_address || "N/A"}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{lead.customer_name || "N/A"}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-4 h-4 text-green-600" />
                            {lead.customer_phone || "N/A"}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-4 h-4 text-blue-600" />
                            {lead.customer_email || "N/A"}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className="bg-blue-100 text-blue-800">
                            {lead.lead_status?.toUpperCase() || 'NEW'}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">
                          {lead.purchased_by ? "✅ Assigned" : "🔓 Available"}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {format(new Date(lead.created_date), 'MMM d, yyyy')}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(lead)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(lead.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {goldLeads.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No actionable leads yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section B: Ghost Leads (Address Only) */}
        <TabsContent value="address">
          <Card className="border-t-4 border-t-slate-600">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
              <CardTitle className="flex items-center gap-2">
                👻 Ghost Leads - Abandoned / Address Only
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-slate-50 border-l-4 border-slate-600 p-4 mb-6">
                <p className="text-sm text-slate-800">
                  👻 These leads only have addresses. User abandoned before providing contact info.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-sm">Address</th>
                      <th className="text-left p-3 font-semibold text-sm">Sq Ft</th>
                      <th className="text-left p-3 font-semibold text-sm">Date Captured</th>
                      <th className="text-left p-3 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ghostLeads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium">{lead.property_address}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          {lead.total_sqft ? `${Math.round(lead.total_sqft)} sq ft` : "N/A"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(lead.created_date), 'MMM d, yyyy h:mm a')}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(lead)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(lead.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {ghostLeads.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No address-only captures
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Details Modal */}
      <Dialog open={!!viewingLead} onOpenChange={() => setViewingLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {viewingLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-600">Address</div>
                  <p className="font-semibold">{viewingLead.property_address || "N/A"}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">Customer Name</div>
                  <p className="font-semibold">{viewingLead.customer_name || "N/A"}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">Email</div>
                  <p className="font-semibold">{viewingLead.customer_email || "Not Provided"}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">Phone</div>
                  <p className="font-semibold">{viewingLead.customer_phone || "Not Provided"}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">Total Sq Ft</div>
                  <p className="font-semibold">
                    {viewingLead.total_sqft ? `${Math.round(viewingLead.total_sqft)} sq ft` : "N/A"}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">Status</div>
                  <p className="font-semibold">{viewingLead.lead_status || "New"}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">Created</div>
                  <p className="font-semibold">{format(new Date(viewingLead.created_date), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">User Type</div>
                  <p className="font-semibold">{viewingLead.user_type || "N/A"}</p>
                </div>
              </div>

              {viewingLead.measurement_data && (
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-2">Measurement Data</div>
                  <div className="p-4 bg-slate-100 rounded-lg text-sm max-h-64 overflow-auto">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(viewingLead.measurement_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}