import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  CreditCard,
  Check,
  Calendar,
  DollarSign,
  Download,
  TrendingUp,
  AlertCircle
} from "lucide-react";

const PLANS = {
  free: {
    name: "FREE",
    price: 0,
    measurements: 3,
    features: ["3 measurements per month", "Basic PDF reports", "Email support"]
  },
  starter: {
    name: "STARTER",
    price: 49,
    measurements: 20,
    features: ["20 measurements per month", "Standard PDF reports", "Email support", "Save history"]
  },
  pro: {
    name: "PRO",
    price: 99,
    measurements: 100,
    popular: true,
    features: ["100 measurements per month", "Custom branded PDFs", "Priority support", "API access"]
  },
  unlimited: {
    name: "UNLIMITED",
    price: 199,
    measurements: "Unlimited",
    features: ["Unlimited measurements", "White label PDFs", "Dedicated support", "Full API", "Custom integrations"]
  }
};

export default function RooferBilling() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.aroof_role !== 'external_roofer') {
        alert('This page is for external roofer accounts only');
        navigate(createPageUrl("RooferDashboard"));
        return;
      }

      setUser(currentUser);
      setLoading(false);
    } catch (err) {
      console.error('Error loading user:', err);
      navigate(createPageUrl("RooferSignup"));
    }
  };

  const handleUpgrade = async (newPlan) => {
    if (window.confirm(`Upgrade to ${PLANS[newPlan].name} plan for $${PLANS[newPlan].price}/month?\n\nThis would open Stripe checkout in production.`)) {
      try {
        await base44.auth.updateMe({
          subscription_plan: newPlan,
          measurements_limit: PLANS[newPlan].measurements === "Unlimited" ? -1 : PLANS[newPlan].measurements
        });
        
        alert('✅ Plan upgraded successfully!');
        navigate(createPageUrl("RooferDashboard"));
      } catch (err) {
        alert('Failed to upgrade plan');
      }
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?\n\nYou will be downgraded to the FREE plan at the end of your billing cycle.')) {
      try {
        await base44.auth.updateMe({
          subscription_status: 'canceled'
        });
        
        alert('Subscription canceled. You can continue using the service until the end of your billing period.');
        loadUser();
      } catch (err) {
        alert('Failed to cancel subscription');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading billing info...</p>
        </div>
      </div>
    );
  }

  const currentPlan = user?.subscription_plan || 'free';
  const mockInvoices = [
    { date: '2025-01-01', amount: PLANS[currentPlan].price, status: 'Paid', invoice_url: '#' },
    { date: '2024-12-01', amount: PLANS[currentPlan].price, status: 'Paid', invoice_url: '#' },
    { date: '2024-11-01', amount: PLANS[currentPlan].price, status: 'Paid', invoice_url: '#' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Billing & Subscription</h1>
            <Link to={createPageUrl("RooferDashboard")}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold">{PLANS[currentPlan].name}</h2>
                  <Badge className={currentPlan === 'unlimited' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-blue-100 text-blue-800'}>
                    Active
                  </Badge>
                </div>
                <p className="text-2xl text-slate-600 mb-4">
                  ${PLANS[currentPlan].price}/month
                </p>
                <div className="space-y-2">
                  {PLANS[currentPlan].features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Next billing: Feb 15, 2025</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>•••• 4242</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span>Amount: ${PLANS[currentPlan].price}</span>
                </div>
              </div>
            </div>

            {currentPlan !== 'free' && (
              <div className="flex gap-4 mt-6 pt-6 border-t">
                <Button variant="outline">
                  Update Payment Method
                </Button>
                <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        {currentPlan !== 'unlimited' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Upgrade Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(PLANS).filter(([key]) => {
                const planOrder = { free: 0, starter: 1, pro: 2, unlimited: 3 };
                return planOrder[key] > planOrder[currentPlan];
              }).map(([key, plan]) => (
                <Card
                  key={key}
                  className={`relative ${
                    plan.popular ? 'border-4 border-blue-600 shadow-xl' : 'border-2'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">MOST POPULAR</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-center">
                      <p className="text-2xl mb-2">{plan.name}</p>
                      <p className="text-4xl font-bold text-blue-600">${plan.price}</p>
                      <p className="text-slate-600">/month</p>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleUpgrade(key)}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade to {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Billing History */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2">
                  <tr>
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Plan</th>
                    <th className="text-left p-3 font-semibold">Amount</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPlan === 'free' ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">
                        No billing history for free plan
                      </td>
                    </tr>
                  ) : (
                    mockInvoices.map((invoice, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="p-3">{new Date(invoice.date).toLocaleDateString()}</td>
                        <td className="p-3 font-semibold">{PLANS[currentPlan].name}</td>
                        <td className="p-3 font-semibold">${invoice.amount}</td>
                        <td className="p-3">
                          <Badge className="bg-green-100 text-green-800">
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Need help with billing?</h3>
                <p className="text-blue-800 mb-4">
                  Contact our support team at billing@aroof.build or call (850) 238-9727
                </p>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}