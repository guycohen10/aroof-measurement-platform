import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, Zap, PenTool, RefreshCw, Layers, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Pitch Multipliers
const PITCH_FACTORS = {
  0: 1.0, 1: 1.0035, 2: 1.0138, 3: 1.0308, 4: 1.0541, 5: 1.0833,
  6: 1.1180, 7: 1.1577, 8: 1.2019, 9: 1.2500, 10: 1.3017, 11: 1.3566, 12: 1.4142
};

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
  const [sections, setSections] = useState([]); // { id, polygon, pitch, area, edges: [] }
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [quickArea, setQuickArea] = useState(0);

  // 1. DATA LOADER (Robust Version)
  useEffect(() => {
    const load = async () => {
      if (!leadId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Session Check
        const sId = sessionStorage.getItem('active_lead_id')?.replace(/"/g, '');
        const sAddr = sessionStorage.getItem('lead_address')?.replace(/"/g, '');

        if (sId === leadId && sAddr) {
           console.log("Loaded from Session Storage");
           setLead({ id: leadId, address_street: sAddr, source: 'session' });
           setLoading(false);
           return;
        }

        // Local/API Check
        const local = [...JSON.parse(localStorage.getItem('my_leads') || '[]'), ...JSON.parse(localStorage.getItem('jobs') || '[]')];
        const target = local.find(l => l.id === leadId);
        
        if (target) {
            if (!target.address_street) target.address_street = target.address || "Dallas, TX";
            setLead(target);
        } else {
            const api = await base44.entities.Lead.get(leadId).catch(() => null);
            if (api) {
                setLead(api);
            } else {
                toast.error("Lead not found. Demo Mode.");
                setLead({ address_street: "5103 Lincolnshire Ct, Dallas, TX", id: 'demo' });
            }
        }
      } catch (err) {
          console.error(err);
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
        geocoder.geocode({ address: lead.address_street || "Dallas, TX" }, (results, status) => {
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

            // Add Marker for initial view
            const marker = new Marker({ 
                position: location, 
                map: map, 
                title: "Target Property",
                animation: window.google.maps.Animation.DROP 
            });
            setMarkerInstance(marker);

            const manager = new DrawingManager({
              drawingMode: null, // Start disabled
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
               const path = poly.getPath().getArray();
               const area = window.google.maps.geometry.spherical.computeArea(path) * 10.764; // sq ft conversion
               
               // Generate Edges
               const newEdges = [];
               for(let i = 0; i < path.length; i++) {
                   const start = path[i];
                   const end = path[(i + 1) % path.length];
                   const len = window.google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084;
                   
                   const line = new window.google.maps.Polyline({
                       path: [start, end],
                       strokeColor: EDGE_TYPES[0].color,
                       strokeWeight: 5,
                       map: map,
                       zIndex: 100
                   });
                   
                   const edge = { id: Date.now() + i, lineInstance: line, type: 0, length: len };
                   
                   line.addListener("click", () => {
                       edge.type = (edge.type + 1) % 7;
                       line.setOptions({ strokeColor: EDGE_TYPES[edge.type].color });
                   });
                   newEdges.push(edge);
               }

               // Recalculate area on edit
               ['set_at', 'insert_at', 'remove_at'].forEach(evt => {
                   window.google.maps.event.addListener(poly.getPath(), evt, () => {
                       const newArea = window.google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                       setSections(prev => prev.map(s => s.polygon === poly ? { ...s, area: Math.round(newArea) } : s));
                   });
               });

               const newSection = {
                   id: Date.now(),
                   polygon: poly,
                   area: Math.round(area),
                   pitch: 6, // Default 6/12
                   edges: newEdges
               };
               
               setSections(prev => [...prev, newSection]);
               setActiveSectionId(newSection.id);
               manager.setDrawingMode(null);
               toast.success("Section Added!");
            });
          } else {
              toast.error("Could not locate address");
          }
        });
      } catch (err) {
          console.error("Map init error:", err);
      }
    };
    
    // Check for Google Maps
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
           fillOpacity: 0.4, 
           strokeColor: '#16a34a', 
           strokeWeight: 2,
           map: mapInstance, 
           editable: true
        });
        
        const area = window.google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
        setQuickArea(Math.round(area));
        setSections([{ id: Date.now(), polygon: poly, area: Math.round(area), pitch: 6, edges: [] }]);
        
        // Listen for edits on the quick box too
        ['set_at', 'insert_at', 'remove_at'].forEach(evt => {
            window.google.maps.event.addListener(poly.getPath(), evt, () => {
                const newArea = window.google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                setQuickArea(Math.round(newArea));
                setSections(prev => prev.map(s => s.polygon === poly ? { ...s, area: Math.round(newArea) } : s));
            });
        });
    }
  };

  const startDetailed = () => {
    setStep('detailed');
    // Clear quick mode polygon if it exists, to start fresh or keep it? 
    // Usually detailed mode implies starting fresh or refining. 
    // Let's clear the marker to allow drawing.
    if (markerInstance) markerInstance.setMap(null);
    
    // If coming from Quick, we might have a green box. 
    // For detailed, we usually want to draw custom.
    // If sections exist (from quick), let's keep them but allow adding more.
    if (sections.length > 0) {
        sections.forEach(s => {
            s.polygon.setOptions({
                fillColor: '#3b82f6',
                strokeColor: '#2563eb'
            });
        });
    }
  };

  const updatePitch = (id, newPitch) => {
      setSections(prev => prev.map(s => s.id === id ? { ...s, pitch: newPitch } : s));
  };

  const deleteSection = (id) => {
      const section = sections.find(s => s.id === id);
      if (section) {
          section.polygon.setMap(null);
          if (section.edges) section.edges.forEach(e => e.lineInstance.setMap(null));
          setSections(prev => prev.filter(s => s.id !== id));
      }
  };

  const saveMeasurement = async () => {
      toast.loading("Saving Measurement...");
      
      const isQuick = step === 'quick';
      const finalArea = isQuick ? quickArea : sections.reduce((sum, s) => sum + (s.area * (PITCH_FACTORS[s.pitch] || 1)), 0);
      
      const payload = {
          property_address: lead.address_street,
          measurement_type: isQuick ? 'quick_estimate' : 'detailed_polygon',
          total_sqft: Math.round(sections.reduce((a, b) => a + b.area, 0)),
          total_adjusted_sqft: Math.round(finalArea),
          measurement_data: { 
              sections: sections.map(s => ({ pitch: s.pitch, area: s.area }))
          },
          lead_status: 'Quoted'
      };

      try {
          // 1. Save to Measurement Table
          await base44.entities.Measurement.create(payload);
          
          // 2. Update Lead
          await base44.entities.Lead.update(lead.id, { 
              roof_sqft: Math.round(finalArea), 
              lead_status: 'Quoted',
              price_sold: Math.round(finalArea * 4.5) 
          });

          // 3. Local Storage Sync
          if (lead.source === 'session' || lead.source === 'local') {
              const currentLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
              const idx = currentLeads.findIndex(l => l.id === lead.id);
              const updatedLead = { ...lead, roof_sqft: Math.round(finalArea), lead_status: 'Quoted' };
              
              if (idx !== -1) {
                  currentLeads[idx] = updatedLead;
                  localStorage.setItem('my_leads', JSON.stringify(currentLeads));
              } else if (lead.source === 'session') {
                  localStorage.setItem('my_leads', JSON.stringify([...currentLeads, updatedLead]));
              }
          }
          
          toast.dismiss();
          toast.success("Saved successfully!");
          setTimeout(() => navigate('/rooferdashboard'), 1000);
      } catch (err) {
          console.error(err);
          toast.dismiss();
          toast.error("Save failed - check console");
      }
  };

  const handleReset = () => {
      setStep('choice');
      setSections(prev => {
          prev.forEach(s => {
              s.polygon.setMap(null);
              if (s.edges) s.edges.forEach(e => e.lineInstance.setMap(null));
          });
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 relative">
        {/* HEADER */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur z-20 border-b flex items-center px-4 justify-between shadow-sm">
            <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2"/> Back
            </Button>
            <span className="font-bold text-slate-800 truncate px-4">{lead?.address_street}</span>
            <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2"/> Reset
            </Button>
        </div>

        {/* SIDEBAR (Only in Detailed Mode) */}
        {step === 'detailed' && (
            <div className="w-80 bg-white border-r z-10 mt-16 flex flex-col shadow-xl animate-in slide-in-from-left h-[calc(100vh-64px)]">
                <div className="p-4 border-b bg-blue-50">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2">
                        <PenTool className="w-4 h-4"/> Detailed Measurement
                    </h3>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        onClick={() => drawingManager?.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)}
                    >
                        <Plus className="w-4 h-4 mr-2"/> Draw Roof Section
                    </Button>
                    
                    {sections.length === 0 && (
                        <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-lg">
                            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                            <p className="text-sm">No sections yet</p>
                        </div>
                    )}

                    {sections.map((s, i) => (
                        <Card key={s.id} className="p-3 border-l-4 border-l-blue-500">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-sm">Section {i+1}</div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 -mt-1 -mr-1" onClick={() => deleteSection(s.id)}>
                                    <Trash2 className="w-3 h-3"/>
                                </Button>
                            </div>
                            <div className="text-xs text-slate-500 mb-3">{s.area.toLocaleString()} sq ft</div>
                            <Select 
                                value={s.pitch.toString()} 
                                onValueChange={v => updatePitch(s.id, Number(v))}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(p => (
                                        <SelectItem key={p} value={p.toString()}>{p}/12 Pitch</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Card>
                    ))}
                </div>
                <div className="p-4 border-t bg-slate-50">
                    <div className="mb-4 text-sm">
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-500">Flat Area:</span>
                            <span>{Math.round(sections.reduce((a,b)=>a+b.area, 0)).toLocaleString()} sq ft</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span className="text-slate-700">Adjusted:</span>
                            <span className="text-green-600">
                                {Math.round(sections.reduce((sum, s) => sum + (s.area * (PITCH_FACTORS[s.pitch] || 1)), 0)).toLocaleString()} sq ft
                            </span>
                        </div>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700 h-12" onClick={saveMeasurement}>
                        <Save className="w-4 h-4 mr-2"/> Save Record
                    </Button>
                </div>
            </div>
        )}

        {/* MAP LAYER */}
        <div className="flex-1 relative pt-16">
             <div ref={setMapNode} className="w-full h-full" />
        </div>

        {/* CHOICE OVERLAY */}
        {step === 'choice' && (
             <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center pt-16">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full p-4 animate-in zoom-in-95 duration-200">
                   <Card 
                        className="p-8 cursor-pointer hover:scale-105 transition-all bg-white border-green-500 border-b-4 shadow-2xl group" 
                        onClick={startQuick}
                   >
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                          <Zap className="w-10 h-10 text-green-600"/>
                      </div>
                      <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Quick Estimate</h2>
                      <p className="text-center text-slate-500">Instant AI Result. Best for speed.</p>
                   </Card>
                   <Card 
                        className="p-8 cursor-pointer hover:scale-105 transition-all bg-white border-blue-500 border-b-4 shadow-2xl group" 
                        onClick={startDetailed}
                   >
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                          <PenTool className="w-10 h-10 text-blue-600"/>
                      </div>
                      <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Detailed Measure</h2>
                      <p className="text-center text-slate-500">Manual Precision Mode. Best for contracts.</p>
                   </Card>
                </div>
             </div>
        )}

        {/* QUICK RESULT OVERLAY */}
        {step === 'quick' && (
             <Card className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 shadow-2xl z-30 border-t-4 border-green-500 animate-in slide-in-from-bottom-10">
                <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-slate-400 uppercase text-xs mb-2">AI Estimate</h3>
                    <p className="text-4xl font-bold text-green-600 mb-1">{quickArea.toLocaleString()}</p>
                    <p className="text-sm text-slate-400 mb-4">sq ft</p>
                    <div className="space-y-2">
                        <Button variant="outline" className="w-full text-blue-600" onClick={startDetailed}>
                            Switch to Detailed
                        </Button>
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={saveMeasurement}>
                            <Save className="w-4 h-4 mr-2"/> Save Estimate
                        </Button>
                    </div>
                </CardContent>
             </Card>
        )}
    </div>
  );
}