import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Calendar,
  Save,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function LeadPurchaseTab() {
  const [loading, setLoading] = useState(true);
  const [defaultLeadPrice, setDefaultLeadPrice] = useState(25.00);
  const [tempPrice, setTempPrice] = useState(25.00);
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPurchases: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all measurements with purchases
      const allMeasurements = await base44.entities.Measurement.list('-purchase_date', 500);
      
      const purchasedLeads = allMeasurements.filter(m => m.purchased_by && m.purchase_date);
      
      setPurchases(purchasedLeads);
      
      // Calculate stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      
      const thisMonthPurchases = purchasedLeads.filter(p => {
        const d = new Date(p.purchase_date);
        return d.getMonth() === thisMonth;
      });
      
      const lastMonthPurchases = purchasedLeads.filter(p => {
        const d = new Date(p.purchase_date);
        return d.getMonth() === lastMonth;
      });
      
      const totalRevenue = purchasedLeads.reduce((sum, p) => sum + (p.lead_price || 25), 0);
      
      setStats({
        totalRevenue,
        totalPurchases: purchasedLeads.length,
        thisMonth: thisMonthPurchases.length,
        lastMonth: lastMonthPurchases.length
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading purchase data:', err);
      toast.error('Failed to load purchase data');
      setLoading(false);
    }
  };

  const handleSavePrice = async () => {
    try {
      setDefaultLeadPrice(tempPrice);
      
      // Update all unpurchased leads with new price
      const unpurchasedLeads = await base44.entities.Measurement.filter({
        available_for_purchase: true,
        purchased_by: null
      });
      
      for (const lead of unpurchasedLeads) {
        await base44.entities.Measurement.update(lead.id, {
          lead_price: tempPrice
        });
      }
      
      toast.success(`Default lead price updated to $${tempPrice}`);
    } catch (err) {
      console.error('Error updating price:', err);
      toast.error('Failed to update price');
    }
  };

  const handleToggleAvailability = async (leadId, currentStatus) => {
    try {
      await base44.entities.Measurement.update(leadId, {
        available_for_purchase: !currentStatus
      });
      
      toast.success(`Lead ${!currentStatus ? 'enabled' : 'disabled'} for purchase`);
      await loadData();
    } catch (err) {
      console.error('Error toggling availability:', err);
      toast.error('Failed to update lead');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Purchases</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalPurchases}
                </p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.thisMonth}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Growth</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.lastMonth > 0 
                    ? `${Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)}%`
                    : '—'}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Default Lead Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              Set the default price for new leads. This will apply to all future leads that opt-in to receive quotes.
            </p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Lead Price (USD)
              </label>
              <Input
                type="number"
                step="0.01"
                value={tempPrice}
                onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                className="text-lg font-bold"
              />
            </div>
            <Button 
              onClick={handleSavePrice}
              className="bg-green-600 hover:bg-green-700 h-11"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Price
            </Button>
            <Button 
              variant="outline"
              onClick={loadData}
              className="h-11"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <p className="text-sm text-slate-600">
            Current default: <strong>${defaultLeadPrice.toFixed(2)}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No purchases yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left p-3 font-semibold text-slate-700 text-sm">Date</th>
                    <th className="text-left p-3 font-semibold text-slate-700 text-sm">Property</th>
                    <th className="text-left p-3 font-semibold text-slate-700 text-sm">Customer</th>
                    <th className="text-left p-3 font-semibold text-slate-700 text-sm">Purchaser</th>
                    <th className="text-left p-3 font-semibold text-slate-700 text-sm">Price</th>
                    <th className="text-left p-3 font-semibold text-slate-700 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-sm text-slate-600">
                        {format(new Date(purchase.purchase_date), 'MMM d, yyyy')}
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-900 text-sm">{purchase.property_address}</p>
                        <p className="text-xs text-slate-500">
                          {purchase.total_sqft ? Math.round(purchase.total_sqft).toLocaleString() : 'N/A'} sq ft
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm font-medium text-slate-900">{purchase.customer_name}</p>
                        <p className="text-xs text-slate-600">{purchase.customer_email}</p>
                      </td>
                      <td className="p-3 text-sm text-slate-700">
                        {purchase.purchased_by ? purchase.purchased_by.slice(0, 8) + '...' : 'N/A'}
                      </td>
                      <td className="p-3">
                        <span className="text-lg font-bold text-green-600">
                          ${(purchase.lead_price || 25).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-green-600 text-white">
                          Purchased
                        </Badge>
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
  );
}