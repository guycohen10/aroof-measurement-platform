import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, Trash2, Eye, Loader2, MapPin, Calendar, User } from "lucide-react";
import { toast } from "sonner";

export default function LeadOverseer() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState({});
  const [viewingLead, setViewingLead] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allMeasurements, allCompanies] = await Promise.all([
        base44.asServiceRole.entities.Measurement.list('-created_date', 500),
        base44.asServiceRole.entities.Company.list()
      ]);

      setLeads(allMeasurements || []);
      
      const companyMap = {};
      (allCompanies || []).forEach(company => {
        companyMap[company.id] = company;
      });
      setCompanies(companyMap);
    } catch (error) {
      console.error("Failed to load leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId) => {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) {
      return;
    }

    try {
      await base44.asServiceRole.entities.Measurement.delete(leadId);
      toast.success("Lead deleted successfully");
      loadData();
    } catch (error) {
      console.error("Failed to delete lead:", error);
      toast.error("Failed to delete lead");
    }
  };

  const getStatusBadge = (lead) => {
    if (lead.purchased_by) {
      return <Badge className="bg-green-600">Sold</Badge>;
    }
    if (lead.available_for_purchase) {
      return <Badge className="bg-blue-600">Available</Badge>;
    }
    return <Badge variant="secondary">New</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6" />
            Lead Overseer ({leads.length} Leads)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Address</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Sq Ft</th>
                  <th className="text-left py-3 px-4 font-semibold">Assigned To</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const assignedCompany = lead.purchased_by ? companies[lead.purchased_by] : null;

                  return (
                    <tr key={lead.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{lead.property_address || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(lead.created_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(lead)}
                      </td>
                      <td className="py-3 px-4">
                        {lead.total_adjusted_sqft ? `${Math.round(lead.total_adjusted_sqft)} sq ft` : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {assignedCompany ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{assignedCompany.company_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingLead(lead)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(lead.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Lead Details Modal */}
      <Dialog open={!!viewingLead} onOpenChange={() => setViewingLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {viewingLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Address</Label>
                  <p className="font-semibold">{viewingLead.property_address}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Customer Name</Label>
                  <p className="font-semibold">{viewingLead.customer_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Email</Label>
                  <p className="font-semibold">{viewingLead.customer_email || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Phone</Label>
                  <p className="font-semibold">{viewingLead.customer_phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Total Sq Ft</Label>
                  <p className="font-semibold">{viewingLead.total_adjusted_sqft ? `${Math.round(viewingLead.total_adjusted_sqft)} sq ft` : "N/A"}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Lead Price</Label>
                  <p className="font-semibold">${viewingLead.lead_price || 25}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Created</Label>
                  <p className="font-semibold">{new Date(viewingLead.created_date).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Purchased By</Label>
                  <p className="font-semibold">
                    {viewingLead.purchased_by ? companies[viewingLead.purchased_by]?.company_name : "Not Purchased"}
                  </p>
                </div>
              </div>

              {viewingLead.measurement_data && (
                <div>
                  <Label className="text-slate-600">Measurement Details</Label>
                  <div className="mt-2 p-4 bg-slate-100 rounded-lg text-sm">
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
    </>
  );
}

function Label({ children, className }) {
  return <div className={`text-sm font-medium text-slate-600 mb-1 ${className}`}>{children}</div>;
}