import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, List, LayoutGrid, TrendingUp, Users, CheckCircle, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import LeadPipelineView from "../components/leads/LeadPipelineView";
import LeadTableView from "../components/leads/LeadTableView";
import LeadDetailModal from "../components/leads/LeadDetailModal";

export default function LeadManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [estimators, setEstimators] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'pipeline'
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.aroof_role !== 'external_roofer') {
        toast.error('Access denied');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setUser(currentUser);

      // Load leads for this company
      const allLeads = await base44.entities.Measurement.list('-created_date', 200);
      const companyLeads = allLeads.filter(m => 
        m.company_id === currentUser.company_id && 
        m.user_type === 'homeowner'
      );
      setLeads(companyLeads);

      // Load estimators
      const allUsers = await base44.entities.User.list();
      const companyEstimators = allUsers.filter(u => 
        u.company_id === currentUser.company_id && 
        u.aroof_role === 'estimator'
      );
      setEstimators(companyEstimators);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      toast.error('Failed to load lead data');
      navigate(createPageUrl("RooferDashboard"));
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await base44.entities.Measurement.update(leadId, {
        lead_status: newStatus
      });
      
      toast.success(`Lead moved to ${newStatus}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAssign = async (leadId, userId) => {
    try {
      await base44.entities.Measurement.update(leadId, {
        assigned_to: userId === 'unassigned' ? null : userId
      });
      
      toast.success('Lead assigned successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to assign lead');
    }
  };

  const handleBulkAction = async (action, leadIds, value) => {
    try {
      for (const id of leadIds) {
        if (action === 'assign') {
          await base44.entities.Measurement.update(id, { assigned_to: value });
        } else if (action === 'status') {
          await base44.entities.Measurement.update(id, { lead_status: value });
        }
      }
      
      toast.success(`Updated ${leadIds.length} leads`);
      loadData();
    } catch (err) {
      toast.error('Failed to update leads');
    }
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const stats = {
    total: leads.length,
    thisWeek: leads.filter(l => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(l.created_date) >= weekAgo;
    }).length,
    new: leads.filter(l => l.lead_status === 'new').length,
    contacted: leads.filter(l => l.lead_status === 'contacted').length,
    quoted: leads.filter(l => l.lead_status === 'quoted').length,
    booked: leads.filter(l => l.lead_status === 'booked').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Lead Management</h1>
                <p className="text-blue-200 text-sm">{leads.length} total leads</p>
              </div>
            </div>
            <Link to={createPageUrl("RooferDashboard")}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Leads</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">This Week</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.thisWeek}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Conversion</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.total > 0 ? Math.round((stats.booked / stats.total) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Deal</p>
                  <p className="text-3xl font-bold text-slate-900">$8.2k</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-semibold text-blue-900">New</p>
              <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-semibold text-yellow-900">Contacted</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.contacted}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-semibold text-purple-900">Quoted</p>
              <p className="text-3xl font-bold text-purple-600">{stats.quoted}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-semibold text-green-900">Booked</p>
              <p className="text-3xl font-bold text-green-600">{stats.booked}</p>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4 mr-2" />
              Table View
            </Button>
            <Button
              variant={viewMode === 'pipeline' ? 'default' : 'outline'}
              onClick={() => setViewMode('pipeline')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Pipeline View
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'pipeline' ? (
          <LeadPipelineView
            leads={leads}
            onStatusChange={handleStatusChange}
            onLeadClick={handleLeadClick}
          />
        ) : (
          <LeadTableView
            leads={leads}
            onLeadClick={handleLeadClick}
            onAssign={handleAssign}
            onStatusChange={handleStatusChange}
            onBulkAction={handleBulkAction}
            estimators={estimators}
          />
        )}
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUpdate={loadData}
      />
    </div>
  );
}