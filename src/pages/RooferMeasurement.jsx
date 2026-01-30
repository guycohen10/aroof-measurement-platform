import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Zap, PenTool, Key, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const EDGE_TYPES = { 
    0: { name: 'Unassigned', color: '#94a3b8' }, 
    1: { name: 'Eave', color: '#3b82f6' }, 
    2: { name: 'Rake', color: '#22c55e' }, 
    3: { name: 'Ridge', color: '#ef4444' }, 
    4: { name: 'Hip', color: '#f97316' }, 
    5: { name: 'Valley', color: '#a855f7' }, 
    6: { name: 'Wall', color: '#eab308' }, 
};

const PITCH_FACTORS = { 
    0: 1.0, 4: 1.054, 5: 1.083, 6: 1.118, 7: 1.158, 8: 1.202, 9: 1.25, 10: 1.302, 12: 1.414 
};

export default function RooferMeasurement() {
    const [searchParams] = useSearchParams();
    const leadId = searchParams.get('leadId')?.replace(/"/g, '');
    const navigate = useNavigate();

    const [step, setStep] = useState('choice');
    const [loading, setLoading] = useState(true);
    const [lead, setLead] = useState(null);
    const [mapNode, setMapNode] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [markerInstance, setMarkerInstance] = useState(null);
    const [drawingManager, setDrawingManager] = useState(null);
    const [sections, setSections] = useState([]);
    
    // API & Fallback
    const [apiKey, setApiKey] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);

    // 1. LOAD DATA
    useEffect(() => {
        const load = async () => {
            if(!leadId) return;
            try {
                const l = await base44.entities.Lead.get(leadId);
                setLead(l);
            } catch(e) {
                console.error(e);
                toast.error("Could not load lead data");
            }
        };
        load();
    }, [leadId]);

    // 2. LOAD MAP (No Auto-Timeout)
    useEffect(() => {
        if (!mapNode || !lead?.address) return;

        const initMap = async () => {
            try {
                const { Map } = await google.maps.importLibrary("maps");
                const { Marker } = await google.maps.importLibrary("marker");
                const { Geocoder } = await google.maps.importLibrary("geocoding");
                await google.maps.importLibrary("drawing");
                await google.maps.importLibrary("geometry");

                const geocoder = new Geocoder();
                geocoder.geocode({ address: lead.address }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const map = new Map(mapNode, { 
                            center: results[0].geometry.location, 
                            zoom: 20, 
                            mapTypeId: 'satellite', 
                            disableDefaultUI: true, 
                            tilt: 0 
                        });
                        setMapInstance(map);

                        const marker = new Marker({ position: results[0].geometry.location, map: map });
                        setMarkerInstance(marker);

                        const manager = new google.maps.drawing.DrawingManager({
                            drawingMode: null,
                            drawingControl: false,
                            polygonOptions: { 
                                fillColor: '#3b82f6', 
                                fillOpacity: 0.2, 
                                strokeColor: '#2563eb', 
                                strokeWeight: 2, 
                                editable: true 
                            }
                        });
                        manager.setMap(map);
                        setDrawingManager(manager);

                        google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
                            const area = google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                            const newEdges = [];
                            const path = poly.getPath().getArray();
                            
                            for(let i=0; i<path.length; i++) {
                                const start = path[i];
                                const end = path[(i+1)%path.length];
                                const len = google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084;
                                const line = new google.maps.Polyline({
                                    path: [start, end], 
                                    strokeColor: EDGE_TYPES[0].color, 
                                    strokeWeight: 8, 
                                    zIndex: 999, 
                                    map: map 
                                });
                                
                                const edgeData = { id: Date.now()+i, type: 0, length: len, lineInstance: line };
                                newEdges.push(edgeData);
                                
                                line.addListener("click", () => {
                                    edgeData.type = (edgeData.type + 1) % 7;
                                    line.setOptions({ strokeColor: EDGE_TYPES[edgeData.type].color });
                                });
                            }
                            
                            setSections(p => [...p, { id: Date.now(), area: Math.round(area), pitch: 6, edges: newEdges }]);
                            manager.setDrawingMode(null);
                        });
                        
                        setLoading(false); 
                    } else { 
                        setLoading(false);
                    }
                });
            } catch(e) { console.error(e); }
        };

        const loadScript = () => {
            let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('user_provided_maps_key');
            if(key && !window.google?.maps) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,drawing,geometry`;
                script.async = true;
                script.onload = initMap;
                document.head.appendChild(script);
            } else if (window.google?.maps) {
                initMap();
            }
        };

        loadScript(); 
    }, [mapNode, lead]);

    // 3. ACTIONS
    const startQuick = () => {
        if(!mapInstance || !markerInstance) return;
        setStep('quick');
        
        const center = markerInstance.getPosition();
        const box = [
            { lat: center.lat() + 0.00015, lng: center.lng() - 0.0002 },
            { lat: center.lat() + 0.00015, lng: center.lng() + 0.0002 },
            { lat: center.lat() - 0.00015, lng: center.lng() + 0.0002 },
            { lat: center.lat() - 0.00015, lng: center.lng() - 0.0002 },
        ];
        
        const poly = new google.maps.Polygon({ 
            paths: box, 
            fillColor: '#22c55e', 
            strokeColor: '#16a34a', 
            map: mapInstance 
        });
        
        const area = google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;

        saveMeasurement(Math.round(area), true);
    };

    const saveMeasurement = async (areaVal, isQuick=false) => {
        let total = areaVal || sections.reduce((a,b)=>a+b.area,0);
        
        if(!isQuick) {
            total = sections.reduce((acc, s) => acc + (s.area * (PITCH_FACTORS[s.pitch]||1.1)), 0);
        }

        toast.loading("Saving Result...");
        
        // FIX: Send List DIRECTLY, not wrapped in object
        // And ensure integer types for pitch and area
        const sectionList = isQuick 
            ? [{ pitch: 4, area: parseInt(total), edges: [] }] 
            : sections.map(s => ({ pitch: parseInt(s.pitch), area: parseInt(s.area), edges: [] }));

        try {
            await base44.entities.RoofMeasurement.create({
                lead_id: lead.id,
                total_sqft: parseInt(total),
                status: 'Complete', 
                sections_data: sectionList // DIRECT LIST
            });
            // Updating lead status
            await base44.entities.Lead.update(lead.id, { lead_status: 'Contacted' }); // Using 'Contacted' as it's a valid enum value, 'Measured' is not.
            
            toast.dismiss();
            toast.success("Success!");
            
            setTimeout(() => navigate(`/quotebuilder?leadId=${lead.id}`), 500);
        } catch(e) { 
            console.error("Save Error:", e);
            toast.dismiss();
            toast.error("Error Saving Estimate");
        }
    };

    // 4. RENDER
    if (showKeyInput) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <Key className="w-5 h-5"/> Maps Key Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 mb-4">The map failed to load. Please enter a valid Google Maps API Key to continue.</p>
                        <Input 
                            value={apiKey} 
                            onChange={e => setApiKey(e.target.value)} 
                            placeholder="Enter AIza..." 
                            className="mb-4"
                        />
                        <Button className="w-full" onClick={() => {
                            localStorage.setItem('user_provided_maps_key', apiKey);
                            window.location.reload();
                        }}>Save & Reload</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full relative overflow-hidden">
            {/* NAVIGATION BAR */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm h-16 flex items-center px-4 justify-between">
                <Button variant="ghost" onClick={() => navigate('/rooferdashboard')}><ArrowLeft className="w-4 h-4 mr-2"/> Exit</Button>
                <div className="font-bold text-slate-800">{lead?.address || 'Loading Address...'}</div>
                <Button variant="ghost" size="icon" onClick={() => setShowKeyInput(true)} title="Fix Map Key">
                    <Key className="w-4 h-4 text-slate-400"/>
                </Button>
            </div>

            {/* MAP CONTAINER */}
            <div className="flex-1 relative w-full h-full bg-slate-100">
                <div ref={setMapNode} className="w-full h-full" />
            </div>

            {/* LOADING OVERLAY */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4"/>
                    <h2 className="text-xl font-bold text-slate-800">Loading Satellite Data...</h2>
                </div>
            )}

            {/* CHOICE OVERLAY (Only shows when map is ready) */}
            {!loading && step === 'choice' && (
                <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center pt-16">
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full p-4">
                        <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white shadow-2xl border-green-500 border-b-4 group" onClick={startQuick}>
                            <Zap className="w-12 h-12 text-green-600 mb-4 mx-auto group-hover:scale-110 transition-transform"/>
                            <h2 className="text-2xl font-bold text-center">Quick Estimate</h2>
                        </Card>
                        <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white shadow-2xl border-blue-500 border-b-4 group" onClick={() => setStep('detailed')}>
                            <PenTool className="w-12 h-12 text-blue-600 mb-4 mx-auto group-hover:scale-110 transition-transform"/>
                            <h2 className="text-2xl font-bold text-center">Pro Measure</h2>
                        </Card>
                    </div>
                </div>
            )}

            {/* SIDEBAR (Detailed Mode) */}
            {step === 'detailed' && (
                <div className="w-80 bg-white border-r z-40 shadow-xl absolute left-0 bottom-0 top-16 flex flex-col">
                    <div className="p-4 border-b bg-blue-50">
                        <h3 className="font-bold text-blue-900">Measurements</h3>
                        <p className="text-xs text-blue-600">Total: {Math.round(sections.reduce((a,b)=>a+b.area,0))} sq ft</p>
                    </div>
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        <Button className="w-full bg-blue-600" onClick={() => drawingManager?.setDrawingMode('polygon')}><Plus className="w-4 h-4 mr-2"/> Draw Section</Button>
                        {sections.map((s, i) => (
                            <Card key={s.id} className="p-3 border-l-4 border-blue-500">
                                <div className="font-bold text-sm mb-2">Section {i+1} ({s.area} sq ft)</div>
                                <Select value={s.pitch.toString()} onValueChange={v => {
                                    setSections(prev => prev.map(sec => sec.id === s.id ? {...sec, pitch: Number(v)} : sec));
                                }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{[0,4,5,6,7,8,9,10,12].map(p => <SelectItem key={p} value={p.toString()}>{p}/12 Pitch</SelectItem>)}</SelectContent>
                                </Select>
                            </Card>
                        ))}
                    </div>
                    <div className="p-4 border-t"><Button className="w-full bg-green-600" onClick={() => saveMeasurement(0, false)}><Save className="w-4 h-4 mr-2"/> Finish & Save</Button></div>
                </div>
            )}
        </div>
    );
}