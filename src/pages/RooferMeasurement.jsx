import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Zap, PenTool, Key, Loader2, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // 1. STABLE PARAMS
    const rawAddress = searchParams.get('address');
    const urlLeadId = searchParams.get('leadId')?.replace(/"/g, '');

    const [step, setStep] = useState('choice');
    const [loading, setLoading] = useState(true);
    const [lead, setLead] = useState(null);
    const [mapAddress, setMapAddress] = useState(rawAddress || '');

    // Map State
    const [mapNode, setMapNode] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [markerInstance, setMarkerInstance] = useState(null);
    const [drawingManager, setDrawingManager] = useState(null);
    const [sections, setSections] = useState([]);
    const [areaLabels, setAreaLabels] = useState([]); // Store text markers
    
    // API & Fallback
    const [apiKey, setApiKey] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);

    // 2. SELF-HEALING INITIALIZATION
    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            // A. We have an ID -> Fetch it
            if (urlLeadId) {
                try {
                    const l = await base44.entities.Lead.get(urlLeadId);
                    if (isMounted) {
                        setLead(l);
                        if (l.address) setMapAddress(l.address); // Changed from property_address to address based on entity
                        else if (l.property_address) setMapAddress(l.property_address);
                    }
                } catch (e) { 
                    console.warn("Lead fetch failed, likely invalid ID"); 
                }
            } 
            // B. No ID, but we have Address -> CREATE IT (Fixes Loop & Enables Data Capture)
            else if (rawAddress && !urlLeadId) {
                try {
                    const newLead = await base44.entities.Lead.create({
                        address: decodeURIComponent(rawAddress), // Changed from property_address to address based on entity
                        name: 'New Lead', // Default name
                        email: 'temp@placeholder.com', // Placeholder
                        phone: '000-000-0000', // Placeholder
                        lead_status: 'New',
                        lead_source: 'Website Measurement'
                    });
                    
                    if (isMounted) {
                        setLead(newLead);
                        setMapAddress(decodeURIComponent(rawAddress));
                        
                        // Silent URL Update (No Reload)
                        const newUrl = new URL(window.location);
                        newUrl.searchParams.set('leadId', newLead.id);
                        window.history.replaceState({}, '', newUrl);
                    }
                } catch (e) { 
                    console.error("Auto-create failed", e); 
                    // Fallback to just using the address if creation fails (e.g. permission issues)
                    if (isMounted) setMapAddress(decodeURIComponent(rawAddress));
                }
            }
        };
        
        initialize();
        
        return () => { isMounted = false; };
    }, [urlLeadId, rawAddress]); // Only run if URL changes

    // 3. LOAD MAP (Depends on mapAddress)
    useEffect(() => {
        if (!mapNode || !mapAddress) return;

        const initMap = async () => {
            try {
                const { Map } = await google.maps.importLibrary("maps");
                const { Marker } = await google.maps.importLibrary("marker");
                const { Geocoder } = await google.maps.importLibrary("geocoding");
                await google.maps.importLibrary("drawing");
                await google.maps.importLibrary("geometry");

                const geocoder = new Geocoder();
                geocoder.geocode({ address: mapAddress }, (results, status) => {
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
                            const sectionId = Date.now();
                            
                            // --- LABEL (White Text) ---
                            const bounds = new google.maps.LatLngBounds();
                            poly.getPath().forEach(p => bounds.extend(p));
                            
                            const labelMarker = new google.maps.Marker({
                                position: bounds.getCenter(),
                                map: map,
                                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 }, // Invisible icon
                                label: {
                                    text: `${Math.round(area).toLocaleString()} sq ft`,
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    className: "map-label-shadow"
                                }
                            });
                            
                            setAreaLabels(prev => [...prev, { id: sectionId, marker: labelMarker }]);
                            // ----------------------------------

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
                            
                            setSections(p => [...p, { id: sectionId, area: Math.round(area), pitch: 6, edges: newEdges, polyInstance: poly }]);
                            manager.setDrawingMode(null);
                        });
                        
                        setLoading(false); 
                    } else { 
                        setLoading(false);
                        toast.error("Address not found on map");
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
    }, [mapNode, mapAddress]);

    // 4. ACTIONS
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

        // Ensure we have a Lead ID (Should be created by init, but double check)
        if (!lead?.id) { 
            toast.error("System Error: No Lead ID found"); 
            return; 
        }

        toast.loading("Saving...");
        
        const sectionList = isQuick 
            ? [{ pitch: 4, area: parseInt(total), edges: [] }] 
            : sections.map(s => ({ pitch: parseInt(s.pitch), area: parseInt(s.area), edges: [] }));

        try {
            await base44.entities.RoofMeasurement.create({
                lead_id: lead.id,
                total_sqft: parseInt(total),
                measurement_status: 'Completed',
                sections_data: sectionList
            });
            await base44.entities.Lead.update(lead.id, { lead_status: 'Contacted' }); // Using 'Contacted' as generic progress status
            
            toast.dismiss();
            toast.success("Success!");
            
            setTimeout(() => navigate(`/quotebuilder?leadId=${lead.id}`), 500);
        } catch(e) { 
            console.error("Save Error:", e);
            toast.dismiss();
            toast.error("Error Saving Estimate");
        }
    };

    // 5. RENDER
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

    // Calculate Total Live
    const currentTotal = sections.reduce((acc, s) => acc + (s.area * (PITCH_FACTORS[s.pitch]||1.0)), 0);

    return (
        <div className="flex flex-col h-screen w-full relative overflow-hidden">
            {/* NAVIGATION BAR */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm h-16 flex items-center px-4 justify-between">
                <Button variant="ghost" onClick={() => navigate('/rooferdashboard')}><ArrowLeft className="w-4 h-4 mr-2"/> Exit</Button>
                <div className="font-bold text-slate-800">{mapAddress || 'Loading Address...'}</div>
                <Button variant="ghost" size="icon" onClick={() => setShowKeyInput(true)} title="Fix Map Key">
                    <Key className="w-4 h-4 text-slate-400"/>
                </Button>
            </div>

            {/* MAP CONTAINER */}
            <div className="flex-1 relative pt-16 h-screen w-full">
                <div ref={setMapNode} className="w-full h-full bg-slate-200" />
                
                {/* TOP FLOATING RESULT (HEADS UP DISPLAY) */}
                {step === 'detailed' && (
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 bg-slate-900 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <span className="text-sm font-medium text-slate-400">Total Area:</span>
                        <span className="text-xl font-bold">{Math.round(currentTotal).toLocaleString()} sq ft</span>
                        {sections.length > 0 && <Badge variant="secondary" className="bg-green-500 text-white border-0">{sections.length} Sections</Badge>}
                    </div>
                )}
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

            {/* SIDEBAR (Detailed Mode) - SIMPLIFIED */}
            {step === 'detailed' && (
                <div className="w-72 bg-white border-r z-40 shadow-xl absolute left-0 bottom-0 top-16 flex flex-col transition-all">
                    <div className="p-4 border-b bg-slate-50">
                        <Button className="w-full bg-blue-600 shadow-blue-200 shadow-lg" onClick={() => drawingManager?.setDrawingMode('polygon')}>
                            <Plus className="w-4 h-4 mr-2"/> Draw Section
                        </Button>
                    </div>
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                        {sections.length === 0 && <div className="text-center text-slate-400 text-sm mt-10 p-4">Draw the roof outline on the map to begin.</div>}
                        
                        {sections.map((s, i) => (
                            <Card key={s.id} className="p-3 border-l-4 border-blue-500 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm">Section {i+1}</span>
                                    <span className="text-xs font-mono bg-slate-100 px-1 rounded">{s.area} sqft</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-500">Pitch:</label>
                                    <Select value={s.pitch.toString()} onValueChange={v => {
                                        setSections(prev => prev.map(sec => sec.id === s.id ? {...sec, pitch: Number(v)} : sec));
                                    }}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{[0,4,5,6,7,8,9,10,12].map(p => <SelectItem key={p} value={p.toString()}>{p}/12 Pitch</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="p-4 border-t bg-white">
                        <Button className="w-full bg-green-600 h-12 text-lg font-bold shadow-green-200 shadow-lg" onClick={() => saveMeasurement(0, false)}>
                            <Save className="w-5 h-5 mr-2"/> Finish & Quote
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}