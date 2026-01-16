import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MapPin, Star, Loader2, ExternalLink, Grid3x3, Award } from "lucide-react";
import CompanyLogoDisplay from "../components/CompanyLogoDisplay";

export default function CompanyProfilePublic() {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("id");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      if (!companyId) {
        setError("No company specified");
        setLoading(false);
        return;
      }

      const companies = await base44.entities.Company.filter({ id: companyId });
      if (companies.length === 0) {
        setError("Company not found");
        setLoading(false);
        return;
      }

      setCompany(companies[0]);
    } catch (err) {
      console.error('Error loading company:', err);
      setError("Failed to load company information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Company Not Found</h2>
            <p className="text-slate-600 mb-6">{error || "The company you are looking for does not exist."}</p>
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

  const portfolio = company.portfolio_images || [];
  const reviews = company.imported_reviews || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to={createPageUrl("RooferDirectory")} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
          {company.enhanced_profile && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              ⭐ Featured Profile
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white rounded-2xl p-8 shadow-lg">
            <CompanyLogoDisplay company={company} size="xl" className="bg-slate-100" />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{company.company_name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-slate-600">4.9 (50+ reviews)</span>
              </div>
              {company.service_area_zips && company.service_area_zips.length > 0 && (
                <p className="text-slate-600 mb-4">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Serves {company.service_area_zips.length} ZIP codes in {company.address_city}, {company.address_state}
                </p>
              )}
              <div className="flex gap-2">
                {company.contact_phone && (
                  <a href={`tel:${company.contact_phone}`}>
                    <Button className="gap-2">
                      <Phone className="w-4 h-4" />
                      {company.contact_phone}
                    </Button>
                  </a>
                )}
                {company.contact_email && (
                  <a href={`mailto:${company.contact_email}`}>
                    <Button variant="outline" className="gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {company.company_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">
                  {company.description || "Professional roofing services in the Dallas-Fort Worth area. Licensed, insured, and committed to delivering quality workmanship on every project. We specialize in residential and commercial roofing installations, repairs, and maintenance."}
                </p>
              </CardContent>
            </Card>

            {/* Portfolio */}
            {company.enhanced_profile && portfolio.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid3x3 className="w-5 h-5" />
                    Project Portfolio ({portfolio.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {portfolio.map((photo) => (
                      <div key={photo.id} className="group relative overflow-hidden rounded-lg">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                          <p className="text-white text-center text-sm font-semibold mb-2">{photo.title}</p>
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            {photo.project_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {(company.enhanced_profile && reviews.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Customer Reviews ({reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-l-4 border-blue-400 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-semibold text-slate-900">{review.reviewer_name}</p>
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize text-xs">
                            {review.source}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm mt-2">{review.review_text}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(review.review_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Get Your Free Quote</h3>
                <p className="text-blue-100 text-sm">
                  Connect with {company.company_name} today and get an accurate estimate for your roofing project.
                </p>
                <Link to={createPageUrl(`RooferProfile?id=${company.id}`)}>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold">
                    Request Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Service Areas */}
            {company.service_area_zips && company.service_area_zips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Service Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.service_area_zips.slice(0, 10).map(zip => (
                      <Badge key={zip} variant="outline" className="bg-slate-50">
                        {zip}
                      </Badge>
                    ))}
                    {company.service_area_zips.length > 10 && (
                      <Badge variant="outline" className="bg-slate-50">
                        +{company.service_area_zips.length - 10} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.contact_phone && (
                  <div className="flex gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    <a href={`tel:${company.contact_phone}`} className="text-blue-600 hover:underline text-sm">
                      {company.contact_phone}
                    </a>
                  </div>
                )}
                {company.contact_email && (
                  <div className="flex gap-2">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    <a href={`mailto:${company.contact_email}`} className="text-blue-600 hover:underline text-sm break-all">
                      {company.contact_email}
                    </a>
                  </div>
                )}
                {company.address_street && (
                  <div className="flex gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    <span className="text-sm text-slate-700">
                      {company.address_street}<br />
                      {company.address_city}, {company.address_state} {company.address_zip}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}