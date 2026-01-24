import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  ArrowLeft, CheckCircle2, Save, PenTool, MousePointerClick, 
  Loader2, Zap, Ruler, MapPin 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Edge Types Configuration
const EDGE_TYPES = {
  0: { name: 'Unassigned', color: '#94a3b8' }, // Slate-400
  1: { name: 'Eave', color: '#3b82f6' },       // Blue-500
  2: { name: 'Rake', color: '#22c55e' },       // Green-500
  3: { name: 'Ridge', color: '#ef4444' },      // Red-500
  4: { name: 'Hip', color: '#f97316' },        // Orange-500
  5: { name: 'Valley', color: '#a855f7' },     // Purple-500
  6: { name: 'Wall', color: '#eab308' },       // Yellow-500
};

export default function MeasurementPage() {
  const { leadId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = paramId || searchParams.get('leadId');
  const navigate = useNavigate();

  // State
  const [mode, setMode] = useState('choice'); // 'choice', 'quick_result', 'measure', 'classify', 'report'
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  
  // Map Refs
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);

  // Measurement Data
  const [polygons, setPolygons] = useState([]);
  const [edges, setEdges] = useState([]); // Array of { id, lineInstance, type, length }
  const [totalArea, setTotalArea] = useState(0);
  const [waste, setWaste] = useState(10);
  const [pitch, setPitch] = useState(6);

  // 1. UNIVERSAL DATA LOADER (Preserved Logic)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const activeId = leadId || sessionStorage.getItem('active_lead_id');

        // PRIORITY 1: Check Session Storage (Immediate Handoff from New Lead Form)
        const sessionAddress = sessionStorage.getItem('lead_address');
        const sessionId = sessionStorage.getItem('active_lead_id');

        if (activeId && activeId === sessionId && sessionAddress) {
             console.log("Found Lead in Session Storage!");
             setLead({
                 id: activeId,
                 address_street: sessionAddress,
                 address_city: "", 
                 address_state: ""
             });
             setLoading(false);
             return;
        }

        // SEARCH PRIORITY 2: Check Local 'Jobs' (Job Board)
        const localJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        let target = localJobs.find(l => l.id === activeId);

        // SEARCH PRIORITY 3: Check Local 'Leads' (Marketplace)
        if (!target) {
           const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
           target = localLeads.find(l => l.id === activeId);
        }

        // SEARCH PRIORITY 4: Real Database (API)
        if (!target && activeId) {
           try {
              target = await base44.entities.Lead.get(activeId);
           } catch (e) {
              console.warn("API Lookup failed");
           }
        }

        // RESULT HANDLER
        if (target) {
           // Ensure address exists
           if (!target.address_street) {
              // Attempt to fix missing address from customer name or default
              target.address_street = target.address || "Dallas, TX"; 
           }
           setLead(target);
        } else {
           // ONLY use Mock if absolutely nothing found
           console.error("Lead ID not found anywhere:", activeId);
           toast.error("Could not find lead details. Loading Demo Mode.");
           setLead({
              id: activeId || 'mock-lead',
              address_street: "5103 Lincolnshire Ct",
              address_city: "Dallas",
              address_state: "TX",
              assigned_company_id: 'mock-company'
           });
        }
      } catch (e) {
        console.error(e);
        toast.error("Error loading lead data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [leadId]);

  // 2. Initialize Map
  useEffect(() => {
    if (!mapNode || !lead || mapInstance) return;

    const init = async () => {
      try {
        const { Map } = await window.google.maps.importLibrary("maps");
        const { DrawingManager } = await window.google.maps.importLibrary("drawing");
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        const { Marker } = await window.google.maps.importLibrary("marker");
        await window.google.maps.importLibrary("geometry");
        
        const geocoder = new Geocoder();
        const address = lead.address || lead.property_address || 
                        (lead.address_street ? `${lead.address_street}, ${lead.address_city || ''}` : "Dallas, TX");
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            
            const map = new Map(mapNode, {
              center: location,
              zoom: 20,
              mapTypeId: 'satellite',
              disableDefaultUI: true,
              tilt: 0
            });
            setMapInstance(map);

            // 1. ADD RED MARKER
            const marker = new Marker({
              position: location,
              map: map,
              title: "Property Location",
              animation: google.maps.Animation.DROP
            });
            setMarkerInstance(marker);
            
            // 2. Setup Drawing Manager (Initially Disabled)
            const manager = new DrawingManager({
              drawingMode: null, // Disabled initially
              drawingControl: false,
              polygonOptions: {
                fillColor: 'white', 
                fillOpacity: 0.1, 
                strokeWeight: 1, 
                strokeColor: 'white', 
                editable: false
              }
            });
            manager.setMap(map);
            setDrawingManager(manager);
            
            // 3. Polygon Complete Listener (For Detailed Mode)
            window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
              const path = poly.getPath().getArray();
              const area = window.google.maps.geometry.spherical.computeArea(path);
              setTotalArea(Math.round(area * 10.764));
              
              const newEdges = [];
              for (let i = 0; i < path.length; i++) {
                const start = path[i];
                const end = path[(i + 1) % path.length];
                const length = window.google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084; // Meters to Feet
                
                // Create Clickable Polyline
                const line = new window.google.maps.Polyline({
                  path: [start, end],
                  geodesic: true,
                  strokeColor: EDGE_TYPES[0].color, // Default Gray
                  strokeOpacity: 1.0,
                  strokeWeight: 6,
                  map: map,
                  zIndex: 100 // On top of polygon
                });
                
                // Store reference
                const edgeObj = { id: Date.now() + i, lineInstance: line, type: 0, length };
                
                // Add Click Listener
                line.addListener("click", () => {
                  edgeObj.type = (edgeObj.type + 1) % 7; // Cycle 0-6
                  line.setOptions({ strokeColor: EDGE_TYPES[edgeObj.type].color });
                  
                  // Force re-render of stats
                  setEdges(prevEdges => {
                      const updated = prevEdges.map(e => e.id === edgeObj.id ? {...e, type: edgeObj.type} : e);
                      return updated;
                  });
                });
                
                newEdges.push(edgeObj);
              }
              
              setEdges(newEdges);
              setPolygons([poly]);
              manager.setDrawingMode(null); // Stop drawing after shape
              setMode('classify'); // Switch to "Click your edges" mode
              toast.success("Outline Complete! Now click the lines to label them.");
            });
          } else {
              toast.error("Could not find address on map");
          }
        });
      } catch (err) {
        console.error("Map load error:", err);
      }
    };

    const waitForGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
            clearInterval(waitForGoogle);
            init();
        }
    }, 100);

    return () => clearInterval(waitForGoogle);
  }, [mapNode, lead, mapInstance]);

  // 3. Workflow Actions
  
  const startQuickEstimate = () => {
    if (!mapInstance || !markerInstance) return;
    
    // Calculate 40x40ft box (approx 12 meters)
    const center = markerInstance.getPosition();
    const lat = center.lat();
    const lng = center.lng();
    const offset = 0.0001; // Approx 10m
    
    const coords = [
      { lat: lat + offset, lng: lng - offset },
      { lat: lat + offset, lng: lng + offset },
      { lat: lat - offset, lng: lng + offset },
      { lat: lat - offset, lng: lng - offset },
    ];
    
    const poly = new window.google.maps.Polygon({
      paths: coords,
      strokeColor: "#22c55e",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#22c55e",
      fillOpacity: 0.35,
      map: mapInstance
    });
    
    // Zoom in
    mapInstance.setZoom(21);
    
    // Calc area
    const path = poly.getPath().getArray();
    const area = window.google.maps.geometry.spherical.computeArea(path);
    const sqft = Math.round(area * 10.764);
    
    setTotalArea(sqft);
    setPolygons([poly]);
    setMode('quick_result');
    toast.success("Quick Estimate Generated!");
  };

  const startDetailed = () => {
    setMode('measure');
    if (drawingManager) {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    }
    // Remove marker to clear view for drawing
    if (markerInstance) {
      markerInstance.setMap(null);
    }
    toast.info("Drawing Mode Enabled. Outline the roof structure.");
  };

  const getLinearTotal = (typeIndex) => {
      return Math.round(edges.filter(e => e.type === typeIndex).reduce((sum, e) => sum + e.length, 0));
  };

  const handleSave = async () => {
    toast.loading("Saving Measurement...");
    
    const finalArea = Math.round(totalArea * (1 + waste/100));
    const finalPrice = Math.round(totalArea * (1 + waste/100) * 4.50);
    
    const data = {
        roof_sqft: finalArea,
        estimated_value: finalPrice,
        status: 'Quoted',
        lead_status: 'Quoted'
    };

    try {
      const activeId = leadId || sessionStorage.getItem('active_lead_id') || lead.id;
        
      // Local Check
      const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
      const idx = localLeads.findIndex(l => l.id === activeId);
      
      if (idx !== -1) {
        localLeads[idx] = { ...localLeads[idx], ...data };
        localStorage.setItem('my_leads', JSON.stringify(localLeads));
        toast.dismiss();
        toast.success("Saved (Local Mode)!");
        setTimeout(() => navigate('/roofer-dashboard'), 1000);
      } else {
         // API Check
         if (activeId !== 'mock-lead') {
             await base44.entities.Lead.update(activeId, data);
             // Also persist measurement record
            await base44.entities.Measurement.create({
                company_id: lead.assigned_company_id,
                property_address: lead.address || lead.property_address || lead.address_street,
                total_sqft: finalArea,
                quote_amount: finalPrice,
                lead_status: 'quoted',
                user_type: 'roofer'
            });
            toast.dismiss();
            toast.success("Saved to CRM!");
            setTimeout(() => navigate(`/customer-detail?id=${activeId}`), 1000);
         } else {
             toast.dismiss();
             toast.success("Demo Saved (Mock)!");
             setTimeout(() => navigate('/roofer-dashboard'), 1000);
         }
      }
    } catch (e) {
      console.error(e);
      toast.dismiss();
      toast.error("Save failed");
    }
  };
  
  const handleReset = () => {
      setMode('measure');
      setTotalArea(0);
      setEdges([]);
      polygons.forEach(p => p.setMap(null));
      setPolygons([]);
      edges.forEach(e => e.lineInstance.setMap(null));
      if (drawingManager) drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
      if (markerInstance) markerInstance.setMap(null);
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
        <h1 className="font-bold text-slate-800 truncate">
            {lead?.address || lead?.property_address || lead?.address_street || "Roof Measurement"}
        </h1>
        
        {mode === 'measure' && (
            <div className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                <PenTool className="w-3 h-3" /> Draw Polygon
            </div>
        )}
        
        {mode === 'classify' && (
            <div className="ml-auto flex items-center gap-3">
                 <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                    <MousePointerClick className="w-3 h-3" /> Click Edges to Label
                 </div>
                 <Button size="sm" onClick={() => setMode('report')} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Finish
                 </Button>
            </div>
        )}
      </header>

      {/* MAP LAYER */}
      <div className="absolute inset-0 top-14 z-0">
        <div ref={setMapNode} className="w-full h-full" />
      </div>

      {/* CHOICE OVERLAY (Start Screen) */}
      {mode === 'choice' && (
        <div className="absolute inset-0 top-14 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
            
            {/* Quick Estimate Card */}
            <Card className="bg-white hover:scale-105 transition-transform cursor-pointer border-t-8 border-green-500 shadow-2xl" onClick={startQuickEstimate}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Quick Estimate</h3>
                  <p className="text-slate-500 mt-2">AI-Powered Instant Result</p>
                </div>
                <p className="text-sm text-slate-400">Perfect for rough quotes and initial calls.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700 mt-4">Start Quick Mode</Button>
              </CardContent>
            </Card>

            {/* Detailed Measurement Card */}
            <Card className="bg-white hover:scale-105 transition-transform cursor-pointer border-t-8 border-blue-500 shadow-2xl" onClick={startDetailed}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Ruler className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Detailed Measurement</h3>
                  <p className="text-slate-500 mt-2">Manual Precision Drawing</p>
                </div>
                <p className="text-sm text-slate-400">Full material orders and precise contracts.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">Start Detailed Mode</Button>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* QUICK RESULT OVERLAY */}
      {mode === 'quick_result' && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
          <Card className="bg-white shadow-2xl border-2 border-green-500 animate-in slide-in-from-bottom-10">
            <CardHeader className="bg-green-50 border-b pb-4">
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Quick Estimate Complete
              </CardTitle>
              <CardDescription>Based on approximate roof footprint</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-slate-600">Est. Roof Area</span>
                <span className="font-bold text-slate-900">{totalArea.toLocaleString()} sq ft</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-slate-600">Est. Value</span>
                <span className="font-bold text-green-600">${(totalArea * 4.5).toLocaleString()}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setMode('choice')}>Back</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSave}>Save & Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DETAILED REPORT OVERLAY (From Previous Version) */}
      {mode === 'report' && (
        <div className="absolute inset-0 top-14 z-10 bg-slate-900/90 backdrop-blur p-4 md:p-8 overflow-y-auto">
          <Card className="max-w-5xl mx-auto bg-white shadow-xl min-h-[600px] animate-in zoom-in-95 duration-200">
            <Tabs defaultValue="blueprint" className="h-full flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                <TabsList className="bg-slate-200">
                  <TabsTrigger value="blueprint">Blueprint & Linears</TabsTrigger>
                  <TabsTrigger value="quote">Quote & Summary</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                     <Button variant="ghost" onClick={handleReset}>Redraw</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2"/> Save & Exit
                    </Button>
                </div>
              </div>
              
              <TabsContent value="blueprint" className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8 h-full">
                    <div className="space-y-4">
                        <h3 className="font-bold border-b pb-2 text-slate-700">Measurements</h3>
                        <div className="grid gap-3">
                            {Object.entries(EDGE_TYPES).slice(1).map(([idx, t]) => {
                                const length = getLinearTotal(Number(idx));
                                return (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded border-l-4 transition-all hover:bg-slate-100" style={{borderColor: t.color}}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: t.color}}></div>
                                            <span className="font-medium text-slate-700">{t.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{length} ft</span>
                                    </div>
                                );
                            })}
                            <div className="mt-4 pt-4 border-t flex justify-between items-center px-2">
                                <span className="font-bold text-slate-500">Total Perimeter</span>
                                <span className="font-bold text-xl text-slate-800">
                                    {Object.keys(EDGE_TYPES).reduce((acc, type) => acc + getLinearTotal(Number(type)), 0)} ft
                                </span>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="font-bold text-slate-500">Total Area</span>
                                <span className="font-bold text-xl text-slate-800">{totalArea.toLocaleString()} sq ft</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 relative min-h-[400px]">
                        <Zap className="w-16 h-16 mb-4 opacity-30 text-slate-500"/>
                        <p className="text-slate-500 font-medium">Blueprint Generated</p>
                        <p className="text-slate-400 text-xs mt-1">Ready for export</p>
                    </div>
                </div>
              </TabsContent>

              <TabsContent value="quote" className="p-6 md:p-8">
                 <div className="flex flex-col items-center justify-center h-full space-y-8 py-10">
                    <div className="text-center space-y-2">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight">
                            ${(Math.round(totalArea * (1 + waste/100) * 4.5)).toLocaleString()}
                        </h2>
                        <p className="text-slate-500 text-lg">Estimated Project Total</p>
                    </div>

                    <div className="w-full max-w-md bg-slate-50 p-6 rounded-xl border space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Waste %</Label>
                                <Input type="number" value={waste} onChange={e => setWaste(Number(e.target.value))} />
                            </div>
                            <div>
                                <Label>Pitch</Label>
                                <Input type="number" value={pitch} onChange={e => setPitch(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="pt-4 border-t flex justify-between text-sm">
                            <span className="text-slate-500">Base Price / sqft</span>
                            <span className="font-bold">$4.50</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" /> Save & Exit
                        </Button>
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
}