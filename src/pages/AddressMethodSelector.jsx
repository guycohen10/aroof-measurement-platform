import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, Zap, Ruler, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AddressMethodSelector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [address, setAddress] = useState('');
  const [showChoices, setShowChoices] = useState(false);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  // 1. Check URL param and Clear old data on load
  useEffect(() => {
    const urlAddress = searchParams.get('address');
    if (urlAddress) {
      setAddress(decodeURIComponent(urlAddress));
      setShowChoices(true);
    } else {
      sessionStorage.removeItem('homeowner_address');
      sessionStorage.removeItem('measurement_method');
      sessionStorage.removeItem('active_lead_id');
      console.log('🧹 Session cleared for new measurement');
    }

    // Load Google Maps
    const loadGooglePlaces = () => {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (window.google?.maps?.places && window.google?.maps?.drawing) {
        initAutocomplete();
        return;
      }
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`;
        script.async = true;
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      } else {
        setTimeout(initAutocomplete, 500);
      }
    };
    loadGooglePlaces();
  }, []);

  const initAutocomplete = () => {
    // CRITICAL FIX: addressInputRef.current was null because of typo
    if (!addressInputRef.current || !window.google?.maps?.places) return;

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'geometry']
        }
      );
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address && place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          console.log('📍 Selected:', place.formatted_address);
          console.log('📍 Coords:', lat, lng);
          
          setAddress(place.formatted_address);
          
          // SAVE COORDS TO SESSION
          sessionStorage.setItem('homeowner_lat', lat);
          sessionStorage.setItem('homeowner_lng', lng);
        }
      });
    } catch (err) {
      console.error("Autocomplete init failed:", err);
    }
  };

  const handleAddressSubmit = (e) => {
    if (e) e.preventDefault();
    if (!address) {
      alert('Please enter a property address');
      return;
    }
    setShowChoices(true);
  };

  const handleChoice = (type) => {
    console.log('🚀 Starting measurement:', type, 'for:', address);
    sessionStorage.setItem('homeowner_address', address);
    
    if (type === 'quick') {
        navigate(`/quick-estimate?address=${encodeURIComponent(address)}`);
    } else {
        sessionStorage.setItem('measurement_method', 'manual');
        navigate(`/measurementpage?address=${encodeURIComponent(address)}&homeowner=true`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Home className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Aroof</h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {showChoices ? "Choose Your Estimate Type" : "Get Your Free Roof Measurement"}
          </h2>
          <p className="text-xl text-blue-100">
            {showChoices ? `For: ${address}` : "Enter your address to get started with satellite measurements"}
          </p>
        </div>

        {!showChoices ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <div>
                <Label htmlFor="address" className="text-lg mb-2 block">Property Address</Label>
                <Input
                  id="address"
                  ref={addressInputRef}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Start typing address..."
                  className="text-lg p-6 h-16 shadow-inner"
                  autoComplete="off"
                />
              </div>
              
              <Button 
                type="submit"
                size="lg" 
                className="w-full text-xl py-8 font-bold shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={!address}
              >
                Continue <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </form>
            <p className="text-center text-sm text-slate-400 mt-4">
              Uses satellite imagery for precision accuracy
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Estimate Option */}
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-blue-500" onClick={() => handleChoice('quick')}>
              <CardContent className="p-8 flex flex-col items-center text-center h-full">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Quick Estimate</h3>
                <p className="text-slate-600 mb-8 flex-1">
                  Get an instant ballpark estimate using AI and Google Solar API data. Perfect for a fast price check.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                  Select Quick Estimate
                </Button>
              </CardContent>
            </Card>

            {/* Detailed Measurement Option */}
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-green-500" onClick={() => handleChoice('detailed')}>
              <CardContent className="p-8 flex flex-col items-center text-center h-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Ruler className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Detailed Measurement</h3>
                <p className="text-slate-600 mb-8 flex-1">
                  Draw your roof sections on a satellite map for maximum precision. Best for accurate quotes.
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                  Select Detailed Tool
                </Button>
              </CardContent>
            </Card>
            
            <button onClick={() => setShowChoices(false)} className="md:col-span-2 text-white/70 hover:text-white underline mt-4">
                Change Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}