import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Start() { 
    const navigate = useNavigate(); 
    const [address, setAddress] = useState(''); 
    const inputRef = useRef(null);

    useEffect(() => { 
        // 1. Check if Google Maps is already loaded by the main app 
        if (window.google?.maps?.places) { 
            initAutocomplete(); 
            return; 
        }

        // 2. If not, wait 1 second (it might be loading) then try once more
        const timer = setTimeout(() => {
            if (window.google?.maps?.places) initAutocomplete();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const initAutocomplete = () => { 
        if (!inputRef.current) return; 
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

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        if(!address) return; 
        // Save data and move to form 
        sessionStorage.setItem('client_address', address); 
        navigate(`/newleadform?address=${encodeURIComponent(address)}`); 
    };

    return (
        <div className="min-h-screen bg-slate-900 relative flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1632759929280-a6cb9089a80e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
            
            <div className="relative z-10 w-full max-w-2xl space-y-8 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-xl">
                    Get Your Instant <span className="text-blue-500">Roof Quote</span>
                </h1>
                <p className="text-xl text-slate-200 drop-shadow-md max-w-lg mx-auto">
                    Professional roofing estimates in seconds using AI technology.
                </p>

                <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur p-2">
                    <CardContent className="p-2">
                        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-4 top-4 text-slate-400"/>
                                <Input 
                                    ref={inputRef}
                                    className="h-14 pl-12 text-lg border-0 bg-transparent focus-visible:ring-0 shadow-none" 
                                    placeholder="Enter your home address..."
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                                Go <ArrowRight className="ml-2 w-5 h-5"/>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    ); 
}