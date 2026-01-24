import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, Layers, ChevronDown, Loader2 } from 'lucide-react';
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
  // FIX: Check both casing formats
  const leadId = paramId || searchParams.get('leadId') || searchParams.get('leadid');
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  
  // Map State
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);

  // Complex Measurement State
  const [sections, setSections] = useState([]); // { id, polygon, pitch, area, edges: [] }
  const [activeSectionId, setActiveSectionId] = useState(null);

  // 1. ROBUST DATA LOADER
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
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        const { DrawingManager } = await window.google.maps.importLibrary("drawing");
        await window.google.maps.importLibrary("geometry");

        const geocoder = new Geocoder();
        geocoder.geocode({ address: lead.address_street || "Dallas, TX" }, (results, status) => {
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
               toast.success("Section Added! Click edges to label.");
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

  }, [mapNode, lead]); // Intentionally not dependent on mapInstance to avoid re-init

  // 3. HELPERS
  const updatePitch = (id, newPitch) => {
      setSections(prev => prev.map(s => s.id === id ? { ...s, pitch: newPitch } : s));
  };
  
  const deleteSection = (id) => {
      const section = sections.find(s => s.id === id);
      if (section) {
          section.polygon.setMap(null);
          section.edges.forEach(e => e.lineInstance.setMap(null));
          setSections(prev => prev.filter(s => s.id !== id));
      }
  };

  const getTotalAdjustedArea = () => {
      return sections.reduce((sum, s) => sum + (s.area * (PITCH_FACTORS[s.pitch] || 1)), 0);
  };

  const saveMeasurement = async () => {
      toast.loading("Saving Measurement Record...");
      const finalSqFt = Math.round(getTotalAdjustedArea());
      
      // Calculate Edge Totals
      const edgeTotals = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }; // Eave, Rake, etc.
      sections.forEach(s => s.edges.forEach(e => {
          if(edgeTotals[e.type] !== undefined) edgeTotals[e.type] += e.length;
      }));

      // Create Measurement Entity Payload
      const payload = {
          company_id: lead.assigned_company_id, // If available
          property_address: lead.address_street,
          measurement_type: 'detailed_polygon',
          total_sqft: Math.round(sections.reduce((a, b) => a + b.area, 0)),
          total_adjusted_sqft: finalSqFt,
          eaves_ft: Math.round(edgeTotals[1]),
          rakes_ft: Math.round(edgeTotals[2]),
          ridges_ft: Math.round(edgeTotals[3]),
          hips_ft: Math.round(edgeTotals[4]),
          valleys_ft: Math.round(edgeTotals[5]),
          measurement_data: { 
              sections: sections.map(s => ({ pitch: s.pitch, area: s.area })),
              edges: sections.flatMap(s => s.edges.map(e => ({ type: e.type, length: e.length })))
          },
          lead_status: 'quoted'
      };

      try {
          // 1. Save to Measurement Table
          await base44.entities.Measurement.create(payload);
          
          // 2. Update Lead
          await base44.entities.Lead.update(lead.id, { 
              roof_sqft: finalSqFt, 
              lead_status: 'Quoted',
              price_sold: Math.round(finalSqFt * 4.5) // Using price_sold as value placeholder based on previous logic
          });

          // 3. Local Storage Sync (If needed)
          if (lead.source === 'session' || lead.source === 'local') {
              const currentLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
              const idx = currentLeads.findIndex(l => l.id === lead.id);
              const updatedLead = { ...lead, roof_sqft: finalSqFt, lead_status: 'Quoted' };
              
              if (idx !== -1) {
                  currentLeads[idx] = updatedLead;
                  localStorage.setItem('my_leads', JSON.stringify(currentLeads));
              } else if (lead.source === 'session') {
                  localStorage.setItem('my_leads', JSON.stringify([...currentLeads, updatedLead]));
              }
          }
          
          toast.dismiss();
          toast.success("Measurement Record Created!");
          setTimeout(() => navigate('/roofer-dashboard'), 1000);
      } catch (err) {
          console.error(err);
          toast.dismiss();
          toast.error("Save failed - check console");
      }
  };

  // 4. RENDER
  if (loading) return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
        {/* SIDEBAR */}
        <div className="w-96 flex flex-col bg-white border-r shadow-xl z-20">
            {/* Header */}
            <div className="p-4 border-b bg-slate-50">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="font-bold text-slate-800 truncate" title={lead?.address_street}>
                    {lead?.address_street || "Measurement Tool"}
                </h1>
            </div>

            {/* Scrollable Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" 
                    onClick={() => drawingManager?.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)}
                >
                    <Plus className="w-4 h-4 mr-2"/> Add Roof Section
                </Button>
                
                {sections.length === 0 && (
                    <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-xl">
                        <Layers className="w-10 h-10 mx-auto mb-2 opacity-50"/>
                        <p>No sections drawn</p>
                    </div>
                )}

                {sections.map((s, idx) => (
                    <Card 
                        key={s.id} 
                        className={`border-2 cursor-pointer transition-all ${activeSectionId === s.id ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-slate-200'}`} 
                        onClick={() => setActiveSectionId(s.id)}
                    >
                        <CardContent className="p-3">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-sm flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"/>
                                    Section {idx + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-slate-500">{s.area} sq ft</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); deleteSection(s.id); }}>
                                        <Trash2 className="w-3 h-3"/>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded">
                                <span className="text-xs font-bold text-slate-500 uppercase">Pitch:</span>
                                <Select value={s.pitch.toString()} onValueChange={(v) => updatePitch(s.id, Number(v))}>
                                    <SelectTrigger className="h-8 text-xs border-none bg-transparent shadow-none focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(p => (
                                            <SelectItem key={p} value={p.toString()}>{p}/12</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Footer Summary */}
            <div className="p-4 border-t bg-slate-50 space-y-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <div className="space-y-1">
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Flat Area:</span>
                        <span>{Math.round(sections.reduce((a,b)=>a+b.area, 0)).toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-slate-800">
                        <span>Adjusted Total:</span>
                        <span className="text-green-600">{Math.round(getTotalAdjustedArea()).toLocaleString()} sq ft</span>
                    </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold shadow-lg shadow-green-200" onClick={saveMeasurement}>
                    <Save className="w-5 h-5 mr-2"/> Finish & Save
                </Button>
            </div>
        </div>

        {/* MAP AREA */}
        <div className="flex-1 relative bg-slate-200">
             <div ref={setMapNode} className="w-full h-full" />
        </div>
    </div>
  );
}