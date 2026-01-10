import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Shield, CheckCircle, Calendar, Phone, Mail, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function CustomerPortal() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const subId = window.location.pathname.split('/').pop();
      const subs = await base44.entities.Subscription.filter({ id: subId });
      
      if (subs.length > 0) {
        setSubscription(subs[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
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

  if (!subscription) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 mb-4">Subscription not found</p>
            <Link to={createPageUrl("Homepage")}>
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxInspections = subscription.plan_tier === 'basic' ? 1 : subscription.plan_tier === 'premium' ? 2 : 4;
  const maxCleanings = subscription.plan_tier === 'basic' ? 1 : subscription.plan_tier === 'premium' ? 2 : 4;
  const maxRepairs = subscription.plan_tier === 'basic' ? 250 : subscription.plan_tier === 'premium' ? 500 : 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
              <p className="text-xs text-blue-600 font-semibold">My Roof Protection Plan</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-bold">My Roof Protection Plan</h1>
          </div>
          <p className="text-2xl mb-2">{subscription.property_address}</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className={`px-4 py-2 rounded-lg ${
              subscription.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <span className="font-bold capitalize">{subscription.plan_tier} Plan</span>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              subscription.status === 'active' ? 'bg-white/20' : 'bg-red-600'
            }`}>
              <span className="font-semibold">Status: {subscription.status === 'active' ? 'Active ✓' : subscription.status}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-1">Inspections</p>
              <p className="text-4xl font-bold text-blue-600">
                {subscription.inspections_remaining || 0}
              </p>
              <p className="text-sm text-slate-500">of {maxInspections} remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-1">Gutter Cleanings</p>
              <p className="text-4xl font-bold text-green-600">
                {subscription.cleanings_remaining || 0}
              </p>
              <p className="text-sm text-slate-500">of {maxCleanings} remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-1">Repair Budget</p>
              <p className="text-4xl font-bold text-purple-600">
                ${maxRepairs - (subscription.repairs_budget_used || 0)}
              </p>
              <p className="text-sm text-slate-500">of ${maxRepairs} available</p>
            </CardContent>
          </Card>
        </div>

        {subscription.next_service_date && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-12 h-12 text-green-600" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Next Scheduled Service</h3>
                  <p className="text-lg text-slate-700">
                    {format(new Date(subscription.next_service_date), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-slate-600">Type: Annual Inspection</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Reschedule
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Services</CardTitle>
          </CardHeader>
          <CardContent>
            {(!subscription.service_history || subscription.service_history.length === 0) ? (
              <p className="text-center text-slate-500 py-8">No services completed yet</p>
            ) : (
              <div className="space-y-3">
                {subscription.service_history.slice(0, 5).map((service, i) => (
                  <Card key={i} className="border-l-4 border-l-green-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{service.service_type}</h4>
                          <p className="text-sm text-slate-600 mb-2">
                            {format(new Date(service.date), 'MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-slate-700">{service.notes}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      {service.photos && service.photos.length > 0 && (
                        <Button size="sm" variant="outline" className="mt-3">
                          View Photos & Report 📄
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Button className="h-14 bg-green-600 hover:bg-green-700">
            Request Service
          </Button>
          <Button variant="outline" className="h-14">
            Update Payment Method
          </Button>
          <Button variant="outline" className="h-14" asChild>
            <a href="tel:+18502389727">
              <Phone className="w-4 h-4 mr-2" />
              Contact Us
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}