import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Eye, Download, Phone, Mail } from "lucide-react";

export default function LeadsGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await base44.entities.Measurement.list('-created_date', 500);
      setMeasurements(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      setLoading(false);
    }
  }

  async function deleteLead(id) {
    if (!confirm('Delete this lead permanently?')) return;
    try {
      await base44.entities.Measurement.delete(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await base44.entities.Measurement.update(id, { lead_status: newStatus });
      await loadData();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  }

  const filteredLeads = measurements.filter(m => {
    const matchesSearch = 
      (m.property_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.lead_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 flex gap-4 flex-wrap items-center">
          <Input
            placeholder="🔍 Search by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[300px]"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700">
            📥 Export CSV
          </Button>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Area</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => (
                  <tr key={lead.id} className={`border-b hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-4 py-4 text-sm">
                      {new Date(lead.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{lead.customer_name || 'N/A'}</div>
                      <div className="text-xs text-slate-600">{lead.customer_email}</div>
                      <div className="text-xs text-slate-600">{lead.customer_phone}</div>
                    </td>
                    <td className="px-4 py-4 text-sm max-w-xs truncate">
                      {lead.property_address}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">
                      {Math.round(lead.total_adjusted_sqft || lead.total_sqft || 0).toLocaleString()} sq ft
                    </td>
                    <td className="px-4 py-4">
                      <Select 
                        value={lead.lead_status || 'new'} 
                        onValueChange={(value) => updateStatus(lead.id, value)}
                      >
                        <SelectTrigger className="w-32 text-xs">
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
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedLead(lead)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {lead.customer_phone && (
                          <a href={`tel:${lead.customer_phone}`}>
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button size="sm" variant="outline" onClick={() => deleteLead(lead.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLeads.length === 0 && (
              <div className="py-20 text-center text-slate-400">
                No leads found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLead(null)}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">Lead Details</h3>
                <button onClick={() => setSelectedLead(null)} className="text-2xl text-slate-400 hover:text-slate-600">×</button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">Customer Name</div>
                  <div className="text-lg font-semibold">{selectedLead.customer_name || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">Email</div>
                    <div>{selectedLead.customer_email || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">Phone</div>
                    <div>{selectedLead.customer_phone || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">Property Address</div>
                  <div>{selectedLead.property_address}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">Total Area</div>
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(selectedLead.total_adjusted_sqft || selectedLead.total_sqft || 0).toLocaleString()} sq ft
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">Payment</div>
                    <div className="text-sm font-semibold text-green-600">${selectedLead.payment_amount || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">Created</div>
                    <div className="text-sm">{new Date(selectedLead.created_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {selectedLead.customer_phone && (
                    <a href={`tel:${selectedLead.customer_phone}`} className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </a>
                  )}
                  {selectedLead.customer_email && (
                    <a href={`mailto:${selectedLead.customer_email}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}