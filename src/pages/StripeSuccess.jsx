import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";

export default function StripeSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setError("No payment session found");
      setLoading(false);
      return;
    }

    try {
      // In a real implementation, you would verify this with your backend
      // For now, we'll update the user's subscription status
      const user = await base44.auth.me();
      
      // Update user subscription to active
      // In production, this should be done via webhook after Stripe confirms payment
      await base44.auth.updateMe({
        subscription_status: 'active'
      });

      setSessionData({
        plan: user.subscription_plan,
        email: user.email
      });

      setLoading(false);
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment. Please contact support.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-xl text-slate-700">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Error</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => navigate(createPageUrl("RooferDashboard"))}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center pb-8 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-4xl mb-2">Payment Successful!</CardTitle>
          <p className="text-xl text-green-100">Welcome to Aroof Measurement Platform</p>
        </CardHeader>

        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Your Subscription Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Plan:</span>
                  <span className="font-bold text-blue-900">
                    {sessionData?.plan?.toUpperCase() || 'STARTER'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Email:</span>
                  <span className="font-semibold text-slate-900">{sessionData?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                    ✓ ACTIVE
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-3">What's Next?</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Start measuring roofs with unlimited accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Download professional PDF reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Customize with your company branding (Pro/Unlimited)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Access priority support</span>
                </li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Button
                size="lg"
                className="w-full h-16 text-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                onClick={() => navigate(createPageUrl("RooferDashboard"))}
              >
                Go to Dashboard
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </div>

            <p className="text-center text-sm text-slate-500">
              Questions? Email us at{' '}
              <a href="mailto:support@aroof.build" className="text-blue-600 hover:underline">
                support@aroof.build
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}