import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Home,
  Zap,
  TrendingUp,
  Calendar,
  CreditCard,
  Settings,
  Download,
  Eye,
  AlertCircle,
  Crown,
  LogOut,
  Loader2 // Added Loader2 import
} from "lucide-react";
import { format } from "date-fns";

export default function RooferDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    loadDashboardData(); // Changed to loadDashboardData
  }, []);

  // Renamed from checkAuthAndLoad and updated
  const loadDashboardData = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Check if user is external roofer
      if (currentUser.aroof_role !== 'external_roofer') {
        alert('Access denied. This dashboard is for external roofers only.');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setUser(currentUser);

      // Load all users in this company
      const companyUsers = await base44.entities.User.list();
      const companyUserIds = companyUsers
        .filter(u => u.company_id === currentUser.company_id)
        .map(u => u.email);

      // Load measurements for all users in this company, sorted by created_date descending, limited to 10
      const allMeasurements = await base44.entities.Measurement.list('-created_date', 100);
      const userMeasurements = allMeasurements.filter(m => 
        m.company_id === currentUser.company_id || companyUserIds.includes(m.created_by)
      );
      
      setMeasurements(userMeasurements.slice(0, 10));
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      
      // Not authenticated - redirect to login
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        navigate(createPageUrl("RooferLogin"));
        return;
      }
      
      alert('Failed to load dashboard. Please try logging in again.');
      navigate(createPageUrl("RooferLogin"));
    }
  };

  const handleLogout = async () => { // Made async
    try {
      await base44.auth.logout(); // Added await
      navigate(createPageUrl("RooferLogin")); // Navigate to login page
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback for more robust logout, force page reload to clear state
      window.location.href = createPageUrl("RooferLogin");
    }
  };

  const handleNewMeasurement = async () => {
    // Check if user can create measurement
    const limit = getLimit(user.subscription_plan);
    const used = user.measurements_used_this_month || 0;

    if (user.subscription_plan !== 'unlimited' && used >= limit) {
      alert(`You've reached your monthly limit of ${limit} measurements.\n\nUpgrade to ${getNextPlan(user.subscription_plan)} for more measurements!`);
      return;
    }

    // Redirect to measurement page
    navigate(createPageUrl("FormPage"));
  };

  const getLimit = (plan) => {
    const limits = { free: 3, starter: 20, pro: 100, unlimited: 999999 };
    return limits[plan] || 3;
  };

  const getNextPlan = (currentPlan) => {
    const upgrades = { free: 'Starter', starter: 'Pro', pro: 'Unlimited' };
    return upgrades[currentPlan] || 'Pro';
  };

  const getPlanBadge = (plan) => {
    const colors = {
      free: 'bg-slate-100 text-slate-800',
      starter: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      unlimited: 'bg-yellow-100 text-yellow-800'
    };
    return colors[plan] || colors.free;
  };

  const getPlanPrice = (plan) => {
    const prices = { free: 0, starter: 49, pro: 99, unlimited: 199 };
    return prices[plan] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" /> {/* Updated spinner */}
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const limit = getLimit(user.subscription_plan);
  const used = user.measurements_used_this_month || 0;
  const remaining = user.subscription_plan === 'unlimited' ? '∞' : Math.max(0, limit - used);
  const usagePercent = user.subscription_plan === 'unlimited' ? 0 : Math.min(100, (used / limit) * 100);
  const nearLimit = usagePercent > 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Home className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user.company_name || user.full_name || 'Your Dashboard'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getPlanBadge(user.subscription_plan)}>
                    {user.subscription_plan?.toUpperCase() || 'FREE'}
                  </Badge>
                  <span className="text-sm text-blue-200">
                    {remaining === '∞' ? 'Unlimited measurements' : `${remaining} measurements left`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={createPageUrl("LeadManagement")}>
                <Button variant="ghost" className="text-white hover:bg-white/10" size="sm">
                  Leads
                </Button>
              </Link>
              <Link to={createPageUrl("JobScheduling")}>
                <Button variant="ghost" className="text-white hover:bg-white/10" size="sm">
                  Jobs
                </Button>
              </Link>
              <Link to={createPageUrl("Subscriptions")}>
                <Button variant="ghost" className="text-white hover:bg-white/10" size="sm">
                  Subscriptions
                </Button>
              </Link>
              <Link to={createPageUrl("CrewManagement")}>
                <Button variant="ghost" className="text-white hover:bg-white/10" size="sm">
                  Crews
                </Button>
              </Link>
              <Link to={createPageUrl("StormTracking")}>
                <Button variant="ghost" className="text-white hover:bg-white/10" size="sm">
                  Storm
                </Button>
              </Link>
              <Link to={createPageUrl("FollowUpSettings")}>
                <Button variant="ghost" className="text-white hover:bg-white/10" size="sm">
                  Follow-Ups
                </Button>
              </Link>
              <Button variant="ghost" className="text-white hover:bg-white/10" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Alert */}
        {nearLimit && user.subscription_plan !== 'unlimited' && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 mb-2">
                    You're running low on measurements!
                  </h3>
                  <p className="text-orange-800 mb-4">
                    You've used {used} out of {limit} measurements this month. 
                    Upgrade to get more measurements.
                  </p>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Row - Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Measure */}
          <Card className="lg:col-span-2 shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Ready to Measure a Roof?
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Get accurate measurements in 60 seconds using satellite imagery
              </p>
              <Button 
                size="lg"
                className="h-16 px-10 text-xl bg-green-600 hover:bg-green-700"
                onClick={handleNewMeasurement}
              >
                <Zap className="w-6 h-6 mr-3" />
                Measure New Roof
              </Button>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Usage This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {used}
                  <span className="text-2xl text-slate-400">
                    /{user.subscription_plan === 'unlimited' ? '∞' : limit}
                  </span>
                </div>
                <p className="text-slate-600">measurements used</p>
              </div>

              {user.subscription_plan !== 'unlimited' && (
                <>
                  <Progress value={usagePercent} className="h-3" />
                  <div className="text-center">
                    <p className="text-sm text-slate-500">
                      {remaining} measurements remaining
                    </p>
                  </div>
                </>
              )}

              {user.next_billing_date && (
                <div className="pt-4 border-t text-center">
                  <p className="text-xs text-slate-500 mb-1">Resets on</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {format(new Date(user.next_billing_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Measurements */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Measurements</CardTitle>
              <Badge variant="outline">{measurements.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {measurements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-4">No measurements yet</p>
                <Button onClick={handleNewMeasurement}>
                  <Zap className="w-4 h-4 mr-2" />
                  Create Your First Measurement
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Date</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Property Address</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Area</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Type</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Status</th>
                      <th className="text-left p-3 font-semibold text-slate-700 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.slice(0, 10).map((measurement) => (
                      <tr key={measurement.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 text-sm text-slate-600">
                          {format(new Date(measurement.created_date), 'MMM d, yyyy')}
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-900">{measurement.property_address}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">
                          {Math.round(measurement.total_adjusted_sqft || measurement.total_sqft || 0).toLocaleString()} sq ft
                        </td>
                        <td className="p-3">
                          {measurement.measurement_type === 'quick_estimate' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                              ⚡ Quick Est
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                              📐 Detailed
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            measurement.lead_status === 'new' ? 'bg-slate-100 text-slate-800' :
                            measurement.lead_status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            measurement.lead_status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                            measurement.lead_status === 'booked' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {measurement.lead_status || 'New'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(createPageUrl(`Results?measurementid=${measurement.id}`))}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing & Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-slate-900">
                  {user.subscription_plan?.charAt(0).toUpperCase() + user.subscription_plan?.slice(1) || 'Free'}
                </p>
                <p className="text-sm text-slate-500">
                  ${getPlanPrice(user.subscription_plan)}/month
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Next Billing Date</p>
                <p className="text-lg font-semibold text-slate-900">
                  {user.next_billing_date 
                    ? format(new Date(user.next_billing_date), 'MMM d, yyyy')
                    : 'N/A'
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <Badge className="bg-green-100 text-green-800">
                  {user.subscription_status?.toUpperCase() || 'ACTIVE'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Link to={createPageUrl("RooferBilling")} className="flex-1">
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </Link>
              {user.subscription_plan !== 'unlimited' && (
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}