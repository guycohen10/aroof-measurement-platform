import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, isPast, parseISO } from 'date-fns';

export default function InvoiceManager() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const invoicesData = await base44.entities.Invoice.filter({
        company_id: currentUser.company_id
      }, '-issue_date');
      
      setInvoices(invoicesData || []);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (invoice) => {
    setSendingEmail(invoice.id);
    try {
      // Send email to customer
      await base44.integrations.Core.SendEmail({
        to: invoice.customer_email,
        subject: `Invoice ${invoice.invoice_number} - Payment Reminder`,
        body: `Hi ${invoice.customer_name},\n\nWe wanted to remind you about invoice ${invoice.invoice_number} for $${invoice.amount.toFixed(2)}.\n\nDue Date: ${format(new Date(invoice.due_date), 'MMM dd, yyyy')}\n\nPlease click the link below to pay:\n${window.location.origin}/page/InvoiceView?id=${invoice.id}\n\nThank you for your business!`
      });

      // Update sent_date
      await base44.entities.Invoice.update(invoice.id, {
        sent_date: new Date().toISOString()
      });

      toast.success('Email sent to customer');
      loadInvoices();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(null);
    }
  };

  const getStatusBadge = (status, dueDate) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          <CheckCircle2 className="w-4 h-4" /> Paid
        </span>
      );
    }

    const isOverdue = isPast(parseISO(dueDate));
    if (isOverdue && status === 'unpaid') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
          <AlertCircle className="w-4 h-4" /> Overdue
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
        <AlertCircle className="w-4 h-4" /> Unpaid
      </span>
    );
  };

  const calculateStats = () => {
    let totalDue = 0;
    let totalCollected = 0;

    invoices.forEach(inv => {
      if (inv.status === 'paid') {
        totalCollected += inv.amount;
      } else {
        totalDue += inv.amount;
      }
    });

    return { totalDue, totalCollected };
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Invoice Manager</h1>
          <p className="text-slate-600 mt-1">Track and manage all invoices</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <p className="text-slate-600 text-sm font-medium mb-2">Total Due</p>
              <p className="text-3xl font-bold text-orange-600">${stats.totalDue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <p className="text-slate-600 text-sm font-medium mb-2">Total Collected</p>
              <p className="text-3xl font-bold text-green-600">${stats.totalCollected.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>No invoices yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900">Invoice #</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Customer</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Property</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Amount</th>
                      <th className="text-center p-4 font-semibold text-slate-900">Due Date</th>
                      <th className="text-center p-4 font-semibold text-slate-900">Status</th>
                      <th className="text-center p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-slate-50">
                        <td className="p-4 font-semibold text-slate-900">{invoice.invoice_number}</td>
                        <td className="p-4">
                          <p className="font-medium text-slate-900">{invoice.customer_name}</p>
                          <p className="text-sm text-slate-600">{invoice.customer_email}</p>
                        </td>
                        <td className="p-4 text-slate-700">{invoice.property_address}</td>
                        <td className="p-4 text-right font-semibold text-slate-900">
                          ${invoice.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-center text-sm text-slate-600">
                          {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(invoice.status, invoice.due_date)}
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <Button 
                            onClick={() => navigate(createPageUrl(`InvoiceView?id=${invoice.id}`))}
                            variant="ghost" 
                            size="sm"
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" /> View
                          </Button>
                          <Button 
                            onClick={() => handleResendEmail(invoice)}
                            disabled={sendingEmail === invoice.id}
                            variant="ghost" 
                            size="sm"
                            className="gap-1"
                          >
                            {sendingEmail === invoice.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                            Email
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