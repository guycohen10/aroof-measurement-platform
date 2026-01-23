import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Hammer, Home, DollarSign, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RooferBrowseLeads() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Fetch available marketplace leads
      const marketplaceLeads = await base44.entities.MarketplaceLead.filter({
        status: 'available'
      });
      
      setLeads(marketplaceLeads || []);
    } catch (err) {
      console.error("Failed to load leads:", err);
      toast.error("Failed to load marketplace leads");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyLead = async (marketplaceLead) => {
    if (!user?.company_id || !user?.id) {
      toast.error("User info not found");
      return;
    }

    setPurchasing(marketplaceLead.id);

    try {
      // 1. UI Feedback
      toast.info("Initializing Secure Checkout...");

      // 2. Try Real API (Will likely fail in dev)
      // Throw error to force fallback as requested
      throw new Error("Force Test Mode");

      /* 
      // Create Stripe Checkout Session
      const { sessionId } = await base44.functions.invoke('createLeadCheckoutSession', {
        lead_id: marketplaceLead.id,
        headline: marketplaceLead.lead_details,
        price: marketplaceLead.price,
        user_id: user.id,
        company_id: user.company_id
      });

      if (sessionId) {
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      } else {
        toast.error("Failed to create checkout session");
      }
      */
    } catch (err) {
      console.warn("Payment Gateway unavailable. Using Test Mode.");
      
      // 3. SIMULATE SUCCESS (The Fix)
      toast.loading("Processing Test Payment...");
      
      setTimeout(() => {
        toast.dismiss(); // Clear loading
        
        // SAVE PURCHASE TO LOCAL STORAGE (PERSISTENCE)
        const purchasedLeads = JSON.parse(localStorage.getItem('my_leads') || '[]');
        
        // Convert MarketplaceLead to generic Lead structure
        const newLead = {
          ...marketplaceLead,
          id: `test-lead-${Date.now()}`, // Unique ID
          status: 'New',
          lead_status: 'New', // Handle both naming conventions
          name: 'Test Customer', // Marketplace leads might hide this, reveal it now
          customer_name: 'Test Customer',
          date: new Date().toISOString(),
          created_date: new Date().toISOString(),
          source: 'Marketplace'
        };
        
        purchasedLeads.push(newLead);
        localStorage.setItem('my_leads', JSON.stringify(purchasedLeads));
        
        toast.success(`Successfully purchased lead for $${marketplaceLead.price.toFixed(2)} (Test Mode)`);
        setPurchasing(null);
        
        // Redirect to 'My Leads' to show ownership
        setTimeout(() => navigate(createPageUrl('LeadManagement')), 500);
      }, 1500);
    }
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case 'Roof Replacement':
        return <Home className="w-5 h-5" />;
      case 'Repair':
        return <Hammer className="w-5 h-5" />;
      default:
        return <Home className="w-5 h-5" />;
    }
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(l => l.service_needed === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Lead Marketplace</h1>
                <p className="text-slate-600 text-sm">Browse and purchase exclusive leads</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{filteredLeads.length}</div>
              <div className="text-xs text-slate-600">Available Leads</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'Roof Replacement', 'Repair', 'Inspection', 'Maintenance'].map(service => (
            <Button
              key={service}
              variant={filter === service ? 'default' : 'outline'}
              onClick={() => setFilter(service)}
              className="capitalize"
            >
              {service === 'all' ? 'All Services' : service}
            </Button>
          ))}
        </div>

        {/* Leads Grid */}
        {filteredLeads.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-slate-400 mb-4">
                <Home className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Leads Available</h3>
              <p className="text-slate-600">Check back soon for new leads matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map(lead => (
              <Card key={lead.id} className="hover:shadow-lg transition-all border-l-4 border-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-lg text-slate-900">{lead.zip_code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getServiceIcon(lead.service_needed)}
                        <span className="text-sm font-medium text-slate-700">{lead.service_needed}</span>
                      </div>
                    </div>
                    {lead.exclusive && (
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">
                        Exclusive
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">{lead.lead_details}</p>

                  {lead.roof_size_sqft && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                      <Home className="w-4 h-4" />
                      {lead.roof_size_sqft.toLocaleString()} sq ft
                    </div>
                  )}

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Price</div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-5 h-5 text-green-600 font-bold" />
                        <span className="text-2xl font-bold text-green-600">{lead.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleBuyLead(lead)}
                      disabled={purchasing === lead.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {purchasing === lead.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Buy Now'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}