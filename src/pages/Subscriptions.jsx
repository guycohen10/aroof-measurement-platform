import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Search, Eye, Calendar, Phone, DollarSign, TrendingUp, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Subscriptions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      
      if (user.aroof_role !== 'external_roofer') {
        alert('Access denied');
        navigate(createPageUrl("Homepage"));
        return;
      }

      const allSubs = await base44.entities.Subscription.list('-created_date', 200);
      const companySubs = allSubs.filter(s => s.company_id === user.company_id);
      setSubscriptions(companySubs);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      setLoading(false);
    }
  };

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = searchTerm === "" || 
      sub.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = planFilter === "all" || sub.plan_tier === planFilter;
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    mrr: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.monthly_price || 0), 0),
    annual: subscriptions.filter(s => s.billing_cycle === 'annual').length
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
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Maintenance Subscriptions</h1>
                <p className="text-blue-200 text-sm">{stats.active} active subscriptions</p>
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
                  <p className="text-sm text-slate-600">Active Subs</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">MRR</p>
                  <p className="text-3xl font-bold text-green-600">${stats.mrr.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Annual Run Rate</p>
                  <p className="text-3xl font-bold text-blue-600">${(stats.mrr * 12).toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Annual Plans</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.annual}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by address or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Property</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Plan</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Next Service</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map(sub => (
                  <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{sub.property_address}</div>
                      <div className="text-xs text-slate-500">
                        {sub.inspections_remaining || 0}/{sub.plan_tier === 'basic' ? 1 : sub.plan_tier === 'premium' ? 2 : 4} inspections
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm font-medium text-slate-900">{sub.customer_name}</div>
                      <div className="text-xs text-slate-500">{sub.customer_email}</div>
                    </td>
                    <td className="p-3">
                      <div className={`px-2 py-1 rounded text-xs font-semibold inline-block ${
                        sub.plan_tier === 'basic' ? 'bg-slate-100 text-slate-800' :
                        sub.plan_tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {sub.plan_tier}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">${sub.monthly_price}/{sub.billing_cycle === 'monthly' ? 'mo' : 'yr'}</div>
                    </td>
                    <td className="p-3 text-sm text-slate-700">
                      {sub.next_service_date ? format(new Date(sub.next_service_date), 'MMM d, yyyy') : 'Not scheduled'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        sub.status === 'active' ? 'bg-green-100 text-green-800' :
                        sub.status === 'past_due' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(createPageUrl(`SubscriptionDetail/${sub.id}`))}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}