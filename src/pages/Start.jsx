import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Star, ShieldCheck, MapPin, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Start() {
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const inputRef = useRef(null);

    // SAFE MAP LOADER
    useEffect(() => {
        const loadScript = () => {
            // 1. If Google is already there, just init
            if (window.google?.maps?.places) {
                initAutocomplete();
                return;
            }

            // 2. Else, try to find a key and load it
            let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (!key || key.includes('your_key')) key = localStorage.getItem('user_provided_maps_key');
            
            if (key) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
                script.async = true;
                script.onload = initAutocomplete;
                script.onerror = () => console.warn("Maps failed to load");
                document.head.appendChild(script);
            }
        };

        const initAutocomplete = () => {
            if (!inputRef.current || !window.google?.maps?.places) return;
            try {
                const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                    types: ['address'],
                    componentRestrictions: { country: 'us' }
                });
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.formatted_address) {
                        setAddress(place.formatted_address);
                    }
                });
            } catch(e) { console.error(e); }
        };

        loadScript();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!address) return;
        // Navigate directly to the Measurement Tool (Value-First Flow)
        navigate(`/measurementpage?address=${encodeURIComponent(address)}`);
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* HERO SECTION */}
            <div className="bg-blue-900 text-white py-24 px-4 text-center relative overflow-hidden flex-1 flex items-center justify-center">
                <div className="max-w-4xl mx-auto z-10 relative">
                    <div className="inline-flex items-center gap-2 bg-blue-800/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium mb-8 border border-blue-700">
                        <ShieldCheck className="w-3 h-3"/> Trusted Platform for DFW Roofing
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
                        Get Your Roof Measured <br/>
                        <span className="text-blue-400">Free in 60 Seconds</span>
                    </h1>
                    <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
                        AI-powered measurements + instant pricing. See your home with a new roof today.
                    </p>
                    
                    {/* SEARCH BAR */}
                    <Card className="max-w-xl mx-auto shadow-2xl border-0 overflow-hidden">
                        <CardContent className="p-2">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <div className="relative flex-1 text-left">
                                    <MapPin className="absolute left-4 top-4 text-slate-400"/>
                                    <Input 
                                        ref={inputRef}
                                        className="h-14 pl-12 text-lg border-0 bg-transparent focus-visible:ring-0 text-slate-900 placeholder:text-slate-400" 
                                        placeholder="Enter your home address..."
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700">
                                    Start <ArrowRight className="ml-2 w-5 h-5"/>
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-blue-300 opacity-80">
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> 5,000+ Roofs Measured</span>
                        <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400"/> 4.9 Rating</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> $2M+ Projects</span>
                    </div>
                </div>
            </div>
        </div>
    );
}