import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home, ShieldCheck, Star, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Start() {
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const inputRef = useRef(null);

    // LOAD MAPS SCRIPT (Robust)
    useEffect(() => {
        const loadScript = () => {
            if (window.google?.maps?.places) {
                initAutocomplete();
                return;
            }

            let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (!key || key.includes('your_key')) key = localStorage.getItem('user_provided_maps_key');
            
            if (key) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
                script.async = true;
                script.onload = initAutocomplete;
                script.onerror = () => console.warn("Google Maps blocked/missing - Manual input active");
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
                    if (place.formatted_address) setAddress(place.formatted_address);
                });
            } catch(e) { console.error(e); }
        };

        loadScript();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!address) return;
        // Navigate to Measurement Choice Page
        navigate(`/measurement-choice?address=${encodeURIComponent(address)}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            {/* HERO */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        See Your Home with a <br/>
                        <span className="text-blue-600">Brand New Roof</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        AI-powered visualization + instant pricing. 100% free, no obligation.
                    </p>
                    
                    {/* SEARCH CARD */}
                    <Card className="max-w-xl mx-auto shadow-2xl border-0 ring-4 ring-blue-50/50 mt-10 bg-white">
                        <CardContent className="p-2">
                            <form onSubmit={handleSubmit} className="relative">
                                <div className="absolute top-0 left-0 pl-4 pt-4 text-xs font-bold text-slate-400 uppercase tracking-wider pointer-events-none">
                                    Your Home Address
                                </div>
                                <Input 
                                    ref={inputRef}
                                    className="h-20 pl-4 pt-6 text-lg border-0 shadow-none focus-visible:ring-0 bg-transparent placeholder:text-slate-300" 
                                    placeholder="e.g. 123 Maple Ave"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    className={`w-full h-14 text-lg font-bold transition-all duration-300 mt-2 ${address ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-400'}`}
                                >
                                    Show Me My New Roof <ArrowRight className="ml-2 w-5 h-5"/>
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* TRUST SIGNALS */}
                    <div className="flex flex-wrap justify-center gap-8 pt-12 opacity-80">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Home className="w-5 h-5 text-blue-500"/> 5,000+ Homes Visualized
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500"/> 4.9 Rating
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <ShieldCheck className="w-5 h-5 text-green-500"/> Licensed & Insured
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <div className="bg-white py-12 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="text-4xl mb-2">⚡</div>
                        <h3 className="font-bold text-slate-800">60-Second Process</h3>
                    </div>
                    <div>
                        <div className="text-4xl mb-2">💯</div>
                        <h3 className="font-bold text-slate-800">100% Free & Private</h3>
                    </div>
                    <div>
                        <div className="text-4xl mb-2">🤝</div>
                        <h3 className="font-bold text-slate-800">Connect with Top Roofers</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}