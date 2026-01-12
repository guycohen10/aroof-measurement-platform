import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Zap, Edit3 } from 'lucide-react';

export default function AddressMethodSelector() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState(null);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  // Load Google Places autocomplete
  useEffect(() => {
    const loadGooglePlaces = () => {
      if (window.google?.maps?.places) {
        initAutocomplete();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    loadGooglePlaces();
  }, []);

  const initAutocomplete = () => {
    if (!addressInputRef.current || !window.google?.maps?.places) return;

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
        setAddress(place.formatted_address);
      }
    });
  };

  const handleContinue = () => {
    if (!address) {
      alert('Please enter a property address');
      return;
    }

    if (!method) {
      alert('Please select a measurement method');
      return;
    }

    console.log('🚀 ═══════════════════════════════════');
    console.log('🚀 CONTINUING TO MEASUREMENT');
    console.log('🚀 Address:', address);
    console.log('🚀 Method:', method);
    console.log('🚀 ═══════════════════════════════════');

    // Save to session storage
    sessionStorage.setItem('homeowner_address', address);
    sessionStorage.setItem('measurement_method', method);
    
    // IMPORTANT: Clear any old measurement data
    sessionStorage.removeItem('active_lead_id');
    sessionStorage.removeItem('lead_address');
    sessionStorage.removeItem('pending_measurement_id');
    
    console.log('✅ Saved to session storage');
    console.log('📦 homeowner_address:', sessionStorage.getItem('homeowner_address'));
    console.log('📦 measurement_method:', sessionStorage.getItem('measurement_method'));

    if (method === 'solar') {
      const url = `/results?address=${encodeURIComponent(address)}&method=solar`;
      console.log('🚀 Navigating to:', url);
      navigate(url);
    } else {
      const url = `/measurementpage?address=${encodeURIComponent(address)}&homeowner=true`;
      console.log('🚀 Navigating to:', url);
      navigate(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-blue-700 bg-blue-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Aroof</span>
            </Link>
            <Link to={createPageUrl("Homepage")}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center text-white mb-10">
            <h1 className="text-5xl font-bold mb-3">Measure Your Roof</h1>
            <p className="text-xl text-blue-100">Get accurate measurements in minutes</p>
          </div>

          {/* Main Card */}
          <Card className="shadow-2xl border-0">
            <CardContent className="p-8 space-y-8">
              {/* Step 1: Address */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900">Step 1: Enter Your Address</h2>
                <Label htmlFor="address" className="text-lg font-semibold mb-3 block">
                  Property Address *
                </Label>
                <Input
                   id="address"
                   ref={addressInputRef}
                   value={address}
                   onChange={(e) => setAddress(e.target.value)}
                   placeholder="123 Main St, Dallas, TX..."
                   className="text-lg p-4 h-14"
                   autoComplete="off"
                   autoCorrect="off"
                   autoCapitalize="off"
                   spellCheck="false"
                   name="property_address_new"
                   data-lpignore="true"
                   data-form-type="other"
                 />
                <p className="text-sm text-slate-500 mt-2">
                  Start typing and select from the dropdown
                </p>
              </div>

              {/* Step 2: Method Selection */}
              {address && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Step 2: Choose Your Method</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Estimate */}
                    <div
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        method === 'solar'
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-300'
                          : 'border-slate-200 hover:border-green-300'
                      }`}
                      onClick={() => setMethod('solar')}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-4xl">⚡</div>
                        <h3 className="text-xl font-bold text-slate-900">Quick Estimate</h3>
                      </div>
                      <p className="text-slate-600 mb-4 font-medium">
                        Instant measurements using satellite data
                      </p>
                      <ul className="text-sm text-slate-600 space-y-2">
                        <li>✓ 30 seconds</li>
                        <li>✓ Automatic calculation</li>
                        <li>✓ Great for estimates</li>
                        <li>✓ Perfect for homeowners</li>
                      </ul>
                    </div>

                    {/* Detailed Drawing */}
                    <div
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        method === 'manual'
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                      onClick={() => setMethod('manual')}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-4xl">✏️</div>
                        <h3 className="text-xl font-bold text-slate-900">Detailed Drawing</h3>
                      </div>
                      <p className="text-slate-600 mb-4 font-medium">
                        Precisely draw your roof outline
                      </p>
                      <ul className="text-sm text-slate-600 space-y-2">
                        <li>✓ Most accurate</li>
                        <li>✓ Custom shapes</li>
                        <li>✓ Professional quality</li>
                        <li>✓ Full control</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              {address && method && (
                <div className="text-center pt-4">
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="px-12 py-6 text-lg h-auto bg-blue-600 hover:bg-blue-700"
                  >
                    {method === 'solar' ? '⚡ Get Quick Estimate' : '✏️ Start Drawing'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}