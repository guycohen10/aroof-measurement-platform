import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Loader2, Image, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function UpgradeProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const user = await base44.auth.me();
      if (!user.company_id) {
        navigate(createPageUrl("RooferDashboard"));
        return;
      }

      const companies = await base44.entities.Company.filter({ id: user.company_id });
      setCompany(companies[0]);
    } catch (err) {
      console.error('Error loading company:', err);
      toast.error('Failed to load company data');
      navigate(createPageUrl("RooferDashboard"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // Update company to enable enhanced profile
      await base44.entities.Company.update(company.id, {
        enhanced_profile: true
      });

      toast.success('✅ Enhanced Profile activated! Your portfolio and reviews are now visible.');
      navigate(createPageUrl("CompanyProfile"));
    } catch (err) {
      console.error('Error upgrading:', err);
      toast.error('Failed to upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!company) return null;

  if (company.enhanced_profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link to={createPageUrl("RooferDashboard")} className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Enhanced Profile Active!</h2>
              <p className="text-lg text-slate-600 mb-6">You now have access to portfolio management and review imports.</p>
              <Link to={createPageUrl("CompanyProfile")}>
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Manage Your Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const benefits = [
    {
      icon: Image,
      title: "Project Portfolio",
      description: "Showcase up to 50 before/after photos of your roofing projects"
    },
    {
      icon: Star,
      title: "Review Management",
      description: "Import and display reviews from Google, Yelp, and Facebook"
    },
    {
      icon: TrendingUp,
      title: "Featured Placement",
      description: "Appear first in the roofer directory with a prominent badge"
    },
    {
      icon: Loader2,
      title: "Enhanced Profile Page",
      description: "Custom public profile showcasing your work and customer testimonials"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Enhanced Profile</h1>
          <Link to={createPageUrl("RooferDashboard")}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="bg-purple-100 text-purple-800 mb-4">Premium Add-On</Badge>
          <h2 className="text-5xl font-bold text-slate-900 mb-4">Stand Out in the Directory</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Upgrade to Enhanced Profile and showcase your best work. Build trust with potential customers through your portfolio and reviews.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                      <p className="text-sm text-slate-600">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pricing & CTA */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-blue-100 mb-2">Monthly Subscription</p>
              <div className="mb-6">
                <span className="text-6xl font-bold">$20</span>
                <span className="text-blue-200 ml-2">/month</span>
              </div>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Added to your existing subscription. Cancel anytime. Keep your data even if you downgrade.
              </p>
              <Button
                onClick={handleUpgrade}
                disabled={upgrading}
                size="lg"
                className="h-14 px-12 text-lg bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upgrade Now"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Details */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-600" />
                Portfolio Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">Upload up to 50 project photos</span>
              </div>
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">Before/after photo sets</span>
              </div>
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">Categorize by project type</span>
              </div>
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">Add descriptions to each project</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                Review Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">Import from Google, Yelp, Facebook</span>
              </div>
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">Display with source badges</span>
              </div>
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">Boost customer trust</span>
              </div>
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">Manage all reviews centrally</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}