import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [newLeadId, setNewLeadId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setStatus('error');
        setErrorMessage('No session ID provided');
        setLoading(false);
        return;
      }

      const user = await base44.auth.me();
      if (!user) {
        setStatus('error');
        setErrorMessage('User not authenticated');
        setLoading(false);
        return;
      }

      // Verify payment with Stripe via backend function
      const result = await base44.functions.invoke('verifyLeadPayment', {
        session_id: sessionId,
        user_id: user.id,
        company_id: user.company_id
      });

      if (result.success) {
        setStatus('success');
        setNewLeadId(result.lead_id);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Card className="w-full max-w-md">
        {status === 'success' ? (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Payment Successful! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-medium">Lead added to your pipeline</p>
                <p className="text-sm text-green-700 mt-1">
                  Your new lead is now available in your CRM dashboard.
                </p>
              </div>

              <Button
                onClick={() => navigate(createPageUrl(`CustomerDetail?id=${newLeadId}`))}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                View My New Lead
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('RooferDashboard'))}
                className="w-full h-12"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-900 font-medium">Something went wrong</p>
                <p className="text-sm text-red-700 mt-1">
                  {errorMessage || 'Your payment could not be processed. Please try again.'}
                </p>
              </div>

              <Button
                onClick={() => navigate(createPageUrl('RooferBrowseLeads'))}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('RooferDashboard'))}
                className="w-full h-12"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}