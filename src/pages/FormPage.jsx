import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
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
    
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("FormPage: Google Places already loaded");
      setPlacesLoaded(true);
      return;
    }

    // Check if script is already in DOM
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
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error("FormPage: Timeout waiting for Google Places");
          setPlacesError("Google Maps is taking too long to load. Please refresh the page.");
        }
      }, 10000);
      
      return;
    }

    // Load script
    const apiKey = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
    
    console.log("FormPage: Loading Google Maps script with Places library...");
    console.log("FormPage: API Key:", apiKey.substring(0, 10) + "...");

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Add callback to window
    window.initGoogleMaps = () => {
      console.log("FormPage: ✅ Google Maps callback fired");
      console.log("FormPage: window.google exists:", !!window.google);
      console.log("FormPage: window.google.maps exists:", !!(window.google && window.google.maps));
      console.log("FormPage: window.google.maps.places exists:", !!(window.google && window.google.maps && window.google.maps.places));
      
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

    // Cleanup
    return () => {
      delete window.initGoogleMaps;
    };
  }, []);

  // Initialize autocomplete when Places API is loaded
  useEffect(() => {
    if (!placesLoaded || !addressInputRef.current) {
      console.log("FormPage: Waiting for Places API or input ref...", { placesLoaded, hasInputRef: !!addressInputRef.current });
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

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        console.log("FormPage: Place changed event fired");
        console.log("FormPage: Place object:", place);

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
    
    // Clear selected place if user manually changes the input after selecting
    if (selectedPlace && value !== selectedPlace.formatted_address) {
      console.log("FormPage: User modified address, clearing selected place");
      setSelectedPlace(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("FormPage: Form submitted");
    console.log("FormPage: Selected place:", selectedPlace);
    console.log("FormPage: Form data:", formData);

    // Validate that address was selected from autocomplete
    if (!selectedPlace) {
      setError("Please select your address from the dropdown suggestions");
      return;
    }

    setLoading(true);

    try {
      // Save to database
      await base44.entities.Lead.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: selectedPlace.formatted_address
      });

      console.log("FormPage: Lead saved, redirecting with coordinates:", selectedPlace);

      // Redirect to measurement page with address AND coordinates
      const params = new URLSearchParams({
        address: selectedPlace.formatted_address,
        lat: selectedPlace.lat.toString(),
        lng: selectedPlace.lng.toString()
      });

      navigate(createPageUrl(`MeasurementPage?${params.toString()}`));
    } catch (err) {
      console.error("FormPage: Error saving lead:", err);
      setError(`Failed to save information: ${err.message}. Please try again.`);
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
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Enter Your Information</CardTitle>
            <p className="text-center text-slate-600 mt-2">
              We need a few details to get started
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {/* Google Maps Error */}
            {placesError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">{placesError}</p>
                  <div className="text-sm mt-2 space-y-1">
                    <p><strong>Possible issues:</strong></p>
                    <ul className="list-disc ml-4">
                      <li>Billing not enabled on Google Cloud project</li>
                      <li>Places API not enabled</li>
                      <li>API key restrictions blocking the domain</li>
                      <li>Daily quota exceeded</li>
                    </ul>
                    <p className="mt-2">
                      <a 
                        href="https://console.cloud.google.com/apis/credentials" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Check your Google Cloud Console →
                      </a>
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {error && !placesError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
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

              {/* Email */}
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

              {/* Phone */}
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

              {/* Property Address with Autocomplete */}
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
                {placesError && (
                  <p className="text-xs text-slate-500 mt-2">
                    You can still type your address manually and continue
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || (!selectedPlace && !placesError)}
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Measure My Roof"
                )}
              </Button>

              {placesError && (
                <p className="text-center text-xs text-slate-500">
                  Note: Address autocomplete is unavailable, but you can still continue
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> {placesLoaded ? 
                "Start typing your address and select it from the dropdown for the most accurate measurements" :
                "Once autocomplete loads, you'll be able to search for your address easily"
              }
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