import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Info, CheckCircle, Camera, Loader2, User, Mail, Phone, Map as MapIcon, Trash2, ZoomIn, ZoomOut, RotateCw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SECTION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
const PITCH_FACTORS = { 0: 1.0, 4: 1.054, 5: 1.083, 6: 1.118, 7: 1.158, 8: 1.202, 9: 1.25, 10: 1.302, 12: 1.414 };

export default function MeasurementPage() {
    const [searchParams] = useSearchParams();
    const rawAddress = searchParams.get('address');
    const urlLeadId = searchParams.get('leadId')?.replace(/"/g, '');

    const [loading, setLoading] = useState(true);
    const [mapAddress, setMapAddress] = useState(rawAddress ? decodeURIComponent(rawAddress) : '');
    const [lead, setLead] = useState(null);
    const [sections, setSections] = useState([]);
    
    // Ref to access latest sections inside map event listeners
    const sectionsRef = useRef([]);

    const [mapNode, setMapNode] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [drawingManager, setDrawingManager] = useState(null);

    // Map Controls
    const [zoom, setZoom] = useState(20);
    const [tilt, setTilt] = useState(0);

    const [isContactOpen, setIsContactOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    // Sync ref
    useEffect(() => {
        sectionsRef.current = sections;
    }, [sections]);

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
                        const map = new Map(mapNode, {
                            center: results[0].geometry.location,
                            zoom: 20,
                            mapTypeId: 'satellite',
                            disableDefaultUI: true,
                            tilt: 0,
                            heading: 0
                        });
                        setMapInstance(map);
                        new Marker({ position: results[0].geometry.location, map: map });
                        
                        const manager = new google.maps.drawing.DrawingManager({
                            drawingMode: null,
                            drawingControl: false,
                            polygonOptions: { 
                                strokeWeight: 2, 
                                editable: true, 
                                fillOpacity: 0.4,
                                clickable: true
                            }
                        });
                        manager.setMap(map);
                        setDrawingManager(manager);

                        google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
                            const id = Date.now();
                            
                            // FIX #4: Distinct Colors
                            const currentCount = sectionsRef.current.length;
                            const colorIndex = currentCount % SECTION_COLORS.length;
                            const color = SECTION_COLORS[colorIndex];

                            poly.setOptions({ 
                                fillColor: color, 
                                strokeColor: color 
                            });

                            const flatArea = google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764;
                            const defaultPitch = 6;
                            const factor = PITCH_FACTORS[defaultPitch] || 1.118;
                            const adjustedArea = Math.round(flatArea * factor);

                            const bounds = new google.maps.LatLngBounds();
                            poly.getPath().forEach(p => bounds.extend(p));
                            
                            const label = new google.maps.Marker({
                                position: bounds.getCenter(),
                                map: map,
                                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
                                label: { 
                                    text: `${adjustedArea}`, 
                                    color: "white", 
                                    fontWeight: "bold", 
                                    fontSize: "14px",
                                    className: 'map-label-text'
                                }
                            });
                            
                            // Store flatArea separately for accurate recalculations
                            setSections(prev => [...prev, { 
                                id, 
                                flatArea: Math.round(flatArea),
                                adjustedArea,
                                pitch: defaultPitch, 
                                poly, 
                                label, 
                                color 
                            }]);
                            manager.setDrawingMode(null);
                        });
                        setLoading(false);
                    } else { setLoading(false); toast.error("Address not found"); }
                });
            } catch (e) { 
                console.error(e);
                setLoading(false);
                toast.error("Failed to load map libraries");
            }
        };

        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('user_provided_maps_key');
        if (!key) {
            setLoading(false);
            toast.error("Missing Google Maps API Key");
            return;
        }
        
        if (!window.google?.maps && key) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,drawing,geometry`;
            script.async = true;
            script.onload = loadMap;
            document.head.appendChild(script);
        } else if (window.google?.maps) { loadMap(); }

    }, [mapNode, mapAddress]);

    // 3. ACTIONS
    const handleZoom = (delta) => { if (mapInstance) { const newZoom = mapInstance.getZoom() + delta; mapInstance.setZoom(newZoom); setZoom(newZoom); } };
    const handleRotate = () => { if (mapInstance) { mapInstance.setHeading((mapInstance.getHeading() || 0) + 90); } };
    const handleTilt = () => { if (mapInstance) { const newTilt = mapInstance.getTilt() === 0 ? 45 : 0; mapInstance.setTilt(newTilt); setTilt(newTilt); } };
    
    const deleteSection = (id) => { 
        const target = sections.find(s => s.id === id); 
        if (target) { 
            target.poly.setMap(null); 
            target.label.setMap(null); 
            setSections(prev => prev.filter(s => s.id !== id)); 
        } 
    };

    // FIX #3: Recalculate area on pitch change
    const handlePitchChange = (id, newPitchVal) => {
        const newPitch = Number(newPitchVal);
        setSections(prev => prev.map(s => {
            if (s.id === id) {
                // Ensure we use the factor correctly
                const factor = PITCH_FACTORS[newPitch] || 1.0;
                // Use flatArea from state which should be the base unadjusted area
                const newAdjusted = Math.round(s.flatArea * factor);
                
                // Update map label immediately
                if (s.label) {
                    s.label.setLabel({
                        text: `${newAdjusted}`,
                        color: "white", 
                        fontWeight: "bold", 
                        fontSize: "14px",
                        className: 'map-label-text'
                    });
                }
                
                return { ...s, pitch: newPitch, adjustedArea: newAdjusted };
            }
            return s;
        }));
    };

    // 4. SAVE
    const handleFinalSave = async () => {
        if (!formData.name || !formData.phone) {
            toast.error("Name and Phone required");
            return;
        }
        
        // Calculate total from adjusted areas
        const total = Math.round(sections.reduce((acc, s) => acc + s.adjustedArea, 0));
        toast.loading("Finalizing...");

        try {
            let activeId = lead?.id;
            // 1. Upsert Lead
            if (!activeId) {
                const newLead = await base44.entities.Lead.create({
                    address: mapAddress,
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    lead_status: 'New',
                });
                activeId = newLead.id;
            } else {
                await base44.entities.Lead.update(activeId, {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                });
            }

            // 2. Create Measurement
            console.log("Saving measurement for Lead:", activeId);
            const m = await base44.entities.RoofMeasurement.create({
                lead_id: activeId,
                total_sqft: parseInt(total),
                status: 'Complete',
                sections_data: sections.map(s => ({
                    pitch: parseInt(s.pitch),
                    area: parseInt(s.adjustedArea), // Store adjusted area
                    flat_area: parseInt(s.flatArea), // Store flat area reference
                    color: s.color,
                    path: s.poly.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() })),
                    edges: []
                }))
            });

            await base44.entities.Lead.update(activeId, { lead_status: 'Contacted' });

            // FIX #1: Robust Redirect
            console.log("✅ Measurement created successfully:", m);
            console.log("✅ Redirecting to results with ID:", m.id);
            toast.dismiss(); 
            toast.success("Done!");
            
            if (!m || !m.id) throw new Error("Created measurement has no ID");

            // Navigate to results
            navigate(`/Results?measurementId=${m.id}`);

        } catch (e) {
            console.error("❌ Measurement save failed:", e);
            console.error("Error details:", e.message);
            
            if (e.message?.includes("Permission")) {
                toast.error("Database Locked: Please enable Public Access for 'Lead' entity.");
            } else {
                toast.error("Save failed: " + (e.message || "Unknown error"));
            }
        }
    };

    const currentTotal = sections.reduce((acc, s) => acc + s.adjustedArea, 0);

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
                    {/* CONTROLS */}
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        <Button variant="outline" size="icon" onClick={() => handleZoom(1)}><ZoomIn className="w-4 h-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => handleZoom(-1)}><ZoomOut className="w-4 h-4" /></Button>
                        <Button variant="outline" size="icon" onClick={handleRotate}><RotateCw className="w-4 h-4" /></Button>
                        <Button variant="outline" size="icon" onClick={handleTilt} className={tilt > 0 ? "bg-blue-100 text-blue-600" : ""}><Layers className="w-4 h-4" /></Button>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-sm" onClick={() => drawingManager?.setDrawingMode('polygon')}>
                        <Plus className="w-4 h-4 mr-2" /> Add Section
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-2">
                            <Info className="w-3 h-3" /> Instructions:
                        </div>
                        <ul className="space-y-1 text-xs text-slate-600 pl-1">
                            <li>1. Controls help see trees.</li>
                            <li>2. Click "Add Section".</li>
                            <li>3. Trace roof & Set Pitch.</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        {sections.map((s, i) => (
                            <div key={s.id} className="p-3 bg-white border rounded shadow-sm relative border-l-4" style={{ borderLeftColor: s.color }}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm text-slate-700">Section {i + 1}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{s.adjustedArea} sqft</Badge>
                                        <button onClick={() => deleteSection(s.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-bold">Pitch:</span>
                                    <Select value={s.pitch.toString()} onValueChange={v => handlePitchChange(s.id, v)}>
                                        <SelectTrigger className="h-8 text-xs bg-slate-50 w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>{[0, 4, 5, 6, 7, 8, 9, 10, 12].map(p => <SelectItem key={p} value={p.toString()}>{p}/12</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
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
                    <DialogHeader><DialogTitle>Almost Done!</DialogTitle><DialogDescription>Where should we send your report?</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1"><label className="text-xs font-bold">NAME</label><Input placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold">EMAIL</label><Input placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold">PHONE</label><Input placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                        <Button className="w-full bg-green-600 h-12 text-lg font-bold mt-4" onClick={handleFinalSave}>View My Quote</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}