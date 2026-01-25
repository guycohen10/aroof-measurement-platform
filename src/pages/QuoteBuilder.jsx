import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Wand2, DollarSign, Check, FileText, Save } from 'lucide-react';
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

  // Quote Data (3 Tiers) 
  const [quotes, setQuotes] = useState({ 
    Economy: { price: 0, cost: 0, margin: 25, warranty: '10 Year', materials: [] }, 
    Standard: { price: 0, cost: 0, margin: 35, warranty: 'Lifetime', materials: [] }, 
    Premium: { price: 0, cost: 0, margin: 45, warranty: 'Lifetime + Labor', materials: [] } 
  });

  useEffect(() => { 
    const load = async () => { 
      if(!leadId) return; 
      try { 
        const l = await base44.entities.Lead.get(leadId); 
        setLead(l); 
        const measures = await base44.entities.RoofMeasurement.list(); 
        // Find the measurement for this lead 
        const m = measures.find(x => x.lead_id === leadId); 
        setMeasurement(m); 
        if(m) runAiEstimate(m); // Auto-Run AI on load 
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      } 
    }; 
    load(); 
  }, [leadId]);

  // THE "AI" CALCULATOR 
  const runAiEstimate = (m) => { 
    const sq = m.total_squares || 0; 
    const waste = 1.10; // 10% default 
    const actualSq = sq * waste;

    // Material Formulas
    const shingles = Math.ceil(actualSq * 3); // 3 bundles/sq
    const starter = Math.ceil((m.eaves_ft + m.rakes_ft) / 100);
    const hipRidge = Math.ceil((m.ridges_ft + m.hips_ft) / 29); // 29ft per bundle
    const valleyMetal = Math.ceil(m.valleys_ft / 50);
    
    const baseMaterials = [
       { name: "Shingles (Bundles)", qty: shingles, unitCost: 35 },
       { name: "Starter Strip", qty: starter, unitCost: 18 },
       { name: "Hip & Ridge Cap", qty: hipRidge, unitCost: 45 },
       { name: "Valley Protection", qty: valleyMetal, unitCost: 25 },
       { name: "Synthetic Underlayment", qty: Math.ceil(actualSq / 10), unitCost: 65 },
       { name: "Labor (per Sq)", qty: Math.ceil(actualSq), unitCost: 85 }
    ];
    // Generate Tiers
    const newQuotes = { ...quotes };
    ['Economy', 'Standard', 'Premium'].forEach(tier => {
        const multiplier = tier === 'Economy' ? 1 : (tier === 'Standard' ? 1.2 : 1.5); // Better materials cost more
        
        let totalCost = 0;
        const tierMaterials = baseMaterials.map(item => {
            const cost = item.unitCost * multiplier;
            totalCost += (cost * item.qty);
            return { ...item, unitCost: cost };
        });
        const margin = newQuotes[tier].margin / 100;
        const sellPrice = totalCost / (1 - margin);
        
        newQuotes[tier] = {
            ...newQuotes[tier],
            cost: Math.round(totalCost),
            price: Math.round(sellPrice),
            materials: tierMaterials
        };
    });
    setQuotes(newQuotes);
    toast.success("AI Estimate Generated!");
  };

  const handleSave = async () => { 
    const selected = quotes[activeTier]; 
    toast.loading("Publishing Quote..."); 
    try { 
      // Create Quote record
      await base44.entities.Quote.create({ 
        lead_id: lead.id, 
        measurement_id: measurement?.id, // Corrected from measurement_id to id
        tier_name: activeTier, 
        total_price: selected.price, 
        status: 'Sent' 
      }); 
      // Update Lead status
      await base44.entities.Lead.update(lead.id, { 
        lead_status: 'Quoted', // Corrected from status to lead_status based on previous files 
        price_sold: selected.price 
      }); 
      toast.success("Quote Sent to Customer!"); 
      setTimeout(() => navigate('/rooferdashboard'), 1500); 
    } catch(e) { 
      console.error(e);
      toast.error("Error saving"); 
    } 
  };

  if(loading) return <div className="p-10 text-center">Loading AI Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
       <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5"/></Button>
             <h1 className="text-2xl font-bold flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-purple-600"/> 
                AI Quote Builder
             </h1>
          </div>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
             <Save className="w-4 h-4 mr-2"/> Publish Quote
          </Button>
       </div>

       <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {/* LEFT: ROOF STATS */}
          <Card className="h-fit">
             <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4"/> Measurement Data</CardTitle>
             </CardHeader>
             <CardContent className="p-4 space-y-3 text-sm">
                {measurement ? (
                    <>
                        <div className="flex justify-between"><span>Squares</span><span className="font-bold">{measurement.total_squares}</span></div>
                        <div className="flex justify-between"><span>Pitch</span><span className="font-bold">{measurement.pitch_primary || measurement.primary_pitch || '6'}</span></div>
                        <div className="border-t my-2"></div>
                        <div className="flex justify-between text-slate-500"><span>Eaves</span><span>{measurement.eaves_ft || 0} ft</span></div>
                        <div className="flex justify-between text-slate-500"><span>Ridges</span><span>{measurement.ridges_ft || 0} ft</span></div>
                        <div className="flex justify-between text-slate-500"><span>Valleys</span><span>{measurement.valleys_ft || 0} ft</span></div>
                    </>
                ) : <p className="text-red-500">No data linked. Go back and measure first.</p>}
             </CardContent>
          </Card>

          {/* CENTER/RIGHT: TIERS */}
          <div className="md:col-span-2 space-y-6">
             <Tabs value={activeTier} onValueChange={setActiveTier} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-14 bg-slate-200 p-1">
                   {['Economy', 'Standard', 'Premium'].map(tier => (
                       <TabsTrigger key={tier} value={tier} className="flex flex-col items-center py-2 h-full data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                           <span className="font-bold">{tier}</span>
                           <span className="text-xs text-slate-500">${quotes[tier].price.toLocaleString()}</span>
                       </TabsTrigger>
                   ))}
                </TabsList>
                
                {['Economy', 'Standard', 'Premium'].map(tier => (
                    <TabsContent key={tier} value={tier} className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                       <Card className="border-t-4 border-blue-600 shadow-lg">
                          <CardHeader className="flex flex-row justify-between items-start pb-2">
                              <div>
                                 <CardTitle className="text-3xl font-bold text-slate-900">${quotes[tier].price.toLocaleString()}</CardTitle>
                                 <p className="text-green-600 font-bold mt-1 text-sm">Est. Profit: ${(quotes[tier].price - quotes[tier].cost).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                 <div className="text-sm font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                                    {quotes[tier].warranty} Warranty
                                 </div>
                              </div>
                          </CardHeader>
                          <CardContent>
                             <h3 className="font-bold mb-3 flex items-center gap-2 text-slate-700"><Check className="w-4 h-4 text-green-500"/> Material Breakdown (AI Generated)</h3>
                             <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                {quotes[tier].materials.map((m, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-slate-700">{m.qty} x {m.name}</span>
                                        <span className="text-slate-400 font-mono">${(m.unitCost * m.qty).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold mt-2 text-slate-900">
                                    <span>Total Cost</span>
                                    <span>${quotes[tier].cost.toLocaleString()}</span>
                                </div>
                             </div>
                             
                             <div className="mt-6 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Target Margin %</label>
                                    <div className="relative mt-1">
                                        <Input 
                                            type="number" 
                                            value={quotes[tier].margin} 
                                            onChange={(e) => {
                                                const newM = Number(e.target.value);
                                                const cost = quotes[tier].cost;
                                                // Avoid division by zero
                                                const marginFactor = newM >= 99 ? 0.01 : (1 - (newM/100));
                                                const newPrice = cost / marginFactor;
                                                setQuotes(prev => ({
                                                    ...prev,
                                                    [tier]: { ...prev[tier], margin: newM, price: Math.round(newPrice) }
                                                }));
                                            }}
                                            className="pl-8"
                                        />
                                        <span className="absolute left-3 top-2.5 text-slate-400">%</span>
                                    </div>
                                </div>
                             </div>
                          </CardContent>
                       </Card>
                    </TabsContent>
                ))}
             </Tabs>
          </div>
       </div>
    </div>
  ); 
}