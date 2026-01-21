import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

export default function InvoiceView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceId = searchParams.get('id');
  const isSuccess = searchParams.get('success') === 'true';

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadInvoice();

    if (isSuccess) {
      triggerConfetti();
    }
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const loadInvoice = async () => {
    try {
      const invoiceData = await base44.entities.Invoice.filter({ id: invoiceId });
      if (invoiceData.length > 0) {
        setInvoice(invoiceData[0]);
      }
    } catch (err) {
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await base44.entities.Invoice.update(invoiceId, {
        status: 'paid',
        paid_date: new Date().toISOString()
      });
      setInvoice({ ...invoice, status: 'paid', paid_date: new Date().toISOString() });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayNow = async () => {
    setProcessing(true);
    try {
      // Call backend function to create Stripe checkout session
      const response = await base44.functions.invoke('createStripeCheckoutSession', {
        invoiceId: invoiceId,
        amount: invoice.amount,
        customerEmail: invoice.customer_email,
        invoiceNumber: invoice.invoice_number
      });

      if (response.data.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.data.sessionUrl;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to process payment');
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!invoice) {
    return <div className="flex items-center justify-center min-h-screen text-gray-600">Invoice not found</div>;
  }

  const isPaid = invoice.status === 'paid';

  return (
    <div className="min-h-screen bg-white">
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 20px; }
          .invoice-container { box-shadow: none; }
        }
      `}</style>

      {/* Header (No Print) */}
      <div className="no-print bg-slate-50 border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            Print/PDF
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      {isSuccess && (
        <div className="bg-green-50 border-b-2 border-green-200 p-6">
          <div className="max-w-4xl mx-auto flex items-center gap-3 text-green-800">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold">Payment Received!</p>
              <p className="text-sm">Thank you for your payment. Your invoice is now marked as paid.</p>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="invoice-container bg-white">
          {/* Header */}
          <div className="mb-12 pb-8 border-b">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">INVOICE</h1>
                <p className="text-slate-600 mt-1">{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                {isPaid && (
                  <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold text-lg mb-2">
                    ✓ PAID
                  </div>
                )}
                <p className="text-sm text-slate-600">Due</p>
                <p className="font-semibold text-lg">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">BILL TO</p>
                <p className="font-semibold text-lg">{invoice.customer_name}</p>
                <p className="text-slate-600 text-sm">{invoice.property_address}</p>
                <p className="text-slate-600 text-sm">{invoice.customer_email}</p>
                <p className="text-slate-600 text-sm">{invoice.customer_phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 font-medium mb-1">INVOICE DATE</p>
                <p className="font-semibold text-lg">{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div className="mb-12 p-8 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-2">TOTAL AMOUNT DUE</p>
                <p className="text-5xl font-bold text-slate-900">${invoice.amount.toFixed(2)}</p>
              </div>
              {isPaid && (
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">PAID ON</p>
                  <p className="font-semibold text-lg text-green-700">
                    {format(new Date(invoice.paid_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center text-sm text-slate-600">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>

      {/* Payment Button (No Print) */}
      {!isPaid && (
        <div className="no-print fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto p-4">
            <Button 
              onClick={handlePayNow}
              disabled={processing}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                '💳 Pay Now'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Spacing for button */}
      {!isPaid && <div className="h-24" />}
    </div>
  );
}