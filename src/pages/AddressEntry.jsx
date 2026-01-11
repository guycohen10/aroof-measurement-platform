import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddressEntry() {
  const navigate = useNavigate();
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [placesError, setPlacesError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    checkIfRooferAndRedirect();
  }, []);

  const checkIfRooferAndRedirect = async () => {
    try {
      const user = await base44.auth.me();
      if (user && user.aroof_role === 'external_roofer') {
        navigate(createPageUrl("RooferDashboard"));
      }
    } catch {
      // Not logged in - show form (homeowner path)
    }
  };

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setPlacesLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogle);
          setPlacesLoaded(true);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          setPlacesError("Google Maps is taking too long to load. Please refresh the page.");
        }
      }, 10000);
      
      return;
    }

    const apiKey = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    window.initGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setPlacesLoaded(true);
      } else {
        setPlacesError("Google Maps loaded but Places library is not available.");
      }
    };
    
    script.onerror = () => {
      setPlacesError("Failed to load Google Maps. Please check your internet connection and refresh the page.");
    };

    document.head.appendChild(script);

    return () => {
      delete window.initGoogleMaps;
    };
  }, []);

  useEffect(() => {
    if (!placesLoaded || !addressInputRef.current) {
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'geometry', 'address_components']
        }
      );

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          setSelectedPlace(null);
          return;
        }

        const placeData = {
          formatted_address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        setSelectedPlace(placeData);
        setAddress(place.formatted_address);
      });
    } catch (err) {
      setPlacesError(`Failed to initialize address autocomplete: ${err.message}`);
    }
  }, [placesLoaded]);

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    if (selectedPlace && value !== selectedPlace.formatted_address) {
      setSelectedPlace(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedPlace) {
      alert("Please select your address from the dropdown suggestions");
      return;
    }

    setLoading(true);

    const params = new URLSearchParams({
      address: selectedPlace.formatted_address,
      lat: selectedPlace.lat.toString(),
      lng: selectedPlace.lng.toString()
    });

    navigate(createPageUrl(`MeasurementPage?${params.toString()}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link to={createPageUrl("Homepage")}>
          <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Home className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Aroof</h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Get Your Roof Measured in 60 Seconds
          </h2>
          <p className="text-xl text-blue-200">
            100% FREE • No payment required • Instant results
          </p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardContent className="p-8">
            {placesError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{placesError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-lg font-semibold text-slate-900 mb-3 block">
                  Enter Your Property Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400 z-10 pointer-events-none" />
                  <Input
                    ref={addressInputRef}
                    type="text"
                    required
                    placeholder="Start typing your address..."
                    value={address}
                    onChange={handleAddressChange}
                    className="h-16 text-lg pl-14 pr-4"
                    disabled={loading || !!placesError}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                {!placesLoaded && !placesError && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading address search...
                  </p>
                )}
                {placesLoaded && !selectedPlace && address && !placesError && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Please select your address from the dropdown
                  </p>
                )}
                {selectedPlace && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    ✓ Address verified: {selectedPlace.formatted_address}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || (!selectedPlace && !placesError)}
                className="w-full h-16 text-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Start FREE Measurement →'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <span>100% FREE - no credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <span>Instant satellite measurement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <span>Professional pricing estimate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/60 text-sm mt-6">
          Questions? Call us at <a href="tel:+18502389727" className="text-white hover:underline font-semibold">(850) 238-9727</a>
        </p>
      </div>

      <style>{`
        .pac-container {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          margin-top: 4px;
          font-family: inherit;
          z-index: 9999 !important;
        }
        .pac-item {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          line-height: 1.5;
        }
        .pac-item:hover {
          background-color: #f8fafc;
        }
        .pac-item:last-child {
          border-bottom: none;
        }
        .pac-item-query {
          color: #1e293b;
          font-weight: 500;
        }
        .pac-matched {
          font-weight: 700;
          color: #2563eb;
        }
      `}</style>
    </div>
  );
}