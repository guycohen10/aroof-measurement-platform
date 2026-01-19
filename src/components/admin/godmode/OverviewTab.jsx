import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Coins } from "lucide-react";
import { toast } from "sonner";

export default function OverviewTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({});
  const [pricing, setPricing] = useState({
    lead_price_credits: 50,
    subscription_price_monthly: 99,
    subscription_price_yearly: 990
  });

  useEffect(() => {
    loadStats();
    loadPricing();
  }, []);

  async function loadStats() {
    try {
      const [measurements, appointments, users] = await Promise.all([
        base44.entities.Measurement.list('-created_date', 1000),
        base44.entities.Appointment.list('-created_date', 1000),
        base44.entities.User.list()
      ]);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const monthlyMeasurements = measurements.filter(m => 
        new Date(m.created_date) >= firstDayOfMonth
      );

      const totalRevenue = measurements
        .filter(m => m.payment_status === 'completed')
        .reduce((sum, m) => sum + (m.payment_amount || 0), 0);

      const monthlyRevenue = monthlyMeasurements
        .filter(m => m.payment_status === 'completed')
        .reduce((sum, m) => sum + (m.payment_amount || 0), 0);

      const activeJobs = measurements.filter(m => 
        m.lead_status && !['completed', 'lost'].includes(m.lead_status)
      ).length;

      const converted = measurements.filter(m => m.clicked_booking || m.requested_quote).length;
      const conversionRate = measurements.length > 0 
        ? ((converted / measurements.length) * 100).toFixed(1)
        : 0;

      setStats({
        totalLeads: measurements.length,
        monthlyLeads: monthlyMeasurements.length,
        totalRevenue,
        monthlyRevenue,
        activeJobs,
        conversionRate,
        totalAppointments: appointments.length,
        totalUsers: users.length,
        recentActivity: measurements.slice(0, 10).map(m => ({
          icon: '📏',
          title: 'New Measurement',
          description: `${m.property_address}`,
          time: new Date(m.created_date).toLocaleTimeString()
        }))
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setLoading(false);
    }
  }

  const loadPricing = async () => {
    try {
      const settings = await base44.entities.PlatformSettings.list();
      if (settings && settings.length > 0) {
        setPricing({
          lead_price_credits: settings[0].lead_price_credits || 50,
          subscription_price_monthly: settings[0].subscription_price_monthly || 99,
          subscription_price_yearly: settings[0].subscription_price_yearly || 990
        });
      }
    } catch (error) {
      console.error("Failed to load pricing:", error);
    }
  };

  const handleUpdatePricing = async () => {
    setSaving(true);
    try {
      const settings = await base44.entities.PlatformSettings.list();
      if (settings && settings.length > 0) {
        await base44.entities.PlatformSettings.update(settings[0].id, pricing);
      } else {
        await base44.entities.PlatformSettings.create(pricing);
      }
      toast.success("Global pricing updated successfully!");
    } catch (error) {
      console.error("Failed to update pricing:", error);
      toast.error("Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Pricing Control */}
      <Card className="border-2 border-purple-600 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6" />
            🌎 Global Pricing - Treasury Control
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Price per Lead (Credits)</Label>
              <Input
                type="number"
                value={pricing.lead_price_credits}
                onChange={(e) => setPricing({...pricing, lead_price_credits: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Subscription ($)</Label>
              <Input
                type="number"
                value={pricing.subscription_price_monthly}
                onChange={(e) => setPricing({...pricing, subscription_price_monthly: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Yearly Subscription ($)</Label>
              <Input
                type="number"
                value={pricing.subscription_price_yearly}
                onChange={(e) => setPricing({...pricing, subscription_price_yearly: Number(e.target.value)})}
              />
            </div>
          </div>
          <Button
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
            onClick={handleUpdatePricing}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "💰 Update Global Prices"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          change={`+${stats.monthlyLeads} this month`}
          icon="👥"
          color="#3b82f6"
        />
        <StatCard
          title="Revenue (Month)"
          value={`$${stats.monthlyRevenue?.toLocaleString()}`}
          change={`$${stats.totalRevenue?.toLocaleString()} total`}
          icon="💰"
          color="#10b981"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          change="In progress"
          icon="🏗️"
          color="#f59e0b"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="Booking rate"
          icon="📈"
          color="#8b5cf6"
        />
      </div>

      {/* Financial Pulse - Recent Transactions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            💰 Recent Transactions (P&L)
          </h3>
          <div className="space-y-2">
            {(stats.recentActivity || []).slice(0, 5).map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border-l-4 border-l-green-600">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{activity.icon}</div>
                  <div>
                    <div className="font-semibold text-slate-900">{activity.title}</div>
                    <div className="text-sm text-slate-600">{activity.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-green-600">+$25.00</div>
                    <div className="text-xs text-slate-400">{activity.time}</div>
                  </div>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-semibold">
                    Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {(stats.recentActivity || []).map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{activity.title}</div>
                  <div className="text-sm text-slate-600">{activity.description}</div>
                </div>
                <div className="text-xs text-slate-400">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, change, icon, color }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10"
          style={{ background: color, transform: 'translate(40%, -40%)' }}
        />
        <div className="text-3xl mb-3">{icon}</div>
        <div className="text-sm text-slate-600 font-semibold mb-1">{title}</div>
        <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
        <div className="text-xs text-green-600">{change}</div>
      </CardContent>
    </Card>
  );
}