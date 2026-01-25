import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { CheckCircle2, FileSignature, ShieldCheck, BrainCircuit, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function ProposalView() { 
  const [searchParams] = useSearchParams(); 
  const quoteId = searchParams.get('quoteId'); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true); 
  const [quote, setQuote] = useState(null); 
  const [lead, setLead] = useState(null); 
  const [measurement, setMeasurement] = useState(null); 
  const [signature, setSignature] = useState('');

  useEffect(() => { 
    const load = async () => { 
      if(!quoteId) return; 
      try { 
        const quotes = await base44.entities.Quote.list(); 
        const q = quotes.find(x => x.id === quoteId || x.quote_id === quoteId); 
        if(!q) throw new Error("Quote not found"); 
        setQuote(q);

        const l = await base44.entities.Lead.get(q.lead_id);
        setLead(l);
        if(q.measurement_id) {
            const m = await base44.entities.RoofMeasurement.get(q.measurement_id).catch(()=>null);
            setMeasurement(m);
        }
      } catch(e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, [quoteId]);

  // THE "AI" BRAIN 
  const generateNarrative = () => { 
    if(!measurement || !quote) return "Standard Roof Replacement Scope.";

    const pitchVal = parseInt(measurement.primary_pitch || measurement.pitch_primary) || 6;
    const sq = measurement.total_squares;
    const isPremium = quote.tier_name === 'Premium';
    
    let text = `Based on our satellite analysis of ${lead?.address || lead?.property_address || lead?.address_street}, we have designed a custom roofing system for your ${sq} square roof. `;
    
    if(pitchVal > 7) text += `Due to the steep ${measurement.primary_pitch || measurement.pitch_primary} pitch, we have included specific safety staging and high-traction underlayment. `;
    else text += `The ${measurement.primary_pitch || measurement.pitch_primary} pitch allows for efficient installation and standard ventilation flow. `;
    
    if(measurement.valleys_ft > 10) text += `Critical attention will be given to the ${measurement.valleys_ft} ft of valleys, reinforcing them with leak-proof liner. `;
    
    if(isPremium) text += `As requested, this proposal includes our Premium Materials Package, offering maximum hail resistance and a transferable lifetime warranty.`;
    else text += `This system balances performance and value, utilizing industry-standard architectural shingles with a comprehensive wind warranty.`;
    return text;
  };

  const handleAccept = async () => { 
    if(!signature) { 
      toast.error("Please sign your name"); 
      return; 
    } 
    toast.loading("Securing Job...");

    try {
        await base44.entities.Quote.update(quote.id, { 
            status: 'Accepted', 
            signed_by_name: signature,
            signed_date: new Date().toISOString()
        });
        await base44.entities.Lead.update(lead.id, { 
            lead_status: 'Sold',
        });
        await base44.entities.Job.create({
            quote_id: quote.id,
            customer_id: lead.id,
            address: lead.address || lead.property_address || lead.address_street,
            stage: 'Sold',
            start_date: new Date(Date.now() + 86400000 * 14).toISOString(), 
            job_name: `${lead.name || lead.customer_name} - Roof Project`
        });
        toast.dismiss();
        toast.success("Job Sold! Redirecting...");
        setTimeout(() => navigate('/rooferdashboard'), 2000);
    } catch(e) { 
      console.error(e);
      toast.error("Error processing signature"); 
    }
  };

  if(loading) return <div className="p-10 text-center">Loading Proposal...</div>;
  if(!quote) return <div className="p-10 text-center text-red-500">Invalid Proposal</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
      <Card className="max-w-4xl w-full shadow-2xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
             <div className="flex items-center justify-between">
                 <div>
                    <ShieldCheck className="w-12 h-12 text-green-400 mb-4" />
                    <CardTitle className="text-3xl font-bold">Roofing Proposal</CardTitle>
                    <p className="text-slate-400 mt-1">Prepared for {lead?.name || lead?.customer_name}</p>
                 </div>
                 <div className="text-right">
                    <div className="text-4xl font-bold text-white mb-1">${quote.total_price?.toLocaleString()}</div>
                    <div className="bg-white/10 px-3 py-1 rounded text-sm inline-block">{quote.tier_name} Package</div>
                 </div>
             </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
              {/* AI SUMMARY */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <h3 className="flex items-center gap-2 font-bold text-indigo-900 mb-2">
                      <BrainCircuit className="w-5 h-5"/> Project Executive Summary
                  </h3>
                  <p className="text-slate-700 leading-relaxed italic">
                      "{generateNarrative()}"
                  </p>
              </div>
              {/* SPECS GRID */}
              <div className="grid md:grid-cols-2 gap-8">
                  <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">System Specifications</h3>
                      <div className="space-y-3 text-sm">
                          <div className="flex justify-between border-b border-dashed border-slate-200 pb-2"><span>Roof Area</span><span className="font-bold">{measurement?.total_squares} Squares</span></div>
                          <div className="flex justify-between border-b border-dashed border-slate-200 pb-2"><span>Pitch</span><span className="font-bold">{measurement?.primary_pitch || measurement?.pitch_primary || 6}</span></div>
                          <div className="flex justify-between border-b border-dashed border-slate-200 pb-2"><span>Ridges & Hips</span><span className="font-bold">{(measurement?.ridges_ft || 0) + (measurement?.hips_ft || 0)} ft</span></div>
                          <div className="flex justify-between border-b border-dashed border-slate-200 pb-2"><span>Valleys</span><span className="font-bold">{measurement?.valleys_ft || 0} ft</span></div>
                      </div>
                  </div>
                  <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Included Services</h3>
                      <ul className="space-y-2">
                          {['Complete tear-off of existing layers', 'Decking inspection & re-nailing', 'Synthetic underlayment installation', 'New pipe boots & ventilation', 'Magnetic debris sweep', 'Permit acquisition & inspection'].map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0"/> {item}</li>
                          ))}
                      </ul>
                  </div>
              </div>
              {/* SIGNATURE */}
              <div className="bg-blue-600 text-white p-8 rounded-xl shadow-lg mt-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                          <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><FileSignature className="w-6 h-6"/> Authorization</h3>
                          <p className="text-blue-100 text-sm mb-4">By signing, you accept the {quote.tier_name} proposal and authorize the work to begin.</p>
                          <div className="bg-white/10 p-3 rounded text-sm inline-block">
                              <span className="opacity-70 mr-2">Date:</span> {new Date().toLocaleDateString()}
                          </div>
                      </div>
                      <div className="space-y-4">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-blue-200 uppercase">Electronic Signature</label>
                              <Input 
                                  value={signature} 
                                  onChange={e => setSignature(e.target.value)} 
                                  placeholder="Type Full Name"
                                  className="bg-white text-slate-900 border-0 h-12 focus-visible:ring-offset-0 focus-visible:ring-blue-400"
                              />
                          </div>
                          <Button size="lg" className="w-full bg-green-500 hover:bg-green-400 text-white font-bold h-12 shadow-md transition-all hover:scale-[1.02]" onClick={handleAccept}>
                              Accept & Start Job <ArrowRight className="w-5 h-5 ml-2"/>
                          </Button>
                      </div>
                  </div>
              </div>
          </CardContent>
       </Card>
    </div>
  ); 
}