import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function FinancialsGodModeTab() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      // Fetch all measurements (lead purchases)
      const measurements = await base44.entities.Measurement.list('-created_date', 500);
      
      // Build transaction history from lead purchases
      const txns = measurements
        .filter(m => m.purchased_by && m.lead_price)
        .map(m => ({
          id: m.id,
          type: 'lead_purchase',
          amount: m.lead_price,
          company_id: m.purchased_by,
          property_address: m.property_address,
          date: m.purchase_date || m.created_date,
          status: m.payment_status || 'completed'
        }));

      setTransactions(txns);

      // Calculate stats
      const totalRevenue = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
      const thisMonth = txns.filter(t => {
        const txDate = new Date(t.date);
        const now = new Date();
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      });
      const monthlyRevenue = thisMonth.reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalTransactions: txns.length,
        monthlyTransactions: thisMonth.length
      });

      setLoading(false);
    } catch (err) {
      toast.error('Failed to load transactions');
      setLoading(false);
    }
  };

  const handleRefund = async (transaction) => {
    if (!confirm(`Refund $${transaction.amount} for ${transaction.property_address}?`)) return;

    try {
      // Update measurement to mark as refunded
      await base44.entities.Measurement.update(transaction.id, {
        purchased_by: null,
        available_for_purchase: true,
        lead_status: 'new',
        payment_status: 'refunded'
      });

      toast.success('Refund processed - lead returned to marketplace');
      loadTransactions();
    } catch (err) {
      toast.error('Failed to process refund');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Total Revenue</div>
                <div className="text-3xl font-bold text-green-600">
                  ${stats.totalRevenue?.toFixed(2) || '0.00'}
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">This Month</div>
                <div className="text-3xl font-bold text-blue-600">
                  ${stats.monthlyRevenue?.toFixed(2) || '0.00'}
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Total Transactions</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.totalTransactions || 0}
                </div>
              </div>
              <RefreshCw className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Avg Transaction</div>
                <div className="text-3xl font-bold text-orange-600">
                  ${stats.totalTransactions > 0 
                    ? (stats.totalRevenue / stats.totalTransactions).toFixed(2) 
                    : '0.00'}
                </div>
              </div>
              <TrendingDown className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💰 Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-sm">Date</th>
                  <th className="text-left p-3 font-semibold text-sm">Type</th>
                  <th className="text-left p-3 font-semibold text-sm">Property</th>
                  <th className="text-left p-3 font-semibold text-sm">Amount</th>
                  <th className="text-left p-3 font-semibold text-sm">Status</th>
                  <th className="text-left p-3 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 text-sm text-slate-600">
                      {format(new Date(tx.date), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="p-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        Lead Purchase
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{tx.property_address}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <DollarSign className="w-4 h-4" />
                        {tx.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={
                        tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'refunded' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {tx.status?.toUpperCase() || 'COMPLETED'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {tx.status !== 'refunded' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRefund(tx)}
                        >
                          Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No transactions yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}