import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Zap, PenTool, Key, Pencil, RotateCcw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EDGE_TYPES = { 0: { name: 'Unassigned', color: '#94a3b8' }, 1: { name: 'Eave', color: '#3b82f6' }, 2: { name: 'Rake', color: '#22c55e' }, 3: { name: 'Ridge', color: '#ef4444' }, 4: { name: 'Hip', color: '#f97316' }, 5: { name: 'Valley', color: '#a855f7' }, 6: { name: 'Wall', color: '#eab308' }, };
const PITCH_FACTORS = { 0: 1.0, 4: 1.054, 5: 1.083, 6: 1.118, 7: 1.158, 8: 1.202, 9: 1.25, 10: 1.302, 12: 1.414 };

export default function RooferMeasurement() { 
  const [searchParams, setSearchParams] = useSearchParams(); 
  const leadId = searchParams.get('leadId')?.replace(/"/g, ''); 
  const navigate = useNavigate();

  const [step, setStep] = useState('choice'); 
  const [loading, setLoading] = useState(true); 
  const [lead, setLead] = useState({ customer_name: '', address_street: '', email: '', phone: '' }); 
  const [mapNode, setMapNode] = useState(null); 
  const [mapInstance, setMapInstance] = useState(null); 
  const [drawingManager, setDrawingManager] = useState(null); 
  const [sections, setSections] = useState([]);

  // Edit & API State 
  const [isEditing, setIsEditing] = useState(false); 
  const [editForm, setEditForm] = useState({}); 
  const [apiKey, setApiKey] = useState(''); 
  const [needsKey, setNeedsKey] = useState(false); 
  const addressInputRef = useRef(null);

  // 1. DATA LOADER (Session Recovery) 
  useEffect(() => { 
    const load = async () => { 
      if(!leadId) { 
        // No ID? Check Session immediately 
        recoverSession(); 
        return; 
      }

      try {
          const api = await base44.entities.Lead.get(leadId);
          if(api) {
              setLead(api);
              setEditForm(api);
              setLoading(false);
          } else { throw new Error("Not found"); }
      } catch(e) {
          console.log("Lead not in DB, checking session...");
          recoverSession();
      }
    };
    
    const recoverSession = () => {
        const sAddr = sessionStorage.getItem('lead_address')?.replace(/"/g, '');
        const sName = sessionStorage.getItem('customer_name')?.replace(/"/g, '');
        const sPhone = sessionStorage.getItem('customer_phone')?.replace(/"/g, '');
        const sEmail = sessionStorage.getItem('customer_email')?.replace(/"/g, '');
        
        const ghostLead = {
            id: 'temp_' + Date.now(),
            address_street: sAddr || '',
            customer_name: sName || 'New Customer',
            phone: sPhone || '',
            email: sEmail || '',
            source: 'session'
        };
        
        setLead(ghostLead);
        setEditForm(ghostLead);
        setLoading(false);
        // If we have no address, force edit mode
        if(!sAddr) setIsEditing(true);
    };
    
    load();
  }, [leadId]);

  // 2. AUTOCOMPLETE INIT 
  useEffect(() => { 
    if(isEditing && addressInputRef.current && window.google?.maps?.places) { 
        const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, { types: ['address'] }); 
        autocomplete.addListener("place_changed", () => { 
            const place = autocomplete.getPlace(); 
            if(place.formatted_address) { 
                setEditForm(prev => ({ ...prev, address_street: place.formatted_address })); 
            } 
        }); 
    } 
  }, [isEditing]);

  // 3. MAP LOADER 
  useEffect(() => { 
    if (!mapNode || !lead?.address_street) return;

    const initMap = async () => {
        let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('user_provided_maps_key');
        if (!key) { setNeedsKey(true); return; }
        
        // Load script if missing
        if (!window.google?.maps) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,drawing,geometry`;
            script.async = true;
            script.onload = () => initMap(); // Retry
            document.head.appendChild(script);
            return;
        }
        
        try {
            const { Map } = await google.maps.importLibrary("maps");
            const { Geocoder } = await google.maps.importLibrary("geocoding");
            await google.maps.importLibrary("drawing");
            await google.maps.importLibrary("places");
            
            const geocoder = new Geocoder();
            geocoder.geocode({ address: lead.address_street }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const map = new Map(mapNode, { center: results[0].geometry.location, zoom: 20, mapTypeId: 'satellite', disableDefaultUI: true, tilt: 0 });
                    setMapInstance(map);
                    
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
                } else { toast.error("Address not found on Map."); }
            });
        } catch(e) { console.error(e); }
    };
    initMap();
  }, [mapNode, lead?.address_street]);

  // 4. SAVE / UPDATE LOGIC 
  const handleUpdateLead = async () => { 
    if(!editForm.customer_name || !editForm.address_street) { 
        toast.error("Name and Address are required"); 
        return; 
    } 
    toast.loading("Updating Database...");

    try {
        let realId = lead.id;
        
        // If it's a temp ID or session, CREATE NEW
        if(!realId || realId.startsWith('temp') || lead.source === 'session') {
             const newLead = await base44.entities.Lead.create({
                 customer_name: editForm.customer_name,
                 property_address: editForm.address_street,
                 email_address: editForm.email_address || editForm.email,
                 phone_number: editForm.phone_number || editForm.phone,
                 status: 'New'
             });
             realId = newLead.id;
             // LOCK URL TO REAL ID
             setSearchParams({ leadId: realId });
        } else {
            // UPDATE EXISTING
            await base44.entities.Lead.update(realId, {
                 customer_name: editForm.customer_name,
                 property_address: editForm.address_street,
                 email_address: editForm.email_address || editForm.email,
                 phone_number: editForm.phone_number || editForm.phone
            });
        }
        
        setLead({ ...editForm, id: realId });
        setIsEditing(false);
        toast.dismiss();
        toast.success("Lead Saved! Reloading Map...");
        // Map will reload via effect dependency on lead.address_street
    } catch(e) {
        console.error(e);
        toast.error("Save failed. Try again.");
    }
  };

  const saveMeasurement = async () => { 
    // Ensure we have a real ID first 
    if(!lead.id || lead.id.startsWith('temp')) { 
        toast.error("Please click 'Edit Info' and Save the Lead first!"); 
        setIsEditing(true); 
        return; 
    }

    toast.loading("Saving Measurement...");
    let totalAdj = 0;
    sections.forEach(s => totalAdj += (s.area * (PITCH_FACTORS[s.pitch]||1.1)));
    
    try {
        await base44.entities.RoofMeasurement.create({
            lead_id: lead.id,
            total_sqft: Math.round(totalAdj),
            measurement_status: 'Completed',
            sections_data: { sections: sections.map(s => ({ pitch: s.pitch, area: s.area })) }
        });
        await base44.entities.Lead.update(lead.id, { status: 'Measured', roof_sqft: Math.round(totalAdj) });
        toast.success("Measurement Saved!");
        setTimeout(() => navigate('/jobboard'), 1000);
    } catch(e) { toast.error("Could not save measurement."); }
  };

  // 5. RENDER 
  if (needsKey) { 
      return (
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
      );
  }

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
           <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
               <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                   <CardHeader className="border-b bg-slate-50">
                       <CardTitle>Client Details</CardTitle>
                       <p className="text-xs text-slate-500">This will create/update the client in your database.</p>
                   </CardHeader>
                   <CardContent className="space-y-4 p-6">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2">
                               <Label>Property Address (Auto-Complete)</Label>
                               <div className="relative">
                                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                                  <Input ref={addressInputRef} className="pl-9" value={editForm.address_street||''} onChange={e=>setEditForm({...editForm, address_street:e.target.value})} placeholder="Start typing address..."/>
                               </div>
                           </div>
                           <div className="col-span-2">
                               <Label>Customer Name</Label>
                               <Input value={editForm.customer_name||''} onChange={e=>setEditForm({...editForm, customer_name:e.target.value})}/>
                           </div>
                           <div>
                               <Label>Email</Label>
                               <Input value={editForm.email||''} onChange={e=>setEditForm({...editForm, email:e.target.value})}/>
                           </div>
                           <div>
                               <Label>Phone</Label>
                               <Input value={editForm.phone||''} onChange={e=>setEditForm({...editForm, phone:e.target.value})}/>
                           </div>
                       </div>
                       <div className="flex gap-2 pt-4">
                           <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleUpdateLead}>
                               <Save className="w-4 h-4 mr-2"/> Save & Load Map
                           </Button>
                           <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                       </div>
                   </CardContent>
               </Card>
           </div>
       )}
       {/* MAIN UI */}
       <div className="flex-1 relative pt-16"><div ref={setMapNode} className="w-full h-full" /></div>
       
       {step === 'choice' && !loading && (
          <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center pt-16">
             <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full p-4">
                <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white shadow-2xl border-green-500 border-b-4" onClick={() => setStep('quick')}>
                   <Zap className="w-12 h-12 text-green-600 mb-4 mx-auto"/>
                   <h2 className="text-2xl font-bold text-center">Quick Estimate</h2>
                </Card>
                <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white shadow-2xl border-blue-500 border-b-4" onClick={() => { setStep('detailed'); mapInstance?.setTilt(0); }}>
                   <PenTool className="w-12 h-12 text-blue-600 mb-4 mx-auto"/>
                   <h2 className="text-2xl font-bold text-center">Pro Measure</h2>
                </Card>
             </div>
          </div>
       )}
       
       {/* SIDEBAR */}
       {step === 'detailed' && (
          <div className="w-80 bg-white border-r z-10 mt-16 flex flex-col shadow-xl absolute left-0 bottom-0 top-0">
              <div className="p-4 border-b bg-blue-50 pt-20">
                  <h3 className="font-bold text-blue-900">Measurements</h3>
                  <p className="text-xs text-blue-600">Total: {Math.round(sections.reduce((a,b)=>a+b.area,0))} sq ft</p>
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
              <div className="p-4 border-t"><Button className="w-full bg-green-600" onClick={saveMeasurement}><Save className="w-4 h-4 mr-2"/> Finish & Save</Button></div>
          </div>
       )}
    </div>
  );
}