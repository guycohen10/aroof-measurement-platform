import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Check, MousePointerClick, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PITCH_FACTORS = { 0: 1.0, 4: 1.054, 5: 1.083, 6: 1.118, 7: 1.158, 8: 1.202, 9: 1.25, 10: 1.302, 12: 1.414 };

export default function MeasurementPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const rawAddress = searchParams.get('address');
    const urlLeadId = searchParams.get('leadId')?.replace(/"/g, '');

    const [loading, setLoading] = useState(true);
    const [mapAddress, setMapAddress] = useState(rawAddress ? decodeURIComponent(rawAddress) : '');
    const [lead, setLead] = useState(null);

    const [mapNode, setMapNode] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [drawingManager, setDrawingManager] = useState(null);
    const [sections, setSections] = useState([]);
    const [areaLabels, setAreaLabels] = useState([]);

    // 1. INIT
    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            if (urlLeadId) {
                try {
                    const l = await base44.entities.Lead.get(urlLeadId);
                    if (isMounted) {
                        setLead(l);
                        if (l.address) setMapAddress(l.address);
                    }
                } catch (e) {
                    if (isMounted) {
                        const cleanUrl = new URL(window.location);
                        cleanUrl.searchParams.delete('leadId');
                        window.history.replaceState({}, '', cleanUrl);
                        if (rawAddress) setMapAddress(decodeURIComponent(rawAddress));
                    }
                }
            }
        };
        init();
        return () => { isMounted = false; };
    }, [urlLeadId, rawAddress]);

    // 2. MAP
    useEffect(() => {
        if (!mapNode || !mapAddress) return;
        const loadMap = async () => {
            try {
                const { Map } = await google.maps.importLibrary("maps");
                const { Marker } = await google.maps.importLibrary("marker");
                const { Geocoder } = await google.maps.importLibrary("geocoding");
                await google.maps.importLibrary("drawing");
                await google.maps.importLibrary("geometry");

                const geocoder = new Geocoder();
                geocoder.geocode({ address: mapAddress }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const map = new Map(mapNode, { center: results[0].geometry.location, zoom: 20, mapTypeId: 'satellite', disableDefaultUI: true, tilt: 0 });
                        setMapInstance(map);
                        new Marker({ position: results[0].geometry.location, map: map });
                        const manager = new google.maps.drawing.DrawingManager({
                            drawingMode: null,
                            drawingControl: false,
                            polygonOptions: { fillColor: '#3b82f6', fillOpacity: 0.3, strokeColor: '#2563eb', strokeWeight: 2, editable: true }
                        });
                        manager.setMap(map);
                        setDrawingManager(manager);
                        google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
                            const area = google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                            const id = Date.now();
                            const bounds = new google.maps.LatLngBounds();
                            poly.getPath().forEach(p => bounds.extend(p));
                            const labelMarker = new google.maps.Marker({
                                position: bounds.getCenter(),
                                map: map,
                                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
                                label: { text: `${Math.round(area).toLocaleString()} sq ft`, color: "white", fontWeight: "bold", fontSize: "16px" }
                            });

                            setAreaLabels(p => [...p, { id, marker: labelMarker }]);
                            // Default Pitch: 6
                            setSections(p => [...p, { id, area: Math.round(area), pitch: 6, poly: poly }]);
                            manager.setDrawingMode(null);
                        });
                        setLoading(false);
                    } else { setLoading(false); toast.error("Address not found"); }
                });
            } catch (e) { console.error(e); }
        };
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('user_provided_maps_key');
        if (!window.google?.maps && key) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,drawing,geometry`;
            script.async = true;
            script.onload = loadMap;
            document.head.appendChild(script);
        } else if (window.google?.maps) { loadMap(); }


    }, [mapNode, mapAddress]);

    // 3. ACTIONS
    const reset = () => { sections.forEach(s => s.poly?.setMap(null)); areaLabels.forEach(l => l.marker.setMap(null)); setSections([]); setAreaLabels([]); };

    const saveMeasurement = async () => {
        // Calculate Total with Pitch
        const total = Math.round(sections.reduce((acc, s) => acc + (s.area * (PITCH_FACTORS[s.pitch] || 1.1)), 0));

        toast.loading("Saving...");
        try {
            let activeId = lead?.id;
            // Try Auto-Create (Will fail if Public Access is Off)
            if (!activeId) {
                const newLead = await base44.entities.Lead.create({
                    address: mapAddress,
                    name: "Guest Client",
                    email: "guest@example.com",
                    phone: "0000000000",
                    lead_status: 'New'
                });
                activeId = newLead.id;
            }

            const sectionList = sections.map(s => ({ pitch: parseInt(s.pitch), area: parseInt(s.area), edges: [] }));

            await base44.entities.RoofMeasurement.create({
                lead_id: activeId,
                total_sqft: parseInt(total),
                status: 'Complete',
                sections_data: sectionList
            });
            // Update Lead Status if possible
            await base44.entities.Lead.update(activeId, { lead_status: 'Contacted' });

            toast.dismiss(); toast.success("Quote Ready!");
            setTimeout(() => navigate(`/quotebuilder?leadId=${activeId}`), 500);
        } catch (e) {
            console.error(e);
            if (e.message?.includes("Permission")) {
                toast.error("Save Failed: Please Log In (Public Access is Closed)");
            } else {
                toast.error("Save Failed: " + (e.message || "Unknown error"));
            }
        }
    };

    const currentTotal = sections.reduce((acc, s) => acc + (s.area * (PITCH_FACTORS[s.pitch] || 1.0)), 0);

    return (
        <div className="flex h-screen w-full relative overflow-hidden">
            <div className="flex-1 relative h-full w-full">
                <div ref={setMapNode} className="w-full h-full bg-slate-200" />

                {/* FLOATING HEADER */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-white rounded-full px-6 py-2 shadow-xl flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Area</span>
                        <span className="text-xl font-black text-slate-900">{Math.round(currentTotal).toLocaleString()} <span className="text-sm font-normal text-slate-400">sq ft</span></span>
                        {sections.length > 0 && <Badge className="bg-green-500">{sections.length} Sections</Badge>}
                    </div>
                </div>

                <div className="absolute top-6 left-6 z-10">
                    <Button variant="secondary" className="shadow-lg bg-white" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                </div>
            </div>

            {/* RIGHT SIDEBAR (Restored Original) */}
            <div className="w-80 bg-white border-l shadow-2xl flex flex-col z-20">
                <div className="p-6 border-b">
                    <h2 className="font-bold text-xl text-slate-900">Your Roof</h2>
                    <p className="text-sm text-slate-500 mt-1 truncate">{mapAddress}</p>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900 space-y-2">
                        <p className="font-bold">Instructions:</p>
                        <ol className="list-decimal pl-4 space-y-1">
                            <li>Click <b>Trace Roof</b>.</li>
                            <li>Tap corners on map.</li>
                            <li>Adjust Pitch for accuracy.</li>
                        </ol>
                    </div>
                    <Button className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 h-12 font-bold" onClick={() => drawingManager?.setDrawingMode('polygon')}>
                        <MousePointerClick className="w-5 h-5 mr-2" /> Trace Roof
                    </Button>
                    {/* SECTIONS LIST WITH PITCH */}
                    <div className="space-y-3">
                        {sections.map((s, i) => (
                            <div key={s.id} className="p-3 bg-slate-50 border rounded-lg space-y-2">
                                <div className="flex justify-between font-bold text-sm text-slate-700">
                                    <span>Section {i + 1}</span>
                                    <span>{s.area} sqft</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Pitch:</span>
                                    <Select value={s.pitch.toString()} onValueChange={v => {
                                        setSections(prev => prev.map(sec => sec.id === s.id ? { ...sec, pitch: Number(v) } : sec));
                                    }}>
                                        <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[0, 4, 5, 6, 7, 8, 9, 10, 12].map(p => <SelectItem key={p} value={p.toString()}>{p}/12</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 border-t bg-slate-50 space-y-3">
                    <div className="flex justify-center">
                        <button onClick={reset} className="text-red-500 text-sm hover:underline flex items-center"><RotateCcw className="w-3 h-3 mr-1" /> Start Over</button>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-lg text-white" onClick={() => saveMeasurement(0, false)}>
                        <Check className="w-6 h-6 mr-2" /> See My Price
                    </Button>
                </div>
            </div>

            {loading && <div className="absolute inset-0 z-50 bg-white flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>}
        </div>
    );
}