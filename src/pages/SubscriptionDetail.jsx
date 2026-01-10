import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Home, User, MapPin, Phone, Mail, DollarSign, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SubscriptionDetail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const subId = window.location.pathname.split('/').pop();
      const subs = await base44.entities.Subscription.filter({ id: subId });
      
      if (subs.length > 0) {
        setSubscription(subs[0]);
      } else {
        toast.error('Subscription not found');
        navigate(createPageUrl("Subscriptions"));
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;

    try {
      const history = subscription.service_history || [];
      history.push({
        date: new Date().toISOString(),
        service_type: 'note',
        notes: note,
        technician: 'Admin'
      });

      await base44.entities.Subscription.update(subscription.id, {
        service_history: history
      });

      setNote("");
      loadSubscription();
      toast.success('Note added');
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!subscription) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Subscription Details</h1>
            <Link to={createPageUrl("Subscriptions")}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="font-semibold">{subscription.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{subscription.customer_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{subscription.customer_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{subscription.property_address}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Plan & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Plan:</span>
                <span className="font-semibold text-lg capitalize">{subscription.plan_tier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Price:</span>
                <span className="font-bold text-lg text-green-600">
                  ${subscription.monthly_price}/{subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Status:</span>
                <span className={`px-2 py-1 rounded font-semibold ${
                  subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {subscription.status}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Next Billing:</span>
                  <span>{format(new Date(subscription.current_period_end), 'MMM d, yyyy')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Service Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">Inspections</p>
                <p className="text-3xl font-bold text-blue-600">
                  {subscription.inspections_remaining || 0}
                  <span className="text-lg text-slate-600">
                    /{subscription.plan_tier === 'basic' ? 1 : subscription.plan_tier === 'premium' ? 2 : 4}
                  </span>
                </p>
                <p className="text-xs text-blue-700 mt-1">remaining</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-900 font-semibold mb-2">Gutter Cleanings</p>
                <p className="text-3xl font-bold text-green-600">
                  {subscription.cleanings_remaining || 0}
                  <span className="text-lg text-slate-600">
                    /{subscription.plan_tier === 'basic' ? 1 : subscription.plan_tier === 'premium' ? 2 : 4}
                  </span>
                </p>
                <p className="text-xs text-green-700 mt-1">remaining</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-900 font-semibold mb-2">Repair Budget</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${subscription.repairs_budget_used || 0}
                  <span className="text-lg text-slate-600">
                    /${subscription.plan_tier === 'basic' ? 250 : subscription.plan_tier === 'premium' ? 500 : 1000}
                  </span>
                </p>
                <p className="text-xs text-purple-700 mt-1">used</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add Service Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes about service, customer contact, etc..."
              rows={4}
            />
            <Button onClick={handleAddNote} disabled={!note.trim()}>
              Save Note
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Service History</CardTitle>
          </CardHeader>
          <CardContent>
            {(!subscription.service_history || subscription.service_history.length === 0) ? (
              <p className="text-center text-slate-500 py-8">No service history yet</p>
            ) : (
              <div className="space-y-4">
                {subscription.service_history.map((service, i) => (
                  <Card key={i} className="border-l-4 border-l-blue-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">{service.service_type}</h4>
                          <p className="text-sm text-slate-600">
                            {format(new Date(service.date), 'MMM d, yyyy')} - {service.technician}
                          </p>
                        </div>
                        {service.photos && service.photos.length > 0 && (
                          <span className="text-sm text-blue-600">📷 {service.photos.length} photos</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700">{service.notes}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1">
            Schedule Service
          </Button>
          <Button variant="outline" className="flex-1">
            Contact Customer
          </Button>
          <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
            Cancel Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}