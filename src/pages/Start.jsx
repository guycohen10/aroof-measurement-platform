import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Start() {
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    // ROBUST KEY LOADER
    useEffect(() => {
        const loadScript = () => {
            // 1. Try Environment
            let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            
            // 2. Try Local Storage (The Admin Key)
            if (!key || key.includes('your_key')) {
                key = localStorage.getItem('user_provided_maps_key');
            }

            if (!key) {
                console.error("No API Key found");
                return;
            }

            if (window.google?.maps) {
                initAutocomplete();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
            script.async = true;
            script.onload = initAutocomplete;
            document.head.appendChild(script);
        };

        const initAutocomplete = () => {
            if (!inputRef.current || !window.google?.maps?.places) return;
            
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
        };

        loadScript();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!address) return;
        setLoading(true);
        
        // Save to session to ensure data passes to next step
        sessionStorage.setItem('client_address', address);
        
        // Use timeout to allow UI update
        setTimeout(() => navigate(`/newleadform?address=${encodeURIComponent(address)}`), 300);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* HERO */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20 relative overflow-hidden">
                <div className="max-w-4xl mx-auto z-10 space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        See Your Home with a <br/>
                        <span className="text-blue-600">Brand New Roof</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        AI-powered visualization + instant pricing. 100% free, no obligation.
                    </p>
                    
                    {/* SEARCH BOX */}
                    <Card className="max-w-xl mx-auto shadow-2xl border-0 ring-4 ring-blue-50/50 mt-10 transform hover:scale-[1.01] transition-all duration-300">
                        <CardContent className="p-2">
                            <form onSubmit={handleSubmit} className="relative">
                                <div className="absolute top-0 left-0 pl-4 pt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                                    className={`w-full h-14 text-lg font-bold transition-all duration-300 ${address ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30' : 'bg-slate-100 text-slate-400'}`}
                                >
                                    {loading ? "Locating..." : "Show Me My New Roof"} <ArrowRight className="ml-2 w-5 h-5"/>
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* TRUST SIGNALS */}
                    <div className="flex flex-wrap justify-center gap-8 pt-8 opacity-80">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Home className="w-5 h-5 text-blue-500"/> 5,000+ Homes Visualized
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500"/> 4.9★ Rating
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <ShieldCheck className="w-5 h-5 text-green-500"/> Licensed & Insured
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}