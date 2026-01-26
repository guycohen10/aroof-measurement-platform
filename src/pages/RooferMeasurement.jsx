import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Zap, PenTool, Key, Pencil, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EDGE_TYPES = { 0: { name: 'Unassigned', color: '#94a3b8' }, 1: { name: 'Eave', color: '#3b82f6' }, 2: { name: 'Rake', color: '#22c55e' }, 3: { name: 'Ridge', color: '#ef4444' }, 4: { name: 'Hip', color: '#f97316' }, 5: { name: 'Valley', color: '#a855f7' }, 6: { name: 'Wall', color: '#eab308' }, };

const PITCH_FACTORS = { 0: 1.0, 4: 1.054, 5: 1.083, 6: 1.118, 7: 1.158, 8: 1.202, 9: 1.25, 10: 1.302, 12: 1.414 };

export default function RooferMeasurement() { 
  const [searchParams] = useSearchParams(); 
  const leadId = searchParams.get('leadId')?.replace(/"/g, ''); 
  const navigate = useNavigate();

  const [step, setStep] = useState('choice'); 
  const [loading, setLoading] = useState(true); 
  const [lead, setLead] = useState(null); 
  const [mapNode, setMapNode] = useState(null); 
  const [mapInstance, setMapInstance] = useState(null); 
  const [markerInstance, setMarkerInstance] = useState(null); 
  const [drawingManager, setDrawingManager] = useState(null); 
  const [sections, setSections] = useState([]); 
  const [quickArea, setQuickArea] = useState(0);

  // API & Edit State 
  const [apiKey, setApiKey] = useState(''); 
  const [needsKey, setNeedsKey] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 
  const [editForm, setEditForm] = useState({}); 
  const addressInputRef = useRef(null);

  // 1. DATA LOADER 
  useEffect(() => { 
    const load = async () => { 
      if(!leadId) { setLoading(false); return; }

      // Check DB first for most accurate data
      try {
          const api = await base44.entities.Lead.get(leadId);
          setLead(api);
          setEditForm(api);
          setLoading(false);
          return;
      } catch(e) { console.log("Lead not in DB yet, checking local"); }
      
      // Fallback to Session/Local
      const sId = sessionStorage.getItem('active_lead_id')?.replace(/"/g, '');
      if(sId === leadId) {
          const sessionLead = {
              id: leadId,
              address_street: sessionStorage.getItem('lead_address')?.replace(/"/g, ''),
              customer_name: sessionStorage.getItem('customer_name')?.replace(/"/g, ''),
              email: sessionStorage.getItem('customer_email')?.replace(/"/g, ''),
              phone: sessionStorage.getItem('customer_phone')?.replace(/"/g, ''),
              source: 'session'
          };
          setLead(sessionLead); setEditForm(sessionLead); setLoading(false); return;
      }
      
      const local = JSON.parse(localStorage.getItem('my_leads')||'[]');
      const target = local.find(l => l.id === leadId);
      if(target) { setLead(target); setEditForm(target); setLoading(false); }
      else { setLoading(false); } // Allow empty load to trigger edit mode
    };
    load();
  }, [leadId]);

  // 2. MAP LOADER + AUTOCOMPLETE 
  useEffect(() => { 
    if (!mapNode || !lead || !lead.address_street) return;

    const attemptLoad = () => {
        let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if(!key) key = localStorage.getItem('user_provided_maps_key');
        if (!key) { setNeedsKey(true); return; }
        if (window.google?.maps) { initMap(); return; }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,drawing,geometry`;
        script.async = true;
        script.onload = initMap;
        script.onerror = () => { toast.error("Invalid API Key"); setNeedsKey(true); localStorage.removeItem('user_provided_maps_key'); };
        document.head.appendChild(script);
    };
    const initMap = async () => {
        try {
            const { Map } = await google.maps.importLibrary("maps");
            const { Marker } = await google.maps.importLibrary("marker");
            const { Geocoder } = await google.maps.importLibrary("geocoding");
            await google.maps.importLibrary("drawing");
            await google.maps.importLibrary("geometry");
            await google.maps.importLibrary("places");
            // Geocode & Map
            const geocoder = new Geocoder();
            geocoder.geocode({ address: lead.address_street }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const map = new Map(mapNode, { center: results[0].geometry.location, zoom: 20, mapTypeId: 'satellite', disableDefaultUI: true, tilt: 0 });
                    setMapInstance(map);
                    const marker = new Marker({ position: results[0].geometry.location, map: map, title: "Target" });
                    setMarkerInstance(marker);
                    const manager = new google.maps.drawing.DrawingManager({
                        drawingMode: null,
                        drawingControl: false,
                        polygonOptions: { fillColor: '#3b82f6', fillOpacity: 0.2, strokeColor: '#2563eb', strokeWeight: 2, zIndex: 1, editable: true }
                    });
                    manager.setMap(map);
                    setDrawingManager(manager);
                    google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
                        const area = google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                        const newEdges = [];
                        const path = poly.getPath().getArray();
                        for(let i=0; i<path.length; i++) {
                            const start = path[i];
                            const end = path[(i+1)%path.length];
                            const len = google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084;
                            const line = new google.maps.Polyline({
                                path: [start, end], strokeColor: EDGE_TYPES[0].color, strokeWeight: 8, zIndex: 9999, map: map 
                            });
                            const edgeData = { id: Date.now()+i, type: 0, length: len, lineInstance: line };
                            line.addListener("click", () => {
                                edgeData.type = (edgeData.type + 1) % 7;
                                line.setOptions({ strokeColor: EDGE_TYPES[edgeData.type].color });
                            });
                            newEdges.push(edgeData);
                        }
                        setSections(p => [...p, { id: Date.now(), area: Math.round(area), pitch: 6, edges: newEdges }]);
                        manager.setDrawingMode(null);
                        toast.success("Section Added!");
                    });
                } else { toast.error("Address not found on map"); }
            });
        } catch(e) { console.error(e); }
    };
    attemptLoad();
  }, [mapNode, lead]);

  // 3. AUTOCOMPLETE HOOK 
  useEffect(() => { 
    if(isEditing && addressInputRef.current && window.google?.maps?.places) { 
        const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current); 
        autocomplete.addListener("place_changed", () => { 
            const place = autocomplete.getPlace(); 
            if(place.formatted_address) { 
                setEditForm(prev => ({ ...prev, address_street: place.formatted_address })); 
            } 
        }); 
    } 
  }, [isEditing]);

  const handleUpdateLead = async () => { 
    // Save to DB immediately if possible 
    try { 
        // Check if lead exists in DB 
        let dbId = lead.id; 
        try { await base44.entities.Lead.get(dbId); } 
        catch { 
            // Create if missing 
            const newLead = await base44.entities.Lead.create({ 
                customer_name: editForm.customer_name, 
                property_address: editForm.address_street, 
                email_address: editForm.email, 
                phone_number: editForm.phone, 
                status: 'New' 
            }); 
            dbId = newLead.id; 
        }

        // Update existing
        if(dbId === lead.id) {
            await base44.entities.Lead.update(dbId, {
                customer_name: editForm.customer_name,
                property_address: editForm.address_street,
                email_address: editForm.email,
                phone_number: editForm.phone
            });
        }
        
        setLead({ ...editForm, id: dbId });
        setIsEditing(false);
        toast.success("Info Saved & Map Reloading...");
    } catch(e) {
        // Fallback to local state if DB fails (offline/demo)
        setLead(editForm);
        setIsEditing(false);
        toast.success("Preview Updated");
    }
  };

  const saveMeasurement = async () => { 
    toast.loading("Saving..."); 
    let totalAdj = 0; 
    sections.forEach(s => totalAdj += (s.area * (PITCH_FACTORS[s.pitch]||1.1)));

    try {
        // Ensure lead is up to date in DB
        await handleUpdateLead();
        
        await base44.entities.RoofMeasurement.create({
            lead_id: lead.id,
            total_sqft: Math.round(totalAdj),
            measurement_status: 'Completed',
            sections_data: { sections: sections.map(s => ({ pitch: s.pitch, area: s.area })) }
        });
        
        await base44.entities.Lead.update(lead.id, { status: 'Measured', roof_sqft: Math.round(totalAdj) });
        toast.success("Saved!");
        setTimeout(() => navigate('/jobboard'), 1000);
    } catch(e) { toast.error("Save Failed"); }
  };

  // RENDER EDIT MODAL 
  return (
    <div className="h-screen flex flex-col relative bg-slate-100 overflow-hidden">
        {/* HEADER */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-white z-30 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
            <h1 className="font-bold text-lg">Measurement Tool</h1>
          </div>
          <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="w-4 h-4 mr-2"/> Edit Info</Button>
              <Button variant="outline" size="sm" onClick={() => setSections([])}>Clear Map</Button>
          </div>
       </div>

       {/* EDIT OVERLAY */}
       {isEditing && (
           <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
               <Card className="w-full max-w-lg shadow-2xl">
                   <CardHeader><CardTitle>Update Lead Info</CardTitle></CardHeader>
                   <CardContent className="space-y-4">
                       <div><Label>Customer Name</Label><Input value={editForm.customer_name||''} onChange={e=>setEditForm({...editForm, customer_name:e.target.value})}/></div>
                       <div><Label>Email</Label><Input value={editForm.email||''} onChange={e=>setEditForm({...editForm, email:e.target.value})}/></div>
                       <div><Label>Phone</Label><Input value={editForm.phone||''} onChange={e=>setEditForm({...editForm, phone:e.target.value})}/></div>
                       <div>
                          <Label>Property Address</Label>
                          <Input ref={addressInputRef} value={editForm.address_street||''} onChange={e=>setEditForm({...editForm, address_street:e.target.value})} placeholder="Start typing address..."/>
                       </div>
                       <div className="flex gap-2 pt-2">
                           <Button className="flex-1 bg-blue-600" onClick={handleUpdateLead}>Save & Update Map</Button>
                           <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                       </div>
                        <div className="border-t pt-4 mt-2">
                            <Button variant="destructive" size="sm" className="w-full" onClick={() => { localStorage.removeItem('user_provided_maps_key'); window.location.reload(); }}>
                                <RotateCcw className="w-3 h-3 mr-2"/> Reset API Key
                            </Button>
                       </div>
                   </CardContent>
               </Card>
           </div>
       )}
       
       <div className="flex flex-1 h-full">
           {step === 'detailed' && (
              <div className="w-80 bg-white border-r z-10 mt-16 flex flex-col shadow-xl">
                  <div className="p-4 border-b bg-blue-50">
                      <h3 className="font-bold text-blue-900">Pro Measurement</h3>
                      <p className="text-xs text-blue-600">Total: {Math.round(sections.reduce((a,b)=>a+b.area,0))} sq ft</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 text-[10px]">
                      {Object.entries(EDGE_TYPES).slice(1).map(([k,v]) => (
                          <div key={k} className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{background:v.color}}/>{v.name}</div>
                      ))}
                  </div>
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      <Button className="w-full bg-blue-600" onClick={() => drawingManager?.setDrawingMode('polygon')}><Plus className="w-4 h-4 mr-2"/> Draw Section</Button>
                      {sections.map((s, i) => (
                          <Card key={s.id} className="p-3 border-l-4 border-blue-500">
                              <div className="font-bold text-sm mb-2">Section {i+1} ({s.area} sq ft)</div>
                              <Select value={s.pitch.toString()} onValueChange={v => {
                                  setSections(prev => prev.map(sec => sec.id === s.id ? {...sec, pitch: Number(v)} : sec));
                              }}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>{[0,4,5,6,7,8,9,10,12].map(p => <SelectItem key={p} value={p.toString()}>{p}/12 Pitch</SelectItem>)}</SelectContent>
                              </Select>
                          </Card>
                      ))}
                  </div>
                  <div className="p-4 border-t"><Button className="w-full bg-green-600" onClick={saveMeasurement}><Save className="w-4 h-4 mr-2"/> Save</Button></div>
              </div>
           )}
           <div className="flex-1 relative pt-16"><div ref={setMapNode} className="w-full h-full" /></div>
           {step === 'choice' && !loading && (
              <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center pt-16">
                 <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full p-4">
                    <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white border-green-500 border-b-4" onClick={() => setStep('quick')}>
                       <Zap className="w-12 h-12 text-green-600 mb-4 mx-auto"/>
                       <h2 className="text-2xl font-bold text-center">Quick Estimate</h2>
                    </Card>
                    <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white border-blue-500 border-b-4" onClick={() => { setStep('detailed'); markerInstance?.setMap(null); }}>
                       <PenTool className="w-12 h-12 text-blue-600 mb-4 mx-auto"/>
                       <h2 className="text-2xl font-bold text-center">Pro Measure</h2>
                    </Card>
                 </div>
              </div>
           )}
       </div>
       
       {/* KEY FALLBACK */}
       {needsKey && (
          <div className="flex h-screen items-center justify-center bg-slate-900 p-4 absolute inset-0 z-50">
              <Card className="w-full max-w-md">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" /> Enter API Key</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <p className="text-sm text-slate-500">Google Maps needs a valid API Key.</p>
                      <Input placeholder="AIzaSy..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
                      <Button className="w-full bg-blue-600" onClick={() => { 
                          if(apiKey.length < 10) return;
                          localStorage.setItem('user_provided_maps_key', apiKey);
                          window.location.reload();
                      }}>Load Map</Button>
                  </CardContent>
              </Card>
          </div>
       )}
    </div>
  ); 
}