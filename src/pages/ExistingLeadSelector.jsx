import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Loader2, User, MapPin, Phone, Calendar } from 'lucide-react';

export default function ExistingLeadSelector() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const user = await base44.auth.me();
      
      const allLeads = await base44.entities.Measurement.list('-created_date', 200);
      
      const companyLeads = allLeads.filter(m => 
        m.company_id === user.company_id && m.customer_name
      );

      setLeads(companyLeads);
      setFilteredLeads(companyLeads);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load leads:', err);
      alert('Failed to load leads: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredLeads(leads);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = leads.filter(lead => 
      lead.customer_name?.toLowerCase().includes(query) ||
      lead.customer_phone?.includes(query) ||
      lead.property_address?.toLowerCase().includes(query)
    );
    setFilteredLeads(filtered);
  }, [searchQuery, leads]);

  const handleSelectLead = (lead) => {
    sessionStorage.setItem('active_lead_id', lead.id);
    sessionStorage.setItem('lead_address', lead.property_address);
    navigate(createPageUrl(`MeasurementPage?leadId=${lead.id}`));
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-slate-100 text-slate-800',
      contacted: 'bg-blue-100 text-blue-800',
      quoted: 'bg-purple-100 text-purple-800',
      booked: 'bg-green-100 text-green-800',
      completed: 'bg-green-200 text-green-900',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.new;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(createPageUrl('RooferDashboard'))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Select Existing Lead</h1>
          <p className="text-slate-600">Choose a lead to measure their roof</p>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Search by name, phone, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="space-y-3">
          {filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500">
                  {searchQuery ? 'No leads found matching your search.' : 'No leads found.'}
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate(createPageUrl('NewLeadForm'))}
                >
                  Create New Lead
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredLeads.map(lead => (
              <Card
                key={lead.id}
                className="hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleSelectLead(lead)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-lg">{lead.customer_name}</h3>
                      </div>
                      
                      <div className="space-y-1 ml-8">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{lead.property_address}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{lead.customer_phone}</span>
                        </div>
                        
                        {lead.total_adjusted_sqft && (
                          <p className="text-sm text-slate-500">
                            Roof: {Math.round(lead.total_adjusted_sqft).toLocaleString()} sq ft
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <Badge className={getStatusColor(lead.lead_status)}>
                        {lead.lead_status?.toUpperCase() || 'NEW'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.created_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}