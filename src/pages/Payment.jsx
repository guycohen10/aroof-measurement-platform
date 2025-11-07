import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, CreditCard, Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Payment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [address, setAddress] = useState("");
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      const addr = urlParams.get('address');
      const type = urlParams.get('type');

      if (!userId || !addr || !type) {
        navigate(createPageUrl("Homepage"));
        return;
      }

      try {
        const users = await base44.entities.User.filter({ id: userId });
        if (users.length > 0) {
          setUserData(users[0]);
          setAddress(decodeURIComponent(addr));
          setUserType(type);
        } else {
          navigate(createPageUrl("Homepage"));
        }
      } catch (err) {
        console.error(err);
        navigate(createPageUrl("Homepage"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Create measurement record
      const measurement = await base44.entities.Measurement.create({
        user_id: userData.id,
        property_address: address,
        user_type: userType,
        payment_amount: userType === "homeowner" ? 3 : 5,
        payment_status: "completed",
        stripe_payment_id: "demo_" + Date.now(),
        lead_status: "new"
      });

      // Navigate to measurement tool
      navigate(createPageUrl(`MeasurementTool?measurementId=${measurement.id}`));
    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const amount = userType === "homeowner" ? 3 : 5;
  const primaryColor = userType === "homeowner" ? "blue" : "orange";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Aroof</h1>
                <p className="text-xs text-slate-500">Aroof.build</p>
              </div>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium text-${primaryColor}-${userType === "homeowner" ? "900" : "500"}`}>
            Step 2 of 3
          </span>
          <span className="text-sm text-slate-500">Secure Payment</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className={`bg-${primaryColor}-${userType === "homeowner" ? "900" : "500"} h-2 rounded-full`} style={{ width: '66%' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-slate-700">
                    <strong>Note:</strong> Stripe payment integration is not yet enabled. Click "Complete Payment" below to continue with a demo flow. 
                    In production, this will process real payments through Stripe.
                  </AlertDescription>
                </Alert>

                {/* Stripe Integration Placeholder */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
                  <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Stripe Checkout Integration
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Secure payment form will appear here once Stripe is connected
                  </p>
                  <div className="space-y-3 text-sm text-slate-500">
                    <p>✓ PCI Compliant</p>
                    <p>✓ 256-bit SSL Encryption</p>
                    <p>✓ Secure Card Processing</p>
                  </div>
                </div>

                {/* Demo Continue Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className={`w-full h-14 text-lg mt-6 bg-${primaryColor}-${userType === "homeowner" ? "900" : "500"} hover:bg-${primaryColor}-${userType === "homeowner" ? "800" : "600"}`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Complete Payment (Demo)
                    </>
                  )}
                </Button>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl sticky top-24">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-xl text-slate-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Customer Type</p>
                    <p className="font-medium text-slate-900 capitalize">{userType}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-1">Name</p>
                    <p className="font-medium text-slate-900">{userData?.name}</p>
                  </div>

                  {userData?.business_name && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Business</p>
                      <p className="font-medium text-slate-900">{userData.business_name}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="font-medium text-slate-900 text-sm break-all">{userData?.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-1">Property Address</p>
                    <p className="font-medium text-slate-900">{address}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-500 mb-1">Service</p>
                    <p className="font-medium text-slate-900">
                      {userType === "homeowner" 
                        ? "Roof Measurement + Aroof Estimate" 
                        : "Professional Roof Measurement"}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-2xl font-bold">
                      <span className="text-slate-900">Total</span>
                      <span className={`text-${primaryColor}-${userType === "homeowner" ? "900" : "500"}`}>
                        ${amount}.00
                      </span>
                    </div>
                  </div>

                  {userType === "homeowner" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-green-800">
                        <strong>What you'll get:</strong> Precise measurements + personalized Aroof cost estimate + booking option
                      </p>
                    </div>
                  )}

                  {userType === "roofer" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-orange-800">
                        <strong>What you'll get:</strong> Detailed measurements report for your business (no Aroof pricing included)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}