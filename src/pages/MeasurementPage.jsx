import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Check, Plus, Zap, PenTool, Loader2, Eraser, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MeasurementPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const rawAddress = searchParams.get('address');
    const urlLeadId = searchParams.get('leadId')?.replace(/"/g, '');

    const [step, setStep] = useState('choice');
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
        const init = async () => {
            if (urlLeadId) {
                try {
                    const l = await base44.entities.Lead.get(urlLeadId);
                    setLead(l);
                    if (l.address) setMapAddress(l.address);
                } catch (e) {
                    const cleanUrl = new URL(window.location);
                    cleanUrl.searchParams.delete('leadId');
                    window.history.replaceState({}, '', cleanUrl);
                }
            }
        };
        init();
    }, [urlLeadId]);

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
                                label: { text: `${Math.round(area).toLocaleString()} sq ft`, color: "white", fontWeight: "bold", fontSize: "14px", className: "drop-shadow-md" }
                            });
                            
                            setAreaLabels(p => [...p, { id, marker: labelMarker }]);
                            setSections(p => [...p, { id, area: Math.round(area), poly: poly }]);
                            manager.setDrawingMode(null);
                        });
                        setLoading(false);
                    } else { setLoading(false); toast.error("Address not found"); }
                });
            } catch(e) { console.error(e); }
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
    const startQuick = () => { if(!mapInstance) return; setStep('quick'); saveMeasurement(2500, true); };

    const reset = () => { sections.forEach(s => s.poly?.setMap(null)); areaLabels.forEach(l => l.marker.setMap(null)); setSections([]); setAreaLabels([]); };

    const saveMeasurement = async (areaVal, isQuick=false) => {
        let total = areaVal || sections.reduce((a,b)=>a+b.area,0);
        if(!isQuick) total = Math.round(total * 1.15);

        toast.loading("Saving...");
        try {
            let activeId = lead?.id;
            if (!activeId) {
                const newLead = await base44.entities.Lead.create({
                    address: mapAddress || "Unknown Address",
                    name: "Guest Client",
                    email: "guest@placeholder.com",
                    phone: "0000000000",
                    lead_status: 'New'
                });
                activeId = newLead.id;
            }
            
            const sectionList = isQuick 
                 ? [{ pitch: 6, area: parseInt(total), edges: [] }] 
                 : sections.map(s => ({ pitch: 6, area: parseInt(s.area), edges: [] }));
            
            await base44.entities.RoofMeasurement.create({
                lead_id: activeId,
                total_sqft: parseInt(total),
                status: 'Complete',
                sections_data: sectionList
            });
            
            await base44.entities.Lead.update(activeId, { lead_status: 'Contacted' });
            
            toast.dismiss();
            toast.success("Success!");
            setTimeout(() => navigate(`/quotebuilder?leadId=${activeId}`), 500);
        } catch(e) { 
            console.error(e);
            toast.error("Save Failed: " + (e.message || "Unknown error")); 
        }
    };

    const currentTotal = sections.reduce((acc, s) => acc + s.area, 0);

    return (
        <div className="flex flex-col h-screen w-full relative overflow-hidden">
            <div className="flex-1 relative h-screen w-full">
                <div ref={setMapNode} className="w-full h-full bg-slate-200" />
                
                {step === 'detailed' && (
                   <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                       <Card className="shadow-xl border-0 bg-white/95 backdrop-blur rounded-full px-6 py-2 flex items-center gap-4">
                           <div className="text-sm font-bold text-slate-500 uppercase">Total</div>
                           <div className="text-2xl font-black text-slate-900">{Math.round(currentTotal).toLocaleString()} <span className="text-sm font-normal text-slate-400">sq ft</span></div>
                       </Card>
                   </div>
                )}
                
                <div className="absolute top-6 left-6 z-10">
                    <Button variant="secondary" className="shadow-lg" onClick={() => navigate('/')}>
                        <ArrowLeft className="w-4 h-4 mr-2"/> Back
                    </Button>
                </div>
            </div>

            {loading && <div className="absolute inset-0 z-50 bg-white flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>}

            {!loading && step === 'choice' && (
                <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
                        <div onClick={startQuick} className="bg-white rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all shadow-2xl border-b-8 border-green-500">
                            <Zap className="w-12 h-12 text-green-600 mb-4"/>
                            <h2 className="text-2xl font-bold">Instant Estimate</h2>
                            <p className="text-slate-500">Auto-calculate in seconds.</p>
                        </div>
                        <div onClick={() => setStep('detailed')} className="bg-white rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all shadow-2xl border-b-8 border-blue-600">
                            <PenTool className="w-12 h-12 text-blue-600 mb-4"/>
                            <h2 className="text-2xl font-bold">Precise Measure</h2>
                            <p className="text-slate-500">Draw it yourself.</p>
                        </div>
                    </div>
                </div>
            )}

            {step === 'detailed' && (
                <div className="absolute top-0 right-0 h-full w-80 bg-white border-l z-20 flex flex-col shadow-2xl">
                    <div className="p-6 border-b bg-slate-50">
                        <h2 className="font-bold text-lg text-slate-800">Your Roof</h2>
                        <p className="text-sm text-slate-500 truncate">{mapAddress}</p>
                    </div>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 text-sm">
                            <strong>Instructions:</strong><br/>
                            1. Click "Trace Roof".<br/>
                            2. Tap the corners of your house.<br/>
                            3. Click the first point to close the shape.
                        </div>
                        
                        <Button className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 h-12 font-bold" onClick={() => drawingManager?.setDrawingMode('polygon')}>
                            <MousePointerClick className="w-5 h-5 mr-2"/> Trace Roof
                        </Button>
                        
                        {sections.map((s, i) => (
                            <div key={s.id} className="flex justify-between items-center p-3 bg-slate-100 rounded border">
                                <span className="font-bold text-sm">Section {i+1}</span>
                                <Badge variant="outline" className="bg-white">{s.area} sqft</Badge>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 border-t bg-slate-50 space-y-3">
                        <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50" onClick={reset}>
                            <Eraser className="w-4 h-4 mr-2"/> Start Over
                        </Button>
                        <Button className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-lg" onClick={() => saveMeasurement(0, false)}>
                            <Check className="w-5 h-5 mr-2"/> See My Price
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}