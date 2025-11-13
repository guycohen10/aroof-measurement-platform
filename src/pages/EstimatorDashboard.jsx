import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  LogOut, 
  Search, 
  Filter,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Eye,
  Download
} from "lucide-react";

export default function EstimatorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [stats, setStats] = useState({
    newLeads: 0,
    activeQuotes: 0,
    monthlyRevenue: 0,
    conversionRate: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, priorityFilter]);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Check if user has estimator role
      if (currentUser.role !== 'admin' && currentUser.aroof_role !== 'estimator') {
        alert('Access denied. Estimator role required.');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setUser(currentUser);
      await loadDashboardData(currentUser);
    } catch (err) {
      console.error('Auth error:', err);
      navigate(createPageUrl("Homepage"));
    }
  };

  const loadDashboardData = async (currentUser) => {
    try {
      // Load all measurements (leads)
      const allMeasurements = await base44.entities.Measurement.list('-created_date', 100);
      setLeads(allMeasurements);

      // Calculate stats
      const now = new Date();
      const thisMonth = allMeasurements.filter(m => {
        const createdDate = new Date(m.created_date);
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      });

      const newLeads = allMeasurements.filter(m => m.lead_status === 'new').length;
      const quotedLeads = allMeasurements.filter(m => m.lead_status === 'quoted').length;
      const completedLeads = allMeasurements.filter(m => m.lead_status === 'completed');
      
      const monthlyRevenue = completedLeads.reduce((sum, m) => sum + (m.quote_amount || 0), 0);
      const conversionRate = allMeasurements.length > 0 
        ? Math.round((completedLeads.length / allMeasurements.length) * 100)
        : 0;

      setStats({
        newLeads,
        activeQuotes: quotedLeads,
        monthlyRevenue,
        conversionRate
      });

      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customer_phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.lead_status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(lead => lead.priority === priorityFilter);
    }

    setFilteredLeads(filtered);
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await base44.entities.Measurement.update(leadId, { lead_status: newStatus });
      
      // Reload data
      const currentUser = await base44.auth.me();
      await loadDashboardData(currentUser);
      
      alert('Status updated successfully!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Home className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Aroof Estimator</h1>
                <p className="text-sm text-blue-200">Welcome, {user?.full_name || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Homepage")}>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Home className="w-4 h-4 mr-2" />
                  Public Site
                </Button>
              </Link>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={AlertCircle}
            title="New Leads"
            value={stats.newLeads}
            color="blue"
            subtitle="Require attention"
          />
          <StatCard
            icon={FileText}
            title="Active Quotes"
            value={stats.activeQuotes}
            color="orange"
            subtitle="Pending decision"
          />
          <StatCard
            icon={DollarSign}
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            color="green"
            subtitle="This month"
          />
          <StatCard
            icon={TrendingUp}
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            color="purple"
            subtitle="Lead to sale"
          />
        </div>

        {/* Leads Management */}
        <Card className="shadow-xl">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Lead Management</CardTitle>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {filteredLeads.length} leads
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by address, name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
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

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left p-3 font-semibold text-slate-700">Date</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Property</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Customer</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Contact</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Area</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Priority</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500">
                        No leads found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <LeadRow 
                        key={lead.id} 
                        lead={lead} 
                        onStatusChange={handleStatusChange}
                        onViewDetails={() => navigate(createPageUrl(`Results?measurementid=${lead.id}`))}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="text-sm opacity-90 mb-1">{title}</div>
        <div className="text-4xl font-bold mb-1">{value}</div>
        <div className="text-xs opacity-75">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function LeadRow({ lead, onStatusChange, onViewDetails }) {
  const getStatusBadge = (status) => {
    const badges = {
      new: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'New' },
      contacted: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Contacted' },
      quoted: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Quoted' },
      booked: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Booked' },
      completed: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Completed' },
      lost: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Lost' }
    };
    const badge = badges[status] || badges.new;
    return <Badge className={`${badge.color} border`}>{badge.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: { color: 'bg-red-100 text-red-800', label: '🔥 Urgent' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      low: { color: 'bg-slate-100 text-slate-800', label: 'Low' }
    };
    const badge = badges[priority || 'medium'];
    return <Badge variant="outline" className={badge.color}>{badge.label}</Badge>;
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="p-3 text-sm text-slate-600">
        {new Date(lead.created_date).toLocaleDateString()}
      </td>
      <td className="p-3">
        <div className="font-medium text-slate-900">{lead.property_address}</div>
      </td>
      <td className="p-3">
        <div className="font-medium text-slate-900">{lead.customer_name || 'N/A'}</div>
      </td>
      <td className="p-3 text-sm">
        <div className="flex flex-col gap-1">
          {lead.customer_phone && (
            <a href={`tel:${lead.customer_phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
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
        </div>
      </td>
      <td className="p-3 font-semibold text-slate-900">
        {Math.round(lead.total_adjusted_sqft || lead.total_sqft || 0).toLocaleString()} sq ft
      </td>
      <td className="p-3">
        {getPriorityBadge(lead.priority)}
      </td>
      <td className="p-3">
        <Select 
          value={lead.lead_status || 'new'} 
          onValueChange={(value) => onStatusChange(lead.id, value)}
        >
          <SelectTrigger className="w-32 h-8">
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
      <td className="p-3">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onViewDetails}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </div>
      </td>
    </tr>
  );
}