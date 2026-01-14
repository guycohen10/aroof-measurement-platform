import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Phone, Mail, MapPin, CheckCircle, Loader2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RooferProfile() {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('id');
  const measurementId = searchParams.get('measurement');

  const [company, setCompany] = useState(null);
  const [measurement, setMeasurement] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [companyId, measurementId]);

  const loadData = async () => {
    try {
      if (!companyId) {
        setError('No company ID provided');
        setLoading(false);
        return;
      }

      // Load company
      const companies = await base44.entities.Company.filter({ id: companyId });
      if (companies.length === 0) {
        setError('Company not found');
        setLoading(false);
        return;
      }
      setCompany(companies[0]);

      // Load measurement if ID provided
      if (measurementId) {
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        if (measurements.length > 0) {
          const measurementData = measurements[0];
          setMeasurement(measurementData);

          // Check if already connected
          if (measurementData.purchased_by_companies?.includes(companyId)) {
            setConnected(true);
          }
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load company information');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!measurementId) {
      alert('No measurement found. Please start from the results page.');
      return;
    }

    if (!measurement) {
      alert('Measurement data not loaded. Please try again.');
      return;
    }

    setConnecting(true);

    try {
      // Update measurement - add this company to purchased_by
      const existingCompanies = measurement.purchased_by_companies || [];
      const updatedCompanies = [...existingCompanies, companyId];

      await base44.entities.Measurement.update(measurementId, {
        purchased_by_companies: updatedCompanies,
        lead_status: 'contacted'
      });

      // Update local state
      setMeasurement({
        ...measurement,
        purchased_by_companies: updatedCompanies,
        lead_status: 'contacted'
      });

      // TODO: Charge roofer $25 via Stripe when billing is implemented
      // This will be added in the next phase

      setConnected(true);

    } catch (err) {
      console.error('Error connecting:', err);
      alert('Failed to connect with roofer. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading roofer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Roofer Not Found</h2>
            <p className="text-slate-600 mb-6">{error || 'The roofer you are looking for does not exist.'}</p>
            <Link to={createPageUrl("RooferDirectory")}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl(`RooferDirectory${measurementId ? `?measurement=${measurementId}` : ''}`)} className="text-blue-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-3 flex-shrink-0">
              {company.company_logo_url ? (
                <img 
                  src={company.company_logo_url} 
                  alt={company.company_name} 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-4xl">🏠</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{company.company_name}</h1>
                {company.subscription_tier !== 'basic' && (
                  <Badge 
                    className={`${
                      company.subscription_tier === 'enterprise' 
                        ? 'bg-purple-500 hover:bg-purple-500' 
                        : 'bg-blue-500 hover:bg-blue-500'
                    }`}
                  >
                    {company.subscription_tier?.toUpperCase()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-blue-100">4.8 (50+ reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">About {company.company_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">
                  Professional roofing services in the Dallas-Fort Worth area. Licensed, insured, and committed 
                  to delivering quality workmanship on every project. We specialize in residential and commercial 
                  roofing installations, repairs, and maintenance.
                </p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <a href={`tel:${company.contact_phone}`} className="font-medium text-blue-600 hover:underline">
                      {company.contact_phone}
                    </a>
                  </div>
                )}
                {company.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <a href={`mailto:${company.contact_email}`} className="font-medium text-blue-600 hover:underline">
                      {company.contact_email}
                    </a>
                  </div>
                )}
                {company.address_city && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">
                      {company.address_street && `${company.address_street}, `}
                      {company.address_city}, {company.address_state} {company.address_zip}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Areas */}
            {company.service_area_zips && company.service_area_zips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Service Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-3">
                    We proudly serve the following ZIP codes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {company.service_area_zips.slice(0, 15).map(zip => (
                      <Badge key={zip} variant="outline" className="bg-blue-50">
                        {zip}
                      </Badge>
                    ))}
                    {company.service_area_zips.length > 15 && (
                      <Badge variant="outline" className="bg-slate-50">
                        +{company.service_area_zips.length - 15} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section - Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Customer reviews will be available soon.</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connect CTA */}
            {measurementId && !connected && (
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-xl sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Your Roof is Ready</h3>
                  {measurement && (
                    <div className="bg-blue-500 rounded-lg p-4 mb-4">
                      <p className="text-sm mb-1 text-blue-100">Roof Size:</p>
                      <p className="text-3xl font-bold">{Math.round(measurement.total_adjusted_sqft || measurement.total_sqft || 0).toLocaleString()} sq ft</p>
                      <p className="text-xs text-blue-200 mt-1">{measurement.property_address}</p>
                    </div>
                  )}
                  <p className="mb-6 text-blue-100">
                    Connect with {company.company_name} to receive an accurate quote for your roof project.
                  </p>
                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 h-12 font-bold"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect with This Roofer'
                    )}
                  </Button>
                  <p className="text-xs text-blue-200 mt-3 text-center">
                    No cost to you. Roofer will contact you within 24 hours.
                  </p>
                </CardContent>
              </Card>
            )}

            {connected && (
              <Alert className="bg-green-50 border-green-400 border-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <AlertDescription className="ml-2">
                  <h3 className="font-bold text-green-800 mb-1">Successfully Connected!</h3>
                  <p className="text-sm text-green-700">
                    {company.company_name} has received your information and will contact you within 24 hours 
                    to discuss your roof project and provide a detailed quote.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Verified Company</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Fast Response Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Professional Service</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="bg-slate-900 text-white border-none">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-4">Have Questions?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Contact us directly for immediate assistance
                </p>
                {company.contact_phone && (
                  <a href={`tel:${company.contact_phone}`}>
                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}