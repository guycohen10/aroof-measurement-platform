import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Zap, PenTool, CheckCircle2, MousePointerClick, RefreshCw, Loader2, Ruler, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const EDGE_TYPES = {
  0: { name: 'Unassigned', color: '#94a3b8' },
  1: { name: 'Eave', color: '#3b82f6' },
  2: { name: 'Rake', color: '#22c55e' },
  3: { name: 'Ridge', color: '#ef4444' },
  4: { name: 'Hip', color: '#f97316' },
  5: { name: 'Valley', color: '#a855f7' },
  6: { name: 'Wall', color: '#eab308' },
};

export default function MeasurementPage() {
  const { leadId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = paramId || searchParams.get('leadId');
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState('choice'); // 'choice', 'quick', 'detailed', 'report'
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  
  // Map Refs
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);

  // Measurement Data
  const [totalArea, setTotalArea] = useState(0);
  const [edges, setEdges] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [waste, setWaste] = useState(10);
  const [pitch, setPitch] = useState(6);

  // 1. UNIVERSAL DATA LOADER
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // A. Priority: Session Storage (From New Lead Form)
        const sessionAddr = sessionStorage.getItem('lead_address');
        const sessionId = sessionStorage.getItem('active_lead_id');

        if (leadId && sessionId === leadId && sessionAddr) {
          console.log("Found in Session Storage");
          setLead({ id: leadId, address_street: sessionAddr, source: 'session' });
          setLoading(false);
          return;
        }

        // B. Priority: Local Storage (Job Board/Marketplace)
        const localJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
        const target = [...localJobs, ...localLeads].find(l => l.id === leadId);
        
        if (target) {
            // Fix address if missing
           if (!target.address_street) {
              target.address_street = target.address || "Dallas, TX"; 
           }
          setLead({ ...target, source: 'local' });
          setLoading(false);
          return;
        }

        // C. Priority: API
        if (leadId && leadId !== 'mock-lead') {
            try {
                const apiLead = await base44.entities.Lead.get(leadId);
                setLead({ ...apiLead, source: 'api' });
            } catch (e) {
                console.warn("API lookup failed", e);
                // Fallback to demo if API fails
                toast.error("Could not find lead. Using demo mode.");
                setLead({ id: 'demo', address_street: "5103 Lincolnshire Ct, Dallas, TX", source: 'demo' });
            }
        } else {
             // Mock/Demo Fallback
             toast.error("Using demo mode.");
             setLead({ id: 'demo', address_street: "5103 Lincolnshire Ct, Dallas, TX", source: 'demo' });
        }

      } catch (err) {
        console.error("Load failed", err);
        setLead({ id: 'demo', address_street: "5103 Lincolnshire Ct, Dallas, TX", source: 'demo' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [leadId]);

  // 2. MAP INIT & RED MARKER
  useEffect(() => {
    if (!mapNode || !lead || mapInstance) return;

    const init = async () => {
      try {
        const { Map } = await window.google.maps.importLibrary("maps");
        const { Marker } = await window.google.maps.importLibrary("marker");
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        await window.google.maps.importLibrary("drawing");
        await window.google.maps.importLibrary("geometry");
        
        const geocoder = new Geocoder();
        const address = lead.address_street || lead.address || lead.property_address || "Dallas, TX";
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            
            // Init Map
            const map = new Map(mapNode, {
              center: location,
              zoom: 20,
              mapTypeId: 'satellite',
              disableDefaultUI: true,
              tilt: 0
            });
            setMapInstance(map);
            
            // DROP RED MARKER
            const marker = new Marker({
              position: location,
              map: map,
              title: "Property Location",
              animation: window.google.maps.Animation.DROP
            });
            setMarkerInstance(marker);
          } else {
              toast.error("Could not locate address");
          }
        });
      } catch (e) {
          console.error("Map init error", e);
      }
    };
    
    // Wait for Google API to be available
    const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
            clearInterval(checkGoogle);
            init();
        }
    }, 100);
    return () => clearInterval(checkGoogle);
  }, [mapNode, lead]); // Intentionally omitting mapInstance to run once per lead load if map is not set

  // 3. WORKFLOW HANDLERS
  const startQuick = () => {
    setStep('quick');
    if (!mapInstance || !markerInstance) return;

    // Simulate Solar API: Draw Green Box around marker
    const center = markerInstance.getPosition();
    const lat = center.lat();
    const lng = center.lng();
    const offset = 0.0001;
    
    const box = [
      { lat: lat + offset, lng: lng - 0.00015 },
      { lat: lat + offset, lng: lng + 0.00015 },
      { lat: lat - offset, lng: lng + 0.00015 },
      { lat: lat - offset, lng: lng - 0.00015 }
    ];
    
    const poly = new window.google.maps.Polygon({
      paths: box,
      fillColor: '#22c55e', 
      fillOpacity: 0.4, 
      strokeColor: '#15803d', 
      strokeWeight: 2,
      map: mapInstance, 
      editable: true
    });
    
    const area = window.google.maps.geometry.spherical.computeArea(poly.getPath());
    setTotalArea(Math.round(area * 10.764));
    setPolygons([poly]);

    // Update area on edit
    ['set_at', 'insert_at'].forEach(evt => {
        window.google.maps.event.addListener(poly.getPath(), evt, () => {
             const newArea = window.google.maps.geometry.spherical.computeArea(poly.getPath());
             setTotalArea(Math.round(newArea * 10.764));
        });
    });
    
    // Slight zoom out to see box
    mapInstance.setZoom(21);
  };

  const startDetailed = async () => {
    setStep('detailed');
    if (markerInstance) markerInstance.setMap(null); // Hide marker for drawing

    const { DrawingManager } = await window.google.maps.importLibrary("drawing");
    const manager = new DrawingManager({
      drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions: { 
          fillColor: 'white', 
          fillOpacity: 0.1, 
          strokeColor: 'white', 
          strokeWeight: 2, 
          editable: false,
          zIndex: 1
      }
    });
    
    manager.setMap(mapInstance);
    setDrawingManager(manager);

    window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
        const path = poly.getPath().getArray();
        const area = window.google.maps.geometry.spherical.computeArea(path);
        setTotalArea(Math.round(area * 10.764));
        
        // Convert to Edges logic
        const newEdges = [];
        for (let i = 0; i < path.length; i++) {
            const start = path[i];
            const end = path[(i + 1) % path.length];
            const length = window.google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084;
            
            const line = new window.google.maps.Polyline({
                path: [start, end],
                geodesic: true,
                strokeColor: EDGE_TYPES[0].color,
                strokeOpacity: 1.0,
                strokeWeight: 6,
                map: mapInstance,
                zIndex: 100
            });
            
            const edgeObj = { id: Date.now() + i, lineInstance: line, type: 0, length };
            
            line.addListener("click", () => {
                edgeObj.type = (edgeObj.type + 1) % 7;
                line.setOptions({ strokeColor: EDGE_TYPES[edgeObj.type].color });
                // Force update
                setEdges(prev => prev.map(e => e.id === edgeObj.id ? {...e, type: edgeObj.type} : e));
            });
            
            newEdges.push(edgeObj);
        }
        
        setEdges(newEdges);
        setPolygons([poly]);
        manager.setDrawingMode(null);
        setStep('report');
        toast.success("Polygon Complete! Click edges to classify.");
    });
    
    toast.info("Draw the roof outline points.");
  };
  
  const handleReset = () => {
      setStep('choice');
      setTotalArea(0);
      setEdges([]);
      // Clear Map Objects
      polygons.forEach(p => p.setMap(null));
      setPolygons([]);
      edges.forEach(e => e.lineInstance.setMap(null));
      if (drawingManager) {
          drawingManager.setMap(null);
          setDrawingManager(null);
      }
      if (markerInstance) markerInstance.setMap(mapInstance); // Show marker again
      if (mapInstance) mapInstance.setZoom(20);
  };

  // 4. SAVE
  const handleSave = async () => {
    toast.loading("Saving to Lead Manager...");
    
    const finalPrice = Math.round(totalArea * (1 + waste/100) * 4.50);
    const leadData = {
      ...lead,
      roof_sqft: totalArea,
      status: 'Quoted',
      lead_status: 'Quoted',
      estimated_value: finalPrice,
      quote_amount: finalPrice,
      last_updated: new Date().toISOString()
    };

    try {
        // If it was Session (Temp), promote to LocalStorage
        if (lead.source === 'session' || lead.source === 'demo') {
           const currentLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
           // Remove duplicates if existing
           const filtered = currentLeads.filter(l => l.id !== lead.id);
           localStorage.setItem('my_leads', JSON.stringify([...filtered, leadData]));
           toast.dismiss();
           toast.success("Lead Saved to Dashboard!");
           setTimeout(() => navigate('/roofer-dashboard'), 1000);
        } else if (lead.source === 'local') {
           // Update Local
           const currentLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
           const idx = currentLeads.findIndex(l => l.id === lead.id);
           if (idx !== -1) {
               currentLeads[idx] = { ...currentLeads[idx], ...leadData };
               localStorage.setItem('my_leads', JSON.stringify(currentLeads));
           } else {
               // Might be in 'jobs'
               const currentJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
               const jIdx = currentJobs.findIndex(j => j.id === lead.id);
               if (jIdx !== -1) {
                   currentJobs[jIdx] = { ...currentJobs[jIdx], ...leadData };
                   localStorage.setItem('jobs', JSON.stringify(currentJobs));
               }
           }
           toast.dismiss();
           toast.success("Local Lead Updated!");
           setTimeout(() => navigate('/roofer-dashboard'), 1000);
        } else {
           // API Update
           await base44.entities.Lead.update(lead.id, {
               roof_sqft: totalArea,
               lead_status: 'Quoted',
               price_sold: finalPrice // Using a field available on Lead entity for value tracking
           });
           toast.dismiss();
           toast.success("Lead Updated in CRM!");
           setTimeout(() => navigate('/roofer-dashboard'), 1000);
        }
    } catch (e) {
        console.error("Save failed", e);
        toast.dismiss();
        toast.error("Save failed");
    }
  };
  
  const getLinearTotal = (typeIndex) => {
      return Math.round(edges.filter(e => e.type === typeIndex).reduce((sum, e) => sum + e.length, 0));
  };

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
        <h1 className="font-bold text-slate-800 truncate flex-1">
            {lead?.address_street || lead?.address || "Measurement"}
        </h1>
        
        <div className="flex gap-2">
            {step !== 'choice' && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
            )}
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2"/> Save
            </Button>
        </div>
      </header>

      {/* MAP LAYER */}
      <div className="absolute inset-0 top-14 z-0">
        <div ref={setMapNode} className="w-full h-full" />
      </div>

      {/* CHOICE OVERLAY */}
      {step === 'choice' && !loading && (
        <div className="absolute inset-0 top-14 z-10 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
            <Card className="p-8 cursor-pointer hover:border-green-500 border-2 transition-all hover:scale-105 shadow-xl" onClick={startQuick}>
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"><Zap className="w-10 h-10 text-green-600"/></div>
              <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">Quick Estimate</h2>
                  <p className="text-slate-500">Instant AI approximation. Best for speed.</p>
                  <Button className="mt-6 w-full bg-green-600 hover:bg-green-700">Start Quick Mode</Button>
              </div>
            </Card>
            <Card className="p-8 cursor-pointer hover:border-blue-500 border-2 transition-all hover:scale-105 shadow-xl" onClick={startDetailed}>
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"><PenTool className="w-10 h-10 text-blue-600"/></div>
              <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">Detailed Measure</h2>
                  <p className="text-slate-500">Manual precision. Best for contracts.</p>
                  <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700">Start Detailed Mode</Button>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {/* QUICK MODE OVERLAY */}
      {step === 'quick' && (
         <Card className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 shadow-2xl z-10 animate-in slide-in-from-bottom-10 border-t-4 border-green-500">
            <CardContent className="p-6 text-center">
               <p className="text-slate-500 uppercase text-xs font-bold mb-2">Estimated Area</p>
               <p className="text-4xl font-bold text-green-600 mb-1">{totalArea.toLocaleString()}</p>
               <p className="text-sm text-slate-400 mb-4">sq ft</p>
               <div className="space-y-2">
                   <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">Save Estimate</Button>
                   <Button onClick={() => handleReset()} variant="ghost" className="w-full text-xs">Start Over</Button>
               </div>
            </CardContent>
         </Card>
      )}

      {/* REPORT / DETAILED OVERLAY */}
      {step === 'report' && (
        <div className="absolute inset-0 top-14 z-10 bg-slate-900/90 backdrop-blur p-4 md:p-8 overflow-y-auto">
          <Card className="max-w-5xl mx-auto bg-white shadow-xl min-h-[600px] animate-in zoom-in-95 duration-200">
             <Tabs defaultValue="blueprint" className="h-full flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <TabsList>
                        <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
                        <TabsTrigger value="quote">Quote</TabsTrigger>
                    </TabsList>
                    <Button variant="ghost" onClick={handleReset}>Close</Button>
                </div>
                
                <TabsContent value="blueprint" className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold border-b pb-2 mb-4">Linear Measurements</h3>
                            <div className="space-y-2">
                                {Object.entries(EDGE_TYPES).slice(1).map(([idx, t]) => (
                                    <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded border-l-4" style={{borderColor: t.color}}>
                                        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: t.color}}/>{t.name}</span>
                                        <span className="font-bold">{getLinearTotal(Number(idx))} ft</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-between text-xl font-bold">
                                <span>Total Area</span>
                                <span>{totalArea.toLocaleString()} sq ft</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 border-2 border-dashed rounded-xl flex items-center justify-center p-8 text-slate-400">
                            Blueprint Preview Generated
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="quote" className="p-6">
                     <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="text-center">
                            <h2 className="text-5xl font-black text-slate-900">${(Math.round(totalArea * (1 + waste/100) * 4.5)).toLocaleString()}</h2>
                            <p className="text-slate-500">Estimated Project Total</p>
                        </div>
                        <div className="w-full max-w-sm space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Waste %</Label><Input type="number" value={waste} onChange={e => setWaste(Number(e.target.value))}/></div>
                                <div><Label>Pitch</Label><Input type="number" value={pitch} onChange={e => setPitch(Number(e.target.value))}/></div>
                            </div>
                        </div>
                        <Button size="lg" className="bg-green-600 hover:bg-green-700 w-full max-w-sm" onClick={handleSave}>
                            Save Quote
                        </Button>
                     </div>
                </TabsContent>
             </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
}