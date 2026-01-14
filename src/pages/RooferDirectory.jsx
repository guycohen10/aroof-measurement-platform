import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Search, MapPin, Star, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RooferDirectory() {
  const [searchParams] = useSearchParams();
  const measurementId = searchParams.get('measurement');
  const [roofers, setRoofers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoofers();
  }, []);

  const loadRoofers = async () => {
    try {
      const companies = await base44.entities.Company.list('-created_date', 100);
      const activeCompanies = companies.filter(c => 
        c.is_active && c.subscription_status === 'active'
      );
      setRoofers(activeCompanies);
    } catch (err) {
      console.error('Error loading roofers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoofers = roofers.filter(roofer => {
    const matchesSearch = !searchQuery || 
      roofer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roofer.address_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roofer.address_zip?.includes(searchQuery);
    
    const matchesTier = filterTier === 'All' || 
      roofer.subscription_tier === filterTier.toLowerCase();
    
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl("Homepage")} className="text-blue-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">Find Your Perfect Roofer</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Browse verified, licensed roofing contractors in the DFW area
          </p>
        </div>
      </div>

      {/* Measurement Banner */}
      {measurementId && (
        <div className="bg-green-50 border-b-4 border-green-400 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <p className="font-medium text-green-800">
              ✓ Your roof measurement is ready! Choose a roofer below to receive accurate quotes.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filters */}
        <div className="mb-8">
          <div className="relative max-w-2xl mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by company name, city, or ZIP code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {['All', 'Pro', 'Enterprise'].map(tier => (
              <Button
                key={tier}
                onClick={() => setFilterTier(tier)}
                variant={filterTier === tier ? 'default' : 'outline'}
                className={filterTier === tier ? '' : 'bg-white'}
              >
                {tier}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-blue-50 rounded-xl p-4 mb-8 flex items-center gap-4">
          <div className="text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-blue-900 text-lg">{filteredRoofers.length} Active Roofers</p>
            <p className="text-sm text-blue-700">All verified and licensed in Texas</p>
          </div>
        </div>

        {/* Roofer Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading roofers...</p>
          </div>
        ) : filteredRoofers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-600 mb-4">No roofers found matching your criteria.</p>
              <Button onClick={() => { setSearchQuery(''); setFilterTier('All'); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoofers.map(roofer => (
              <Card key={roofer.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Logo/Image */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 h-48 flex items-center justify-center p-6">
                  {roofer.company_logo_url ? (
                    <img 
                      src={roofer.company_logo_url} 
                      alt={roofer.company_name} 
                      className="max-h-32 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-7xl">🏠</div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-6">
                  {/* Tier Badge */}
                  {roofer.subscription_tier !== 'basic' && (
                    <Badge 
                      className={`mb-3 ${
                        roofer.subscription_tier === 'enterprise' 
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                      }`}
                    >
                      {roofer.subscription_tier?.toUpperCase()} MEMBER
                    </Badge>
                  )}

                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {roofer.company_name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">4.8 (50+ reviews)</span>
                  </div>

                  {/* Location */}
                  {roofer.address_city && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{roofer.address_city}, {roofer.address_state}</span>
                    </div>
                  )}

                  {/* Service Areas */}
                  {roofer.service_area_zips && roofer.service_area_zips.length > 0 && (
                    <div className="text-xs text-slate-500 mb-4">
                      Services {roofer.service_area_zips.length} ZIP codes
                    </div>
                  )}

                  <Link to={createPageUrl(`RooferProfile?id=${roofer.id}${measurementId ? `&measurement=${measurementId}` : ''}`)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      View Profile & Connect
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}