import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Save, PenTool, Calculator, FileText, Mail, Download, MousePointerClick, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Edge Types Configuration
const EDGE_TYPES = {
  0: { name: 'Unassigned', color: '#94a3b8' }, // Slate-400
  1: { name: 'Eave', color: '#3b82f6' }, // Blue-500
  2: { name: 'Rake', color: '#22c55e' }, // Green-500
  3: { name: 'Ridge', color: '#ef4444' }, // Red-500
  4: { name: 'Hip', color: '#f97316' }, // Orange-500
  5: { name: 'Valley', color: '#a855f7' }, // Purple-500
  6: { name: 'Wall', color: '#eab308' }, // Yellow-500
};

export default function MeasurementPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  // State
  const [mode, setMode] = useState('measure'); // 'measure', 'classify', 'report'
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);

  // Measurement Data
  const [polygons, setPolygons] = useState([]);
  const [edges, setEdges] = useState([]); // Array of { id, lineInstance, type, length }
  const [totalArea, setTotalArea] = useState(0);
  const [waste, setWaste] = useState(10);
  const [pitch, setPitch] = useState(6);

  // 1. Load Data
  useEffect(() => {
    const fetchLead = async () => {
        try {
            const activeId = leadId || sessionStorage.getItem('active_lead_id');
            if (!activeId) {
                const sessionAddress = sessionStorage.getItem('lead_address');
                if (sessionAddress) {
                    setLead({ address_street: sessionAddress });
                }
                setLoading(false);
                return;
            }

            // Try API first
            try {
                const apiLead = await base44.entities.Lead.get(activeId);
                if (apiLead) {
                    setLead(apiLead);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.log("Not found in API, checking local storage");
            }

            // Fallback to LocalStorage (Test Mode)
            const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
            const localLead = localLeads.find(l => l.id === activeId);
            
            if (localLead) {
                setLead(localLead);
            } else {
                toast.error("Lead not found locally or in DB");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchLead();
  }, [leadId]);

  // 2. Initialize Map (Always-On)
  useEffect(() => {
    if (!mapNode || !lead || mapInstance) return;

    const init = async () => {
      try {
        const { Map } = await window.google.maps.importLibrary("maps");
        const { DrawingManager } = await window.google.maps.importLibrary("drawing");
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        await window.google.maps.importLibrary("geometry");
        
        const geocoder = new Geocoder();
        const address = lead.address || lead.property_address || 
                        (lead.address_street ? `${lead.address_street}, ${lead.address_city || ''}` : "Dallas, TX");
        
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
            
            const manager = new DrawingManager({
              drawingMode: google.maps.drawing.OverlayType.POLYGON,
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
            
            window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
              const path = poly.getPath().getArray();
              const area = window.google.maps.geometry.spherical.computeArea(path);
              setTotalArea(Math.round(area * 10.764));
              
              // Generate Edges
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
                  // We need to update the state array correctly to reflect changes
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
              toast.info("Click the lines to label them (Ridge, Eave, etc.)", { duration: 5000 });
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

  // 3. Helpers
  const getLinearTotal = (typeIndex) => {
      // Use edges state to calculate totals
      return Math.round(edges.filter(e => e.type === typeIndex).reduce((sum, e) => sum + e.length, 0));
  };

  const handleSave = async () => {
    toast.loading("Saving Proposal...");
    
    const finalArea = Math.round(totalArea * (1 + waste/100));
    const finalPrice = Math.round(totalArea * (1 + waste/100) * 4.50);
    
    const data = {
        roof_sqft: finalArea,
        estimated_value: finalPrice,
        status: 'Quoted',
        lead_status: 'Quoted'
    };

    try {
      const activeId = leadId || sessionStorage.getItem('active_lead_id');
        
      // Local Check
      const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
      const idx = localLeads.findIndex(l => l.id === activeId);
      
      if (idx !== -1) {
        localLeads[idx] = { ...localLeads[idx], ...data };
        localStorage.setItem('my_leads', JSON.stringify(localLeads));
        toast.dismiss();
        toast.success("Measurement & Linears Saved (Test Mode)!");
        setTimeout(() => navigate('/roofer-dashboard'), 1000);
      } else {
        await base44.entities.Lead.update(activeId, data);
        
        // Also persist measurement record
        await base44.entities.Measurement.create({
            company_id: lead.assigned_company_id,
            property_address: lead.address || lead.property_address,
            total_sqft: finalArea,
            quote_amount: finalPrice,
            lead_status: 'quoted',
            user_type: 'roofer'
        });

        toast.dismiss();
        toast.success("Measurement & Linears Saved to CRM!");
        setTimeout(() => navigate(`/customer-detail?id=${activeId}`), 1000);
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
  };

  // 4. Render
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

      {/* MAIN MAP LAYER (Never Unmounts) */}
      <div className="absolute inset-0 top-14 z-0">
        <div ref={setMapNode} className="w-full h-full" />
      </div>

      {/* REPORT OVERLAY */}
      {mode === 'report' && (
        <div className="absolute inset-0 top-14 z-10 bg-slate-900/90 backdrop-blur p-4 md:p-8 overflow-y-auto">
          <Card className="max-w-5xl mx-auto bg-white shadow-xl min-h-[600px] animate-in zoom-in-95 duration-200">
            <Tabs defaultValue="summary" className="h-full flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                <TabsList className="bg-slate-200">
                  <TabsTrigger value="summary">Summary & Quote</TabsTrigger>
                  <TabsTrigger value="blueprint">Blueprint & Linears</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleReset} className="text-slate-500">
                        Edit
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2"/> Save & Close
                    </Button>
                </div>
              </div>
              
              <TabsContent value="summary" className="p-6 md:p-8 flex-1">
                 <div className="grid md:grid-cols-2 gap-8 h-full">
                    {/* Calculator Section */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-slate-400" /> Project Factors
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-500 text-xs uppercase font-bold">Base Area</Label>
                                    <p className="text-xl font-bold text-slate-800">{totalArea.toLocaleString()} sq ft</p>
                                </div>
                                <div>
                                    <Label className="text-slate-500 text-xs uppercase font-bold">Billable Area</Label>
                                    <p className="text-xl font-bold text-slate-800">{Math.round(totalArea * (1 + waste/100)).toLocaleString()} sq ft</p>
                                </div>
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-500 mb-1 block">Waste %</Label>
                                        <Input type="number" value={waste} onChange={e => setWaste(Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <Label className="text-slate-500 mb-1 block">Pitch /12</Label>
                                        <Input type="number" value={pitch} onChange={e => setPitch(Number(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center shadow-inner">
                            <p className="text-green-700 font-bold uppercase tracking-widest text-xs mb-2">Estimated Project Total</p>
                            <p className="text-5xl font-black text-slate-900 tracking-tight">
                                ${(Math.round(totalArea * (1 + waste/100) * 4.5)).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600 font-medium mt-3 bg-white/50 inline-block px-3 py-1 rounded-full">
                                Based on $4.50/sq ft avg
                            </p>
                        </div>
                    </div>

                    {/* Actions / Next Steps */}
                    <div className="flex flex-col justify-center space-y-4">
                        <Button variant="outline" className="h-16 border-2 hover:bg-slate-50 justify-start px-6">
                             <FileText className="w-6 h-6 mr-4 text-blue-600" />
                             <div className="text-left">
                                 <div className="font-bold text-slate-700">Preview Proposal PDF</div>
                                 <div className="text-xs text-slate-400">View the document before sending</div>
                             </div>
                        </Button>
                        <Button variant="outline" className="h-16 border-2 hover:bg-slate-50 justify-start px-6">
                             <Mail className="w-6 h-6 mr-4 text-yellow-500" />
                             <div className="text-left">
                                 <div className="font-bold text-slate-700">Email Quote to Client</div>
                                 <div className="text-xs text-slate-400">Send directly to {lead?.email || "customer"}</div>
                             </div>
                        </Button>
                    </div>
                 </div>
              </TabsContent>
              
              <TabsContent value="blueprint" className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8 h-full">
                    {/* Left: Linear Breakdown */}
                    <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2 text-slate-700">Linear Measurements</h3>
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
                    </div>
                    </div>
                    
                    {/* Right: Blueprint Preview (SVG Placeholder) */}
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center p-4 relative min-h-[400px]">
                        <div className="absolute top-4 right-4">
                            <Button size="sm" variant="outline" className="bg-white">
                                <Download className="w-4 h-4 mr-2"/> Download DXF
                            </Button>
                        </div>
                        
                        <div className="text-center opacity-60">
                            <FileText className="w-20 h-20 mx-auto mb-4 text-slate-300"/>
                            <h4 className="font-bold text-slate-400">Blueprint Generator</h4>
                            <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                                Detailed CAD export available after saving measurement.
                            </p>
                        </div>
                        
                        <p className="text-slate-400 text-[10px] font-mono absolute bottom-2 left-1/2 -translate-x-1/2">
                            VECTOR_BLUEPRINT_V1.DWG
                        </p>
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