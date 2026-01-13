import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home } from 'lucide-react';

export default function AddressMethodSelector() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  // 1. Clear old data on load
  useEffect(() => {
    sessionStorage.removeItem('homeowner_address');
    sessionStorage.removeItem('measurement_method');
    sessionStorage.removeItem('active_lead_id');
    console.log('🧹 Session cleared for new measurement');

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
        if (place.formatted_address) {
          console.log('📍 Selected:', place.formatted_address);
          setAddress(place.formatted_address);
        }
      });
    } catch (err) {
      console.error("Autocomplete init failed:", err);
    }
  };

  const handleStartMeasurement = (e) => {
    if (e) e.preventDefault(); // Handle form submit

    if (!address) {
      alert('Please enter a property address');
      return;
    }
    
    console.log('🚀 Starting measurement for:', address);
    
    // Save address and defaults
    sessionStorage.setItem('homeowner_address', address);
    sessionStorage.setItem('measurement_method', 'manual');
    
    // Navigate immediately
    navigate(`/measurementpage?address=${encodeURIComponent(address)}&homeowner=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Home className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Aroof</h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Your Free Roof Measurement
          </h2>
          <p className="text-xl text-blue-100">
            Enter your address to get started with satellite measurements
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleStartMeasurement} className="space-y-6">
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
              Start Measurement 🛰️
            </Button>
          </form>
          
          <p className="text-center text-sm text-slate-400 mt-4">
            Uses satellite imagery for precision accuracy
          </p>
        </div>
      </div>
    </div>
  );
}