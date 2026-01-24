import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, Zap, PenTool, RefreshCw, Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Pitch Multipliers
const PITCH_FACTORS = {
  0: 1.0, 1: 1.0035, 2: 1.0138, 3: 1.0308, 4: 1.0541, 5: 1.0833,
  6: 1.1180, 7: 1.1577, 8: 1.2019, 9: 1.2500, 10: 1.3017, 11: 1.3566, 12: 1.4142
};

export default function MeasurementPage() {
  const { leadId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = paramId || searchParams.get('leadId') || searchParams.get('leadid');
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState('choice'); // RESTORED DEFAULT
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  
  // Map Refs
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);

  // Measurement Data
  const [sections, setSections] = useState([]); 
  const [quickArea, setQuickArea] = useState(0);

  // 1. DATA LOADER
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Clean session data
        const sAddr = sessionStorage.getItem('lead_address')?.replace(/"/g, '');
        const sId = sessionStorage.getItem('active_lead_id')?.replace(/"/g, '');

        if (leadId && sId === leadId && sAddr) {
           setLead({ id: leadId, address_street: sAddr, source: 'session' });
           setLoading(false);
           return;
        }

        // Fallback to local/api
        const local = [...JSON.parse(localStorage.getItem('my_leads')||'[]'), ...JSON.parse(localStorage.getItem('jobs')||'[]')];
        const target = local.find(l => l.id === leadId);
        
        if (target) {
            setLead(target);
        } else if (leadId) {
            const api = await base44.entities.Lead.get(leadId).catch(() => null);
            if (api) setLead(api);
            else {
                toast.error("Lead not found. Demo Mode.");
                setLead({ address_street: "5103 Lincolnshire Ct, Dallas, TX", id: 'demo' });
            }
        } else {
             // No ID provided
             setLead({ address_street: "5103 Lincolnshire Ct, Dallas, TX", id: 'demo' });
        }
      } catch (e) {
          console.error(e);
          setLead({ address_street: "5103 Lincolnshire Ct, Dallas, TX", id: 'demo' });
      } finally {
          setLoading(false);
      }
    };
    load();
  }, [leadId]);

  // 2. MAP INIT
  useEffect(() => {
    if (!mapNode || !lead || mapInstance) return;

    const init = async () => {
      try {
        const { Map } = await window.google.maps.importLibrary("maps");
        const { Marker } = await window.google.maps.importLibrary("marker");
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        const { DrawingManager } = await window.google.maps.importLibrary("drawing");
        await window.google.maps.importLibrary("geometry");

        const geocoder = new Geocoder();
        const address = lead.address_street || lead.address || "Dallas, TX";
        
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

            // Add Marker for initial view
            const marker = new Marker({ 
                position: results[0].geometry.location, 
                map: map, 
                title: "Target Property" 
            });
            setMarkerInstance(marker);

            const manager = new DrawingManager({
              drawingMode: null,
              drawingControl: false,
              polygonOptions: { 
                  fillColor: '#3b82f6', 
                  fillOpacity: 0.3, 
                  strokeColor: '#2563eb', 
                  strokeWeight: 2, 
                  editable: true 
              }
            });
            manager.setMap(map);
            setDrawingManager(manager);

            window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
                const area = window.google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                const newSection = { 
                    id: Date.now(), 
                    polygon: poly, 
                    area: Math.round(area), 
                    pitch: 6 
                };
                setSections(p => [...p, newSection]);
                manager.setDrawingMode(null);
                
                // Recalculate area on edit
                ['set_at', 'insert_at', 'remove_at'].forEach(evt => {
                   window.google.maps.event.addListener(poly.getPath(), evt, () => {
                       const newArea = window.google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                       setSections(prev => prev.map(s => s.polygon === poly ? { ...s, area: Math.round(newArea) } : s));
                   });
               });
            });
          }
        });
      } catch (e) {
          console.error("Map init error", e);
      }
    };
    
    const interval = setInterval(() => {
        if (window.google && window.google.maps) {
            clearInterval(interval);
            init();
        }
    }, 100);
    return () => clearInterval(interval);
  }, [mapNode, lead]);

  // 3. ACTIONS
  const startQuick = () => {
    setStep('quick');
    if (markerInstance && mapInstance) {
        const center = markerInstance.getPosition();
        const lat = center.lat();
        const lng = center.lng();
        
        const box = [
          { lat: lat + 0.00015, lng: lng - 0.0002 },
          { lat: lat + 0.00015, lng: lng + 0.0002 },
          { lat: lat - 0.00015, lng: lng + 0.0002 },
          { lat: lat - 0.00015, lng: lng - 0.0002 },
        ];
        
        const poly = new window.google.maps.Polygon({
           paths: box,
           fillColor: '#22c55e', 
           strokeColor: '#16a34a', 
           map: mapInstance,
           editable: true
        });
        
        const area = window.google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
        setQuickArea(Math.round(area));
        
        // Listen for edits
        ['set_at', 'insert_at', 'remove_at'].forEach(evt => {
            window.google.maps.event.addListener(poly.getPath(), evt, () => {
                const newArea = window.google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                setQuickArea(Math.round(newArea));
            });
        });
    }
  };

  const startDetailed = () => {
    setStep('detailed');
    if(markerInstance) markerInstance.setMap(null); // Clear marker
  };

  const saveMeasurement = async () => {
    toast.loading("Saving...");
    
    const isQuick = step === 'quick';
    const finalArea = isQuick ? quickArea : sections.reduce((sum, s) => sum + (s.area * (PITCH_FACTORS[s.pitch] || 1)), 0);
    const estimatedValue = Math.round(finalArea * 4.5);

    const payload = {
        property_address: lead.address_street,
        measurement_type: isQuick ? 'quick_estimate' : 'detailed_polygon',
        total_sqft: Math.round(isQuick ? quickArea : sections.reduce((a, b) => a + b.area, 0)),
        total_adjusted_sqft: Math.round(finalArea),
        measurement_data: { 
            sections: sections.map(s => ({ pitch: s.pitch, area: s.area }))
        },
        lead_status: 'Quoted',
        quote_amount: estimatedValue
    };

    try {
        // Save to Measurement
        await base44.entities.Measurement.create(payload);
        
        // Update Lead
        await base44.entities.Lead.update(lead.id, {
            roof_sqft: Math.round(finalArea),
            lead_status: 'Quoted',
            price_sold: estimatedValue
        });

        // Sync Local
        const currentLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
        const idx = currentLeads.findIndex(l => l.id === lead.id);
        const updatedLead = { ...lead, roof_sqft: Math.round(finalArea), lead_status: 'Quoted' };
        
        if (idx !== -1) {
            currentLeads[idx] = updatedLead;
            localStorage.setItem('my_leads', JSON.stringify(currentLeads));
        } else if (lead.source === 'session') {
            localStorage.setItem('my_leads', JSON.stringify([...currentLeads, updatedLead]));
        }

        toast.dismiss();
        toast.success("Saved successfully!");
        setTimeout(() => navigate('/rooferdashboard'), 1000);
    } catch (err) {
        console.error("Save error", err);
        // Fallback local save
        const currentLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
        localStorage.setItem('my_leads', JSON.stringify([...currentLeads, { ...lead, roof_sqft: Math.round(finalArea), lead_status: 'Quoted' }]));
        toast.dismiss();
        toast.success("Saved locally!");
        setTimeout(() => navigate('/rooferdashboard'), 1000);
    }
  };
  
  const handleReset = () => {
      setStep('choice');
      setSections(prev => {
          prev.forEach(s => s.polygon.setMap(null));
          return [];
      });
      setQuickArea(0);
      if (markerInstance) markerInstance.setMap(mapInstance);
      if (drawingManager) drawingManager.setDrawingMode(null);
  };

  // 4. RENDER
  if (loading) return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
  );

  return (
    <div className="flex flex-col h-screen w-full relative bg-slate-100 overflow-hidden">
      
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur z-20 border-b flex items-center px-4 justify-between shadow-sm">
         <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2"/> Back</Button>
         <span className="font-bold truncate px-4">{lead?.address_street || "Measurement Tool"}</span>
         <Button variant="outline" size="sm" onClick={handleReset}>
             <RefreshCw className="w-4 h-4 mr-2"/> Reset
         </Button>
      </div>

      {/* SIDEBAR (Only in Detailed Mode) */}
      {step === 'detailed' && (
        <div className="absolute left-0 top-16 bottom-0 w-80 bg-white border-r z-10 flex flex-col shadow-xl animate-in slide-in-from-left">
            <div className="p-4 border-b bg-blue-50">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                    <PenTool className="w-4 h-4"/> Detailed Measurement
                </h3>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => drawingManager?.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)}>
                    <Plus className="w-4 h-4 mr-2"/> Draw Section
                </Button>
                
                {sections.length === 0 && (
                     <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-lg">
                        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                        <p className="text-sm">No sections yet</p>
                    </div>
                )}

                {sections.map((s, i) => (
                    <Card key={s.id} className="p-3 border-l-4 border-l-blue-500">
                        <div className="font-bold text-sm mb-2 flex justify-between">
                            <span>Section {i+1}</span>
                            <span className="text-slate-500 font-normal">{s.area.toLocaleString()} sq ft</span>
                        </div>
                        <Select value={s.pitch.toString()} onValueChange={v => {
                            setSections(prev => prev.map(sec => sec.id === s.id ? {...sec, pitch: Number(v)} : sec));
                        }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(p => <SelectItem key={p} value={p.toString()}>{p}/12 Pitch</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Card>
                ))}
            </div>
            <div className="p-4 border-t bg-slate-50">
                <div className="mb-2 flex justify-between font-bold">
                    <span>Adjusted Total:</span>
                    <span className="text-green-600">{Math.round(sections.reduce((sum, s) => sum + (s.area * (PITCH_FACTORS[s.pitch] || 1)), 0)).toLocaleString()} sq ft</span>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={saveMeasurement}>
                    <Save className="w-4 h-4 mr-2"/> Save Record
                </Button>
            </div>
        </div>
      )}

      {/* MAP LAYER */}
      <div className="flex-1 relative pt-16 h-full">
         <div ref={setMapNode} className="w-full h-full" />
      </div>

      {/* CHOICE OVERLAY */}
      {step === 'choice' && (
         <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center pt-16">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full p-4 animate-in zoom-in-95 duration-200">
               <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white border-green-500 border-b-4 shadow-2xl" onClick={startQuick}>
                  <div className="flex justify-center mb-6"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"><Zap className="w-10 h-10 text-green-600"/></div></div>
                  <h2 className="text-2xl font-bold text-center mb-2">Quick Estimate</h2>
                  <p className="text-center text-slate-500">Instant AI Result</p>
               </Card>
               <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white border-blue-500 border-b-4 shadow-2xl" onClick={startDetailed}>
                  <div className="flex justify-center mb-6"><div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center"><PenTool className="w-10 h-10 text-blue-600"/></div></div>
                  <h2 className="text-2xl font-bold text-center mb-2">Detailed Measure</h2>
                  <p className="text-center text-slate-500">Manual Precision Mode</p>
               </Card>
            </div>
         </div>
      )}

      {/* QUICK RESULT OVERLAY */}
      {step === 'quick' && (
         <Card className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 shadow-2xl z-30 border-t-4 border-green-500 animate-in slide-in-from-bottom-10">
            <CardContent className="p-6 text-center">
                <h3 className="font-bold text-slate-500 uppercase text-xs mb-2">AI Estimate</h3>
                <p className="text-4xl font-bold text-green-600 mb-1">{quickArea.toLocaleString()}</p>
                <p className="text-sm text-slate-400 mb-4">sq ft</p>
                <div className="space-y-2">
                    <Button variant="outline" className="w-full" onClick={startDetailed}>Switch to Detailed</Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={saveMeasurement}>Save Estimate</Button>
                </div>
            </CardContent>
         </Card>
      )}
    </div>
  );
}