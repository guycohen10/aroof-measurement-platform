import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Info, CheckCircle, Camera, Loader2, User, Mail, Phone, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function MeasurementPage() {
    const [searchParams] = useSearchParams();
    const rawAddress = searchParams.get('address');
    const urlLeadId = searchParams.get('leadId')?.replace(/"/g, '');

    const [loading, setLoading] = useState(true);
    const [mapAddress, setMapAddress] = useState(rawAddress ? decodeURIComponent(rawAddress) : '');
    const [lead, setLead] = useState(null);
    const [sections, setSections] = useState([]);

    const [mapNode, setMapNode] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [drawingManager, setDrawingManager] = useState(null);

    // Contact Modal State
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    // 1. INIT
    useEffect(() => {
        const init = async () => {
            if (urlLeadId) {
                try {
                    const l = await base44.entities.Lead.get(urlLeadId);
                    setLead(l);
                    if (l.address) setMapAddress(l.address);
                } catch (e) {
                    console.warn("Invalid Lead ID");
                }
            }
        };
        init();
    }, [urlLeadId]);

    // 2. MAP SETUP
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
                        const map = new Map(mapNode, { center: results[0].geometry.location, zoom: 21, mapTypeId: 'satellite', disableDefaultUI: true, tilt: 0 });
                        setMapInstance(map);
                        new Marker({ position: results[0].geometry.location, map: map });
                        const manager = new google.maps.drawing.DrawingManager({
                            drawingMode: null,
                            drawingControl: false,
                            polygonOptions: { fillColor: '#10b981', fillOpacity: 0.4, strokeColor: '#059669', strokeWeight: 2, editable: true }
                        });
                        manager.setMap(map);
                        setDrawingManager(manager);
                        google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
                            const area = google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                            const id = Date.now();

                            // Label
                            const bounds = new google.maps.LatLngBounds();
                            poly.getPath().forEach(p => bounds.extend(p));
                            new google.maps.Marker({
                                position: bounds.getCenter(),
                                map: map,
                                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
                                label: { text: `${Math.round(area).toLocaleString()} sq ft`, color: "white", fontWeight: "bold", fontSize: "14px" }
                            });
                            setSections(p => [...p, { id, area: Math.round(area), poly }]);
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

    // 3. FINAL SAVE (Triggered by Modal)
    const handleFinalSave = async () => {
        if (!formData.name || !formData.phone) {
            toast.error("Name and Phone are required");
            return;
        }

        const total = Math.round(sections.reduce((acc, s) => acc + s.area, 0) * 1.15); // Waste
        toast.loading("Finalizing...");
        try {
            let activeId = lead?.id;

            // CREATE/UPDATE LEAD
            if (!activeId) {
                const newLead = await base44.entities.Lead.create({
                    address: mapAddress,
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    lead_status: 'New',
                    lead_source: 'Website'
                });
                activeId = newLead.id;
            } else {
                await base44.entities.Lead.update(activeId, {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                });
            }

            // SAVE MEASUREMENT
            const m = await base44.entities.RoofMeasurement.create({
                lead_id: activeId,
                total_sqft: parseInt(total),
                status: 'Complete',
                sections_data: sections.map(s => ({ pitch: 6, area: parseInt(s.area), edges: [] }))
            });

            await base44.entities.Lead.update(activeId, { lead_status: 'Contacted' });

            toast.dismiss(); toast.success("Done!");
            // *** REDIRECT TO RESULTS PAGE ***
            window.location.href = `/results?measurementId=${m.id}`;
        } catch (e) {
            console.error(e);
            toast.error("Save failed: " + (e.message || "Unknown error"));
        }
    };

    const currentTotal = sections.reduce((acc, s) => acc + s.area, 0);

    return (
        <div className="flex h-screen w-full relative overflow-hidden bg-white">
            {/* LEFT SIDEBAR (Fixed) */}
            <div className="w-80 border-r flex flex-col z-20 h-full bg-white shadow-xl">
                <div className="p-4 border-b bg-white">
                    <div className="flex items-center gap-2 mb-1">
                        <MapIcon className="w-5 h-5 text-blue-600" />
                        <h2 className="font-bold text-lg text-slate-800">Your Property</h2>
                    </div>
                    <p className="text-sm text-slate-500 truncate font-medium">{mapAddress}</p>
                </div>

                <div className="p-4 bg-slate-50 border-b space-y-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-sm" onClick={() => drawingManager?.setDrawingMode('polygon')}>
                        <Plus className="w-4 h-4 mr-2" /> Add Section {sections.length + 1}
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-2">
                            <Info className="w-3 h-3" /> How to Use:
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600 pl-1">
                            <li className="flex gap-2"><span className="text-blue-500 font-bold">1.</span> Click "Add Section" button.</li>
                            <li className="flex gap-2"><span className="text-blue-500 font-bold">2.</span> Click points around roof area.</li>
                            <li className="flex gap-2"><span className="text-blue-500 font-bold">3.</span> Click first point to close.</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        {sections.map((s, i) => (
                            <div key={s.id} className="flex justify-between items-center p-2 bg-white border rounded text-sm shadow-sm">
                                <span className="font-medium text-slate-700">Section {i + 1}</span>
                                <Badge variant="secondary">{s.area} sqft</Badge>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t space-y-4">
                    <div className="bg-slate-100 rounded p-3 text-center">
                        <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Total Roof Area</div>
                        <div className="text-2xl font-black text-slate-900">{Math.round(currentTotal).toLocaleString()} <span className="text-base font-normal text-slate-500">sq ft</span></div>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-white font-bold shadow-lg" onClick={() => {
                        if (sections.length === 0) toast.error("Draw a section first");
                        else setIsContactOpen(true);
                    }}>
                        <CheckCircle className="w-5 h-5 mr-2" /> Complete Measurement
                    </Button>
                </div>
            </div>
            {/* MAP AREA */}
            <div className="flex-1 relative h-screen bg-slate-200">
                <div className="absolute top-4 left-4 right-4 h-12 bg-blue-600 rounded-lg shadow-xl z-10 flex items-center px-4 text-white">
                    <Camera className="w-5 h-5 mr-2" />
                    <span className="font-bold text-sm">Live Satellite View</span>
                </div>
                <div ref={setMapNode} className="w-full h-full" />
                {loading && <div className="absolute inset-0 bg-white z-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>}
            </div>
            {/* CONTACT MODAL */}
            <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Almost Done!</DialogTitle>
                        <DialogDescription>Where should we send your official measurement report?</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><label className="text-sm font-medium">Full Name</label><div className="relative"><User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><Input className="pl-9" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Email Address</label><div className="relative"><Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><Input className="pl-9" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Phone Number</label><div className="relative"><Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><Input className="pl-9" placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div></div>
                        <Button className="w-full bg-green-600 h-12 text-lg font-bold mt-4" onClick={handleFinalSave}>View My Quote</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}