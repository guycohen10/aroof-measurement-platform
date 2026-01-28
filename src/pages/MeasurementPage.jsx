import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Zap, PenTool, Loader2, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const EDGE_TYPES = { 0: { name: 'Unassigned', color: '#94a3b8' } };
const PITCH_FACTORS = { 0: 1.0, 4: 1.054, 5: 1.083, 6: 1.118, 7: 1.158, 8: 1.202, 9: 1.25, 10: 1.302, 12: 1.414 };

export default function MeasurementPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // 1. GET PARAMS
    const rawAddress = searchParams.get('address');
    const urlLeadId = searchParams.get('leadId')?.replace(/"/g, '');

    const [step, setStep] = useState('choice');
    const [loading, setLoading] = useState(true);
    const [lead, setLead] = useState(null);
    const [mapAddress, setMapAddress] = useState(rawAddress ? decodeURIComponent(rawAddress) : '');

    // Map State
    const [mapNode, setMapNode] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [markerInstance, setMarkerInstance] = useState(null);
    const [drawingManager, setDrawingManager] = useState(null);
    const [sections, setSections] = useState([]);
    const [areaLabels, setAreaLabels] = useState([]);

    // 2. SELF-CORRECTING INITIALIZATION (The Fix)
    useEffect(() => {
        let isMounted = true;
        const initialize = async () => {
            // A. Handle Lead ID (if present)
            if (urlLeadId) {
                try {
                    // Correctly fetch LEAD, not Measurement
                    const l = await base44.entities.Lead.get(urlLeadId);
                    if (isMounted) {
                        setLead(l);
                        if (l.address) setMapAddress(l.address);
                        else if (l.property_address) setMapAddress(l.property_address);
                    }
                } catch (e) {
                    // Clean URL if Lead ID is bad
                    console.warn("Invalid Lead ID on Client Page. Cleaning URL...");
                    if (isMounted) {
                        const cleanUrl = new URL(window.location);
                        cleanUrl.searchParams.delete('leadId');
                        window.history.replaceState({}, '', cleanUrl);
                        
                        // Fallback to address immediately
                        if (rawAddress) setMapAddress(decodeURIComponent(rawAddress));
                    }
                }
            }
            // B. No Lead ID? Just use the Address.
            else if (rawAddress) {
                setMapAddress(decodeURIComponent(rawAddress));
            }
        };
        initialize();
        return () => { isMounted = false; };
    }, [urlLeadId, rawAddress]);

    // 3. LOAD MAP
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
                            
                            // LABEL
                            const bounds = new google.maps.LatLngBounds();
                            poly.getPath().forEach(p => bounds.extend(p));
                            
                            const labelMarker = new google.maps.Marker({
                                position: bounds.getCenter(),
                                map: map,
                                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
                                label: {
                                    text: `${Math.round(area).toLocaleString()} sq ft`,
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    className: "map-label-shadow"
                                }
                            });
                            
                            setAreaLabels(prev => [...prev, { id: sectionId, marker: labelMarker }]);
                            
                            const newEdges = [];
                            const path = poly.getPath().getArray();
                            for (let i = 0; i < path.length; i++) {
                                const start = path[i];
                                const end = path[(i + 1) % path.length];
                                const len = google.maps.geometry.spherical.computeDistanceBetween(start, end) * 3.28084;
                                const line = new google.maps.Polyline({
                                    path: [start, end],
                                    strokeColor: EDGE_TYPES[0].color,
                                    strokeWeight: 8,
                                    zIndex: 999,
                                    map: map
                                });
                                newEdges.push({ id: Date.now() + i, type: 0, length: len, lineInstance: line });
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
            } catch (e) { console.error(e); }
        };

        const loadScript = () => {
            let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('user_provided_maps_key');
            if (key && !window.google?.maps) {
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
        if (!mapInstance || !markerInstance) return;
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

    const saveMeasurement = async (areaVal, isQuick = false) => {
        let total = areaVal || sections.reduce((a, b) => a + b.area, 0);
        if (!isQuick) {
            total = sections.reduce((acc, s) => acc + (s.area * (PITCH_FACTORS[s.pitch] || 1.1)), 0);
        }

        toast.loading("Saving Measurement...");
        
        try {
            // AUTO-CREATE LEAD IF MISSING
            let activeLeadId = lead?.id;
            
            if (!activeLeadId) {
                const newLead = await base44.entities.Lead.create({
                    address: mapAddress,
                    name: 'Client DIY',
                    email: 'diy@placeholder.com',
                    phone: '0000000000',
                    lead_status: 'New',
                    lead_source: 'Client DIY'
                });
                activeLeadId = newLead.id;
                setLead(newLead);
            }
            
            const sectionList = isQuick
                ? [{ pitch: 4, area: parseInt(total), edges: [] }]
                : sections.map(s => ({ pitch: parseInt(s.pitch), area: parseInt(s.area), edges: [] }));
                
            await base44.entities.RoofMeasurement.create({
                lead_id: activeLeadId,
                total_sqft: parseInt(total),
                status: 'Complete',
                sections_data: sectionList
            });

            await base44.entities.Lead.update(activeLeadId, { lead_status: 'Measured', roof_sqft: parseInt(total) });

            toast.dismiss();
            toast.success("Quote Ready!");
            
            // Navigate to Client Quote View
            setTimeout(() => navigate(`/quotebuilder?leadId=${activeLeadId}`), 500);
        } catch (e) {
            console.error("Save Error:", e);
            toast.error("Could not save measurement");
        }
    };

    const currentTotal = sections.reduce((acc, s) => acc + (s.area * (PITCH_FACTORS[s.pitch] || 1.0)), 0);

    return (
        <div className="flex flex-col h-screen w-full relative overflow-hidden">
            {/* NAVIGATION BAR - Simplified for Client */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm h-16 flex items-center px-4 justify-between">
                <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4 mr-2"/> Home</Button>
                <div className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">{mapAddress || 'Locating...'}</div>
                <div className="w-10"></div> {/* Spacer for center alignment */}
            </div>

            {/* MAP CONTAINER */}
            <div className="flex-1 relative pt-16 h-screen w-full">
                <div ref={setMapNode} className="w-full h-full bg-slate-200" />

                {/* TOP FLOATING RESULT (HEADS UP DISPLAY) */}
                {step === 'detailed' && (
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 bg-slate-900 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <span className="text-sm font-medium text-slate-400">Total:</span>
                        <span className="text-xl font-bold">{Math.round(currentTotal).toLocaleString()} sq ft</span>
                        {sections.length > 0 && <Badge variant="secondary" className="bg-green-500 text-white border-0">{sections.length} Sections</Badge>}
                    </div>
                )}
            </div>

            {/* LOADING OVERLAY */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">Locating Property...</h2>
                </div>
            )}

            {/* CHOICE OVERLAY (Only shows when map is ready) */}
            {!loading && step === 'choice' && (
                <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center pt-16">
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full p-4">
                        <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white shadow-2xl border-green-500 border-b-4 group" onClick={startQuick}>
                            <Zap className="w-12 h-12 text-green-600 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                            <h2 className="text-2xl font-bold text-center">Instant Estimate</h2>
                            <p className="text-center text-slate-500 mt-2">I just need a rough number</p>
                        </Card>
                        <Card className="p-8 cursor-pointer hover:scale-105 transition-all bg-white shadow-2xl border-blue-500 border-b-4 group" onClick={() => setStep('detailed')}>
                            <PenTool className="w-12 h-12 text-blue-600 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                            <h2 className="text-2xl font-bold text-center">Precise Measure</h2>
                            <p className="text-center text-slate-500 mt-2">I want to draw the roof myself</p>
                        </Card>
                    </div>
                </div>
            )}

            {/* SIDEBAR (Detailed Mode) */}
            {step === 'detailed' && (
                <div className="w-72 bg-white border-r z-40 shadow-xl absolute left-0 bottom-0 top-16 flex flex-col transition-all">
                    <div className="p-4 border-b bg-slate-50">
                        <Button className="w-full bg-blue-600 shadow-blue-200 shadow-lg" onClick={() => drawingManager?.setDrawingMode('polygon')}>
                            <Plus className="w-4 h-4 mr-2" /> Draw Roof Section
                        </Button>
                    </div>
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                        {sections.length === 0 && <div className="text-center text-slate-400 text-sm mt-10 p-4">Tap points on the map to trace your roof.</div>}
                        
                        {sections.map((s, i) => (
                            <Card key={s.id} className="p-3 border-l-4 border-blue-500 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm">Section {i + 1}</span>
                                    <span className="text-xs font-mono bg-slate-100 px-1 rounded">{s.area} sqft</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-500">Pitch:</label>
                                    <Select value={s.pitch.toString()} onValueChange={v => {
                                        setSections(prev => prev.map(sec => sec.id === s.id ? { ...sec, pitch: Number(v) } : sec));
                                    }}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{[0, 4, 5, 6, 7, 8, 9, 10, 12].map(p => <SelectItem key={p} value={p.toString()}>{p}/12 Pitch</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="p-4 border-t bg-white">
                        <Button className="w-full bg-green-600 h-12 text-lg font-bold shadow-green-200 shadow-lg" onClick={() => saveMeasurement(0, false)}>
                            <Save className="w-5 h-5 mr-2" /> View My Quote
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}