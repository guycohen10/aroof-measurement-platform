import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Star, Shield } from "lucide-react";
import AddressAutocomplete from "../components/AddressAutocomplete";

const GOOGLE_MAPS_API_KEY = "AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc";

export default function Start() {
  const navigate = useNavigate();
  const [addressData, setAddressData] = useState(null);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps API script
  useEffect(() => {
    const loadGooglePlaces = () => {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (window.google?.maps?.places) {
        setScriptLoaded(true);
        return;
      }
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => setError("Failed to load Google Maps. Please refresh the page.");
        document.head.appendChild(script);
      } else {
        setTimeout(() => setScriptLoaded(true), 500);
      }
    };
    loadGooglePlaces();
  }, []);

  const handleAddressSelect = (data, err) => {
    if (err) {
      setError(err);
      setAddressData(null);
    } else {
      setError("");
      setAddressData(data);
    }
  };

  const handleStartVisualization = () => {
    if (!addressData) {
      setError("Please select a valid address");
      return;
    }

    // Store address in sessionStorage for persistence
    sessionStorage.setItem("funnelAddress", JSON.stringify(addressData));

    // Navigate to visualization page
    navigate(createPageUrl("Visualizing"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(createPageUrl("Homepage"))}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </button>
            <div className="flex items-center gap-6">
              <button
                onClick={() => window.scrollTo(0, 0)}
                className="text-slate-600 hover:text-slate-900 text-sm"
              >
                How It Works
              </button>
              <a
                href="tel:+18502389727"
                className="text-slate-600 hover:text-slate-900 font-semibold"
              >
                (850) 238-9727
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4 text-center leading-tight">
            See Your Home with a<br />
            <span className="text-blue-600">Brand New Roof</span>
          </h1>

          <p className="text-xl text-slate-600 text-center mb-12">
            AI-powered visualization + instant pricing. 100% free, no obligation.
          </p>

          {/* Address Input Section */}
          {scriptLoaded ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Your Home Address
              </label>
              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                error={error}
              />

              <Button
                size="lg"
                className={`w-full mt-6 h-14 text-lg font-bold transition-all ${
                  addressData
                    ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
                disabled={!addressData}
                onClick={handleStartVisualization}
              >
                Show Me My New Roof <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              {addressData && (
                <p className="text-sm text-green-600 mt-4 text-center font-medium">
                  ✓ {addressData.formatted_address}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 rounded-2xl p-8 text-center">
              <p className="text-slate-600">Loading address autocomplete...</p>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-slate-600">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">5,000+ Homes Visualized</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">4.9★ Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Licensed & Insured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            What Homeowners Love About Aroof
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "⚡", text: "60-Second Process" },
              { emoji: "💯", text: "100% Free & Private" },
              { emoji: "🤝", text: "Connect with Top Roofers" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="text-slate-700 text-sm font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}