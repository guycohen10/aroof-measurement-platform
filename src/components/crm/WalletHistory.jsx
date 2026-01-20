import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function WalletHistory() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.company_id) {
        toast.error('No company associated with your account');
        return;
      }

      // Load company
      const companies = await base44.entities.Company.list();
      const companyData = companies.find(c => c.id === currentUser.company_id);
      setCompany(companyData);

      // Load wallet transactions for this company
      const allTransactions = await base44.entities.CompanyWalletTransaction.list('-created_date', 100);
      const companyTransactions = allTransactions.filter(t => t.company_id === currentUser.company_id);
      setTransactions(companyTransactions);

      setLoading(false);
    } catch (err) {
      console.error('Error loading wallet history:', err);
      toast.error('Failed to load transaction history');
      setLoading(false);
    }
  };

  const getTransactionTypeIcon = (type) => {
    const icons = {
      deposit: <TrendingUp className="w-5 h-5 text-green-600" />,
      lead_purchase: <TrendingDown className="w-5 h-5 text-red-600" />,
      refund: <TrendingUp className="w-5 h-5 text-blue-600" />,
      subscription_fee: <TrendingDown className="w-5 h-5 text-orange-600" />,
      adjustment: <DollarSign className="w-5 h-5 text-purple-600" />,
      credit_bonus: <TrendingUp className="w-5 h-5 text-green-600" />
    };
    return icons[type] || <CreditCard className="w-5 h-5 text-slate-600" />;
  };

  const getTransactionTypeBadge = (type) => {
    const badges = {
      deposit: <Badge className="bg-green-100 text-green-800">Deposit</Badge>,
      lead_purchase: <Badge className="bg-red-100 text-red-800">Lead Purchase</Badge>,
      refund: <Badge className="bg-blue-100 text-blue-800">Refund</Badge>,
      subscription_fee: <Badge className="bg-orange-100 text-orange-800">Subscription</Badge>,
      adjustment: <Badge className="bg-purple-100 text-purple-800">Adjustment</Badge>,
      credit_bonus: <Badge className="bg-green-100 text-green-800">Bonus</Badge>
    };
    return badges[type] || <Badge>{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Wallet & Transactions
          </h1>
          <p className="text-slate-600 mt-2">Complete financial ledger for your company</p>
        </div>

        {/* Current Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">Current Balance</p>
                <p className="text-5xl font-bold text-blue-900">
                  ${(company?.lead_credits || 0).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600 mt-2">Available for lead purchases</p>
              </div>
              <div className="bg-blue-200 p-6 rounded-full">
                <DollarSign className="w-12 h-12 text-blue-900" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Transaction History ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No transactions yet</p>
                <p className="text-sm text-slate-500 mt-2">Your transaction history will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-700">Date</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Type</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Description</th>
                      <th className="text-right p-4 font-semibold text-slate-700">Amount</th>
                      <th className="text-right p-4 font-semibold text-slate-700">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4 text-sm text-slate-600">
                          {format(new Date(transaction.created_date), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getTransactionTypeIcon(transaction.type)}
                            {getTransactionTypeBadge(transaction.type)}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-900">{transaction.description}</p>
                          {transaction.related_entity_id && (
                            <p className="text-xs text-slate-500 mt-1">
                              Ref: {transaction.related_entity_type} #{transaction.related_entity_id.slice(0, 8)}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`font-bold ${transaction.amount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm text-slate-600">
                            ${(transaction.balance_after || 0).toFixed(2)}
                          </span>
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