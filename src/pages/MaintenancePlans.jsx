import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, CheckCircle, Shield, Star, Calendar, ArrowLeft, Loader2 } from "lucide-react";

export default function MaintenancePlans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const allPlans = await base44.entities.MaintenancePlan.filter({ is_active: true });
      setPlans(allPlans);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
    setLoading(false);
  };

  const defaultPlans = [
    {
      plan_tier: 'basic',
      plan_name: 'Basic Protection',
      monthly_price: 49,
      annual_price: 499,
      inspections_per_year: 1,
      cleanings_per_year: 1,
      max_minor_repairs: 250,
      included_services: [
        '1 Annual Inspection',
        '1 Gutter Cleaning per year',
        'Photos & Detailed Report',
        'Minor repairs up to $250/year',
        'Email support'
      ]
    },
    {
      plan_tier: 'premium',
      plan_name: 'Premium Protection',
      monthly_price: 89,
      annual_price: 899,
      inspections_per_year: 2,
      cleanings_per_year: 2,
      max_minor_repairs: 500,
      discount_percentage: 10,
      popular: true,
      included_services: [
        '2 Annual Inspections',
        '2 Gutter Cleanings per year',
        'Photos & Detailed Report',
        'Minor repairs up to $500/year',
        'Priority service scheduling',
        '10% discount on major repairs',
        'Phone & email support'
      ]
    },
    {
      plan_tier: 'elite',
      plan_name: 'Elite Protection',
      monthly_price: 149,
      annual_price: 1499,
      inspections_per_year: 4,
      cleanings_per_year: 4,
      max_minor_repairs: 1000,
      discount_percentage: 15,
      included_services: [
        '4 Annual Inspections (Quarterly)',
        '4 Gutter Cleanings per year',
        'Photos & Detailed Report',
        'Minor repairs up to $1,000/year',
        'Priority service scheduling',
        '15% discount on major repairs',
        'Extended warranty coverage',
        '24/7 emergency service',
        'Dedicated account manager'
      ]
    }
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl("Homepage")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-4">
            <Shield className="w-4 h-4" />
            <span className="font-semibold">Roof Protection Plans</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Protect Your Investment
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Regular maintenance extends your roof's life and prevents costly repairs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {displayPlans.map((plan) => (
            <Card 
              key={plan.plan_tier}
              className={`relative shadow-xl ${
                plan.popular ? 'border-4 border-blue-500 transform scale-105' : 'border-2 border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <CardHeader className={`text-center ${plan.popular ? 'bg-gradient-to-br from-blue-50 to-white' : ''}`}>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.plan_name || plan.plan_tier.toUpperCase()}
                </CardTitle>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-blue-600">
                    ${plan.monthly_price}
                    <span className="text-lg text-slate-600">/month</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    or ${plan.annual_price}/year <span className="text-green-600 font-semibold">(Save 15%!)</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  {plan.included_services.map((service, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{service}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full h-12 text-lg ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                  onClick={() => navigate(createPageUrl(`EnrollMaintenance/${plan.plan_tier}`))}
                >
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              💰 Save 15% with Annual Billing
            </h3>
            <p className="text-lg text-slate-700">
              Pay annually and save on your roof protection plan
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}