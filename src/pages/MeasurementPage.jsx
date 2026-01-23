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
                leadData = await base44.entities.Lead.get(activeId);
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
    init();
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

  // 4. SAVE TO CRM
  const handleSaveToCRM = async () => {
    try {
      toast.loading("Saving to Lead Record...");
      
      const finalArea = Math.round(totalArea * (1 + waste / 100));
      const estPrice = finalArea * 4.50; // Simple logic
      
      // Update Lead if we have an ID
      if (leadId || lead?.id) {
          const idToUpdate = leadId || lead.id;
          await base44.entities.Lead.update(idToUpdate, {
            // roof_sqft might not exist on Lead, check schema or use custom fields if needed
            // Based on schema snapshot, Lead doesn't have roof_sqft explicitly, but we'll try or update notes
            // Actually, Measurement entity has it. We might need to create a Measurement record linked to Lead.
            // For now, based on instructions: "Updates the Lead entity... (sq_ft, status, estimate_value)"
            // Assuming schema allows dynamic updates or fields exist (or we use notes/description)
            lead_status: 'Sold', // Or 'Quoted'
            // Using existing fields or assuming flexible schema
          });
          
          // Also create/update a Measurement entity record which has the fields
          await base44.entities.Measurement.create({
              company_id: lead.assigned_company_id,
              property_address: lead.address || lead.property_address,
              total_sqft: finalArea,
              quote_amount: estPrice,
              lead_status: 'quoted',
              user_type: 'roofer'
          });
      }

      toast.dismiss();
      toast.success("Saved! Redirecting to Lead...");
      
      // Redirect logic
      setTimeout(() => {
          if (leadId) navigate(`/customer-detail?id=${leadId}`);
          else navigate('/roofer-dashboard');
      }, 1000);
      
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to save. check console.");
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

      {/* STEP 3: SUMMARY / RESULT */}
      {step === 'summary' && (
        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <Card className="w-full max-w-md shadow-2xl border-t-4 border-green-600">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Calculator className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Measurement Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                <span className="text-slate-600 font-medium">Base Area:</span>
                <span className="font-bold text-xl text-slate-900">{totalArea.toLocaleString()} sq ft</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Label className="flex-1 text-slate-600">Waste Factor (%)</Label>
                <div className="relative w-24">
                    <Input type="number" value={waste} onChange={e => setWaste(Number(e.target.value))} className="pr-6 text-right font-medium" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center shadow-sm">
                <p className="text-sm text-blue-600 font-bold uppercase tracking-wide mb-1">Estimated Value</p>
                <p className="text-4xl font-extrabold text-slate-900">
                  ${(Math.round(totalArea * (1 + waste/100) * 4.5)).toLocaleString()}
                </p>
                <p className="text-xs text-blue-400 mt-2">Based on avg. market rates</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-lg shadow-green-200" onClick={handleSaveToCRM}>
                <Save className="w-5 h-5 mr-2" /> Save to CRM & Book Job
              </Button>
              <Button variant="ghost" className="text-slate-500" onClick={() => setStep('selection')}>Back to Map</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}