import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Zap, PenTool, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const EDGE_TYPES = [ 
  { type: 'Unassigned', color: '#94a3b8' }, 
  { type: 'Eave', color: '#10b981' }, 
  { type: 'Rake', color: '#3b82f6' }, 
  { type: 'Ridge', color: '#ef4444' }, 
  { type: 'Hip', color: '#06b6d4' }, 
  { type: 'Valley', color: '#a855f7' }, 
  { type: 'Flashing', color: '#f59e0b' }, 
];

export default function RooferMeasurement() { 
  const { leadId: paramId } = useParams(); 
  const [searchParams] = useSearchParams(); 
  const leadId = paramId || searchParams.get('leadId'); 
  const navigate = useNavigate();

  // State 
  const [step, setStep] = useState('choice'); // 'choice', 'detailed', 'result' 
  const [lead, setLead] = useState(null); 
  const [mapNode, setMapNode] = useState(null); 
  const [mapInstance, setMapInstance] = useState(null); 
  const [totalArea, setTotalArea] = useState(0); 
  const [edges, setEdges] = useState([]);

  // 1. DATA LOADER 
  useEffect(() => { 
    const load = async () => { 
      try { 
        const sessionAddr = sessionStorage.getItem('lead_address')?.replace(/"/g, ''); 
        const sessionId = sessionStorage.getItem('active_lead_id')?.replace(/"/g, '');

        if (sessionId === leadId && sessionAddr) {
          setLead({ id: leadId, address_street: sessionAddr, source: 'session' });
          return;
        }
        const local = [...JSON.parse(localStorage.getItem('jobs')||'[]'), ...JSON.parse(localStorage.getItem('my_leads')||'[]')];
        const target = local.find(l => l.id === leadId);
        if (target) { setLead(target); return; }
     
        const api = await base44.entities.Lead.get(leadId);
        setLead(api);
      } catch (err) {
        console.error(err);
        setLead({ address_street: "Dallas, TX" }); // Fallback
      }
    };
    if (leadId) load();
  }, [leadId]);

  // 2. MAP INIT 
  useEffect(() => { 
    if (!mapNode || !lead) return; 
    const init = async () => { 
      try {
        const { Map } = await google.maps.importLibrary("maps"); 
        const { Geocoder } = await google.maps.importLibrary("geocoding"); 
        await google.maps.importLibrary("drawing"); 
        await google.maps.importLibrary("geometry");

        const geocoder = new Geocoder();
        geocoder.geocode({ address: lead.address_street || lead.address || "Dallas, TX" }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const map = new Map(mapNode, {
               center: results[0].geometry.location, 
               zoom: 20, 
               mapTypeId: 'satellite', 
               disableDefaultUI: true, 
               tilt: 0
            });
            setMapInstance(map);
          }
        });
      } catch (e) {
        console.error("Map Load Error", e);
      }
    };
    init();
  }, [mapNode, lead]);

  // 3. SOLAR API 
  const runSolar = async () => { 
    try { 
      toast.loading("Analyzing..."); 
      const center = mapInstance.getCenter(); 
      
      let apiKey = '';
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('maps.googleapis.com')) {
          const urlParams = new URLSearchParams(new URL(scripts[i].src).search);
          apiKey = urlParams.get('key');
          break;
        }
      }
      
      const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${center.lat()}&location.longitude=${center.lng()}&requiredQuality=HIGH&key=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Solar Data Unavailable");
      const data = await res.json();
      setTotalArea(Math.round(data.solarPotential.wholeRoofStats.areaMeters * 10.764));
      setStep('result');
      toast.dismiss();
    } catch (e) {
      toast.dismiss();
      toast.error("Solar unavailable. Switching to Manual.");
      startDrawing();
    }
  };

  // 4. MANUAL DRAWING 
  const startDrawing = async () => { 
    setStep('detailed'); 
    const { DrawingManager } = await google.maps.importLibrary("drawing"); 
    const manager = new DrawingManager({ 
      drawingMode: google.maps.drawing.OverlayType.POLYGON, 
      drawingControl: false, 
      polygonOptions: { 
        fillColor: 'white', 
        fillOpacity: 0.1, 
        strokeColor: 'white', 
        strokeWeight: 2, 
        editable: false 
      } 
    }); 
    manager.setMap(mapInstance);

    google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
      const path = poly.getPath().getArray();
      const area = google.maps.geometry.spherical.computeArea(path);
      setTotalArea(Math.round(area * 10.764));
      manager.setDrawingMode(null);
      setStep('result');
    });
  };

  const handleSave = async () => { 
    if (leadId) {
        try {
            await base44.entities.Lead.update(leadId, { lead_status: 'Quoted' });
        } catch(e) { console.log("Update failed", e); }
    }
    toast.success("Quote Saved!"); 
    setTimeout(() => navigate('/rooferdashboard'), 1000); 
  };

  // 5. RENDER 
  return (
    <div className="h-screen w-screen relative bg-slate-100 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-white z-30 flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
                <h1 className="font-bold text-lg">Measurement Tool</h1>
            </div>
            {step === 'result' && <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white"><Save className="mr-2 w-4 h-4"/> Save Quote</Button>}
        </div>

        {/* Choice Screen */}
        {step === 'choice' && (
           <div className="absolute inset-0 top-16 z-20 bg-slate-50 flex items-center justify-center p-4">
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                 <Card onClick={runSolar} className="cursor-pointer hover:border-green-500 border-2 p-8 bg-white transition-all hover:shadow-xl">
                    <div className="flex justify-center mb-4"><Zap className="w-12 h-12 text-green-600"/></div>
                    <h2 className="text-2xl font-bold text-center">Quick Estimate</h2>
                    <p className="text-center text-slate-500 mt-2">Solar API Analysis (Instant)</p>
                 </Card>
                 <Card onClick={startDrawing} className="cursor-pointer hover:border-blue-500 border-2 p-8 bg-white transition-all hover:shadow-xl">
                    <div className="flex justify-center mb-4"><PenTool className="w-12 h-12 text-blue-600"/></div>
                    <h2 className="text-2xl font-bold text-center">Detailed Measure</h2>
                    <p className="text-center text-slate-500 mt-2">Manual Drawing Tool</p>
                 </Card>
              </div>
           </div>
        )}
        {/* Result Overlay */}
        {step === 'result' && (
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <Card className="w-80 p-6 text-center shadow-2xl animate-in slide-in-from-bottom-4">
                 <p className="text-xs font-bold text-slate-400 uppercase">Total Area</p>
                 <p className="text-4xl font-bold text-green-600">{totalArea.toLocaleString()} <span className="text-sm">sq ft</span></p>
                 <Button onClick={() => setStep('detailed')} variant="link" className="mt-2 text-xs">Edit Manual</Button>
              </Card>
           </div>
        )}
        {/* Map Layer */}
        <div className="absolute inset-0 top-16">
            <div ref={setMapNode} className="w-full h-full" />
        </div>
     </div>
  ); 
}