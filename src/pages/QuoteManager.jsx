import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Send, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function QuoteManager() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const quotesData = await base44.entities.Quote.filter({
        company_id: currentUser.company_id
      }, '-created_date');
      
      setQuotes(quotesData || []);
    } catch (err) {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQuotes = () => {
    if (filter === 'all') return quotes;
    return quotes.filter(q => q.status === filter);
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { icon: Clock, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      sent: { icon: Send, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sent' },
      approved: { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
      rejected: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const stats = {
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    approved: quotes.filter(q => q.status === 'approved').length
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const filteredQuotes = getFilteredQuotes();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quote Manager</h1>
            <p className="text-slate-600 mt-1">Track and manage all estimates</p>
          </div>
          <Button onClick={() => navigate(createPageUrl('QuoteBuilder'))} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" /> New Quote
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className={filter === 'all' ? 'border-blue-600 border-2' : 'cursor-pointer'} 
            onClick={() => setFilter('all')}>
            <CardContent className="p-4">
              <p className="text-slate-600 text-sm font-medium">Total Quotes</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className={filter === 'draft' ? 'border-blue-600 border-2' : 'cursor-pointer'} 
            onClick={() => setFilter('draft')}>
            <CardContent className="p-4">
              <p className="text-slate-600 text-sm font-medium">Drafts</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </CardContent>
          </Card>

          <Card className={filter === 'sent' ? 'border-blue-600 border-2' : 'cursor-pointer'} 
            onClick={() => setFilter('sent')}>
            <CardContent className="p-4">
              <p className="text-slate-600 text-sm font-medium">Sent</p>
              <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
            </CardContent>
          </Card>

          <Card className={filter === 'approved' ? 'border-blue-600 border-2' : 'cursor-pointer'} 
            onClick={() => setFilter('approved')}>
            <CardContent className="p-4">
              <p className="text-slate-600 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quotes Table */}
        <Card>
          <CardContent className="p-0">
            {filteredQuotes.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>No quotes found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900">Quote #</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Customer</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Property</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Amount</th>
                      <th className="text-center p-4 font-semibold text-slate-900">Status</th>
                      <th className="text-center p-4 font-semibold text-slate-900">Valid Until</th>
                      <th className="text-center p-4 font-semibold text-slate-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredQuotes.map(quote => (
                      <tr key={quote.id} className="hover:bg-slate-50">
                        <td className="p-4 font-semibold text-slate-900">{quote.quote_number}</td>
                        <td className="p-4">
                          <p className="font-medium text-slate-900">{quote.customer_name}</p>
                          <p className="text-sm text-slate-600">{quote.customer_email}</p>
                        </td>
                        <td className="p-4 text-slate-700">{quote.property_address}</td>
                        <td className="p-4 text-right font-semibold text-slate-900">
                          ${quote.total_amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(quote.status)}
                        </td>
                        <td className="p-4 text-center text-sm text-slate-600">
                          {format(new Date(quote.valid_until), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-4 text-center">
                          <Button 
                            onClick={() => navigate(createPageUrl(`QuoteView?id=${quote.id}`))}
                            variant="ghost" 
                            size="sm"
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" /> View
                          </Button>
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