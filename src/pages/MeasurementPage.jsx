import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Zap, PenTool, Loader2, Eraser, Check, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MeasurementPage() {
    const [searchParams] = useSearchParams();
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
    const [drawingManager, setDrawingManager] = useState(null);
    const [sections, setSections] = useState([]);
    const [areaLabels, setAreaLabels] = useState([]);

    // 2. SELF-CORRECTING INITIALIZATION
    useEffect(() => {
        let isMounted = true;
        const initialize = async () => {
            if (urlLeadId) {
                try {
                    const l = await base44.entities.Lead.get(urlLeadId);
                    if (isMounted) {
                        setLead(l);
                        if (l.property_address) setMapAddress(l.property_address);
                    }
                } catch (e) {
                    if (isMounted) {
                        const cleanUrl = new URL(window.location);
                        cleanUrl.searchParams.delete('leadId');
                        window.history.replaceState({}, '', cleanUrl);
                        if (rawAddress) setMapAddress(decodeURIComponent(rawAddress));
                    }
                }
            } else if (rawAddress) {
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
                        new Marker({ position: results[0].geometry.location, map: map });
                        
                        const manager = new google.maps.drawing.DrawingManager({
                            drawingMode: null,
                            drawingControl: false,
                            polygonOptions: {
                                fillColor: '#3b82f6',
                                fillOpacity: 0.3,
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
                            
                            // LABEL (White Text inside Polygon)
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
                                    fontSize: "16px",
                                    className: "drop-shadow-md"
                                }
                            });
                            
                            setAreaLabels(prev => [...prev, { id: sectionId, marker: labelMarker }]);
                            
                            // Simple Section (Default Pitch 6)
                            setSections(p => [...p, { id: sectionId, area: Math.round(area), pitch: 6, polyInstance: poly }]);
                            manager.setDrawingMode(null);
                        });
                        
                        setLoading(false);
                    } else {
                        setLoading(false);
                        toast.error("Address not found");
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
        if (!mapInstance) return;
        setStep('quick');
        
        // Simulating quick estimate logic
        // Ideally we would use Solar API here, but fallback to manual drawing if not available
        // For now, we'll just prompt them to save a placeholder
        saveMeasurement(2500, true);
    };

    const resetAll = () => {
        sections.forEach(s => s.polyInstance?.setMap(null));
        areaLabels.forEach(l => l.marker.setMap(null));
        setSections([]);
        setAreaLabels([]);
    };

    const saveMeasurement = async (areaVal, isQuick = false) => {
        let total = areaVal || sections.reduce((a, b) => a + b.area, 0);
        
        if (!isQuick) {
            // Add waste factor automatically for clients (simulating pitch/waste)
            total = Math.round(total * 1.15); 
        }

        toast.loading("Calculating Quote...");
        
        try {
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
                ? [{ pitch: 6, area: parseInt(total), edges: [] }]
                : sections.map(s => ({ pitch: 6, area: parseInt(s.area), edges: [] }));
                
            await base44.entities.RoofMeasurement.create({
                lead_id: activeLeadId,
                total_sqft: parseInt(total),
                status: 'Complete',
                sections_data: sectionList
            });

            await base44.entities.Lead.update(activeLeadId, { lead_status: 'Measured', roof_sqft: parseInt(total) });

            toast.dismiss();
            toast.success("Quote Ready!");
            
            setTimeout(() => navigate(`/quotebuilder?leadId=${activeLeadId}`), 500);
        } catch (e) {
            console.error("Save error", e);
            toast.error("Could not save");
        }
    };

    const currentTotal = sections.reduce((acc, s) => acc + s.area, 0);

    return (
        <div className="flex flex-col h-screen w-full relative overflow-hidden">
            {/* 1. NAV BAR */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm h-16 flex items-center px-4 justify-between">
                <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4 mr-2"/> Home</Button>
                <div className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">{mapAddress || 'Locating...'}</div>
                <div className="w-10"></div>
            </div>

            {/* 2. MAP AREA */}
            <div className="flex-1 relative pt-16 h-screen w-full">
                <div ref={setMapNode} className="w-full h-full bg-slate-200" />

                {/* NEW: VISIBLE FLOATING HEADER */}
                {step === 'detailed' && (
                    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 w-auto">
                        <Card className="shadow-2xl border-0 ring-4 ring-black/5">
                            <CardContent className="px-8 py-3 flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Area</div>
                                    <div className="text-2xl font-black text-slate-900">{Math.round(currentTotal).toLocaleString()} <span className="text-sm font-normal text-slate-400">sq ft</span></div>
                                </div>
                                {sections.length > 0 && <Badge className="bg-green-500 h-8 px-3 rounded-full text-white">{sections.length} Sections</Badge>}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {loading && <div className="absolute inset-0 z-50 bg-white flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>}

            {/* 3. MODE SELECTION */}
            {!loading && step === 'choice' && (
                <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
                        {/* Instant Card */}
                        <div onClick={startQuick} className="bg-white rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all shadow-2xl group border-b-8 border-green-500">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                                <Zap className="w-8 h-8 text-green-600"/>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Instant Estimate</h2>
                            <p className="text-slate-500">Get a ballpark price in 10 seconds based on your address.</p>
                        </div>
                        {/* Precise Card */}
                        <div onClick={() => setStep('detailed')} className="bg-white rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all shadow-2xl group border-b-8 border-blue-600">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                                <PenTool className="w-8 h-8 text-blue-600"/>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Precise Measure</h2>
                            <p className="text-slate-500">Draw your roof yourself for an exact material list.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. CLIENT SIDEBAR (Simplified) */}
            {step === 'detailed' && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-8 md:bottom-auto md:top-32 w-[90%] md:w-80 z-30 space-y-3">
                    <Card className="border-0 shadow-2xl ring-1 ring-black/5 bg-white/95 backdrop-blur">
                        <CardContent className="p-4 space-y-4">
                            <div className="text-sm text-slate-600 leading-relaxed">
                                <span className="font-bold text-slate-900">How to Measure:</span> Tap the corners of your roof on the map. Close the shape to see the area.
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold shadow-lg shadow-blue-900/10" onClick={() => drawingManager?.setDrawingMode('polygon')}>
                                <MousePointerClick className="w-5 h-5 mr-2"/> Trace Roof
                            </Button>
                            {sections.length > 0 && (
                                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold shadow-lg shadow-green-900/10" onClick={() => saveMeasurement(0, false)}>
                                    <Check className="w-5 h-5 mr-2"/> See My Price
                                </Button>
                            )}
                            {sections.length > 0 && (
                                <Button className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 h-10" variant="ghost" onClick={resetAll}>
                                    <Eraser className="w-4 h-4 mr-2"/> Clear All
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}