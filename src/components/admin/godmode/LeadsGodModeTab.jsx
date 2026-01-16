import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Home, Search, Edit, Trash2, DollarSign, Users, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function LeadsGodModeTab() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [searchTerm, statusFilter, leads]);

  const loadLeads = async () => {
    try {
      const data = await base44.asServiceRole.entities.Measurement.list('-created_date', 500);
      setLeads(data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load leads');
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'available') {
        filtered = filtered.filter(l => l.available_for_purchase);
      } else if (statusFilter === 'purchased') {
        filtered = filtered.filter(l => l.purchased_by);
      } else {
        filtered = filtered.filter(l => l.lead_status === statusFilter);
      }
    }

    setFilteredLeads(filtered);
  };

  const handleEdit = (lead) => {
    setEditingLead({...lead});
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await base44.asServiceRole.entities.Measurement.update(editingLead.id, {
        lead_price: parseFloat(editingLead.lead_price),
        available_for_purchase: editingLead.available_for_purchase,
        lead_status: editingLead.lead_status,
        purchased_by: editingLead.purchased_by || null
      });
      
      toast.success('Lead updated successfully');
      setShowEditModal(false);
      loadLeads();
    } catch (err) {
      toast.error('Failed to update lead');
    }
  };

  const handleToggleAvailability = async (lead) => {
    try {
      await base44.asServiceRole.entities.Measurement.update(lead.id, {
        available_for_purchase: !lead.available_for_purchase
      });
      toast.success(`Lead ${lead.available_for_purchase ? 'hidden' : 'made available'}`);
      loadLeads();
    } catch (err) {
      toast.error('Failed to update lead');
    }
  };

  const handleDelete = async () => {
    try {
      await base44.asServiceRole.entities.Measurement.delete(deleteTarget.id);
      toast.success('Lead deleted successfully');
      setDeleteTarget(null);
      loadLeads();
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading leads...</div>;
  }

  const availableLeads = leads.filter(l => l.available_for_purchase && !l.purchased_by);
  const purchasedLeads = leads.filter(l => l.purchased_by);
  const totalRevenue = purchasedLeads.reduce((sum, l) => sum + (l.lead_price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{leads.length}</div>
            <div className="text-sm text-slate-600">Total Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{availableLeads.length}</div>
            <div className="text-sm text-slate-600">Available for Purchase</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{purchasedLeads.length}</div>
            <div className="text-sm text-slate-600">Purchased</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-slate-600">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="purchased">Purchased</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-sm">Property</th>
                  <th className="text-left p-3 font-semibold text-sm">Customer</th>
                  <th className="text-left p-3 font-semibold text-sm">Area</th>
                  <th className="text-left p-3 font-semibold text-sm">Price</th>
                  <th className="text-left p-3 font-semibold text-sm">Status</th>
                  <th className="text-left p-3 font-semibold text-sm">Available</th>
                  <th className="text-left p-3 font-semibold text-sm">Created</th>
                  <th className="text-left p-3 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-slate-400" />
                        <div className="text-sm">{lead.property_address}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{lead.customer_name || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{lead.customer_email || 'N/A'}</div>
                    </td>
                    <td className="p-3 text-sm">
                      {lead.total_sqft ? Math.round(lead.total_sqft).toLocaleString() : 'N/A'} sq ft
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold">{lead.lead_price || 25}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={
                        lead.lead_status === 'new' ? 'bg-slate-100 text-slate-800' :
                        lead.lead_status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        lead.lead_status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {lead.lead_status?.toUpperCase() || 'NEW'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {lead.available_for_purchase ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {format(new Date(lead.created_date), 'MMM d, yyyy')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(lead)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleAvailability(lead)}
                        >
                          {lead.available_for_purchase ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setDeleteTarget(lead)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Lead: {editingLead.property_address}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Lead Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingLead.lead_price || 25}
                  onChange={(e) => setEditingLead({...editingLead, lead_price: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Lead Status</label>
                <Select 
                  value={editingLead.lead_status} 
                  onValueChange={(val) => setEditingLead({...editingLead, lead_status: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={editingLead.available_for_purchase}
                  onChange={(e) => setEditingLead({...editingLead, available_for_purchase: e.target.checked})}
                />
                <label htmlFor="available" className="text-sm font-medium">Available for Purchase</label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead for <strong>{deleteTarget?.property_address}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}