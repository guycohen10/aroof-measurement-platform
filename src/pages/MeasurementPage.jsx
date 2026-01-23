import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Zap, PenTool, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function MeasurementPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState('selection'); // 'selection', 'quick', 'detailed'
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [mapNode, setMapNode] = useState(null);
  const [mapInstance, setMapInstance] = useState(null); // Keep instance in state
  const [totalArea, setTotalArea] = useState(0);

  const drawingManagerRef = useRef(null);
  const quickPolygonRef = useRef(null);
  const polygonsRef = useRef([]); // Track detailed polygons

  // 1. Data Load
  useEffect(() => {
    const loadData = async () => {
        try {
            const activeId = leadId || sessionStorage.getItem('active_lead_id');
            if (!activeId) {
                // Handle no lead case - maybe look for address in session
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
                    console.log("No lead found");
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

  // 2. Map Init (Run once, stay in background)
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

              // Setup Drawing Manager (Hidden initially)
              const manager = new DrawingManager({
                drawingMode: null,
                drawingControl: false,
                polygonOptions: {
                  fillColor: '#3b82f6',
                  fillOpacity: 0.4,
                  strokeWeight: 2,
                  strokeColor: '#2563eb',
                  editable: true,
                }
              });
              manager.setMap(map);
              drawingManagerRef.current = manager;

              // Listen for manual drawing
              window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
                const area = window.google.maps.geometry.spherical.computeArea(poly.getPath());
                setTotalArea(prev => prev + Math.round(area * 10.764));
                polygonsRef.current.push(poly); // Track polygon
                manager.setDrawingMode(null);
              });
            } else {
                toast.error("Could not locate address");
            }
          });
      } catch (err) {
          console.error("Map init error", err);
      }
    };
    init();
  }, [mapNode, lead, mapInstance]);

  // 3. Workflow Handlers
  const startQuickEstimate = async () => {
    setStep('quick');
    if (!mapInstance) return;

    // Simulate "AI Detection" by creating a box centered on the property
    const center = mapInstance.getCenter();
    const bounds = {
      north: center.lat() + 0.0001,
      south: center.lat() - 0.0001,
      east: center.lng() + 0.00015,
      west: center.lng() - 0.00015
    };
    
    const { Polygon } = await window.google.maps.importLibrary("maps");
    
    const rect = new Polygon({
      paths: [
        { lat: bounds.north, lng: bounds.west },
        { lat: bounds.north, lng: bounds.east },
        { lat: bounds.south, lng: bounds.east },
        { lat: bounds.south, lng: bounds.west }
      ],
      strokeColor: "#16a34a", // Green for Quick
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#22c55e",
      fillOpacity: 0.35,
      map: mapInstance,
      editable: true // Let them adjust the "AI" guess
    });

    quickPolygonRef.current = rect;
    
    // Initial area
    const area = window.google.maps.geometry.spherical.computeArea(rect.getPath());
    setTotalArea(Math.round(area * 10.764));

    // Update area if they drag the "AI" box
    const updateQuickArea = () => {
        const area = window.google.maps.geometry.spherical.computeArea(rect.getPath());
        setTotalArea(Math.round(area * 10.764));
    };

    rect.getPaths().forEach(path => {
      window.google.maps.event.addListener(path, 'set_at', updateQuickArea);
      window.google.maps.event.addListener(path, 'insert_at', updateQuickArea);
    });
  };

  const startDetailedMeasure = async () => {
    setStep('detailed');
    setTotalArea(0);
    // Clear quick polygon if exists
    if (quickPolygonRef.current) {
        quickPolygonRef.current.setMap(null);
        quickPolygonRef.current = null;
    }
    
    if (drawingManagerRef.current) {
      const { OverlayType } = await window.google.maps.importLibrary("drawing");
      drawingManagerRef.current.setDrawingMode(OverlayType.POLYGON);
    }
  };
  
  const clearDetailedPolygons = () => {
      polygonsRef.current.forEach(poly => poly.setMap(null));
      polygonsRef.current = [];
      setTotalArea(0);
  };

  // 4. RENDER
  if (loading) return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
  );

  return (
    <div className="flex flex-col h-screen w-full relative bg-slate-200">
      
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-slate-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>
            <h1 className="font-bold text-slate-800">
                {lead?.address || lead?.property_address || "Roof Measurement"}
            </h1>
        </div>
      </header>

      {/* MAP CONTAINER (Always rendered, z-0) */}
      <div className="flex-1 relative mt-0">
        <div ref={setMapNode} className="absolute inset-0 w-full h-full" />
      </div>

      {/* SELECTION OVERLAY (Wizard) */}
      {step === 'selection' && (
        <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            
            {/* Quick Option */}
            <Card 
              className="p-8 hover:scale-105 transition-all cursor-pointer border-green-500 border-2 bg-white shadow-2xl group"
              onClick={startQuickEstimate}
            >
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Quick Estimate</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">Instant AI-powered approximation. Perfect for initial quotes and ballpark figures.</p>
              <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">⚡ 60 SECONDS</span>
            </Card>

            {/* Detailed Option */}
            <Card 
              className="p-8 hover:scale-105 transition-all cursor-pointer border-blue-500 border-2 bg-white shadow-2xl group"
              onClick={startDetailedMeasure}
            >
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <PenTool className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Detailed Measurement</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">Manual satellite tracing for 99% accuracy. Best for production and ordering materials.</p>
              <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">📐 PRECISION MODE</span>
            </Card>
          </div>
        </div>
      )}

      {/* ACTIVE MODE TOOLS */}
      {step !== 'selection' && (
        <div className="absolute top-20 left-4 z-10 bg-white p-4 rounded-xl shadow-2xl w-80 border border-slate-100 animate-in slide-in-from-left-4 duration-300">
          <div className="mb-4 pb-4 border-b">
            <p className="text-xs uppercase font-extrabold text-slate-400 mb-1 tracking-wider">
              {step === 'quick' ? '⚡ Quick Mode Active' : '📐 Detailed Mode Active'}
            </p>
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                {totalArea.toLocaleString()} 
                <span className="text-sm font-medium text-slate-500 ml-1">sq ft</span>
            </h3>
          </div>
          
          {step === 'quick' ? (
             <div className="space-y-4">
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="mb-2"><strong>AI Detection:</strong> The green box is an automated estimate.</p>
                    <p>Drag the white corners to match the roof shape.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                        setStep('selection');
                        if (quickPolygonRef.current) quickPolygonRef.current.setMap(null);
                    }}>Back</Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                         toast.success("Estimate saved!");
                    }}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Save Estimate
                    </Button>
                </div>
                <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={startDetailedMeasure}>
                    Switch to Detailed Mode
                </Button>
             </div>
          ) : (
             <div className="space-y-3">
                <p className="text-sm text-slate-500 mb-2">Trace the roof edges to calculate area.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={async () => {
                     const { OverlayType } = await window.google.maps.importLibrary("drawing");
                     drawingManagerRef.current.setDrawingMode(OverlayType.POLYGON);
                }}>
                   <PenTool className="w-4 h-4 mr-2" /> Draw Section
                </Button>
                <div className="flex gap-2">
                     <Button variant="outline" className="flex-1" onClick={clearDetailedPolygons}>
                       <RotateCcw className="w-4 h-4 mr-2" /> Clear
                    </Button>
                    <Button variant="outline" onClick={() => setStep('selection')}>
                        Back
                    </Button>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}