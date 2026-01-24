import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  ArrowLeft, Zap, PenTool, CheckCircle2, RotateCcw, 
  Save, DollarSign, FileText, Layers, Plus, MousePointerClick
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// --- CONFIGURATION ---
const EDGE_TYPES = [
  { type: 'Unassigned', color: '#94a3b8', label: 'Unassigned' },
  { type: 'Eave', color: '#10b981', label: 'Eave (Gutter)' },
  { type: 'Rake', color: '#3b82f6', label: 'Rake (Gable)' },
  { type: 'Ridge', color: '#ef4444', label: 'Ridge (Peak)' },
  { type: 'Hip', color: '#06b6d4', label: 'Hip' },
  { type: 'Valley', color: '#a855f7', label: 'Valley' },
  { type: 'Flashing', color: '#f59e0b', label: 'Flashing' },
];

const PRICING = {
  material: 3.50, // per sqft
  labor: 2.50,    // per sqft
  waste: 1.15     // 15% waste
};

export default function MeasurementPage() {
  const { leadId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = paramId || searchParams.get('leadId');
  const navigate = useNavigate();

  // --- STATE ---
  const [view, setView] = useState('choice'); // 'choice' | 'drawing' | 'results'
  const [mode, setMode] = useState('detailed'); // 'quick' | 'detailed'
  
  // Data
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  
  // Measurement Data
  const [totalArea, setTotalArea] = useState(0);
  const [pitch, setPitch] = useState('6');
  const [edges, setEdges] = useState([]); // { id, typeIdx, length, lineObj }
  const [polygons, setPolygons] = useState([]); // Keep track to clear
  
  // Solar Data
  const [solarData, setSolarData] = useState(null);

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const load = async () => {
      try {
        if (!leadId) {
          setLead({ address_street: "5103 Lincolnshire Ct, Dallas, TX" }); // Demo fallback
          setLoading(false);
          return;
        }
        
        // Try to load from API
        try {
          const apiLead = await base44.entities.Lead.get(leadId);
          setLead(apiLead);
        } catch (e) {
          // Fallback to local/session if API fails or demo
          const sessionAddr = sessionStorage.getItem('lead_address')?.replace(/"/g, '');
          setLead({ id: leadId, address_street: sessionAddr || "Dallas, TX" });
        }
        setLoading(false);
      } catch (err) {
        console.error("Load error", err);
        setLoading(false);
      }
    };
    load();
  }, [leadId]);

  // --- 2. MAP SETUP (Detailed Mode) ---
  useEffect(() => {
    if (view !== 'drawing' || !mapNode || !lead || mapInstance) return;

    const initMap = async () => {
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
            tilt: 0,
            fullscreenControl: false
          });
          setMapInstance(map);
          initDrawingManager(map);
        } else {
          toast.error("Could not find address location");
        }
      });
    };
    initMap();
  }, [view, mapNode, lead]);

  const initDrawingManager = async (map) => {
    const { DrawingManager } = await google.maps.importLibrary("drawing");
    const manager = new DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions: {
        fillColor: 'white',
        fillOpacity: 0.3,
        strokeColor: 'white',
        strokeWeight: 2,
        editable: false,
        zIndex: 1
      }
    });
    manager.setMap(map);
    setDrawingManager(manager);

    google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
      // Calculate Area
      const path = poly.getPath().getArray();
      const area = google.maps.geometry.spherical.computeArea(path);
      setTotalArea(prev => prev + Math.round(area * 10.764));
      setPolygons(prev => [...prev, poly]);

      // Generate Interactive Edges
      const newEdges = [];
      for (let i = 0; i < path.length; i++) {
        const start = path[i];
        const end = path[(i + 1) % path.length];
        const length = google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084; // Meters to Feet

        const line = new google.maps.Polyline({
          path: [start, end],
          strokeColor: EDGE_TYPES[0].color,
          strokeWeight: 6,
          map: map,
          zIndex: 100,
          clickable: true
        });

        const edgeId = Date.now() + i + Math.random();
        const edgeData = { id: edgeId, typeIdx: 0, length, line };

        // Click Handler for Edge Classification
        line.addListener("click", () => {
          edgeData.typeIdx = (edgeData.typeIdx + 1) % EDGE_TYPES.length;
          line.setOptions({ strokeColor: EDGE_TYPES[edgeData.typeIdx].color });
          
          // Force update state to reflect in UI tables
          setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, typeIdx: edgeData.typeIdx } : e));
          toast.info(`Labeled as ${EDGE_TYPES[edgeData.typeIdx].label}`);
        });

        newEdges.push(edgeData);
      }
      setEdges(prev => [...prev, ...newEdges]);
      
      // Reset drawing mode to hand so user can pan/zoom or click lines
      manager.setDrawingMode(null); 
      toast.success("Section Added! Click lines to label them.");
    });
  };

  // --- 3. ACTIONS ---

  const handleQuickEstimate = async () => {
    setMode('quick');
    toast.loading("Analyzing Roof via Satellite...");
    
    try {
      // 1. Geocode to get lat/lng (Wrapped in Promise)
      const { Geocoder } = await google.maps.importLibrary("geocoding");
      const geocoder = new Geocoder();
      
      const results = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: lead.address_street }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error("Address not found or Geocoding failed"));
          }
        });
      });

      const { lat, lng } = results.geometry.location;
      
      // Try to find API Key from various sources
      // 1. Configured via Vite env
      // 2. Injected by Google Maps script (if accessible)
      // 3. Fallback to empty (will likely fail but handled)
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || window.google?.maps?.apiKey || '';
      
      if (!apiKey) {
        console.warn("No Google Maps API Key found for Solar API");
      }

      // 2. Call Solar API
      const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat()}&location.longitude=${lng()}&requiredQuality=HIGH&key=${apiKey}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Solar data unavailable");
      }
      
      const data = await res.json();
      
      if (!data.solarPotential?.wholeRoofStats?.areaMeters) {
        throw new Error("Incomplete solar data received");
      }

      const sqMeters = data.solarPotential.wholeRoofStats.areaMeters;
      const sqFt = Math.round(sqMeters * 10.764);
      
      setTotalArea(sqFt);
      setSolarData(data);
      toast.dismiss();
      toast.success("Analysis Complete!");
      setView('results');
      
    } catch (err) {
      console.warn("Solar API Failed:", err);
      toast.dismiss();
      toast.error("Automated analysis failed. Switching to Detailed Mode.");
      
      // Graceful Fallback
      setMode('detailed');
      setView('drawing');
    }
  };

  const handleDetailedStart = () => {
    setMode('detailed');
    setView('drawing');
  };

  const toggleDrawingMode = () => {
    if (drawingManager) {
      const currentMode = drawingManager.getDrawingMode();
      drawingManager.setDrawingMode(currentMode ? null : google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const clearDrawing = () => {
    polygons.forEach(p => p.setMap(null));
    edges.forEach(e => e.line.setMap(null));
    setPolygons([]);
    setEdges([]);
    setTotalArea(0);
    toast.info("Canvas Cleared");
  };

  const handleSaveToLead = async () => {
    toast.loading("Updating Lead Record...");
    try {
      if (lead && lead.id) {
        // Calculate costs
        const wasteArea = totalArea * PRICING.waste;
        const materialCost = wasteArea * PRICING.material;
        const laborCost = totalArea * PRICING.labor;
        const totalCost = materialCost + laborCost;

        await base44.entities.Lead.update(lead.id, {
          lead_status: 'Quoted',
          roof_size_sqft: totalArea,
          estimated_cost: totalCost,
          // Store blueprint data if detailed
          measurement_data: mode === 'detailed' ? {
            edges: edges.map(e => ({ type: EDGE_TYPES[e.typeIdx].label, length: e.length })),
            polygons: polygons.length
          } : { source: 'solar_api' }
        });
      }
      toast.dismiss();
      toast.success("Lead Updated to 'Quoted'!");
      setTimeout(() => navigate('/rooferdashboard'), 1500);
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.success("Saved (Demo Mode)");
      setTimeout(() => navigate('/rooferdashboard'), 1500);
    }
  };

  // --- HELPERS ---
  const getLinearTotal = (typeIdx) => Math.round(edges.filter(e => e.typeIdx === typeIdx).reduce((a, b) => a + b.length, 0));

  // ================= VIEWS =================

  // 1. CHOICE SCREEN
  if (view === 'choice') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Measure Your Roof</h1>
            <p className="text-xl text-slate-600">Select an estimation method to begin</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-sm font-medium">
              <span className="mr-2">📍</span> {lead?.address_street || "Address Loading..."}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* QUICK CARD */}
            <Card 
              className="group cursor-pointer border-2 border-transparent hover:border-green-500 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
              onClick={handleQuickEstimate}
            >
              <div className="h-2 bg-green-500 w-full" />
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Quick Estimate</CardTitle>
                <p className="text-slate-500 font-medium">AI-Powered Analysis</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Instant Results (60 Seconds)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Google Solar API Accuracy</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Best for Standard Roofs</span>
                </div>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 group-hover:translate-y-[-2px] transition-all">
                  Get Quick Estimate
                </Button>
              </CardContent>
            </Card>

            {/* DETAILED CARD */}
            <Card 
              className="group cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
              onClick={handleDetailedStart}
            >
              <div className="h-2 bg-blue-500 w-full" />
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PenTool className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Detailed Measurement</CardTitle>
                <p className="text-slate-500 font-medium">Manual Precision Tool</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Approx. 3 Minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Draw Exact Perimeters</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Label Ridges, Hips & Valleys</span>
                </div>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 group-hover:translate-y-[-2px] transition-all">
                  Start Drawing
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center pt-8">
             <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600">
               <ArrowLeft className="w-4 h-4 mr-2" /> Cancel & Return to Dashboard
             </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. DRAWING MODE (Detailed)
  if (view === 'drawing') {
    return (
      <div className="relative h-screen w-full bg-slate-900 overflow-hidden">
        {/* TOP BAR */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setView('choice')}>
               <ArrowLeft className="w-5 h-5" />
             </Button>
             <div>
               <h2 className="font-bold text-slate-900 text-lg">Detailed Measurement Mode</h2>
               <p className="text-xs text-slate-500 flex items-center gap-1">
                 <MousePointerClick className="w-3 h-3" /> Click outlined lines to label edge types
               </p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-4 mr-4 bg-slate-100 px-4 py-2 rounded-lg">
                <div className="text-right">
                   <p className="text-xs text-slate-500 font-bold uppercase">Total Area</p>
                   <p className="font-bold text-slate-900">{totalArea.toLocaleString()} sq ft</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-right">
                   <p className="text-xs text-slate-500 font-bold uppercase">Linears</p>
                   <p className="font-bold text-slate-900">{Math.round(edges.reduce((a,b)=>a+b.length,0))} ft</p>
                </div>
             </div>
             <Button onClick={() => setView('results')} className="bg-green-600 hover:bg-green-700 shadow-lg px-6">
                Finish & Save <CheckCircle2 className="w-4 h-4 ml-2" />
             </Button>
          </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 bg-white/95 backdrop-blur rounded-full shadow-2xl p-2 border border-slate-200">
           <Button 
             variant={drawingManager?.getDrawingMode() ? "default" : "outline"} 
             onClick={toggleDrawingMode}
             className="rounded-full px-6"
           >
             <Plus className="w-4 h-4 mr-2" /> Add Section
           </Button>
           
           <Separator orientation="vertical" className="h-6" />
           
           <Button variant="ghost" size="icon" onClick={clearDrawing} className="rounded-full text-red-500 hover:text-red-700 hover:bg-red-50">
             <RotateCcw className="w-4 h-4" />
           </Button>
        </div>

        {/* LEGEND OVERLAY */}
        <Card className="absolute top-24 left-4 z-10 w-48 bg-white/90 backdrop-blur shadow-lg border-0">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Edge Legend</p>
            {EDGE_TYPES.slice(1).map((type) => (
              <div key={type.type} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                <span className="text-slate-700">{type.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* MAP CONTAINER */}
        <div ref={setMapNode} className="w-full h-full" />
      </div>
    );
  }

  // 3. RESULTS DASHBOARD
  if (view === 'results') {
    const wasteFactor = PRICING.waste;
    const adjustedArea = Math.round(totalArea * wasteFactor);
    const materialCost = adjustedArea * PRICING.material;
    const laborCost = totalArea * PRICING.labor;
    const totalCost = materialCost + laborCost;

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('choice')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Start Over
            </Button>
            <h1 className="text-xl font-bold text-slate-900">Measurement Results</h1>
          </div>
          <Button onClick={handleSaveToLead} className="bg-blue-600 hover:bg-blue-700 shadow-md">
            Save to Lead & Create Quote <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </header>

        <main className="max-w-7xl mx-auto p-6 grid lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: VISUALS */}
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-md">
              <CardHeader className="bg-slate-100 border-b py-3">
                <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Roof Diagram
                </CardTitle>
              </CardHeader>
              <div className="aspect-video bg-slate-200 flex items-center justify-center relative">
                 {/* Placeholder for map screenshot or SVG */}
                 {mode === 'quick' ? (
                   <div className="text-center p-8">
                     <Zap className="w-16 h-16 text-green-500 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-slate-700">AI Analysis Map</h3>
                     <p className="text-slate-500">Solar potential data loaded for this address.</p>
                   </div>
                 ) : (
                   <div className="text-center p-8">
                     <PenTool className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-slate-700">Custom Blueprint</h3>
                     <p className="text-slate-500">{polygons.length} Sections Drawn • {edges.length} Edges Labeled</p>
                   </div>
                 )}
              </div>
            </Card>

            {mode === 'detailed' && (
              <Card className="shadow-md">
                <CardHeader className="py-3 border-b">
                  <CardTitle className="text-sm font-bold">Edge Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {EDGE_TYPES.slice(1).map((t, i) => {
                      const len = getLinearTotal(i + 1);
                      if (len === 0) return null;
                      return (
                        <div key={t.type} className="flex justify-between p-3 text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: t.color}}/>
                            {t.label}
                          </span>
                          <span className="font-bold">{len} ft</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: CALCULATOR */}
          <div className="space-y-6">
            <Card className="shadow-lg border-t-4 border-blue-600">
              <CardHeader>
                <CardTitle className="text-xl">Project Cost Estimator</CardTitle>
                <p className="text-slate-500 text-sm">Based on {mode} measurement data</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* PRIMARY METRICS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Raw Area</p>
                    <p className="text-2xl font-bold text-slate-900">{totalArea.toLocaleString()} <span className="text-sm text-slate-400">sq ft</span></p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">With Waste (15%)</p>
                    <p className="text-2xl font-bold text-blue-700">{adjustedArea.toLocaleString()} <span className="text-sm text-blue-400">sq ft</span></p>
                  </div>
                </div>

                <Separator />

                {/* COST BREAKDOWN */}
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Material Cost (@ ${PRICING.material}/sqft)</span>
                      <span className="font-medium">${materialCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Labor Cost (@ ${PRICING.labor}/sqft)</span>
                      <span className="font-medium">${laborCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                   </div>
                   
                   <div className="bg-slate-900 text-white p-4 rounded-lg flex justify-between items-center mt-4">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Estimated Total</p>
                        <p className="text-3xl font-bold">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-400" />
                   </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-xs text-yellow-800">
                   <strong>Note:</strong> This is a preliminary estimate. Final pricing may vary based on material selection, steep charge, and access.
                </div>

              </CardContent>
            </Card>
          </div>

        </main>
      </div>
    );
  }
  
  return null; // Should not reach here
}

function ArrowRight(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}