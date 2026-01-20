import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Phone, Mail, Calendar, Trash2, MoreVertical, Download, Briefcase } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LeadTableView({ 
  leads, 
  onLeadClick, 
  onAssign, 
  onStatusChange,
  onBulkAction,
  estimators = []
}) {
  const navigate = useNavigate();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    assignedTo: 'all',
    measurementType: 'all',
    minSqFt: '',
    maxSqFt: '',
    search: ''
  });

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const toggleSelect = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleBulkAssign = async (userId) => {
    await onBulkAction('assign', selectedLeads, userId);
    setSelectedLeads([]);
  };

  const handleBulkStatus = async (status) => {
    await onBulkAction('status', selectedLeads, status);
    setSelectedLeads([]);
  };

  const handleStartJob = async (lead) => {
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Job.create({
        company_id: user.company_id,
        assigned_company_id: user.company_id,
        source_measurement_id: lead.id,
        customer_name: lead.customer_name || 'Unnamed Customer',
        customer_email: lead.customer_email,
        customer_phone: lead.customer_phone,
        property_address: lead.property_address,
        roof_sqft: lead.total_adjusted_sqft || lead.total_sqft,
        status: 'scheduled',
        scheduled_date: new Date().toISOString()
      });
      
      toast.success('Job created! Redirecting to Job Board...');
      setTimeout(() => navigate(createPageUrl('JobBoard')), 1000);
    } catch (err) {
      console.error('Failed to create job:', err);
      toast.error('Failed to create job');
    }
  };

  const handleExport = () => {
    const leadsToExport = selectedLeads.length > 0 
      ? leads.filter(l => selectedLeads.includes(l.id))
      : leads;

    const csv = [
      ['Date', 'Customer Name', 'Email', 'Phone', 'Address', 'Square Feet', 'Status', 'Priority', 'Assigned To'].join(','),
      ...leadsToExport.map(lead => [
        format(new Date(lead.created_date), 'yyyy-MM-dd'),
        lead.customer_name || '',
        lead.customer_email || '',
        lead.customer_phone || '',
        lead.property_address || '',
        Math.round(lead.total_adjusted_sqft || lead.total_sqft || 0),
        lead.lead_status || 'new',
        lead.priority || 'medium',
        lead.assigned_to || 'Unassigned'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-3 mb-3">
            <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(v) => setFilters({...filters, priority: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(v) => setFilters({...filters, dateRange: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search address..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Min Sq Ft"
              value={filters.minSqFt}
              onChange={(e) => setFilters({...filters, minSqFt: e.target.value})}
              className="w-32"
            />
            <Input
              type="number"
              placeholder="Max Sq Ft"
              value={filters.maxSqFt}
              onChange={(e) => setFilters({...filters, maxSqFt: e.target.value})}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-blue-900">
                {selectedLeads.length} selected
              </span>
              <Select onValueChange={handleBulkAssign}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Assign To" />
                </SelectTrigger>
                <SelectContent>
                  {estimators.map(est => (
                    <SelectItem key={est.id} value={est.id}>
                      {est.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={handleBulkStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="p-3 text-left">
                  <Checkbox
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Date</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Address</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Sq Ft</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Priority</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Assigned</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={() => toggleSelect(lead.id)}
                    />
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {format(new Date(lead.created_date), 'MMM d')}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="font-medium text-slate-900">{lead.customer_name || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{lead.customer_phone}</div>
                  </td>
                  <td className="p-3 text-sm text-slate-700">{lead.property_address}</td>
                  <td className="p-3 text-sm font-semibold text-slate-900">
                    {Math.round(lead.total_adjusted_sqft || lead.total_sqft || 0).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      lead.lead_status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.lead_status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.lead_status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                      lead.lead_status === 'booked' ? 'bg-green-100 text-green-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {lead.lead_status || 'new'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      lead.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      lead.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {lead.priority || 'medium'}
                    </span>
                  </td>
                  <td className="p-3">
                    <Select 
                      value={lead.assigned_to || 'unassigned'} 
                      onValueChange={(v) => onAssign(lead.id, v)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {estimators.map(est => (
                          <SelectItem key={est.id} value={est.id}>
                            {est.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleStartJob(lead)}
                      >
                        <Briefcase className="w-3 h-3 mr-1" />
                        Start Job
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onLeadClick(lead)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}