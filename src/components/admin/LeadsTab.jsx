import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Phone, Mail, Filter } from "lucide-react";

export default function LeadsTab({ leads, users }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.lead_status === statusFilter;
    const matchesAssigned = assignedFilter === "all" || lead.assigned_to === assignedFilter;
    const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesAssigned && matchesPriority;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Property', 'Customer', 'Phone', 'Email', 'Area', 'Status', 'Priority', 'Assigned To', 'Quote Amount'];
    const rows = filteredLeads.map(lead => [
      new Date(lead.created_date).toLocaleDateString(),
      lead.property_address,
      lead.customer_name || '',
      lead.customer_phone || '',
      lead.customer_email || '',
      Math.round(lead.total_adjusted_sqft || lead.total_sqft || 0),
      lead.lead_status || 'new',
      lead.priority || 'medium',
      lead.assigned_to || 'Unassigned',
      lead.quote_amount || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aroof-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
      contacted: { color: 'bg-purple-100 text-purple-800', label: 'Contacted' },
      quoted: { color: 'bg-orange-100 text-orange-800', label: 'Quoted' },
      booked: { color: 'bg-green-100 text-green-800', label: 'Booked' },
      completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Completed' },
      lost: { color: 'bg-red-100 text-red-800', label: 'Lost' }
    };
    const badge = badges[status] || badges.new;
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getDaysInStatus = (lead) => {
    const now = new Date();
    const created = new Date(lead.created_date);
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Status" />
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

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Date</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Property</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Customer</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Contact</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Area</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Status</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Days</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Quote</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const daysInStatus = getDaysInStatus(lead);
                  
                  return (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-sm text-slate-600">
                        {new Date(lead.created_date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-900 text-sm">{lead.property_address}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-900 text-sm">{lead.customer_name || 'N/A'}</p>
                      </td>
                      <td className="p-3 text-xs">
                        {lead.customer_phone && (
                          <a href={`tel:${lead.customer_phone}`} className="flex items-center gap-1 text-blue-600 hover:underline mb-1">
                            <Phone className="w-3 h-3" />
                            {lead.customer_phone}
                          </a>
                        )}
                        {lead.customer_email && (
                          <a href={`mailto:${lead.customer_email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                            <Mail className="w-3 h-3" />
                            {lead.customer_email}
                          </a>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-sm">
                        {Math.round(lead.total_adjusted_sqft || lead.total_sqft || 0).toLocaleString()}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(lead.lead_status)}
                      </td>
                      <td className="p-3">
                        <span className={`text-sm font-semibold ${daysInStatus > 7 ? 'text-red-600' : 'text-slate-600'}`}>
                          {daysInStatus}d
                        </span>
                      </td>
                      <td className="p-3 text-sm font-semibold text-green-600">
                        {lead.quote_amount ? `$${lead.quote_amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(createPageUrl(`EstimatorLeadDetail?id=${lead.id}`))}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}