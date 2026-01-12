import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export default function HomeownerLeadsGodModeTab() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      // Get all homeowner measurements ordered by newest first
      const measurements = await base44.entities.Measurement.list('-created_date', 100);
      
      // Filter for homeowners with complete info
      const homeownerLeads = measurements.filter(
        m => m.user_type === 'homeowner' && m.customer_name && m.measurement_completed
      );
      
      setLeads(homeownerLeads);
    } catch (err) {
      console.error('Failed to load homeowner leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToRoofer = (leadId) => {
    alert('Assign to roofer feature coming soon');
    // TODO: Implement roofer assignment
  };

  const handleSendToRoofer = (leadId) => {
    alert('Send to roofer feature coming soon');
    // TODO: Implement sending lead to roofer
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="text-4xl font-bold text-blue-600 mb-2">{leads.length}</div>
          <p className="text-slate-600 font-semibold">Total Homeowner Leads</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-white">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {leads.filter(l => l.lead_status === 'new').length}
          </div>
          <p className="text-slate-600 font-semibold">New Leads</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-white">
          <div className="text-4xl font-bold text-yellow-600 mb-2">
            {leads.filter(l => l.lead_status === 'contacted').length}
          </div>
          <p className="text-slate-600 font-semibold">Contacted</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {leads.reduce((sum, l) => sum + (l.total_sqft || 0), 0).toLocaleString()}
          </div>
          <p className="text-slate-600 font-semibold">Total Sq Ft</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Address</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Sq Ft</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(lead.created_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {lead.customer_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${lead.customer_email}`} className="hover:text-blue-600 truncate">
                          {lead.customer_email}
                        </a>
                      </div>
                      {lead.customer_phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${lead.customer_phone}`} className="hover:text-blue-600">
                            {lead.customer_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{lead.property_address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {(lead.total_sqft || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      lead.lead_status === 'new' ? 'bg-green-100 text-green-800' :
                      lead.lead_status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      lead.lead_status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {lead.lead_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedLead && (
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-slate-900">{selectedLead.customer_name}</h3>
            <button
              onClick={() => setSelectedLead(null)}
              className="text-xl text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Contact Information</h4>
              <div className="space-y-2">
                <p className="text-slate-600">
                  <strong>Email:</strong> {selectedLead.customer_email}
                </p>
                <p className="text-slate-600">
                  <strong>Phone:</strong> {selectedLead.customer_phone || 'N/A'}
                </p>
                <p className="text-slate-600">
                  <strong>Address:</strong> {selectedLead.property_address}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-3">Measurement Details</h4>
              <div className="space-y-2">
                <p className="text-slate-600">
                  <strong>Total Area:</strong> {(selectedLead.total_sqft || 0).toLocaleString()} sq ft
                </p>
                <p className="text-slate-600">
                  <strong>Measurement Type:</strong> {selectedLead.measurement_type || 'detailed_polygon'}
                </p>
                <p className="text-slate-600">
                  <strong>Measured:</strong> {format(new Date(selectedLead.created_date), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Lead Status</h4>
            <p className="text-slate-600 mb-4">
              <strong>Current Status:</strong> <span className={`px-2 py-1 rounded text-xs font-semibold ${
                selectedLead.lead_status === 'new' ? 'bg-green-100 text-green-800' :
                selectedLead.lead_status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                selectedLead.lead_status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                'bg-slate-100 text-slate-800'
              }`}>
                {selectedLead.lead_status}
              </span>
            </p>
            <p className="text-slate-600">
              <strong>SMS Opt-in:</strong> {selectedLead.sms_opt_in ? '✓ Yes' : '✗ No'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleAssignToRoofer(selectedLead.id)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Assign to Roofer
            </Button>
            <Button
              onClick={() => handleSendToRoofer(selectedLead.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send to Roofer
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`/results?measurementid=${selectedLead.id}`, '_blank')}
            >
              View Full Results
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}