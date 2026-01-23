import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Zap, PenTool, Save, CheckCircle2, RotateCcw, FileText, Calculator, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function MeasurementPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  // States: 'selection' | 'quick' | 'detailed' | 'summary'
  const [step, setStep] = useState('selection');
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [totalArea, setTotalArea] = useState(0);
  const [waste, setWaste] = useState(10); // 10% waste default

  const drawingManagerRef = useRef(null);
  const quickPolygonRef = useRef(null);
  const polygonsRef = useRef([]); // Track detailed polygons

  // 1. Data Load
  useEffect(() => {
    const loadData = async () => {
        try {
            const activeId = leadId || sessionStorage.getItem('active_lead_id');
            if (!activeId) {
                // If no lead ID, try session address fallback
                const sessionAddress = sessionStorage.getItem('lead_address');
                if (sessionAddress) {
                    setLead({ address: sessionAddress });
                }
                setLoading(false);
                return;
            }

            let leadData;
            try {
                // Try fetching from local storage first (Test Mode)
                const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
                const localLead = localLeads.find(l => l.id === activeId);
                
                if (localLead) {
                    leadData = localLead;
                } else {
                    // Fetch from API
                    leadData = await base44.entities.Lead.get(activeId);
                }
            } catch {
                try {
                    leadData = await base44.entities.Measurement.get(activeId);
                } catch {
                    console.log("Lead not found via ID");
                }
            }
            if (leadData) setLead(leadData);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };
    loadData();
  }, [leadId]);

  // 2. Map Init
  useEffect(() => {
    if (!mapNode || !lead || mapInstance) return;

    const init = async () => {
      try {
        const { Map } = await window.google.maps.importLibrary("maps");
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        const { DrawingManager } = await window.google.maps.importLibrary("drawing");
        await window.google.maps.importLibrary("geometry");

        const geocoder = new Geocoder();
        const address = lead.address || lead.property_address || 
                        (lead.address_street ? `${lead.address_street}, ${lead.address_city}, ${lead.address_state}` : '');

        if (!address) {
            toast.error("No valid address to map.");
            return;
        }

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
              drawingMode: null,
              drawingControl: false,
              polygonOptions: {
                fillColor: '#3b82f6',
                fillOpacity: 0.4,
                strokeWeight: 2,
                strokeColor: '#2563eb',
                editable: true
              }
            });
            manager.setMap(map);
            drawingManagerRef.current = manager;

            window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
              const area = window.google.maps.geometry.spherical.computeArea(poly.getPath());
              setTotalArea(prev => prev + Math.round(area * 10.764));
              polygonsRef.current.push(poly);
              manager.setDrawingMode(null); // Auto-stop drawing after one shape
            });
          } else {
             toast.error("Could not locate address");
          }
        });
      } catch (err) {
        console.error("Map init error:", err);
      }
    };

    // Robustly wait for Google Maps to be available
    const waitForGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
            clearInterval(waitForGoogle);
            init();
        }
    }, 100);

    return () => clearInterval(waitForGoogle);
  }, [mapNode, lead, mapInstance]);

  // 3. Workflow Logic
  const startQuick = async () => {
    setStep('quick');
    if (!mapInstance) return;

    const center = mapInstance.getCenter();
    const { Polygon } = await window.google.maps.importLibrary("maps");
    
    // Create box around center
    const rect = new Polygon({
      paths: [
        { lat: center.lat() + 0.0001, lng: center.lng() - 0.00015 },
        { lat: center.lat() + 0.0001, lng: center.lng() + 0.00015 },
        { lat: center.lat() - 0.0001, lng: center.lng() + 0.00015 },
        { lat: center.lat() - 0.0001, lng: center.lng() - 0.00015 }
      ],
      strokeColor: "#16a34a",
      fillOpacity: 0.35,
      fillColor: "#22c55e",
      map: mapInstance,
      editable: true
    });
    quickPolygonRef.current = rect;

    const updateArea = () => {
         const area = window.google.maps.geometry.spherical.computeArea(rect.getPath());
         setTotalArea(Math.round(area * 10.764));
    };

    updateArea(); // Initial calculation

    // Listener to update area on drag/edit
    rect.getPaths().forEach(p => {
       window.google.maps.event.addListener(p, 'set_at', updateArea);
       window.google.maps.event.addListener(p, 'insert_at', updateArea);
    });
  };

  const startDetailed = async () => {
    setStep('detailed');
    setTotalArea(0);
    if (quickPolygonRef.current) {
        quickPolygonRef.current.setMap(null);
        quickPolygonRef.current = null;
    }
    if (drawingManagerRef.current) {
        const { OverlayType } = await window.google.maps.importLibrary("drawing");
        drawingManagerRef.current.setDrawingMode(OverlayType.POLYGON);
    }
  };

  const handleClearDetailed = () => {
      polygonsRef.current.forEach(p => p.setMap(null));
      polygonsRef.current = [];
      setTotalArea(0);
  };

  // 4. SAVE TO CRM (Smart Save)
  const handleSaveToCRM = async () => {
    const finalArea = Math.round(totalArea * (1 + waste / 100));
    const estPrice = Math.round(finalArea * 4.50);
    
    const data = {
        roof_sqft: finalArea,
        estimated_value: estPrice,
        status: 'Measured',
        lead_status: 'Quoted' // Update lead status as well
    };

    toast.loading("Saving Estimate...");

    try {
        const idToUpdate = leadId || lead.id;
        
        // STRATEGY: Check LocalStorage First (Test Mode Support)
        const localLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
        const localIndex = localLeads.findIndex(l => l.id === idToUpdate);

        if (localIndex !== -1) {
             // UPDATE LOCAL LEAD
             localLeads[localIndex] = { ...localLeads[localIndex], ...data };
             localStorage.setItem('my_leads', JSON.stringify(localLeads));
             toast.dismiss();
             toast.success("Test Lead Updated Locally!");
             // Redirect to local lead view or list
             setTimeout(() => navigate('/roofer-dashboard'), 1000);
        } else {
             // UPDATE REAL DB LEAD
             await base44.entities.Lead.update(idToUpdate, data);
             
             // Optionally update/create measurement record for persistence
             await base44.entities.Measurement.create({
                 company_id: lead.assigned_company_id,
                 property_address: lead.address || lead.property_address,
                 total_sqft: finalArea,
                 quote_amount: estPrice,
                 lead_status: 'quoted',
                 user_type: 'roofer'
             });

             toast.dismiss();
             toast.success("Lead Record Updated!");
             setTimeout(() => navigate(`/customer-detail?id=${idToUpdate}`), 1000);
        }
    } catch (err) {
        console.error(err);
        toast.dismiss();
        toast.error("Save failed. Check console.");
    }
  };

  // 5. RENDER
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
        <h1 className="font-bold text-slate-800">
            {lead?.address || lead?.property_address || "Roof Measurement"}
        </h1>
      </header>

      {/* Map Layer */}
      <div className="flex-1 relative mt-0">
        <div ref={setMapNode} className="absolute inset-0 w-full h-full" />
      </div>

      {/* STEP 1: SELECTION */}
      {step === 'selection' && (
        <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
            <Card className="p-8 cursor-pointer hover:border-green-500 border-2 transition-all hover:scale-105 shadow-2xl" onClick={startQuick}>
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Quick Estimate</h3>
              <p className="text-slate-500 text-lg">AI-Assisted (60 Seconds)</p>
            </Card>
            <Card className="p-8 cursor-pointer hover:border-blue-500 border-2 transition-all hover:scale-105 shadow-2xl" onClick={startDetailed}>
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                 <PenTool className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Detailed Measure</h3>
              <p className="text-slate-500 text-lg">Manual Precision Mode</p>
            </Card>
          </div>
        </div>
      )}

      {/* STEP 2: TOOLS (Quick & Detailed) */}
      {(step === 'quick' || step === 'detailed') && (
        <Card className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-96 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{step} Mode</p>
              <p className="text-2xl font-bold text-slate-900">{totalArea.toLocaleString()} <span className="text-sm font-normal text-slate-500">sq ft</span></p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 h-10 px-6" onClick={() => setStep('summary')}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Finish
            </Button>
          </CardContent>
          {step === 'detailed' && (
             <CardFooter className="bg-slate-50 p-2 flex justify-between text-xs border-t">
                <Button variant="ghost" size="sm" onClick={async () => {
                    const { OverlayType } = await window.google.maps.importLibrary("drawing");
                    drawingManagerRef.current.setDrawingMode(OverlayType.POLYGON);
                }}>
                    <PenTool className="w-3 h-3 mr-1" /> Draw
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClearDetailed} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <RotateCcw className="w-3 h-3 mr-1" /> Clear
                </Button>
             </CardFooter>
          )}
        </Card>
      )}

      {/* STEP 3: SUMMARY / RESULT (Visual Upgrade) */}
      {step === 'summary' && (
        <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <Card className="w-full max-w-lg shadow-2xl border-none overflow-hidden">
            {/* Green Gradient Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center relative">
               <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <div className="bg-white p-2 rounded-full shadow-lg">
                    <div className="bg-green-100 rounded-full p-2">
                       <CheckCircle2 className="w-10 h-10 text-green-600 animate-bounce" />
                    </div>
                  </div>
               </div>
               <h2 className="text-white text-2xl font-bold mb-2">Estimate Ready!</h2>
               <p className="text-green-50 opacity-90 text-sm">Measurement completed successfully</p>
            </div>
            
            <CardContent className="pt-12 px-8 pb-8 space-y-8">
               {/* Big Stats */}
               <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Area</p>
                     <p className="text-2xl font-black text-slate-800">{totalArea.toLocaleString()}<span className="text-sm font-medium text-slate-400 ml-1">sq ft</span></p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">With Waste</p>
                     <p className="text-2xl font-black text-slate-800">{Math.round(totalArea * (1 + waste/100)).toLocaleString()}<span className="text-sm font-medium text-slate-400 ml-1">sq ft</span></p>
                  </div>
               </div>

               {/* Waste Slider Input */}
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <Label className="font-bold text-slate-700">Waste Factor</Label>
                     <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{waste}%</span>
                  </div>
                  <input 
                     type="range" 
                     min="0" 
                     max="30" 
                     step="1" 
                     value={waste} 
                     onChange={(e) => setWaste(Number(e.target.value))}
                     className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                     <span>0%</span>
                     <span>15%</span>
                     <span>30%</span>
                  </div>
               </div>

               {/* Price Card */}
               <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-center shadow-lg transform transition-transform hover:scale-105">
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.2em] mb-2">Estimated Value</p>
                  <p className="text-4xl font-black text-white tracking-tight">
                     ${Math.round(totalArea * (1 + waste/100) * 4.5).toLocaleString()}
                  </p>
                  <p className="text-slate-400 text-xs mt-2">Based on standard market rates ($4.50/sq ft)</p>
               </div>
            </CardContent>

            <CardFooter className="bg-slate-50 p-6 flex flex-col gap-3 border-t">
              <Button className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-green-200 shadow-lg transition-all active:scale-95" onClick={handleSaveToCRM}>
                <Save className="w-5 h-5 mr-2" /> Save to CRM
              </Button>
              <Button variant="ghost" className="text-slate-500 hover:text-slate-800" onClick={() => setStep('selection')}>
                Discard & Start Over
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}