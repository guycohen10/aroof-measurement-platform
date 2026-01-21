import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Send, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export default function QuoteBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const leadId = searchParams.get('leadId');

  const [user, setUser] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [quoteNumber, setQuoteNumber] = useState('');
  const [validUntil, setValidUntil] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit: 'square', unit_price: 0, total: 0, category: 'materials' }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (leadId) {
        const leadData = await base44.entities.Measurement.list();
        const foundLead = leadData.find(m => m.id === leadId);
        setLead(foundLead);
      }

      // Generate quote number
      const quotes = await base44.entities.Quote.list('-created_date', 1);
      const lastNum = quotes.length > 0 ? parseInt(quotes[0].quote_number.split('-')[1]) : 0;
      setQuoteNumber(`EST-${String(lastNum + 1).padStart(4, '0')}`);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' || field === 'unit_price' ? parseFloat(value) || 0 : value;
    
    // Auto-calculate total
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'square', unit_price: 0, total: 0, category: 'materials' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSaveAndSend = async () => {
    if (!items.some(i => i.description && i.unit_price > 0)) {
      toast.error('Add at least one line item');
      return;
    }

    setSaving(true);
    try {
      const totalAmount = getTotalAmount();

      // Create Quote
      const quote = await base44.entities.Quote.create({
        company_id: user.company_id,
        lead_id: leadId,
        quote_number: quoteNumber,
        status: 'sent',
        total_amount: totalAmount,
        customer_name: lead?.customer_name || '',
        customer_email: lead?.customer_email || '',
        customer_phone: lead?.customer_phone || '',
        property_address: lead?.property_address || '',
        valid_until: validUntil,
        sent_date: new Date().toISOString(),
        notes: ''
      });

      // Create Line Items
      for (const item of items) {
        if (item.description) {
          await base44.entities.QuoteItem.create({
            quote_id: quote.id,
            ...item
          });
        }
      }

      toast.success('Quote created and sent!');
      navigate(createPageUrl(`QuoteView?id=${quote.id}`));
    } catch (err) {
      console.error(err);
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Create Quote</h1>
          {lead && <p className="text-slate-600 mt-1">{lead.customer_name} • {lead.property_address}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">Quote Number</label>
              <input
                type="text"
                value={quoteNumber}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Line Items</CardTitle>
              <Button onClick={addItem} variant="outline" size="sm" className="gap-1">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 text-slate-600 font-medium">Description</th>
                    <th className="pb-3 text-slate-600 font-medium w-20">Qty</th>
                    <th className="pb-3 text-slate-600 font-medium w-24">Unit</th>
                    <th className="pb-3 text-slate-600 font-medium w-28">Price/Unit</th>
                    <th className="pb-3 text-slate-600 font-medium w-32">Total</th>
                    <th className="pb-3 text-slate-600 font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          placeholder="e.g., GAF Timberline Shingles"
                          className="w-full px-2 py-1 border border-slate-200 rounded"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-right"
                        />
                      </td>
                      <td>
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded"
                        >
                          <option value="square">square</option>
                          <option value="sqft">sq ft</option>
                          <option value="each">each</option>
                          <option value="hour">hour</option>
                        </select>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <span className="text-slate-600">$</span>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-right"
                          />
                        </div>
                      </td>
                      <td className="text-right font-semibold">
                        ${(item.total || 0).toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => removeItem(idx)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-48">
                  <div className="flex justify-between mb-2 text-slate-600">
                    <span>Subtotal:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-green-600">${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAndSend} disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Save & Send
          </Button>
        </div>
      </div>
    </div>
  );
}