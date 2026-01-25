import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { CheckCircle2, FileSignature, ShieldCheck } from 'lucide-react';
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
        // 1. Get Quote 
        const q = await base44.entities.Quote.get(quoteId);
        if(!q) throw new Error("Quote not found"); 
        setQuote(q);

        // 2. Get Lead
        const l = await base44.entities.Lead.get(q.lead_id);
        setLead(l);
        
        // 3. Get Measurement (for specs)
        if(q.measurement_id) {
            const m = await base44.entities.RoofMeasurement.get(q.measurement_id).catch(()=>null);
            setMeasurement(m);
        }
      } catch(e) { 
        console.error(e); 
        toast.error("Could not load proposal"); 
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, [quoteId]);

  const handleAccept = async () => { 
    if(!signature) { 
      toast.error("Please sign your name"); 
      return; 
    } 
    toast.loading("Processing Acceptance...");

    try {
        // 1. Update Quote
        await base44.entities.Quote.update(quote.id, { 
            status: 'Accepted', 
            signed_by_name: signature,
            signed_date: new Date().toISOString()
        });
        
        // 2. Update Lead
        await base44.entities.Lead.update(lead.id, { 
            lead_status: 'Sold',
        });
        
        // 3. CREATE JOB (The Handoff)
        await base44.entities.Job.create({
            quote_id: quote.id,
            customer_id: lead.id,
            address: lead.address || lead.property_address || lead.address_street,
            stage: 'Sold',
            start_date: new Date(Date.now() + 86400000 * 14).toISOString(), // Tentative start in 2 weeks
            job_name: `${lead.name || lead.customer_name} - Roof Replacement`
        });
        
        toast.dismiss();
        toast.success("Congratulations! Job Sold.");
        setTimeout(() => navigate('/rooferdashboard'), 2000);
    } catch(e) {
        console.error(e);
        toast.error("Error processing signature");
    }
  };

  if(loading) return <div className="p-10 text-center">Loading Proposal...</div>;
  if(!quote) return <div className="p-10 text-center text-red-500">Invalid Proposal Link</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
      <Card className="max-w-3xl w-full shadow-xl">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl p-8 text-center">
             <ShieldCheck className="w-12 h-12 mx-auto text-green-400 mb-4" />
             <CardTitle className="text-3xl">Roofing Proposal</CardTitle>
             <p className="text-slate-400">Prepared for {lead?.name || lead?.customer_name}</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
              {/* SUMMARY GRID */}
              <div className="grid md:grid-cols-2 gap-8">
                  <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Project Details</h3>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between border-b py-2"><span>Property</span><span className="font-bold text-right">{lead?.address || lead?.property_address || lead?.address_street}</span></div>
                          <div className="flex justify-between border-b py-2"><span>Roof Size</span><span>{measurement?.total_squares || 0} Squares</span></div>
                          <div className="flex justify-between border-b py-2"><span>System Tier</span><span className="font-bold text-blue-600">{quote.tier_name}</span></div>
                          <div className="flex justify-between border-b py-2"><span>Warranty</span><span>Lifetime Workmanship</span></div>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl text-center border-2 border-slate-200 flex flex-col justify-center">
                      <p className="text-slate-500 mb-2 font-semibold">Total Project Investment</p>
                      <div className="text-4xl font-bold text-slate-900">${quote.total_price?.toLocaleString()}</div>
                      <p className="text-xs text-slate-400 mt-2">Includes all labor, materials, and disposal</p>
                  </div>
              </div>
              <Separator />
              {/* SCOPE OF WORK */}
              <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Scope of Work</h3>
                  <ul className="grid md:grid-cols-2 gap-3">
                      {['Remove existing shingles to deck', 'Install synthetic underlayment', 'Install ice & water shield in valleys', 'Replace pipe boots and vents', 'Install new architectural shingles', 'Clean gutters and magnet sweep yard'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0"/> {item}</li>
                      ))}
                  </ul>
              </div>
              <Separator />
              {/* SIGNATURE AREA */}
              <div className="bg-blue-50 p-8 rounded-xl border border-blue-100">
                  <h3 className="flex items-center gap-2 font-bold text-blue-900 mb-4"><FileSignature className="w-5 h-5"/> Acceptance & Authorization</h3>
                  <p className="text-sm text-blue-800 mb-6">By signing below, you agree to the terms of this proposal and authorize the commencement of work.</p>
                  
                  <div className="space-y-4 max-w-md mx-auto md:mx-0">
                      <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">Type Full Name to Sign</label>
                          <Input 
                              value={signature} 
                              onChange={e => setSignature(e.target.value)} 
                              placeholder="e.g. John Doe"
                              className="bg-white border-blue-200 focus:ring-blue-500"
                          />
                      </div>
                      <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 shadow-lg text-lg h-12" onClick={handleAccept}>
                          Accept Proposal & Start Job
                      </Button>
                  </div>
              </div>
          </CardContent>
       </Card>
    </div>
  ); 
}