import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Zap, PenTool, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Pitch Multipliers
const PITCH_FACTORS = { 0: 1.0, 1: 1.0035, 2: 1.0138, 3: 1.0308, 4: 1.0541, 5: 1.0833, 6: 1.1180, 7: 1.1577, 8: 1.2019, 9: 1.2500, 10: 1.3017, 11: 1.3566, 12: 1.4142 };

// Edge Types for Classification
const EDGE_TYPES = {
  0: { name: 'Unassigned', color: '#94a3b8' }, // Gray
  1: { name: 'Eave', color: '#3b82f6' }, // Blue
  2: { name: 'Rake', color: '#22c55e' }, // Green
  3: { name: 'Ridge', color: '#ef4444' }, // Red
  4: { name: 'Hip', color: '#f97316' }, // Orange
  5: { name: 'Valley', color: '#a855f7' }, // Purple
  6: { name: 'Wall', color: '#eab308' }, // Yellow
};

export default function RooferMeasurement() {
  const { leadId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = paramId || searchParams.get('leadId') || searchParams.get('leadid');
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState('choice');
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);

  // Pro Data
  const [sections, setSections] = useState([]); // { id, area, pitch, edges: [] }
  const [quickArea, setQuickArea] = useState(0);

  // 1. DATA LOADER (Robust)
  useEffect(() => {
    const load = async () => {
      try {
        const targetId = leadId?.replace(/"/g, '');
        const sId = sessionStorage.getItem('active_lead_id')?.replace(/"/g, '');
        const sAddr = sessionStorage.getItem('lead_address')?.replace(/"/g, '');

        if (targetId && sId === targetId && sAddr) {
          setLead({ id: targetId, address_street: sAddr, source: 'session' });
          setLoading(false);
          return;
        }

        const local = [...JSON.parse(localStorage.getItem('my_leads') || '[]'), ...JSON.parse(localStorage.getItem('jobs') || '[]')];
        const target = local.find(l => l.id === targetId);

        if (target) { setLead(target); }
        else {
          const api = await base44.entities.Lead.get(targetId).catch(() => null);
          if (api) setLead(api);
          else setLead({ address_street: "5103 Lincolnshire Ct, Dallas, TX", id: 'demo' });
        }
      } catch (e) { setLead({ address_street: "5103 Lincolnshire Ct, Dallas, TX", id: 'demo' }); }
      finally { setLoading(false); }
    };
    if (leadId) load(); else setLoading(false);
  }, [leadId]);

  // 2. MAP INIT
  useEffect(() => {
    if (!mapNode || !lead || mapInstance) return;
    const init = async () => {
      const { Map } = await google.maps.importLibrary("maps");
      const { Marker } = await google.maps.importLibrary("marker");
      const { Geocoder } = await google.maps.importLibrary("geocoding");
      await google.maps.importLibrary("drawing");
      await google.maps.importLibrary("geometry");

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
            polygonOptions: { fillColor: '#3b82f6', fillOpacity: 0.3, strokeColor: '#2563eb', strokeWeight: 2, editable: true }
          });
          manager.setMap(map);
          setDrawingManager(manager);
          // ON POLYGON COMPLETE: GENERATE EDGES
          google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
            const path = poly.getPath().getArray();
            const area = google.maps.geometry.spherical.computeArea(path) * 10.764;

            // Break into lines (Edges)
            const newEdges = [];
            for (let i = 0; i < path.length; i++) {
              const start = path[i];
              const end = path[(i + 1) % path.length];
              const len = google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084;

              const line = new google.maps.Polyline({
                path: [start, end], strokeColor: EDGE_TYPES[0].color, strokeWeight: 6, map: map, zIndex: 100
              });

              // Click to Change Type (Blue -> Green -> Red...)
              const edgeData = { id: Date.now() + i, type: 0, length: len, lineInstance: line };
              line.addListener("click", () => {
                edgeData.type = (edgeData.type + 1) % 7;
                line.setOptions({ strokeColor: EDGE_TYPES[edgeData.type].color });
              });
              newEdges.push(edgeData);
            }
            setSections(p => [...p, { id: Date.now(), area: Math.round(area), pitch: 6, edges: newEdges }]);
            manager.setDrawingMode(null);
            toast.success("Section Added! Click lines to color-code them.");
          });
        }
      });
    };
    init();
  }, [mapNode, lead]);

  // 3. ACTIONS
  const startQuick = () => {
    setStep('quick');
    if (markerInstance && mapInstance) {
      const center = markerInstance.getPosition();
      const box = [
        { lat: center.lat() + 0.00015, lng: center.lng() - 0.0002 },
        { lat: center.lat() + 0.00015, lng: center.lng() + 0.0002 },
        { lat: center.lat() - 0.00015, lng: center.lng() + 0.0002 },
        { lat: center.lat() - 0.00015, lng: center.lng() - 0.0002 },
      ];
      const poly = new google.maps.Polygon({ paths: box, fillColor: '#22c55e', strokeColor: '#16a34a', map: mapInstance });
      const area = google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
      setQuickArea(Math.round(area));
    }
  };

  // 4. SAVE TO DB (The New Logic)
  const saveMeasurement = async () => {
    toast.loading("Saving to Database...");

    // Calculate Totals
    let totalFlat = 0;
    let totalAdjusted = 0;
    const linearTotals = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    sections.forEach(sec => {
      totalFlat += sec.area;
      totalAdjusted += (sec.area * PITCH_FACTORS[sec.pitch]);
      sec.edges.forEach(e => {
        if (linearTotals[e.type] !== undefined) linearTotals[e.type] += e.length;
      });
    });
    
    // Fallback for quick area mode
    if (step === 'quick' && sections.length === 0) {
      totalFlat = quickArea;
      totalAdjusted = quickArea * PITCH_FACTORS[6]; // assume 6/12 pitch for quick
    }
    
    const payload = {
      lead_id: lead.id === 'demo' ? null : lead.id,
      property_address: lead.address_street,
      total_sqft: Math.round(totalFlat),
      total_squares: parseFloat((totalAdjusted / 100).toFixed(2)),
      pitch_primary: sections[0]?.pitch || 6,
      
      // Linear Ft
      eaves_ft: Math.round(linearTotals[1]),
      rakes_ft: Math.round(linearTotals[2]),
      ridges_ft: Math.round(linearTotals[3]),
      hips_ft: Math.round(linearTotals[4]),
      valleys_ft: Math.round(linearTotals[5]),
      walls_ft: Math.round(linearTotals[6]),

      sections_data: sections.map(s => ({ 
          id: s.id.toString(), 
          pitch: s.pitch, 
          area: s.area,
          // Don't save full edge objects to keep payload light
          edge_counts: s.edges.reduce((acc, e) => {
              acc[e.type] = (acc[e.type] || 0) + 1;
              return acc;
          }, {})
      })),
      status: 'Complete'
    };
    
    try {
      if (lead.id !== 'demo') {
        await base44.entities.RoofMeasurement.create(payload);
        // Only update lead status if it's a real lead entity
        try {
            await base44.entities.Lead.update(lead.id, {
                lead_status: 'Contacted', // Mapping to valid enum: New, Unpurchased, Assigned, Contacted, Sold, Closed
            });
        } catch (updateErr) {
            console.warn("Could not update lead status (might not be allowed or incorrect ID)", updateErr);
        }
      }
      toast.success("Measurement Record Created!");
      setTimeout(() => navigate('/rooferdashboard'), 1000);
    } catch (err) {
      console.error("Save Failed", err);
      toast.error("Could not save to DB (Check Console)");
    }
  };

  // 5. RENDER
  return (
    <div className="h-screen flex flex-col relative bg-slate-100 overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-white z-30 flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
                <h1 className="font-bold text-lg">Measurement Tool</h1>
            </div>
        </div>

        <div className="flex flex-1 h-full">
          {/* SIDEBAR (Pro Tool) */}
          {step === 'detailed' && (
            <div className="w-80 bg-white border-r z-10 mt-16 flex flex-col shadow-xl animate-in slide-in-from-left h-[calc(100vh-64px)]">
              <div className="p-4 border-b bg-blue-50">
                <h3 className="font-bold text-blue-900">Pro Measurement</h3>
                <p className="text-xs text-blue-600 mt-1">Draw shape, then click lines to color.</p>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 text-[10px]">
                {Object.entries(EDGE_TYPES).slice(1).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: v.color }} />{v.name}</div>
                ))}
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <Button className="w-full bg-blue-600" onClick={() => drawingManager?.setDrawingMode('polygon')}><Plus className="w-4 h-4 mr-2" /> Draw Section</Button>
                {sections.map((s, i) => (
                  <Card key={s.id} className="p-3 border-l-4 border-blue-500">
                    <div className="font-bold text-sm mb-2">Section {i + 1} ({s.area} sq ft)</div>
                    <Select value={s.pitch.toString()} onValueChange={v => {
                      setSections(prev => prev.map(sec => sec.id === s.id ? { ...sec, pitch: Number(v) } : sec));
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[0, 4, 5, 6, 7, 8, 9, 10, 12].map(p => <SelectItem key={p} value={p.toString()}>{p}/12 Pitch</SelectItem>)}</SelectContent>
                    </Select>
                  </Card>
                ))}
              </div>
              <div className="p-4 border-t">
                <Button className="w-full bg-green-600" onClick={saveMeasurement}><Save className="w-4 h-4 mr-2" /> Finish & Save</Button>
              </div>
            </div>
          )}

          {/* MAP LAYER */}
          <div className="flex-1 relative pt-16 h-full">
                <div ref={setMapNode} className="w-full h-full" />
          </div>
        </div>

      {step === 'choice' && !loading && (
        <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center pt-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full p-4">
            <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white border-green-500 border-b-4" onClick={startQuick}>
              <Zap className="w-12 h-12 text-green-600 mb-4 mx-auto" />
              <h2 className="text-2xl font-bold text-center">Quick Estimate</h2>
            </Card>
            <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white border-blue-500 border-b-4" onClick={() => { setStep('detailed'); markerInstance?.setMap(null); }}>
              <PenTool className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
              <h2 className="text-2xl font-bold text-center">Pro Measure</h2>
            </Card>
          </div>
        </div>
      )}
      
      {step === 'quick' && (
        <Card className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 shadow-2xl z-30 border-t-4 border-green-500">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-green-600">{quickArea.toLocaleString()} sq ft</p>
            <Button variant="link" onClick={() => { setStep('detailed'); markerInstance?.setMap(null); }}>Switch to Pro</Button>
            <Button className="w-full mt-2 bg-green-600" onClick={saveMeasurement}>Save</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}