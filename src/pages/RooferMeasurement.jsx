import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Zap, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PITCH_FACTORS = { 0: 1.0, 1: 1.0035, 2: 1.0138, 3: 1.0308, 4: 1.0541, 5: 1.0833, 6: 1.1180, 7: 1.1577, 8: 1.2019, 9: 1.2500, 10: 1.3017, 11: 1.3566, 12: 1.4142 };

const EDGE_TYPES = { 0: { name: 'Unassigned', color: '#94a3b8' }, 1: { name: 'Eave', color: '#3b82f6' }, 2: { name: 'Rake', color: '#22c55e' }, 3: { name: 'Ridge', color: '#ef4444' }, 4: { name: 'Hip', color: '#f97316' }, 5: { name: 'Valley', color: '#a855f7' }, 6: { name: 'Wall', color: '#eab308' }, };

export default function RooferMeasurement() {
  const { leadId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = paramId || searchParams.get('leadId') || searchParams.get('leadid');
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

  // 1. DATA LOADER
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
        if (target) setLead(target);
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
          const marker = new Marker({ position: results[0].geometry.location, map: map });
          setMarkerInstance(marker);
          const manager = new google.maps.drawing.DrawingManager({
            drawingMode: null,
            drawingControl: false,
            polygonOptions: { fillColor: '#3b82f6', fillOpacity: 0.3, strokeColor: '#2563eb', strokeWeight: 2, editable: true }
          });
          manager.setMap(map);
          setDrawingManager(manager);
          google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
            const area = google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
            const newEdges = [];
            const path = poly.getPath().getArray();
            for (let i = 0; i < path.length; i++) {
              const start = path[i];
              const end = path[(i + 1) % path.length];
              const len = google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084;
              const line = new google.maps.Polyline({
                path: [start, end], strokeColor: EDGE_TYPES[0].color, strokeWeight: 8, map: map, zIndex: 1000
              });
              const edgeData = { id: Date.now() + i, type: 0, length: len, lineInstance: line };
              line.addListener("click", () => {
                edgeData.type = (edgeData.type + 1) % 7;
                line.setOptions({ strokeColor: EDGE_TYPES[edgeData.type].color });
              });
              newEdges.push(edgeData);
            }
            setSections(p => [...p, { id: Date.now(), area: Math.round(area), pitch: 6, edges: newEdges }]);
            manager.setDrawingMode(null);
          });
        }
      });
    };
    init();
  }, [mapNode, lead]);

  // 3. HELPERS
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

  // 4. SAVE WITH UPSERT LOGIC
  const saveMeasurement = async () => {
    toast.loading("Processing...");

    // Calculate
    let totalFlat = 0, totalAdjusted = 0;
    const linear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    sections.forEach(s => {
      totalFlat += s.area;
      totalAdjusted += (s.area * PITCH_FACTORS[s.pitch]);
      s.edges.forEach(e => { if (linear[e.type] !== undefined) linear[e.type] += e.length; });
    });

    // Fallback for quick area
    if (step === 'quick' && sections.length === 0) {
      totalFlat = quickArea;
      totalAdjusted = quickArea * PITCH_FACTORS[6];
    }

    try {
      let dbLeadId = lead.id;

      // A. PROMOTE SESSION LEAD TO DATABASE
      if (lead.source === 'session' || lead.source === 'local' || lead.id.length < 10) {
        try {
          // Try checking if it exists first
          await base44.entities.Lead.get(dbLeadId);
        } catch (e) {
          // Create if missing
          console.log("Creating new lead record...");
          // MAPPING TO LEAD ENTITY SCHEMA (name, email, phone, address)
          const newLead = await base44.entities.Lead.create({
            address: lead.address_street || "Unknown Address",
            lead_status: 'New',
            name: lead.customer_name || "New Customer",
            email: lead.customer_email || "pending@aroof.build",
            phone: lead.customer_phone || "(555) 000-0000"
          });
          dbLeadId = newLead.id;
        }
      }

      // B. CREATE MEASUREMENT RECORD
      const payload = {
        lead_id: dbLeadId,
        total_sqft: Math.round(totalFlat),
        total_squares: parseFloat((totalAdjusted / 100).toFixed(2)),
        pitch_primary: sections[0]?.pitch || 6,
        eaves_ft: Math.round(linear[1]),
        rakes_ft: Math.round(linear[2]),
        ridges_ft: Math.round(linear[3]),
        hips_ft: Math.round(linear[4]),
        valleys_ft: Math.round(linear[5]),
        walls_ft: Math.round(linear[6]),
        status: 'Complete',
        sections_data: sections.map(s => ({ 
            id: s.id.toString(), 
            pitch: s.pitch, 
            area: s.area
        }))
      };
      
      await base44.entities.RoofMeasurement.create(payload);

      // C. UPDATE LEAD STATUS
      try {
          await base44.entities.Lead.update(dbLeadId, { lead_status: 'Contacted' }); 
      } catch (ex) { console.log("Lead update skipped", ex); }
      
      toast.dismiss();
      toast.success("Success! Lead & Measurement Saved.");
      setTimeout(() => navigate('/rooferdashboard'), 1000);
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Error saving data. Check console.");
    }
  };

  // 5. RENDER
  return (
    <div className="h-screen flex flex-col relative bg-slate-100 overflow-hidden">
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white z-30 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="font-bold text-lg">Measurement Tool</h1>
        </div>
      </div>

      <div className="flex flex-1 h-full">
        {step === 'detailed' && (
            <div className="w-80 bg-white border-r z-10 mt-16 flex flex-col shadow-xl animate-in slide-in-from-left h-[calc(100vh-64px)]">
            <div className="p-4 border-b bg-blue-50">
                <h3 className="font-bold text-blue-900">Pro Measurement</h3>
                <p className="text-xs text-blue-600 mt-1">Draw shape, click lines to color.</p>
            </div>

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
        
        <div className="flex-1 relative pt-16 h-full"><div ref={setMapNode} className="w-full h-full" /></div>
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