import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Phone, Mail, MapPin, Tag, FileText } from 'lucide-react';

export default function NewLeadForm() {
  const navigate = useNavigate();
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    leadSource: 'phone_call',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  
  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  const leadSources = [
    { value: 'purchased_lead', label: 'Purchased Lead' },
    { value: 'phone_call', label: 'Phone Call' },
    { value: 'door_knock', label: 'Door Knock / Canvassing' },
    { value: 'website', label: 'Website Form' },
    { value: 'referral', label: 'Referral' },
    { value: 'storm_chasing', label: 'Storm Chasing' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'other', label: 'Other' }
  ];

  // Load Google Places API
  useEffect(() => {
    const loadGooglePlaces = () => {
      // Check if already loaded
      if (window.google?.maps?.places) {
        initAutocomplete();
        return;
      }

      // Check if script exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkInterval = setInterval(() => {
          if (window.google?.maps?.places) {
            clearInterval(checkInterval);
            initAutocomplete();
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 5000);
        return;
      }

      // Load script
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
      
      if (place.geometry) {
        setFormData(prev => ({
          ...prev,
          propertyAddress: place.formatted_address
        }));
        console.log('✅ Address selected:', place.formatted_address);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.phone || !formData.propertyAddress) {
      alert('Please fill in customer name, phone, and property address');
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();

      const lead = await base44.entities.Measurement.create({
        customer_name: formData.customerName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        property_address: formData.propertyAddress,
        roofer_notes: `Lead Source: ${formData.leadSource}\n${formData.notes}`,
        user_id: user.id,
        company_id: user.company_id,
        lead_status: 'new',
        user_type: 'roofer',
        measurement_type: 'detailed_polygon'
      });

      sessionStorage.setItem('active_lead_id', lead.id);
      sessionStorage.setItem('lead_address', formData.propertyAddress);
      
      // COMPREHENSIVE DEBUG LOGGING
      console.log('📦 SESSION STORAGE SAVED:');
      console.log('  active_lead_id:', sessionStorage.getItem('active_lead_id'));
      console.log('  lead_address:', sessionStorage.getItem('lead_address'));
      console.log('  All session storage:', JSON.stringify({
        active_lead_id: sessionStorage.getItem('active_lead_id'),
        lead_address: sessionStorage.getItem('lead_address'),
        pending_measurement_id: sessionStorage.getItem('pending_measurement_id')
      }, null, 2));
      
      // Test if it persists
      setTimeout(() => {
        console.log('📦 SESSION STORAGE CHECK (after 1 second):');
        console.log('  active_lead_id:', sessionStorage.getItem('active_lead_id'));
        console.log('  Still there?', sessionStorage.getItem('active_lead_id') === lead.id ? '✅ YES' : '❌ NO');
      }, 1000);
      
      console.log('🔵 NewLeadForm: Lead created with ID:', lead.id);
      console.log('🔵 NewLeadForm: Navigating to:', `RooferMeasurement?leadId=${lead.id}`);
      
      navigate(createPageUrl(`RooferMeasurement?leadId=${lead.id}`));

    } catch (err) {
      console.error('Failed to create lead:', err);
      alert('Failed to create lead: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(createPageUrl('RooferDashboard'))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle className="text-2xl">New Lead Information</CardTitle>
            <p className="text-slate-600 text-sm">
              Enter customer details to create a lead and measure their roof
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Customer Name *
                </Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="John Smith"
                  required
                  className="h-11"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Phone Number *
                </Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(214) 555-0123"
                  required
                  className="h-11"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                  className="h-11"
                />
                <p className="text-xs text-slate-500 mt-1">Optional - but needed to email reports</p>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Property Address *
                </Label>
                <Input
                  ref={addressInputRef}
                  value={formData.propertyAddress}
                  onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
                  placeholder="Start typing address..."
                  required
                  className="h-11"
                  autoComplete="off"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Start typing and select from suggestions
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  Lead Source
                </Label>
                <Select
                  value={formData.leadSource}
                  onValueChange={(value) => setFormData({...formData, leadSource: value})}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map(source => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Notes (Optional)
                </Label>
                <textarea
                  className="w-full border rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional notes about this lead..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving ? 'Creating Lead...' : 'Continue to Measurement →'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate(createPageUrl('RooferDashboard'))}
                  disabled={saving}
                  className="h-14"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}