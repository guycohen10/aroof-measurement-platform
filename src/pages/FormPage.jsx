
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Loader2, MapPin, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FormPage() {
  const navigate = useNavigate();
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [placesError, setPlacesError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  // Load Google Places API
  useEffect(() => {
    console.log("FormPage: Starting Google Places load...");
    
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("FormPage: Google Places already loaded");
      setPlacesLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log("FormPage: Google Maps script already in DOM, waiting...");
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogle);
          console.log("FormPage: Google Places now available");
          setPlacesLoaded(true);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error("FormPage: Timeout waiting for Google Places");
          setPlacesError("Google Maps is taking too long to load. Please refresh the page.");
        }
      }, 10000);
      
      return;
    }

    const apiKey = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
    
    console.log("FormPage: Loading Google Maps script with Places library...");

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    window.initGoogleMaps = () => {
      console.log("FormPage: ✅ Google Maps callback fired");
      if (window.google && window.google.maps && window.google.maps.places) {
        setPlacesLoaded(true);
      } else {
        console.error("FormPage: Google Maps loaded but Places not available");
        setPlacesError("Google Maps loaded but Places library is not available.");
      }
    };
    
    script.onerror = (e) => {
      console.error("FormPage: ❌ Failed to load Google Maps script", e);
      setPlacesError("Failed to load Google Maps. Please check your internet connection and refresh the page.");
    };

    document.head.appendChild(script);

    return () => {
      delete window.initGoogleMaps;
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!placesLoaded || !addressInputRef.current) {
      return;
    }

    console.log("FormPage: Initializing Google Places Autocomplete...");

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
      console.log("FormPage: Autocomplete object created successfully");

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        console.log("FormPage: Place changed event fired");

        if (!place.geometry) {
          console.warn("FormPage: No geometry found for selected place");
          setSelectedPlace(null);
          setError("Please select a valid address from the dropdown");
          return;
        }

        const placeData = {
          formatted_address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        console.log("FormPage: ✅ Valid place selected:", placeData);

        setSelectedPlace(placeData);
        setFormData(prev => ({ ...prev, address: place.formatted_address }));
        setError("");
      });

      console.log("FormPage: ✅ Autocomplete initialized and listener added");
    } catch (err) {
      console.error("FormPage: ❌ Error initializing autocomplete:", err);
      setPlacesError(`Failed to initialize address autocomplete: ${err.message}`);
    }
  }, [placesLoaded]);

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value }));
    
    if (selectedPlace && value !== selectedPlace.formatted_address) {
      console.log("FormPage: User modified address, clearing selected place");
      setSelectedPlace(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("FormPage: Form submitted - NEW FLOW (FREE measurement)");

    if (!selectedPlace) {
      setError("Please select your address from the dropdown suggestions");
      return;
    }

    setLoading(true);

    try {
      // NEW FLOW: Redirect directly to measurement page (NO PAYMENT)
      const params = new URLSearchParams({
        address: selectedPlace.formatted_address,
        lat: selectedPlace.lat.toString(),
        lng: selectedPlace.lng.toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      console.log("FormPage: Redirecting directly to measurement page (free)");
      navigate(createPageUrl(`MeasurementPage?${params.toString()}`));

    } catch (err) {
      console.error("FormPage: Error:", err);
      setError(`Failed to proceed: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl("Homepage")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* NEW: Free Measurement Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 mb-8 text-center">
          <p className="text-green-100 mb-2">🎉 Limited Time Offer</p>
          <p className="text-3xl font-bold mb-1">FREE Roof Measurement</p>
          <p className="text-lg font-semibold">No payment required • View results instantly</p>
          <p className="text-sm text-green-100 mt-2">
            Optional: Download detailed PDF report for $3-$5
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Enter Your Information</CardTitle>
            <p className="text-center text-slate-600 mt-2">
              Get started with your FREE roof measurement
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {placesError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{placesError}</AlertDescription>
              </Alert>
            )}

            {error && !placesError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base font-medium">
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 h-12 text-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-2 h-12 text-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-base font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 h-12 text-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-base font-medium">
                  Property Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
                  <Input
                    ref={addressInputRef}
                    id="address"
                    type="text"
                    required
                    placeholder="Start typing your address..."
                    value={formData.address}
                    onChange={handleAddressChange}
                    className="h-12 text-lg pl-10"
                    disabled={loading || !!placesError}
                    autoComplete="off"
                  />
                </div>
                {!placesLoaded && !placesError && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading address autocomplete...
                  </p>
                )}
                {placesLoaded && !selectedPlace && formData.address && !placesError && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Please select your address from the dropdown suggestions
                  </p>
                )}
                {selectedPlace && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    ✓ Address verified: {selectedPlace.formatted_address}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || (!selectedPlace && !placesError)}
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue to FREE Measurement Tool →'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-900">
              <strong>💡 100% FREE:</strong> Measure your roof, view results, and get pricing estimates - no payment required! 
              Download a detailed PDF report for just $3 (optional).
            </p>
            <p className="text-xs text-green-800 mt-2">
              <strong>Questions?</strong> Call us at <a href="tel:+18502389727" className="font-bold hover:underline">(850) 238-9727</a>
            </p>
          </CardContent>
        </Card>

        {/* Trust Badge */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-900 font-bold">
              ✓ Texas Licensed Roofing Contractor
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Licensed & Insured | Serving DFW since 2010
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Autocomplete Styling */}
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
        .pac-icon {
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
