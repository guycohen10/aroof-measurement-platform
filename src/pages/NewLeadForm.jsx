import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function NewLeadForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlAddress = searchParams.get('address');

    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        address: urlAddress || '', 
        source: 'Online' 
    });

    const addressInputRef = useRef(null);

    // LOAD KEY & AUTOCOMPLETE
    useEffect(() => {
        const initMap = () => {
            if (!window.google?.maps?.places || !addressInputRef.current) return;
            const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'us' }
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address) {
                    setForm(prev => ({ ...prev, address: place.formatted_address }));
                }
            });
        };

        const loadScript = () => {
             let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
             if (!key || key.includes('your_key')) key = localStorage.getItem('user_provided_maps_key');
             
             if(key && !window.google?.maps) {
                 const script = document.createElement('script');
                 script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
                 script.async = true;
                 script.onload = initMap;
                 document.head.appendChild(script);
             } else if(window.google?.maps) {
                 initMap();
             }
        };
        
        loadScript();
    }, []);

    const handleSubmit = () => {
        // Basic validation
        if(!form.name || !form.phone || !form.address) {
            // Using browser alert for simplicity as per user snippet style, or could use toast if available
            // But preserving user logic flow mainly.
            return; 
        }
        
        // SAVE TO SESSION (So Roofer Tool can find it)
        sessionStorage.setItem('lead_address', form.address);
        sessionStorage.setItem('customer_name', form.name);
        sessionStorage.setItem('customer_email', form.email);
        sessionStorage.setItem('customer_phone', form.phone);

        // Also save a 'Temp' ID to trigger the edit mode if needed
        navigate(`/roofermeasurement?leadId=session_new`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
             <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-slate-200">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-slate-900">Contact Details</CardTitle>
                    <p className="text-sm text-slate-500">Where should we send your estimate?</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input 
                            placeholder="John Doe" 
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Property Address</Label>
                        <Input 
                            ref={addressInputRef}
                            placeholder="123 Maple Ave" 
                            value={form.address} 
                            onChange={e => setForm({...form, address: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input 
                            type="email"
                            placeholder="john@example.com" 
                            value={form.email} 
                            onChange={e => setForm({...form, email: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input 
                            type="tel"
                            placeholder="(555) 123-4567" 
                            value={form.phone} 
                            onChange={e => setForm({...form, phone: e.target.value})}
                        />
                    </div>

                    <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 mt-4" onClick={handleSubmit}>
                        Get Instant Estimate <ArrowRight className="ml-2 w-5 h-5"/>
                    </Button>
                    <p className="text-xs text-center text-slate-400 mt-4"><ShieldCheck className="w-3 h-3 inline mr-1"/> Your data is secure and private.</p>
                </CardContent>
             </Card>
        </div>
    );
}