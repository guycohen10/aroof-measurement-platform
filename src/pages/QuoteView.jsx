import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Download, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function QuoteView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const quoteId = searchParams.get('id');

  const [quote, setQuote] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const quoteData = await base44.entities.Quote.filter({ id: quoteId });
      if (quoteData.length > 0) {
        setQuote(quoteData[0]);

        const itemsData = await base44.entities.QuoteItem.filter({ quote_id: quoteId });
        setItems(itemsData || []);
      }
    } catch (err) {
      toast.error('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      // Update quote status
      await base44.entities.Quote.update(quoteId, { 
        status: 'approved',
        approved_date: new Date().toISOString()
      });

      // Get lead info
      const leads = await base44.entities.Measurement.filter({ id: quote.lead_id });
      if (leads.length > 0) {
        const lead = leads[0];

        // Create Job from lead
        await base44.entities.Job.create({
          company_id: quote.company_id,
          measurement_id: lead.id,
          customer_name: quote.customer_name,
          customer_email: quote.customer_email,
          customer_phone: quote.customer_phone,
          property_address: quote.property_address,
          status: 'scheduled',
          quoted_amount: quote.total_amount,
          job_type: 'replacement'
        });

        // Update lead status
        await base44.entities.Measurement.update(lead.id, {
          lead_status: 'quoted'
        });
      }

      toast.success('Quote approved! Job created.');
      setQuote({ ...quote, status: 'approved' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve quote');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Reject this quote?')) return;
    
    try {
      await base44.entities.Quote.update(quoteId, { 
        status: 'rejected',
        rejected_date: new Date().toISOString()
      });

      toast.success('Quote rejected');
      setQuote({ ...quote, status: 'rejected' });
    } catch (err) {
      toast.error('Failed to reject quote');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!quote) {
    return <div className="flex items-center justify-center min-h-screen text-gray-600">Quote not found</div>;
  }

  const isExpired = new Date(quote.valid_until) < new Date();
  const isApproved = quote.status === 'approved';
  const isRejected = quote.status === 'rejected';

  return (
    <div className="min-h-screen bg-white">
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 20px; }
          .quote-container { box-shadow: none; }
        }
      `}</style>

      {/* Header (No Print) */}
      <div className="no-print bg-slate-50 border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Download className="w-4 h-4 mr-1" /> Print/PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Quote Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="quote-container bg-white">
          {/* Header */}
          <div className="mb-12 pb-8 border-b">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">ESTIMATE</h1>
                <p className="text-slate-600 mt-1">{quote.quote_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Valid until</p>
                <p className="font-semibold text-lg">{format(new Date(quote.valid_until), 'MMM dd, yyyy')}</p>
                {isExpired && <p className="text-red-600 text-sm font-bold mt-1">EXPIRED</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">CUSTOMER</p>
                <p className="font-semibold text-lg">{quote.customer_name}</p>
                <p className="text-slate-600 text-sm">{quote.property_address}</p>
                <p className="text-slate-600 text-sm">{quote.customer_email}</p>
                <p className="text-slate-600 text-sm">{quote.customer_phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 font-medium mb-1">QUOTE DATE</p>
                <p className="font-semibold text-lg">{format(new Date(quote.created_date), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-12">
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="text-left py-3 font-bold text-slate-900">DESCRIPTION</th>
                  <th className="text-center py-3 font-bold text-slate-900 w-24">QTY</th>
                  <th className="text-center py-3 font-bold text-slate-900 w-32">UNIT PRICE</th>
                  <th className="text-right py-3 font-bold text-slate-900 w-32">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="py-4 text-slate-700">{item.description}</td>
                    <td className="py-4 text-center text-slate-700">{item.quantity} {item.unit}</td>
                    <td className="py-4 text-center text-slate-700">${item.unit_price.toFixed(2)}</td>
                    <td className="py-4 text-right font-semibold text-slate-900">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between mb-4 pb-4 border-b-2 border-slate-900">
                  <span className="font-semibold">SUBTOTAL:</span>
                  <span className="font-semibold">${quote.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold">
                  <span>TOTAL:</span>
                  <span className="text-green-600">${quote.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="py-8 border-t">
            {isApproved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Quote Approved</p>
                  <p className="text-sm text-green-700">Customer accepted on {format(new Date(quote.approved_date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Quote Rejected</p>
                  <p className="text-sm text-red-700">Customer declined on {format(new Date(quote.rejected_date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center text-sm text-slate-600">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (No Print) */}
      {!isApproved && !isRejected && (
        <div className="no-print fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto p-4 flex gap-3 justify-center">
            <Button 
              onClick={handleReject} 
              variant="outline" 
              size="lg"
              className="gap-2"
            >
              <XCircle className="w-5 h-5" /> Reject
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={approving}
              size="lg"
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Approve Estimate
            </Button>
          </div>
        </div>
      )}

      {/* Spacing for buttons */}
      {!isApproved && !isRejected && <div className="h-24" />}
    </div>
  );
}