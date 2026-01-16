import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RooferPlans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [billingInterval, setBillingInterval] = useState("monthly");

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
      id: 'starter',
      name: 'Starter',
      price: 19.95,
      measurements: 0,
      stripePriceId: 'STRIPE_PRICE_STARTER',
      features: [
        '7-day free trial',
        'Dashboard access',
        'Profile listing in directory',
        'Lead notifications',
        'Buy leads separately (pay per lead)',
        'Email support'
      ],
      description: 'Access platform + buy leads as you need them'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      measurements: 10,
      popular: true,
      stripePriceId: 'STRIPE_PRICE_PRO',
      features: [
        '10 free leads per month',
        'Custom branded PDFs',
        'Priority support',
        'API access',
        'Advanced reports',
        'Additional leads: $5 each'
      ],
      description: 'Includes 10 free leads/month + platform access'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      measurements: 'Unlimited',
      stripePriceId: 'STRIPE_PRICE_ENTERPRISE',
      features: [
        'Unlimited leads',
        'White label PDFs',
        'Dedicated support',
        'Full API access',
        'Custom integrations',
        'Priority processing'
      ],
      description: 'Unlimited leads + premium features'
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (planId === user.subscription_plan) {
      alert('You are already on this plan');
      return;
    }

    setUpgrading(true);

    try {
      // If user has Stripe subscription and is changing plans
      if (user.stripe_subscription_id && planId !== 'free') {
        // Update existing subscription via Stripe
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Update Stripe subscription ${user.stripe_subscription_id} to new plan ${planId}`,
          add_context_from_internet: false
        });
        
        alert('⚠️ Stripe integration required. Please contact support to change plans.');
        setUpgrading(false);
        return;
      }

      // If downgrading to free
      if (planId === 'free') {
        const confirm = window.confirm(
          'Are you sure you want to downgrade to the Free plan?\n\n' +
          'You will lose access to premium features and your measurement limit will be reduced to 3 per month.'
        );
        
        if (!confirm) {
          setUpgrading(false);
          return;
        }

        // Cancel Stripe subscription if exists
        if (user.stripe_subscription_id) {
          alert('⚠️ Please cancel your subscription through the billing portal in Settings.');
          setUpgrading(false);
          return;
        }

        // Update to free plan
        await base44.auth.updateMe({
          subscription_plan: 'free',
          measurements_limit: 3,
          subscription_status: 'active'
        });

        alert('✅ Downgraded to Free plan');
        await loadUser();
        setUpgrading(false);
        return;
      }

      // If upgrading from free to paid plan
      const plan = plans.find(p => p.id === planId);
      
      // Redirect to Stripe Checkout
      // In production, this would call your backend API to create checkout session
      alert(
        `🚀 STRIPE CHECKOUT\n\n` +
        `This would redirect to Stripe to collect payment for:\n\n` +
        `Plan: ${plan.name}\n` +
        `Price: $${plan.price}/month\n\n` +
        `To integrate:\n` +
        `1. Set up Stripe products\n` +
        `2. Add backend API endpoint\n` +
        `3. Create checkout session\n` +
        `4. Handle webhooks\n\n` +
        `For now, updating plan without payment...`
      );

      // Temporary: Update plan without payment (remove in production)
      const newLimit = planId === 'unlimited' ? 999999 : 
                      planId === 'pro' ? 100 :
                      planId === 'starter' ? 20 : 3;

      await base44.auth.updateMe({
        subscription_plan: planId,
        measurements_limit: newLimit,
        subscription_status: 'trialing' // Would be 'active' after Stripe payment
      });

      alert(`✅ Switched to ${plan.name} plan! (Payment integration pending)`);
      await loadUser();
      
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

        {/* Stripe Integration Alert */}
        <Alert className="mb-8 bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-900">
            <strong>⚠️ Stripe Integration Pending:</strong> To enable real payment processing, 
            you need to set up Stripe credentials and create checkout sessions. 
            See <code className="bg-yellow-100 px-2 py-0.5 rounded">STRIPE_SETUP.md</code> for instructions.
          </AlertDescription>
        </Alert>

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
                  <p className="text-sm text-slate-600 italic mb-2">
                    {plan.description}
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    {plan.measurements === 'Unlimited' ? 'Unlimited leads' : 
                     plan.measurements === 0 ? 'Pay per lead' : 
                     `${plan.measurements} free leads/month`}
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
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.price > 0 ? (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              {plan.price > (plans.find(p => p.id === user.subscription_plan)?.price || 0) ? (
                                `Upgrade to ${plan.name}`
                              ) : (
                                `Switch to ${plan.name}`
                              )}
                            </>
                          ) : (
                            `Downgrade to Free`
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

        {/* Plan Details */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-2">Plan Change Policy</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Upgrades take effect immediately with prorated billing</li>
              <li>• Downgrades take effect at the end of your billing cycle</li>
              <li>• 14-day free trial on all paid plans</li>
              <li>• Cancel anytime - no long-term contracts</li>
              <li>• Usage resets monthly on your billing cycle date</li>
            </ul>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-slate-700 mb-2">
              <strong>Need help choosing a plan?</strong>
            </p>
            <p className="text-sm text-slate-600">
              Contact us at{' '}
              <a href="mailto:sales@aroof.build" className="text-blue-600 hover:underline">
                sales@aroof.build
              </a>
              {' '}or call{' '}
              <a href="tel:+18502389727" className="text-blue-600 hover:underline">
                (850) 238-9727
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}