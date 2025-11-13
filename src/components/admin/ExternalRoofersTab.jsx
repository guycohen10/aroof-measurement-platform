import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Building2, TrendingUp, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function ExternalRoofersTab({ roofers }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const filteredRoofers = roofers.filter(roofer => {
    const matchesSearch = 
      roofer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roofer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roofer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = planFilter === "all" || roofer.subscription_plan === planFilter;
    
    return matchesSearch && matchesPlan;
  });

  // Calculate stats
  const totalSubscribers = roofers.length;
  const byPlan = {
    free: roofers.filter(r => r.subscription_plan === 'free').length,
    starter: roofers.filter(r => r.subscription_plan === 'starter').length,
    pro: roofers.filter(r => r.subscription_plan === 'pro').length,
    unlimited: roofers.filter(r => r.subscription_plan === 'unlimited').length
  };

  const potentialMRR = 
    (byPlan.starter * 49) + 
    (byPlan.pro * 99) + 
    (byPlan.unlimited * 199);

  const getPlanBadge = (plan) => {
    const badges = {
      free: 'bg-slate-100 text-slate-800',
      starter: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      unlimited: 'bg-yellow-100 text-yellow-800'
    };
    return badges[plan] || badges.free;
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Subscribers</p>
                <p className="text-3xl font-bold text-slate-900">{totalSubscribers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">FREE</p>
            <p className="text-2xl font-bold text-slate-900">{byPlan.free}</p>
            <p className="text-xs text-slate-500">subscribers</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">STARTER</p>
            <p className="text-2xl font-bold text-blue-600">{byPlan.starter}</p>
            <p className="text-xs text-slate-500">× $49/mo</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">PRO</p>
            <p className="text-2xl font-bold text-purple-600">{byPlan.pro}</p>
            <p className="text-xs text-slate-500">× $99/mo</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Potential MRR</p>
                <p className="text-3xl font-bold">${potentialMRR.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by company, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Roofers Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>External Roofer Accounts ({filteredRoofers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Company</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Contact</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Plan</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Usage</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Status</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Joined</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">MRR</th>
                  <th className="text-left p-3 font-semibold text-slate-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoofers.map((roofer) => {
                  const usagePercent = roofer.measurements_limit > 0 
                    ? Math.round((roofer.measurements_used_this_month / roofer.measurements_limit) * 100)
                    : 0;

                  const mrr = {
                    free: 0,
                    starter: 49,
                    pro: 99,
                    unlimited: 199
                  }[roofer.subscription_plan] || 0;

                  return (
                    <tr key={roofer.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {roofer.company_name || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {roofer.full_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <p className="text-slate-900">{roofer.email}</p>
                        {roofer.phone && (
                          <p className="text-slate-500 text-xs">{roofer.phone}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={getPlanBadge(roofer.subscription_plan)}>
                          {roofer.subscription_plan?.toUpperCase() || 'FREE'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {roofer.measurements_used_this_month || 0} / 
                            {roofer.measurements_limit === 999999 ? '∞' : roofer.measurements_limit}
                          </p>
                          {roofer.subscription_plan !== 'unlimited' && (
                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  usagePercent > 80 ? 'bg-red-600' : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min(100, usagePercent)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={
                          roofer.subscription_status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }>
                          {roofer.subscription_status?.toUpperCase() || 'ACTIVE'}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {roofer.created_date 
                          ? format(new Date(roofer.created_date), 'MMM d, yyyy')
                          : 'N/A'
                        }
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-green-600">
                          ${mrr}
                        </p>
                      </td>
                      <td className="p-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Could navigate to detailed view
                            alert(`View details for ${roofer.company_name || roofer.email}`);
                          }}
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