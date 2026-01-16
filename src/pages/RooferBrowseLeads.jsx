import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  DollarSign, 
  Home, 
  Calendar,
  ArrowLeft,
  Loader2,
  Search,
  Filter,
  ShoppingCart
} from "lucide-react";
import { toast } from "sonner";

export default function RooferBrowseLeads() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [leads, setLeads] = useState([]);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.aroof_role !== 'external_roofer') {
        toast.error('Access denied. External roofer account required.');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setUser(currentUser);

      // Load company
      const companies = await base44.entities.Company.filter({
        contact_email: currentUser.email
      });
      
      if (companies.length > 0) {
        setCompany(companies[0]);
      }

      // Load available leads
      const availableLeads = await base44.entities.Measurement.filter({
        available_for_purchase: true,
        lead_status: "new",
        agrees_to_quotes: true
      });

      // Filter out leads without required info
      const validLeads = availableLeads.filter(lead => 
        lead.customer_name && 
        lead.customer_email && 
        lead.property_address &&
        !lead.purchased_by
      );

      setLeads(validLeads);
      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load leads');
      setLoading(false);
    }
  };

  const handlePurchaseLead = async (lead) => {
    if (!company) {
      toast.error('Company profile required to purchase leads');
      return;
    }

    setPurchasing(lead.id);

    try {
      // TODO: Integrate with Stripe for actual payment
      // For now, we'll simulate the purchase
      
      toast.loading('Processing payment...', { id: 'purchase' });

      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update lead
      await base44.entities.Measurement.update(lead.id, {
        purchased_by: company.id,
        available_for_purchase: false,
        assigned_to: user.id,
        purchase_date: new Date().toISOString(),
        lead_status: "contacted"
      });

      // Update company stats
      await base44.entities.Company.update(company.id, {
        leads_purchased_this_month: (company.leads_purchased_this_month || 0) + 1
      });

      // Send confirmation emails to both roofer and homeowner
      try {
        await base44.functions.invoke('SendLeadPurchaseConfirmations', {
          measurementId: lead.id,
          companyId: company.id,
          rooferEmail: user.email
        });
        
        console.log('✅ Purchase confirmation emails sent');
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }

      toast.success('Lead purchased successfully!', { id: 'purchase' });

      // Redirect to lead detail
      navigate(createPageUrl("EstimatorLeadDetail") + `?id=${lead.id}`);

    } catch (err) {
      console.error('Purchase error:', err);
      toast.error('Failed to purchase lead. Please try again.', { id: 'purchase' });
      setPurchasing(null);
    }
  };

  const estimateProjectValue = (sqft) => {
    if (!sqft) return { low: 0, high: 0 };
    // Rough estimate: $3.50-$5.50 per sq ft
    const low = Math.round(sqft * 3.5);
    const high = Math.round(sqft * 5.5);
    return { low, high };
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMinArea = !minArea || (lead.total_sqft && lead.total_sqft >= parseInt(minArea));
    const matchesMaxArea = !maxArea || (lead.total_sqft && lead.total_sqft <= parseInt(maxArea));
    
    return matchesSearch && matchesMinArea && matchesMaxArea;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading available leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(createPageUrl("RooferDashboard"))}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-8 w-px bg-slate-300" />
              <h1 className="text-2xl font-bold text-slate-900">Browse Available Leads</h1>
            </div>
            <Badge className="bg-green-600 text-white px-4 py-2">
              {filteredLeads.length} leads available
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  <Search className="w-4 h-4 inline mr-2" />
                  Search Address or Name
                </label>
                <Input
                  placeholder="Enter address or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Min Area (sq ft)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 1000"
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Max Area (sq ft)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 5000"
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Grid */}
        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Leads Available</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || minArea || maxArea 
                  ? 'No leads match your filters. Try adjusting your search criteria.'
                  : 'Check back later for new opportunities.'}
              </p>
              {(searchTerm || minArea || maxArea) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setMinArea("");
                    setMaxArea("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => {
              const estimate = estimateProjectValue(lead.total_sqft);
              
              return (
                <Card key={lead.id} className="hover:shadow-xl transition-all border-2 hover:border-blue-400">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <MapPin className="w-5 h-5 text-blue-600 inline mr-2" />
                        {lead.property_address}
                      </div>
                      <Badge className="bg-green-600 text-white shrink-0">
                        ${lead.lead_price || 25}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-700">Customer:</span>
                        <span className="text-slate-900">{lead.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          Submitted {new Date(lead.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Roof Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Roof Area:</span>
                        <span className="font-bold text-slate-900">
                          {lead.total_sqft ? Math.round(lead.total_sqft).toLocaleString() : 'N/A'} sq ft
                        </span>
                      </div>
                      {estimate.low > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Est. Project Value:</span>
                          <span className="font-bold text-green-600">
                            ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Purchase Button */}
                    <Button
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handlePurchaseLead(lead)}
                      disabled={purchasing === lead.id}
                    >
                      {purchasing === lead.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Purchase Lead - ${lead.lead_price || 25}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                      One-time payment • Full customer contact info after purchase
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-2">How Lead Purchasing Works</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Pay once per lead - no recurring charges</li>
              <li>• Get immediate access to full customer contact information</li>
              <li>• Lead is exclusively yours - no other roofers can purchase it</li>
              <li>• Customer has already agreed to receive quotes from contractors</li>
              <li>• All measurements and roof data included</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}