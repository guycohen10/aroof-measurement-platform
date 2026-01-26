import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, FileText, Calculator, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export default function QuoteBuilder() {
    const [searchParams] = useSearchParams();
    const leadId = searchParams.get('leadId')?.replace(/"/g, '');
    const navigate = useNavigate();

    const [lead, setLead] = useState(null);
    const [sqft, setSqft] = useState(0);
    const [margin, setMargin] = useState(35);

    const [items, setItems] = useState([
        { id: 1, name: 'Architectural Shingles (Bundles)', qty: 0, cost: 42 },
        { id: 2, name: 'Synthetic Underlayment (Rolls)', qty: 0, cost: 78 },
        { id: 3, name: 'Starter Strip (Bundles)', qty: 0, cost: 22 },
        { id: 4, name: 'Hip & Ridge Cap (Bundles)', qty: 0, cost: 54 },
        { id: 5, name: 'Ice & Water Shield (Rolls)', qty: 0, cost: 102 },
        { id: 6, name: 'Pipe Boots / Vents', qty: 4, cost: 30 },
        { id: 7, name: 'Installation Labor (Sq)', qty: 0, cost: 102 },
        { id: 8, name: 'Dumpster & Disposal', qty: 1, cost: 540 },
    ]);

    useEffect(() => {
        const loadData = async () => {
            if(!leadId) return;
            try {
                // 1. Fetch Lead
                const l = await base44.entities.Lead.get(leadId);
                setLead(l);

                // 2. Fetch Measurement
                const measurements = await base44.entities.RoofMeasurement.list();
                const myMeasure = measurements.find(m => m.lead_id === leadId) || measurements.sort((a,b) => b.created_date.localeCompare(a.created_date))[0];
                
                // 3. Determine SqFt
                let foundSqft = 0;
                if (myMeasure && myMeasure.total_sqft > 0) foundSqft = myMeasure.total_sqft;
                else if (l.roof_sqft > 0) foundSqft = l.roof_sqft;

                if(foundSqft > 0) {
                    setSqft(foundSqft);
                    calculateMaterials(foundSqft);
                    toast.success(`Loaded Measurement: ${foundSqft.toLocaleString()} sq ft`);
                } else {
                    toast.error("No measurement data found.");
                }
            } catch(e) { console.error(e); }
        };
        loadData();
    }, [leadId]);

    const calculateMaterials = (area) => {
        const waste = 1.15; // 15% waste
        const totalArea = area * waste;
        const squares = Math.ceil(totalArea / 100);

        setItems(prev => prev.map(item => {
            if(item.name.includes('Shingles')) return { ...item, qty: Math.ceil(squares * 3) };
            if(item.name.includes('Underlayment')) return { ...item, qty: Math.ceil(area / 1000) };
            if(item.name.includes('Labor')) return { ...item, qty: squares };
            if(item.name.includes('Starter')) return { ...item, qty: Math.ceil(squares * 0.12) };
            if(item.name.includes('Hip')) return { ...item, qty: Math.ceil(squares * 0.1) };
            if(item.name.includes('Ice')) return { ...item, qty: Math.ceil(area * 0.1 / 200) };
            return item;
        }));
    };

    const totalCost = items.reduce((acc, item) => acc + (item.qty * item.cost), 0);
    const price = Math.round(totalCost / (1 - (margin / 100)));
    const profit = price - totalCost;

    const saveQuote = async () => {
        toast.loading("Generating Quote...");
        try {
            // 1. Create QUOTE Record (Required First)
            const newQuote = await base44.entities.Quote.create({
                lead_id: leadId,
                total_price: price,
                material_cost: totalCost,
                margin_percent: margin,
                line_items_json: JSON.stringify(items),
                status: 'Draft'
            });

            // 2. Create JOB Record (Linked to Quote & Lead)
            await base44.entities.Job.create({
                job_name: (lead?.name || "Client") + " - Roof Replacement",
                address: lead?.address,
                stage: 'Sold', // Default stage
                quote_id: newQuote.id,      // LINK QUOTE
                customer_id: leadId         // LINK CUSTOMER (Lead)
            });
            
            await base44.entities.Lead.update(leadId, { lead_status: 'Sold' });
            
            toast.dismiss();
            toast.success("Quote Published!");
            setTimeout(() => navigate('/jobboard'), 1000);
        } catch(e) { 
            console.error("Save Error:", e);
            toast.dismiss();
            toast.error("Save Failed: " + (e.message || "Unknown error")); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
                {/* MAIN EDITOR */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Quote Builder</h1>
                            <p className="text-slate-500 text-sm">
                                {lead?.address} • <span className="font-bold text-blue-600">{sqft > 0 ? sqft.toLocaleString() + ' sq ft' : 'No Measurement Found'}</span>
                            </p>
                        </div>
                    </div>
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 py-3 border-b flex flex-row justify-between items-center">
                            <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">Materials & Labor</CardTitle>
                            <Button size="sm" variant="outline" onClick={() => calculateMaterials(sqft)}><RefreshCw className="w-3 h-3 mr-2"/> Reset Calc</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-white text-slate-400 text-left border-b">
                                    <tr>
                                        <th className="p-4 pl-6 font-medium">Item</th>
                                        <th className="p-4 w-24 font-medium">Qty</th>
                                        <th className="p-4 w-24 font-medium">Unit Cost</th>
                                        <th className="p-4 w-28 font-medium text-right pr-6">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3 pl-6 font-medium text-slate-700">{item.name}</td>
                                            <td className="p-3">
                                                <Input 
                                                    type="number" 
                                                    className="h-9 w-20 text-center bg-white border-slate-200" 
                                                    value={item.qty}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setItems(prev => prev.map(p => p.id === item.id ? {...p, qty: val} : p));
                                                    }}
                                                />
                                            </td>
                                            <td className="p-3 text-slate-500">${item.cost}</td>
                                            <td className="p-3 pr-6 text-right font-bold text-slate-900">${(item.qty * item.cost).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
                {/* SIDEBAR: PRICING ENGINE */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-0 shadow-2xl sticky top-6">
                        <CardHeader className="border-b border-slate-800 pb-4">
                            <CardTitle className="flex justify-between items-center">
                                <span>Profit Engine</span>
                                <span className={`text-xs px-2 py-1 rounded ${profit > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {Math.round((profit/price)*100 || 0)}% Net
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-1">
                                <div className="flex justify-between text-slate-400 text-sm">
                                    <span>Total Material & Labor</span>
                                    <span>${totalCost.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-bold text-white">
                                    <span>Margin</span>
                                    <span>{margin}%</span>
                                </div>
                                <Slider 
                                    value={[margin]} 
                                    onValueChange={(v) => setMargin(v[0])} 
                                    max={60} min={10} step={1} 
                                    className="cursor-pointer"
                                />
                            </div>
                            <div className="pt-6 border-t border-slate-800 space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-400 text-sm">Net Profit</span>
                                    <span className="text-green-400 font-bold text-xl">+${profit.toLocaleString()}</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Contract Price</div>
                                    <div className="text-4xl font-black tracking-tight text-white">${price.toLocaleString()}</div>
                                </div>
                            </div>
                            <Button className="w-full h-14 text-lg bg-green-500 hover:bg-green-600 text-slate-900 font-bold shadow-lg shadow-green-900/20" onClick={saveQuote}>
                                <FileText className="w-5 h-5 mr-2"/> Publish Quote
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}