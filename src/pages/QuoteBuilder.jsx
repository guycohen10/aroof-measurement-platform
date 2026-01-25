import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Calculator, DollarSign, FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function QuoteBuilder() {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [measurement, setMeasurement] = useState(null);

  // Pricing Inputs
  const [pricePerSq, setPricePerSq] = useState(350); // Default market rate
  const [waste, setWaste] = useState(10);
  const [margin, setMargin] = useState(30);

  // Calculated State
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!leadId) return;
      try {
        const l = await base44.entities.Lead.get(leadId);
        setLead(l);

        // Find latest measurement for this lead
        // Note: Assuming we filter or just grab the latest if multiple exist
        // For now, we simulate fetching the specific one linked to the lead
        const measures = await base44.entities.RoofMeasurement.list();
        // Client-side filter fallback if API doesn't support filter yet
        const m = measures.find(x => x.lead_id === leadId) || null;

        setMeasurement(m);
        if (m) setWaste(m.waste_factor || 10);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [leadId]);

  // Real-time Calculation
  const calculateTotals = () => {
    if (!measurement) return { subtotal: 0, total: 0 };

    const squares = measurement.total_squares || 0;
    const wasteMult = 1 + (waste / 100);
    const finalSquares = squares * wasteMult;

    const cost = finalSquares * pricePerSq;
    const sellPrice = cost / (1 - (margin / 100));

    return {
      squares: finalSquares.toFixed(2),
      cost: Math.round(cost),
      total: Math.round(sellPrice),
      profit: Math.round(sellPrice - cost)
    };
  };

  const totals = calculateTotals();

  const handleSaveQuote = async () => {
    if (!lead || !measurement) return;
    toast.loading("Generating Quote...");
    try {
      const quote = await base44.entities.Quote.create({
        lead_id: lead.id,
        measurement_id: measurement.id,
        tier_name: "Standard",
        total_price: totals.total,
        material_cost: totals.cost * 0.4, // Est split
        labor_cost: totals.cost * 0.6, // Est split
        margin_percent: margin,
        status: 'Draft'
      });

      // Update Lead
      await base44.entities.Lead.update(lead.id, { status: 'Quoted', price_sold: totals.total });

      toast.dismiss();
      toast.success("Quote Created!");
      setTimeout(() => navigate('/rooferdashboard'), 1000);
    } catch (e) {
      toast.error("Error saving quote");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-2xl font-bold">Quote Builder: {lead?.address}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT: Measurement Summary */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Roof Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {measurement ? (
                <>
                  <div className="flex justify-between border-b pb-2"><span>Total Squares</span><span className="font-bold">{measurement.total_squares} sq</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Primary Pitch</span><span className="font-bold">{measurement.primary_pitch || 'N/A'}</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Ridges</span><span>{measurement.ridges_ft || 0} ft</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Hips</span><span>{measurement.hips_ft || 0} ft</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Valleys</span><span>{measurement.valleys_ft || 0} ft</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Eaves</span><span>{measurement.eaves_ft || 0} ft</span></div>
                  <div className="flex justify-between"><span>Rakes</span><span>{measurement.rakes_ft || 0} ft</span></div>
                </>
              ) : (
                <div className="text-red-500 text-sm">No measurement data found. Please measure roof first.</div>
              )}
            </CardContent>
          </Card>
          {/* RIGHT: Pricing Calculator */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" /> Pricing Engine</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Base Cost / Sq</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                    <Input type="number" className="pl-6" value={pricePerSq} onChange={e => setPricePerSq(Number(e.target.value))} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Material + Labor</p>
                </div>
                <div>
                  <Label>Waste Factor %</Label>
                  <Input type="number" value={waste} onChange={e => setWaste(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Target Margin %</Label>
                  <Input type="number" value={margin} onChange={e => setMargin(Number(e.target.value))} />
                </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Est. Cost</span>
                  <span>${totals.cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-green-400">
                  <span>Est. Profit</span>
                  <span>+ ${totals.profit.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-700 my-2"></div>
                <div className="flex justify-between items-center text-3xl font-bold">
                  <span>Total Price</span>
                  <span>${totals.total.toLocaleString()}</span>
                </div>
              </div>
              <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" onClick={handleSaveQuote} disabled={!measurement}>
                <Save className="w-5 h-5 mr-2" /> Save & Generate Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}