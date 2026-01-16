import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Star, Shield, Home, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function StartFunnel() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [loadingVisualize, setLoadingVisualize] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);

    if (value.length > 2) {
      // Simulate autocomplete - in production use Google Places API
      const mockSuggestions = [
        { address: "123 Main St, Dallas, TX 75201", lat: 32.7767, lng: -96.7970 },
        { address: "456 Oak Ave, Dallas, TX 75202", lat: 32.7765, lng: -96.7960 },
        { address: "789 Elm St, Plano, TX 75074", lat: 33.0198, lng: -96.6989 },
      ].filter(s => s.address.toLowerCase().includes(value.toLowerCase()));
      
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectAddress = async (selectedAddress) => {
    setAddress(selectedAddress.address);
    setSuggestions([]);
    setShowSuggestions(false);

    // Store address in session for next steps
    sessionStorage.setItem('funnel_address', selectedAddress.address);
    sessionStorage.setItem('funnel_lat', selectedAddress.lat);
    sessionStorage.setItem('funnel_lng', selectedAddress.lng);

    // Track funnel start
    base44.analytics.track({
      eventName: "funnel_address_entered",
      properties: { address: selectedAddress.address }
    });

    setLoadingVisualize(true);
    setTimeout(() => {
      navigate(createPageUrl("Visualizing"));
    }, 500);
  };

  const handleCTA = async () => {
    if (!address.trim()) {
      toast.error("Please enter your address");
      return;
    }

    await handleSelectAddress({ 
      address, 
      lat: 32.7767, 
      lng: -96.7970 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
      </div>

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </div>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
              <Building2 className="w-4 h-4 inline mr-1" />
              Contractors
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-20 relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="max-w-2xl w-full text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            See Your Home with a<br />
            <span className="text-blue-200">Brand New Roof</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-xl mx-auto">
            AI-powered visualization + instant pricing. 100% free, no obligation.
          </p>

          {/* Address Input Card */}
          <Card className="bg-white shadow-2xl p-8 mb-8">
            <div className="relative">
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Enter your address..."
                  value={address}
                  onChange={handleAddressChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-12 h-14 text-lg"
                />
              </div>

              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAddress(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{suggestion.address}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleCTA}
              disabled={loadingVisualize || !address.trim()}
              size="lg"
              className="w-full mt-6 h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-bold shadow-lg"
            >
              {loadingVisualize ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Visualization...
                </>
              ) : (
                "Show Me My New Roof →"
              )}
            </Button>
          </Card>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>5,000+ Homes Visualized</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <span>4.9★ Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Licensed & Insured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}