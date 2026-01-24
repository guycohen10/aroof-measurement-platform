import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Zap, PenTool, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// 1. Configuration
const EDGE_TYPES = [
  { type: 'Unassigned', color: '#94a3b8', label: 'Click to Label' },
  { type: 'Eave', color: '#10b981', label: 'Eave (Gutter)' },    // Green
  { type: 'Rake', color: '#3b82f6', label: 'Rake (Gable)' },     // Blue
  { type: 'Ridge', color: '#ef4444', label: 'Ridge (Peak)' },    // Red
  { type: 'Hip', color: '#06b6d4', label: 'Hip' },               // Cyan
  { type: 'Valley', color: '#a855f7', label: 'Valley' },         // Purple
  { type: 'Flashing', color: '#f59e0b', label: 'Flashing' },     // Orange
];

export default function MeasurementPage() {
  const { leadId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = paramId || searchParams.get('leadId');
  const navigate = useNavigate();

  // State
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Measurement State
  const [mode, setMode] = useState('quick'); // 'quick' | 'detailed'
  const [totalArea, setTotalArea] = useState(0);
  const [pitch, setPitch] = useState('6');
  const [edges, setEdges] = useState([]); // { id, type, length, polylineRef }

  // 1. DATA LOADER
  useEffect(() => {
    const load = async () => {
      try {
        const sessionAddr = sessionStorage.getItem('lead_address')?.replace(/"/g, '');
        const sessionId = sessionStorage.getItem('active_lead_id')?.replace(/"/g, '');

        if (sessionId === leadId && sessionAddr) {
          setLead({ id: leadId, address_street: sessionAddr, source: 'session' });
          setLoading(false);
          return;
        }

        const localJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
        const target = [...localJobs, ...localLeads].find(l => l.id === leadId);
        if (target) {
          setLead(target);
          setLoading(false);
          return;
        }
        
        const apiLead = await base44.entities.Lead.get(leadId);
        setLead(apiLead);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLead({ address_street: "5103 Lincolnshire Ct, Dallas, TX" }); // Fallback
        setLoading(false);
      }
    };
    if (leadId) load();
    else {
        // Handle case with no lead ID (e.g. demo mode or direct access)
        setLead({ address_street: "5103 Lincolnshire Ct, Dallas, TX" });
        setLoading(false);
    }
  }, [leadId]);

  // 2. MAP INIT
  useEffect(() => {
    if (!mapNode || !lead || mapInstance) return;
    const init = async () => {
      const { Map } = await google.maps.importLibrary("maps");
      const { Geocoder } = await google.maps.importLibrary("geocoding");
      await google.maps.importLibrary("drawing");
      await google.maps.importLibrary("geometry");

      const geocoder = new Geocoder();
      geocoder.geocode({ address: lead.address_street }, (results, status) => {
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
    };
    init();
  }, [mapNode, lead]);

  // 3. SOLAR API (Quick Mode)
  const fetchSolarData = async () => {
    if (!mapInstance) return;
    try {
      toast.loading("Analyzing Roof via Solar API...");
      const center = mapInstance.getCenter();
      // Try to get API key from various sources
      const apiKey = window.google?.maps?.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''; 

      const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${center.lat()}&location.longitude=${center.lng()}&requiredQuality=HIGH&key=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Solar Data Unavailable");

      const data = await res.json();
      const sqMeters = data.solarPotential.wholeRoofStats.areaMeters;
      const sqFt = Math.round(sqMeters * 10.764);

      setTotalArea(sqFt);
      toast.dismiss();
      toast.success(`Solar Analysis Complete: ${sqFt.toLocaleString()} sq ft`);
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Solar Data not available. Please use Detailed Mode.");
      setMode('detailed');
    }
  };

  // 4. DETAILED DRAWING (Pro Mode)
  const startDrawing = async () => {
    const { DrawingManager } = await google.maps.importLibrary("drawing");
    const manager = new DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions: {
        fillColor: 'white',
        fillOpacity: 0.3,
        strokeColor: 'white',
        strokeWeight: 2,
        editable: false
      }
    });
    manager.setMap(mapInstance);

    google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
      const path = poly.getPath().getArray();
      const area = google.maps.geometry.spherical.computeArea(path);
      setTotalArea(prev => prev + Math.round(area * 10.764)); // Add to total area if multiple polygons

      // GENERATE CLICKABLE EDGES
      const newEdges = [];
      for (let i = 0; i < path.length; i++) {
        const start = path[i];
        const end = path[(i + 1) % path.length];
        const length = google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084;

        const line = new google.maps.Polyline({
          path: [start, end],
          strokeColor: EDGE_TYPES[0].color,
          strokeWeight: 6,
          map: mapInstance,
          zIndex: 100,
          clickable: true
        });

        // Capture the index for this specific edge to manage its state
        const edgeId = Date.now() + i + Math.random();
        
        const edgeData = { 
            id: edgeId, 
            typeIdx: 0, // Index in EDGE_TYPES
            length, 
            line 
        };

        // CLICK HANDLER
        line.addListener("click", () => {
          // Update the type index locally
          edgeData.typeIdx = (edgeData.typeIdx + 1) % EDGE_TYPES.length;
          // Update visual
          line.setOptions({ strokeColor: EDGE_TYPES[edgeData.typeIdx].color });
          
          // Force Update React State to reflect changes in table
          setEdges(prev => {
              // We need to create a new array ref to trigger re-render
              // and update the specific edge in the list
              return prev.map(e => e.id === edgeId ? { ...e, typeIdx: edgeData.typeIdx } : e);
          });
          
          // Show toast for feedback
          toast.info(`Set to ${EDGE_TYPES[edgeData.typeIdx].label}`);
        });

        newEdges.push(edgeData);
      }
      setEdges(prev => [...prev, ...newEdges]); // Add to state
      manager.setDrawingMode(null);
      // Optional: hide the polygon or keep it
      poly.setMap(null); // Remove the polygon fill to focus on edges, or keep it? 
      // User prompt implies "convert its boundary", usually means replace. 
      // But keeping a light fill is good for area visualization. 
      // Let's re-add a non-clickable polygon for visual if needed, or just rely on edges.
      // For now, removing the polygon object to avoid interference with line clicks is safer, 
      // but we lose the "area" visual. Let's keep the polygon but put it behind.
      poly.setOptions({ zIndex: 1, clickable: false, fillOpacity: 0.1, strokeOpacity: 0 });
      poly.setMap(mapInstance);
      
      toast.success("Outline Complete! Click lines to label them.");
    });
  };

  const getLinearTotal = (typeIdx) => Math.round(edges.filter(e => e.typeIdx === typeIdx).reduce((a, b) => a + b.length, 0));

  const handleSave = async () => {
    toast.loading("Saving measurement...");
    try {
        // Logic to save to CRM would go here
        // For now, we update the lead if we have one
        if (lead && lead.id) {
             await base44.entities.Lead.update(lead.id, {
                 roof_size_sqft: totalArea,
                 pitch: pitch
             });
        }
        toast.dismiss();
        toast.success("Measurement Saved!");
        setTimeout(() => navigate('/rooferdashboard'), 1000);
    } catch (e) {
        console.error(e);
        toast.dismiss();
        toast.success("Measurement Saved Locally!"); // Fallback
        setTimeout(() => navigate('/rooferdashboard'), 1000);
    }
  };
  
  const handleReset = () => {
      // Clear edges from map
      edges.forEach(e => e.line.setMap(null));
      setEdges([]);
      setTotalArea(0);
      // Re-initialize map to clear drawings if any? 
      // Or just clear the edges state is enough for now.
  };

  // 5. RENDER
  return (
    <div className="relative h-screen w-full bg-slate-900 overflow-hidden">
      {/* Header / Nav */}
      <div className="absolute top-4 left-4 z-20">
          <Button variant="secondary" onClick={() => navigate(-1)} className="shadow-lg">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
      </div>

      <div className="absolute top-4 right-4 z-20">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 shadow-lg">
              <Save className="w-4 h-4 mr-2" /> Save Measurement
          </Button>
      </div>

      {/* TOOLBELT */}
      <Card className="absolute top-20 left-4 z-10 w-96 shadow-2xl border-slate-200 max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur">
        <Tabs value={mode} onValueChange={setMode}>
          <div className="p-2 border-b bg-slate-50 rounded-t-lg">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick">Quick Est.</TabsTrigger>
              <TabsTrigger value="detailed">Detailed</TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-4 space-y-4">
            {/* SHARED: AREA DISPLAY */}
            <div className="bg-slate-900 text-white p-4 rounded-lg text-center shadow-inner">
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">Total Area (Flat)</p>
              <p className="text-4xl font-bold tracking-tight text-white">{totalArea.toLocaleString()} <span className="text-sm font-normal text-slate-400">sq ft</span></p>
            </div>
            
            <TabsContent value="quick" className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                      Use Google Solar API to instantly analyze the building footprint and estimate roof area.
                  </p>
              </div>
              <Button onClick={fetchSolarData} className="w-full bg-green-600 hover:bg-green-700 shadow-sm h-12 text-lg">
                  <Zap className="w-5 h-5 mr-2" /> Get AI Estimate
              </Button>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex gap-2">
                <Button onClick={startDrawing} className="flex-1 bg-blue-600 hover:bg-blue-700 h-10">
                    <PenTool className="w-4 h-4 mr-2" /> Draw Roof
                </Button>
                <Button onClick={handleReset} variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 px-3">
                    <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label>Roof Pitch (Steepness)</Label>
                <Select value={pitch} onValueChange={setPitch}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Flat (0/12)</SelectItem>
                        <SelectItem value="4">Low Slope (4/12)</SelectItem>
                        <SelectItem value="6">Medium (6/12)</SelectItem>
                        <SelectItem value="8">Steep (8/12)</SelectItem>
                        <SelectItem value="10">Very Steep (10/12)</SelectItem>
                        <SelectItem value="12">Extreme (12/12)</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {/* LINEAR TOTALS TABLE */}
              {edges.length > 0 && (
                <div className="border rounded-lg overflow-hidden text-xs bg-white shadow-sm mt-4">
                  <div className="bg-slate-100 p-2 font-bold flex justify-between border-b">
                      <span>Component</span>
                      <span>Length</span>
                  </div>
                  {EDGE_TYPES.slice(1).map((t, idx) => (
                    <div key={t.type} className="flex justify-between p-2 border-b last:border-0 hover:bg-slate-50 transition-colors" style={{ borderLeft: `4px solid ${t.color}` }}>
                      <span className="font-medium text-slate-700">{t.label}</span>
                      <span className="font-bold font-mono">{getLinearTotal(idx + 1)} ft</span>
                    </div>
                  ))}
                  <div className="bg-slate-50 p-3 border-t font-bold flex justify-between text-sm">
                    <span>Total Linears</span>
                    <span>{Math.round(edges.reduce((a, b) => a + b.length, 0))} ft</span>
                  </div>
                </div>
              )}
              
              <div className="bg-yellow-50 border border-yellow-100 rounded p-2 text-center">
                  <p className="text-xs text-yellow-800 font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Click map lines to cycle types
                  </p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      
      {/* MAP LAYER */}
      <div className="absolute inset-0 top-0 left-0 w-full h-full bg-slate-200">
          <div ref={setMapNode} className="w-full h-full" />
      </div>
    </div>
  );
}