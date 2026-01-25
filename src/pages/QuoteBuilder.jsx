import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Save, Wand2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function QuoteBuilder() { 
  const [searchParams] = useSearchParams(); 
  const leadId = searchParams.get('leadId'); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true); 
  const [lead, setLead] = useState(null); 
  const [measurement, setMeasurement] = useState(null); 
  const [activeTier, setActiveTier] = useState('Standard');

  // State for Each Tier's Line Items 
  const [tiers, setTiers] = useState({ 
    Economy: { items: [], margin: 25, warranty: '10 Year' }, 
    Standard: { items: [], margin: 35, warranty: 'Lifetime' }, 
    Premium: { items: [], margin: 45, warranty: 'Lifetime + Labor' } 
  });

  useEffect(() => { 
    const load = async () => { 
      if(!leadId) return; 
      try { 
        const l = await base44.entities.Lead.get(leadId); 
        setLead(l); 
        const measures = await base44.entities.RoofMeasurement.list(); 
        const m = measures.find(x => x.lead_id === leadId); 
        setMeasurement(m); 
        if(m) generateDefaultItems(m); 
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      } 
    }; 
    load(); 
  }, [leadId]);

  const generateDefaultItems = (m) => { 
    const sq = m.total_squares * 1.10; // 10% waste default 
    const defaults = [ 
      { name: "Architectural Shingles (Bundles)", qty: Math.ceil(sq * 3), cost: 35 }, 
      { name: "Synthetic Underlayment (Rolls)", qty: Math.ceil(sq / 10), cost: 65 }, 
      { name: "Starter Strip (Bundles)", qty: Math.ceil((m.eaves_ft + m.rakes_ft) / 100), cost: 18 }, 
      { name: "Hip & Ridge Cap (Bundles)", qty: Math.ceil((m.ridges_ft + m.hips_ft) / 29), cost: 45 }, 
      { name: "Ice & Water Shield (Rolls)", qty: Math.ceil(m.valleys_ft / 50), cost: 85 }, 
      { name: "Pipe Boots / Vents", qty: 4, cost: 25 }, 
      { name: "Installation Labor (Sq)", qty: Math.ceil(sq), cost: 85 }, 
      { name: "Dumpster & Disposal", qty: 1, cost: 450 } 
    ];

    setTiers(prev => {
        const next = { ...prev };
        ['Economy', 'Standard', 'Premium'].forEach(t => {
            const mult = t === 'Economy' ? 1.0 : (t === 'Standard' ? 1.2 : 1.5);
            next[t].items = defaults.map(d => ({ ...d, cost: Math.round(d.cost * mult) }));
        });
        return next;
    });
  };

  // Helper: Calculate Totals 
  const getTotals = (tierName) => { 
    const t = tiers[tierName]; 
    const cost = t.items.reduce((sum, i) => sum + (i.qty * i.cost), 0); 
    const price = cost / (1 - (t.margin / 100)); 
    return { cost, price, profit: price - cost }; 
  };

  // Handlers 
  const updateItem = (tier, index, field, val) => { 
    setTiers(prev => { 
      const newItems = [...prev[tier].items]; 
      newItems[index] = { ...newItems[index], [field]: val }; 
      return { ...prev, [tier]: { ...prev[tier], items: newItems } }; 
    }); 
  };

  const addItem = (tier) => { 
    setTiers(prev => ({ ...prev, [tier]: { ...prev[tier], items: [...prev[tier].items, { name: "New Item", qty: 1, cost: 0 }] } })); 
  };

  const removeItem = (tier, index) => { 
    setTiers(prev => { 
      const newItems = prev[tier].items.filter((_, i) => i !== index); 
      return { ...prev, [tier]: { ...prev[tier], items: newItems } }; 
    }); 
  };

  const handlePublish = async () => { 
    const t = tiers[activeTier]; 
    const totals = getTotals(activeTier); 
    toast.loading("Creating Proposal...");

    try {
        // 1. Create Quote
        const quote = await base44.entities.Quote.create({
            lead_id: lead.id,
            measurement_id: measurement?.id,
            tier_name: activeTier,
            total_price: Math.round(totals.price),
            material_cost: Math.round(totals.cost),
            margin_percent: t.margin,
            status: 'Sent',
            // Storing custom items for the proposal to read:
            line_items_json: JSON.stringify(t.items) 
        });
        // 2. Update Lead
        await base44.entities.Lead.update(lead.id, { status: 'Quoted', price_sold: Math.round(totals.price) });
        toast.dismiss();
        toast.success("Quote Published!");
        setTimeout(() => navigate(`/proposalview?quoteId=${quote.id}`), 1000);
    } catch(e) { 
      console.error(e); 
      toast.error("Error saving"); 
    }
  };

  if(loading) return <div className="flex h-screen items-center justify-center">Loading Calculator...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
       <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
           <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
             <ArrowLeft className="w-5 h-5"/> Back
           </Button>
           <h1 className="text-2xl font-bold">Quote Builder Pro</h1>
       </div>
       <div className="max-w-6xl mx-auto">
           <Tabs value={activeTier} onValueChange={setActiveTier}>
               <TabsList className="grid w-full grid-cols-3 h-16 mb-6">
                   {['Economy', 'Standard', 'Premium'].map(tier => {
                       const tot = getTotals(tier);
                       return (
                           <TabsTrigger key={tier} value={tier} className="flex flex-col h-full data-[state=active]:bg-white data-[state=active]:shadow">
                               <span className="font-bold text-lg">{tier}</span>
                               <span className="text-xs text-slate-500">${Math.round(tot.price).toLocaleString()}</span>
                           </TabsTrigger>
                       );
                   })}
               </TabsList>
               {['Economy', 'Standard', 'Premium'].map(tier => (
                   <TabsContent key={tier} value={tier}>
                       <div className="grid md:grid-cols-3 gap-6">
                           {/* LEFT: LINE ITEMS */}
                           <Card className="md:col-span-2 shadow-lg">
                               <CardHeader className="flex flex-row justify-between items-center bg-slate-100 py-3">
                                   <CardTitle className="text-sm uppercase text-slate-500">Scope of Work</CardTitle>
                                   <Button size="sm" variant="outline" onClick={() => addItem(tier)}><Plus className="w-3 h-3 mr-1"/> Add Item</Button>
                               </CardHeader>
                               <CardContent className="p-0">
                                   <table className="w-full text-sm">
                                       <thead className="bg-slate-50 text-slate-500">
                                           <tr>
                                               <th className="text-left p-3 font-medium">Item Description</th>
                                               <th className="text-center p-3 font-medium w-20">Qty</th>
                                               <th className="text-center p-3 font-medium w-24">Cost</th>
                                               <th className="text-right p-3 font-medium w-24">Total</th>
                                               <th className="w-10"></th>
                                           </tr>
                                       </thead>
                                       <tbody className="divide-y">
                                           {tiers[tier].items.map((item, idx) => (
                                               <tr key={idx} className="group hover:bg-slate-50">
                                                   <td className="p-2"><Input value={item.name} onChange={e => updateItem(tier, idx, 'name', e.target.value)} className="h-8 border-transparent hover:border-slate-200 focus:border-blue-500"/></td>
                                                   <td className="p-2"><Input type="number" value={item.qty} onChange={e => updateItem(tier, idx, 'qty', Number(e.target.value))} className="h-8 text-center border-transparent hover:border-slate-200"/></td>
                                                   <td className="p-2"><Input type="number" value={item.cost} onChange={e => updateItem(tier, idx, 'cost', Number(e.target.value))} className="h-8 text-center border-transparent hover:border-slate-200"/></td>
                                                   <td className="p-3 text-right font-medium">${(item.qty * item.cost).toLocaleString()}</td>
                                                   <td className="p-2 text-center"><Trash2 className="w-4 h-4 text-slate-300 hover:text-red-500 cursor-pointer" onClick={() => removeItem(tier, idx)}/></td>
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                               </CardContent>
                           </Card>
                           {/* RIGHT: TOTALS */}
                           <Card className="h-fit shadow-lg bg-slate-900 text-white border-0 sticky top-6">
                               <CardHeader><CardTitle>Financials</CardTitle></CardHeader>
                               <CardContent className="space-y-4">
                                   <div className="flex justify-between text-slate-400"><span>Hard Cost</span><span>${Math.round(getTotals(tier).cost).toLocaleString()}</span></div>
                                   <div>
                                       <div className="flex justify-between text-sm mb-1"><span>Target Margin</span><span>{tiers[tier].margin}%</span></div>
                                       <input type="range" min="10" max="60" value={tiers[tier].margin} onChange={e => setTiers(p => ({...p, [tier]: {...p[tier], margin: Number(e.target.value)}}))} className="w-full accent-green-500"/>
                                   </div>
                                   <div className="flex justify-between text-green-400 font-bold border-t border-slate-700 pt-4"><span>Net Profit</span><span>${Math.round(getTotals(tier).profit).toLocaleString()}</span></div>
                                   <div className="flex justify-between text-3xl font-black pt-2"><span>${Math.round(getTotals(tier).price).toLocaleString()}</span></div>
                                   <Button className="w-full bg-green-600 hover:bg-green-500 mt-4" onClick={handlePublish}>Generate Proposal</Button>
                               </CardContent>
                           </Card>
                       </div>
                   </TabsContent>
               ))}
           </Tabs>
       </div>
    </div>
  ); 
}