import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function NewLeadForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        address: searchParams.get('address') || sessionStorage.getItem('client_address') || '' 
    });

    const addressInputRef = useRef(null);

    // MAP LOADER (For Autocomplete)
    useEffect(() => {
        const loadScript = () => {
            let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('user_provided_maps_key');
            
            if(key && !window.google?.maps) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
                script.async = true;
                script.onload = initAutocomplete;
                document.head.appendChild(script);
            } else if (window.google?.maps) {
                initAutocomplete();
            }
        };

        const initAutocomplete = () => {
            if (!addressInputRef.current || !window.google?.maps?.places) return;
            try {
                const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, { types: ['address'] });
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.formatted_address) setForm(prev => ({ ...prev, address: place.formatted_address }));
                });
            } catch(e) { console.error(e); }
        };
        loadScript();
    }, []);

    const handleSubmit = async () => {
        if(!form.name || !form.address) {
            toast.error("Name and Address required");
            return;
        }
        setLoading(true);
        toast.loading("Creating your project...");

        try {
            // 1. CREATE REAL DB RECORD
            // Mapping fields to Lead entity schema
            const newLead = await base44.entities.Lead.create({
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                lead_status: 'New',
                purchase_count: 0,
                assigned_company_id: null // Explicitly null for marketplace
            });
            
            // 2. SAVE ID FOR SESSION
            sessionStorage.setItem('active_lead_id', newLead.id);
            sessionStorage.setItem('lead_address', form.address);
            sessionStorage.setItem('customer_name', form.name);
            sessionStorage.setItem('customer_email', form.email);
            sessionStorage.setItem('customer_phone', form.phone);
            
            toast.dismiss();
            
            // 3. NAVIGATE WITH REAL ID
            navigate(`/roofermeasurement?leadId=${newLead.id}`);
        } catch(e) {
            console.error(e);
            toast.dismiss();
            toast.error("Connection Error. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-slate-100">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-slate-900">Get Your Estimate</CardTitle>
                    <p className="text-sm text-slate-500">We just need a few details to prepare your report.</p>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                                id="name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                className="h-11"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={form.email}
                                onChange={(e) => setForm({...form, email: e.target.value})}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                                id="phone"
                                type="tel"
                                placeholder="(555) 123-4567"
                                value={form.phone}
                                onChange={(e) => setForm({...form, phone: e.target.value})}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Property Address</Label>
                            <Input 
                                id="address"
                                ref={addressInputRef}
                                placeholder="123 Main St..."
                                value={form.address}
                                onChange={(e) => setForm({...form, address: e.target.value})}
                                className="h-11"
                            />
                        </div>
                    </div>

                    <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 mt-6 font-bold shadow-lg shadow-blue-600/20" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Processing..." : "Get Instant Estimate"} <ArrowRight className="ml-2 w-5 h-5"/>
                    </Button>
                    <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3 inline mr-1 text-green-500"/> Your data is secure and private.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}