import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, FileText, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export default function QuoteBuilder() {
    const [searchParams] = useSearchParams();
    const leadId = searchParams.get('leadId')?.replace(/"/g, '');
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [margin, setMargin] = useState(35);

    // Default Items with Cost Basis
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
        const load = async () => {
            if(!leadId) return;
            try {
                const l = await base44.entities.Lead.get(leadId);
                setLead(l);

                // AUTO-CALCULATE QUANTITIES
                if(l.roof_sqft) {
                    const sqft = l.roof_sqft;
                    const waste = 1.15; // 15% waste
                    const totalArea = sqft * waste;
                    const squares = Math.ceil(totalArea / 100);
                    
                    setItems(prev => prev.map(item => {
                        if(item.name.includes('Shingles')) return { ...item, qty: Math.ceil(squares * 3) }; // 3 bundles per sq
                        if(item.name.includes('Underlayment')) return { ...item, qty: Math.ceil(sqft / 1000) }; // 10 sq per roll
                        if(item.name.includes('Labor')) return { ...item, qty: squares };
                        if(item.name.includes('Starter')) return { ...item, qty: Math.ceil(squares * 0.1) }; // Rough estimate
                        if(item.name.includes('Hip')) return { ...item, qty: Math.ceil(squares * 0.1) };
                        if(item.name.includes('Ice')) return { ...item, qty: Math.ceil(sqft * 0.1 / 200) }; // 10% coverage
                        return item;
                    }));
                    toast.success(`Materials calculated for ${sqft} sq ft`);
                }
            } catch(e) { console.error(e); }
        };
        load();
    }, [leadId]);

    const totalCost = items.reduce((acc, item) => acc + (item.qty * item.cost), 0);
    const price = Math.round(totalCost / (1 - (margin / 100)));
    const profit = price - totalCost;

    const saveQuote = async () => {
        toast.loading("Publishing Quote...");
        try {
            await base44.entities.Job.create({
                job_name: (lead?.name || 'Customer') + " - Roof Replacement",
                address: lead?.address || '',
                stage: 'Sold',
                // Adding custom fields if they exist in schema, otherwise ignoring or adding to notes
                // Ideally we'd have explicit fields for price/cost
            });
            // Update Lead Status
            await base44.entities.Lead.update(leadId, { lead_status: 'Sold' });

            toast.dismiss();
            toast.success("Quote Sent!");
            // Redirect to Job Board
            setTimeout(() => navigate('/jobboard'), 1000);
        } catch(e) { 
            console.error(e);
            toast.dismiss();
            toast.error("Error saving quote"); 
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
                            <h1 className="text-2xl font-bold">Quote Builder</h1>
                            <p className="text-slate-500 text-sm">
                                {lead?.address} • <span className="font-bold text-blue-600">{lead?.roof_sqft ? lead.roof_sqft.toLocaleString() + ' sq ft' : 'No Measurement'}</span>
                            </p>
                        </div>
                    </div>
                    <Card>
                        <CardHeader className="bg-slate-100 py-3 border-b flex flex-row justify-between items-center">
                            <CardTitle className="text-sm font-bold uppercase text-slate-500">Scope of Work</CardTitle>
                            <Button size="sm" variant="outline"><Calculator className="w-3 h-3 mr-2"/> Recalculate</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 text-left">
                                    <tr>
                                        <th className="p-3 pl-6 font-medium">Item Description</th>
                                        <th className="p-3 w-20 font-medium">Qty</th>
                                        <th className="p-3 w-24 font-medium">Cost</th>
                                        <th className="p-3 w-24 font-medium text-right pr-6">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map((item, i) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="p-3 pl-6 font-medium">{item.name}</td>
                                            <td className="p-3">
                                                <Input 
                                                    type="number" 
                                                    className="h-8 w-16 text-center" 
                                                    value={item.qty}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setItems(prev => prev.map(p => p.id === item.id ? {...p, qty: val} : p));
                                                    }}
                                                />
                                            </td>
                                            <td className="p-3 text-slate-500">${item.cost}</td>
                                            <td className="p-3 pr-6 text-right font-bold text-slate-700">${(item.qty * item.cost).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
                {/* SIDEBAR: PRICING */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-0 shadow-xl sticky top-6">
                        <CardHeader>
                            <CardTitle>Financials</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>Hard Material Cost</span>
                                <span>${totalCost.toLocaleString()}</span>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Target Margin</span>
                                    <span>{margin}%</span>
                                </div>
                                <Slider value={[margin]} onValueChange={(v) => setMargin(v[0])} max={60} min={10} step={1} className="py-2" />
                            </div>
                            <div className="pt-4 border-t border-slate-700">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-slate-400">Net Profit</span>
                                    <span className="text-green-400 font-bold text-lg">+${profit.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-xl font-bold">Final Price</span>
                                    <span className="text-4xl font-black tracking-tight">${price.toLocaleString()}</span>
                                </div>
                            </div>
                            <Button className="w-full h-12 text-lg bg-green-500 hover:bg-green-600 text-black font-bold" onClick={saveQuote}>
                                <FileText className="w-5 h-5 mr-2"/> Generate Proposal
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}