import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowLeft, Loader2 } from "lucide-react";

export default function RooferPlans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.aroof_role !== 'external_roofer') {
        alert('Access denied. External roofer account required.');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setUser(currentUser);
      setLoading(false);
    } catch (err) {
      console.error('Auth error:', err);
      navigate(createPageUrl("RooferSignup"));
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      measurements: 3,
      features: [
        '3 measurements per month',
        'Basic PDF reports',
        'Satellite imagery',
        'Area calculations',
        'Email support'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      measurements: 20,
      features: [
        '20 measurements per month',
        'Standard PDF reports',
        'All measurement tools',
        'Line measurements',
        'Priority email support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      measurements: 100,
      popular: true,
      features: [
        '100 measurements per month',
        'Custom branded PDFs',
        'Your company logo',
        'Custom colors',
        'Priority support',
        'API access'
      ]
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: 199,
      measurements: 'Unlimited',
      features: [
        'Unlimited measurements',
        'White label PDFs',
        'Full branding control',
        'Dedicated support',
        'Full API access',
        'Custom integrations'
      ]
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (planId === user.subscription_plan) {
      alert('You are already on this plan');
      return;
    }

    setUpgrading(true);

    try {
      const newLimit = planId === 'unlimited' ? 999999 : 
                      planId === 'pro' ? 100 :
                      planId === 'starter' ? 20 : 3;

      await base44.auth.updateMe({
        subscription_plan: planId,
        measurements_limit: newLimit,
        subscription_status: 'active'
      });

      alert(`✅ Successfully switched to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`);
      await loadUser();
      
      // If downgrading, show warning about usage
      if (user.measurements_used_this_month > newLimit && planId !== 'unlimited') {
        alert(`⚠️ Note: You've used ${user.measurements_used_this_month} measurements this month, which is over your new limit of ${newLimit}. Your usage will reset at the start of your next billing cycle.`);
      }
      
    } catch (err) {
      console.error('Error changing plan:', err);
      alert('Failed to change plan. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading plans...</p>
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
            <Link to={createPageUrl("RooferDashboard")}>
              <Button variant="ghost">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Badge className="bg-blue-600">
              Current: {user.subscription_plan?.toUpperCase() || 'FREE'}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600">
            Upgrade or downgrade anytime. No contracts.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = user.subscription_plan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`relative border-2 hover:shadow-xl transition-all ${
                  plan.popular ? 'border-purple-400 shadow-lg' : 'border-slate-200'
                } ${isCurrentPlan ? 'ring-2 ring-blue-600' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-blue-600 text-white px-3 py-1">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-slate-900">
                      ${plan.price}
                    </span>
                    <span className="text-slate-600">/month</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-600">
                    {plan.measurements === 'Unlimited' ? 'Unlimited' : plan.measurements} measurements/month
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button 
                      className="w-full h-12 bg-slate-200 text-slate-600 cursor-not-allowed"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full h-12 ${
                        plan.popular 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={upgrading}
                    >
                      {upgrading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Switching...
                        </>
                      ) : (
                        <>
                          {plan.price > (plans.find(p => p.id === user.subscription_plan)?.price || 0) ? (
                            <>
                              <Crown className="w-4 h-4 mr-2" />
                              Upgrade to {plan.name}
                            </>
                          ) : (
                            `Switch to ${plan.name}`
                          )}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Note about changes */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-2">Plan Change Policy</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Changes take effect immediately</li>
              <li>• Upgrades give you more measurements right away</li>
              <li>• Downgrades keep your current usage until next billing cycle</li>
              <li>• No refunds for partial months</li>
              <li>• Usage resets on your billing cycle date</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}