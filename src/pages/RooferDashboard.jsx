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
  Plus,
  FileText,
  Download,
  Eye,
  CreditCard,
  Settings,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  Zap,
  LogOut
} from "lucide-react";

const PLAN_LIMITS = {
  free: 3,
  starter: 20,
  pro: 100,
  unlimited: -1 // -1 means unlimited
};

const PLAN_COLORS = {
  free: "bg-slate-100 text-slate-800",
  starter: "bg-blue-100 text-blue-800",
  pro: "bg-purple-100 text-purple-800",
  unlimited: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
};

export default function RooferDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.aroof_role !== 'external_roofer') {
        alert('This dashboard is for external roofer accounts only');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setUser(currentUser);
      await loadMeasurements(currentUser);
    } catch (err) {
      console.error('Auth error:', err);
      alert('Please sign in to access your dashboard');
      navigate(createPageUrl("RooferSignup"));
    }
  };

  const loadMeasurements = async (currentUser) => {
    try {
      const userMeasurements = await base44.entities.Measurement.filter({
        created_by: currentUser.email
      });
      setMeasurements(userMeasurements);
      setLoading(false);
    } catch (err) {
      console.error('Error loading measurements:', err);
      setLoading(false);
    }
  };

  const handleNewMeasurement = () => {
    const plan = user.subscription_plan || 'free';
    const limit = PLAN_LIMITS[plan];
    const used = user.measurements_used_this_month || 0;

    if (limit !== -1 && used >= limit) {
      // Show upgrade modal
      if (window.confirm(`You've reached your monthly limit of ${limit} measurements.\n\nUpgrade your plan to continue measuring roofs.\n\nClick OK to view upgrade options.`)) {
        navigate(createPageUrl("RooferBilling"));
      }
      return;
    }

    navigate(createPageUrl("FormPage"));
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

  const plan = user?.subscription_plan || 'free';
  const limit = PLAN_LIMITS[plan];
  const used = user?.measurements_used_this_month || 0;
  const remaining = limit === -1 ? "Unlimited" : limit - used;
  const usagePercent = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
  const daysUntilReset = 15; // Mock - would calculate from billing_cycle_start

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
                <h1 className="text-2xl font-bold">{user?.company_name || "Roofer Dashboard"}</h1>
                <Badge className={PLAN_COLORS[plan]}>
                  {plan.toUpperCase()} PLAN
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("RooferBilling")}>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Button>
              </Link>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Stats */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Usage Card */}
          <Card className="lg:col-span-2 shadow-lg border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Monthly Usage</span>
                {limit !== -1 && usagePercent >= 80 && (
                  <Badge className="bg-orange-100 text-orange-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Near Limit
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-4xl font-bold text-blue-600">
                    {used} / {limit === -1 ? "∞" : limit}
                  </p>
                  <p className="text-slate-600">Measurements used</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{remaining}</p>
                  <p className="text-sm text-slate-600">Remaining</p>
                </div>
              </div>

              {limit !== -1 && (
                <Progress value={usagePercent} className="h-3" />
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>Resets in {daysUntilReset} days</span>
                </div>
                {plan !== 'unlimited' && (
                  <Link to={createPageUrl("RooferBilling")}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Measurements</p>
                    <p className="text-3xl font-bold text-slate-900">{measurements.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Next Billing</p>
                    <p className="text-lg font-bold text-slate-900">
                      {new Date(Date.now() + daysUntilReset * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Measure Button */}
        <Card className="mb-8 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Ready to Measure a Roof?</h2>
                <p className="text-blue-100 text-lg">
                  Get satellite measurements in under 60 seconds
                </p>
              </div>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 h-16 px-10 text-xl shadow-xl"
                onClick={handleNewMeasurement}
              >
                <Zap className="w-6 h-6 mr-2" />
                Measure New Roof
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Measurements */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            {measurements.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xl text-slate-600 mb-2">No measurements yet</p>
                <p className="text-slate-500 mb-6">
                  Start measuring roofs to see your history here
                </p>
                <Button onClick={handleNewMeasurement} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Measurement
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2">
                    <tr>
                      <th className="text-left p-3 font-semibold text-slate-700">Date</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Property</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Area</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Customer</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((measurement) => (
                      <tr key={measurement.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-sm text-slate-600">
                          {new Date(measurement.created_date).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-900">
                            {measurement.property_address}
                          </p>
                        </td>
                        <td className="p-3 font-semibold">
                          {Math.round(measurement.total_adjusted_sqft || measurement.total_sqft || 0).toLocaleString()} sq ft
                        </td>
                        <td className="p-3 text-sm">
                          {measurement.customer_name || 'N/A'}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Complete
                          </Badge>
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
                              <Download className="w-4 h-4 mr-1" />
                              PDF
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
      </div>
    </div>
  );
}