import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Save, PenTool, Calculator, FileText, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MeasurementPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  // State
  const [mode, setMode] = useState('measure'); // 'measure' | 'report'
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);

  // Data
  const [totalArea, setTotalArea] = useState(0);
  const [waste, setWaste] = useState(10);
  const [pitch, setPitch] = useState(6);

  // 1. Load Data
  useEffect(() => {
    const fetchLead = async () => {
        try {
            const activeId = leadId || sessionStorage.getItem('active_lead_id');
            if (!activeId) {
                const sessionAddress = sessionStorage.getItem('lead_address');
                if (sessionAddress) {
                    setLead({ address_street: sessionAddress });
                }
                setLoading(false);
                return;
            }

            // Try API first
            try {
                const apiLead = await base44.entities.Lead.get(activeId);
                if (apiLead) {
                    setLead(apiLead);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.log("Not found in API, checking local storage");
            }

            // Fallback to LocalStorage (Test Mode)
            const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
            const localLead = localLeads.find(l => l.id === activeId);
            
            if (localLead) {
                setLead(localLead);
            } else {
                toast.error("Lead not found locally or in DB");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchLead();
  }, [leadId]);

  // 2. Initialize Map (Always-On)
  useEffect(() => {
    if (!mapNode || !lead || mapInstance) return;

    const init = async () => {
      try {
        const { Map } = await window.google.maps.importLibrary("maps");
        const { DrawingManager } = await window.google.maps.importLibrary("drawing");
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        await window.google.maps.importLibrary("geometry");
        
        const geocoder = new Geocoder();
        const address = lead.address || lead.property_address || 
                        (lead.address_street ? `${lead.address_street}, ${lead.address_city || ''}` : "Dallas, TX");
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const map = new Map(mapNode, {
              center: results[0].geometry.location,
              zoom: 20,
              mapTypeId: 'satellite',
              disableDefaultUI: true,
              tilt: 0
            });
            setMapInstance(map);
            
            const manager = new DrawingManager({
              drawingMode: google.maps.drawing.OverlayType.POLYGON,
              drawingControl: false,
              polygonOptions: {
                fillColor: '#22c55e', // Green like client side
                fillOpacity: 0.4,
                strokeWeight: 2,
                strokeColor: '#15803d',
                editable: true
              }
            });
            manager.setMap(map);
            setDrawingManager(manager);
            
            window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
              const area = window.google.maps.geometry.spherical.computeArea(poly.getPath());
              setTotalArea(Math.round(area * 10.764));
              manager.setDrawingMode(null); // Stop drawing after shape
              setMode('report'); // Auto-jump to report!
            });
          } else {
              toast.error("Could not find address on map");
          }
        });
      } catch (err) {
        console.error("Map load error:", err);
      }
    };

    // Robust wait
    const waitForGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
            clearInterval(waitForGoogle);
            init();
        }
    }, 100);

    return () => clearInterval(waitForGoogle);
  }, [mapNode, lead, mapInstance]);

  // 3. Save Logic (Hybrid)
  const handleSave = async () => {
    toast.loading("Saving Proposal...");
    
    const finalArea = Math.round(totalArea * (1 + waste/100));
    const finalPrice = Math.round(totalArea * (1 + waste/100) * 4.50);
    
    const data = {
        roof_sqft: finalArea,
        estimated_value: finalPrice,
        status: 'Quoted',
        lead_status: 'Quoted'
    };

    try {
      const activeId = leadId || sessionStorage.getItem('active_lead_id');
        
      // Local Check
      const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
      const idx = localLeads.findIndex(l => l.id === activeId);
      
      if (idx !== -1) {
        localLeads[idx] = { ...localLeads[idx], ...data };
        localStorage.setItem('my_leads', JSON.stringify(localLeads));
        toast.dismiss();
        toast.success("Saved to Test Database!");
        setTimeout(() => navigate('/roofer-dashboard'), 1000);
      } else {
        await base44.entities.Lead.update(activeId, data);
        
        // Also persist measurement record
        await base44.entities.Measurement.create({
            company_id: lead.assigned_company_id,
            property_address: lead.address || lead.property_address,
            total_sqft: finalArea,
            quote_amount: finalPrice,
            lead_status: 'quoted',
            user_type: 'roofer'
        });

        toast.dismiss();
        toast.success("Saved to CRM!");
        setTimeout(() => navigate(`/customer-detail?id=${activeId}`), 1000);
      }
    } catch (e) {
      console.error(e);
      toast.dismiss();
      toast.error("Save failed");
    }
  };

  // 4. Render
  if (loading) return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
  );

  return (
    <div className="flex flex-col h-screen w-full relative bg-slate-200">
      
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="font-bold text-slate-800 truncate">
            {lead?.address || lead?.property_address || lead?.address_street || "Roof Measurement"}
        </h1>
        {mode === 'measure' && (
            <div className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                Draw Polygon
            </div>
        )}
      </header>

      {/* MAIN MAP LAYER (Never Unmounts) */}
      <div className="absolute inset-0 top-14 z-0">
        <div ref={setMapNode} className="w-full h-full" />
      </div>

      {/* REPORT OVERLAY (Sits on top of map) */}
      {mode === 'report' && (
        <div className="absolute inset-0 top-14 z-10 bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-4 md:p-8 flex justify-center items-start">
          <Card className="w-full max-w-4xl bg-white shadow-2xl h-fit animate-in fade-in zoom-in duration-300 mt-4">
            
            {/* Report Header */}
            <div className="bg-green-600 p-6 text-white rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-8 h-8" /> Measurement Complete
                </h2>
                <p className="opacity-90 mt-1">Ready for Proposal • {lead?.address_street || lead?.address}</p>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-3xl font-bold">{Math.round(totalArea * (1 + waste/100)).toLocaleString()}</div>
                <div className="text-sm opacity-75">Billable Sq Ft</div>
              </div>
            </div>

            <CardContent className="p-8 grid md:grid-cols-2 gap-10">
              
              {/* Left: Calculator */}
              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-700 mb-6 border-b border-slate-200 pb-3 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-slate-400" /> Project Factors
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-500">Base Area (sq ft)</Label>
                      <Input value={totalArea.toLocaleString()} disabled className="bg-white font-bold text-slate-800" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500">Waste Factor (%)</Label>
                      <div className="relative">
                        <Input type="number" value={waste} onChange={e => setWaste(Number(e.target.value))} className="pr-8" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500">Roof Pitch</Label>
                      <div className="relative">
                        <Input type="number" value={pitch} onChange={e => setPitch(Number(e.target.value))} className="pr-10" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/12</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500">Difficulty</Label>
                      <Input value="Standard" disabled className="bg-slate-100 text-slate-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border border-green-200 text-center shadow-inner">
                  <p className="text-green-700 font-bold uppercase tracking-widest text-xs mb-2">Estimated Client Price</p>
                  <p className="text-5xl font-black text-slate-900 tracking-tight">
                    ${(Math.round(totalArea * (1 + waste/100) * 4.5)).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-3 bg-white/50 inline-block px-3 py-1 rounded-full">
                      Based on $4.50/sq ft avg
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="space-y-6 flex flex-col justify-center">
                 <div className="space-y-3">
                    <h3 className="font-bold text-slate-700 mb-2">Next Steps</h3>
                    <Button className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 transition-all hover:scale-[1.02]" onClick={handleSave}>
                    <Save className="w-6 h-6 mr-3" /> Book Job & Save to CRM
                    </Button>
                    <p className="text-xs text-slate-400 text-center">Updates lead status to 'Quoted' and saves measurement data.</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 pt-4">
                   <Button variant="outline" className="h-14 border-2 hover:bg-slate-50 hover:border-slate-300">
                     <FileText className="w-5 h-5 mr-2 text-blue-600" /> Preview PDF
                   </Button>
                   <Button variant="outline" className="h-14 border-2 hover:bg-slate-50 hover:border-slate-300">
                     <Mail className="w-5 h-5 mr-2 text-yellow-500" /> Email Quote
                   </Button>
                 </div>

                 <div className="pt-8 mt-8 border-t border-slate-100">
                   <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => {
                       setMode('measure');
                       setTotalArea(0);
                       if (drawingManager) drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
                   }}>
                     <PenTool className="w-4 h-4 mr-2" /> Redraw / Adjust Measurement
                   </Button>
                 </div>
              </div>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}