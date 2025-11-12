
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, CreditCard, Lock, CheckCircle, Loader2, Shield, AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Payment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Changed initial state to true
  const [processing, setProcessing] = useState(false); // New state for processing payment
  const [error, setError] = useState("");
  const [measurement, setMeasurement] = useState(null); // New state to store measurement object
  const [orderDetails, setOrderDetails] = useState(null);

  // Payment form data
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(""); // Renamed from nameOnCard
  const [expiryDate, setExpiryDate] = useState(""); // Renamed from expiry
  const [cvc, setCvc] = useState("");
  // Removed zipCode state

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const measurementId = urlParams.get('measurementid');
    const userType = urlParams.get('usertype');
    const amount = urlParams.get('amount');
    const address = urlParams.get('address');
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    const phone = urlParams.get('phone');

    if (!measurementId || !userType || !amount) {
      console.error("Payment: Missing required parameters");
      navigate(createPageUrl("Homepage"));
      return;
    }

    const loadMeasurement = async () => {
      try {
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        if (measurements.length > 0) {
          setMeasurement(measurements[0]);
        } else {
          console.error("Measurement not found for ID:", measurementId);
        }
      } catch (err) {
        console.error("Error loading measurement:", err);
      }
    };

    loadMeasurement(); // Call to load measurement data

    setOrderDetails({
      measurementId,
      userType,
      amount: parseFloat(amount),
      address: decodeURIComponent(address || ''),
      name: decodeURIComponent(name || ''),
      email: decodeURIComponent(email || ''),
      phone: decodeURIComponent(phone || '')
    });

    setLoading(false);
  }, [navigate]); // Added navigate to dependency array

  // Card formatting functions (updated from outline)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? ' / ' + v.slice(2, 4) : '');
    }
    return v;
  };

  const formatCVC = (value) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  // Removed handleCardNumberChange, handleExpiryChange, handleCvcChange, they are now inline in JSX

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      setError("Please enter a valid card number");
      return;
    }

    // Validate expiryDate (MM / YY)
    const expiryParts = expiryDate.split(' / ').map(s => s.trim());
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      setError("Please enter a valid expiry date (MM / YY)");
      return;
    }
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expMonth = parseInt(expiryParts[0], 10);
    const expYear = parseInt(expiryParts[1], 10);

    if (expMonth < 1 || expMonth > 12) {
      setError("Invalid expiry month.");
      return;
    }
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setError("Card has expired.");
      return;
    }

    if (cvc.length < 3 || cvc.length > 4) { // CVC can be 3 or 4 digits
      setError("Please enter a valid CVC");
      return;
    }

    if (!cardName.trim()) {
      setError("Please enter the cardholder name");
      return;
    }

    setProcessing(true); // Use processing state

    try {
      console.log("Processing payment for PDF report:", orderDetails);

      // Test card handling
      if (cleanCardNumber === '4242424242424242') {
        console.log("✅ Test card - simulating successful payment");
      } else if (cleanCardNumber === '4000000000000002') { // Updated test decline card number
        throw new Error("Card declined (test card)");
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update measurement with payment info
      const paymentData = {
        user_type: orderDetails.userType,
        payment_amount: orderDetails.amount,
        payment_status: 'completed',
        stripe_payment_id: 'stripe_' + Date.now(), // In production: real Stripe payment ID
        pdf_purchased: true, // New field
        pdf_purchase_date: new Date().toISOString() // New field
        // Removed agrees_to_quotes as it's not in the new context
      };

      if (measurement) { // Check if measurement object is loaded
        await base44.entities.Measurement.update(measurement.id, paymentData);
      } else {
        throw new Error("Measurement data not available to update.");
      }

      console.log("✅ Payment successful, PDF purchased");

      // Redirect to download success page
      navigate(createPageUrl(`PDFDownload?measurementid=${orderDetails.measurementId}&usertype=${orderDetails.userType}`));

    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please check your card details and try again.");
      setProcessing(false); // Reset processing on error
    }
  };

  if (loading) { // Display loading spinner while fetching initial data
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // If orderDetails are missing after loading, show an error message
  if (!orderDetails || !orderDetails.measurementId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">Invalid order information. Please go back and try again.</p>
            <Link to={createPageUrl("Homepage")}>
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate area for display, defaulting to 0 if not available
  const area = measurement?.total_adjusted_sqft || measurement?.total_sqft || 0;


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header (simplified) */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Aroof</span>
          </Link>
          {/* Removed Back button */}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8"> {/* Changed to 2 columns */}
          {/* Payment Form */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Purchase</h1>
            <p className="text-slate-600 mb-8">
              Secure payment to download your professional PDF report
            </p>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Updated Demo Mode Notice */}
                <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-sm">
                    <strong>DEMO MODE:</strong> Use test card <strong>4242 4242 4242 4242</strong> for success,
                    or <strong>4000 0000 0000 0002</strong> for decline. Any future date and CVC works.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Cardholder Name */}
                  <div>
                    <Label htmlFor="cardName" className="text-base font-medium">Cardholder Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="cardName"
                      type="text"
                      required
                      placeholder="John Smith"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-2 h-12 text-lg"
                      disabled={processing}
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <Label htmlFor="cardNumber" className="text-base font-medium">Card Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="mt-2 h-12 text-lg"
                      disabled={processing}
                    />
                  </div>

                  {/* Expiry Date and CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-base font-medium">Expiry Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="expiry"
                        type="text"
                        required
                        placeholder="MM / YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        maxLength={7}
                        className="mt-2 h-12 text-lg"
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cvc" className="text-base font-medium">CVC <span className="text-red-500">*</span></Label>
                      <Input
                        id="cvc"
                        type="text"
                        required
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(formatCVC(e.target.value))}
                        maxLength={4}
                        className="mt-2 h-12 text-lg"
                        disabled={processing}
                      />
                    </div>
                  </div>

                  {/* Secure Payment Info within form */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <Lock className="w-4 h-4 inline mr-2" />
                    <strong>Secure Payment:</strong> Your payment information is encrypted and secure.
                    We use industry-standard security.
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Pay ${orderDetails.amount.toFixed(2)} Securely
                      </>
                    )}
                  </Button>

                  {/* Test card info at the bottom */}
                  <p className="text-xs text-center text-slate-500">
                    Test card: 4242 4242 4242 4242 | Any future expiry | Any CVC
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="shadow-xl sticky top-24">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-lg">
                      {orderDetails.userType === 'homeowner' ? 'Homeowner' : 'Professional'} PDF Report
                    </p>
                    <p className="text-sm text-slate-600">Detailed roof measurement report</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">${orderDetails.amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Property:</span>
                    <span className="font-semibold text-slate-900">{orderDetails.address}</span>
                  </div>
                  {area > 0 && ( // Display area only if available
                    <div className="flex justify-between">
                      <span className="text-slate-600">Roof Area:</span>
                      <span className="font-semibold text-slate-900">{area.toLocaleString()} sq ft</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Report Type:</span>
                    <span className="font-semibold text-slate-900 capitalize">{orderDetails.userType}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-slate-900">Total:</span>
                    <span className="text-3xl font-bold text-green-600">${orderDetails.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-500">One-time payment • No recurring charges</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <h4 className="font-bold text-green-900 mb-2 text-sm">What You'll Get:</h4>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>✓ Professional PDF report</li>
                    <li>✓ Detailed measurements & satellite imagery</li>
                    <li>✓ Cost breakdown and estimates</li>
                    {orderDetails.userType === 'roofer' && (
                      <>
                        <li>✓ Material quantity calculations</li>
                        <li>✓ Client-ready formatting</li>
                      </>
                    )}
                    <li>✓ Instant download after payment</li>
                    <li>✓ Lifetime access</li>
                  </ul>
                </div>

                {/* New Secure Checkout Badge */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <strong>Secure Checkout:</strong> Your payment is protected with bank-level encryption
                  </div>
                </div>

                {/* New Money-Back Guarantee Badge */}
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-900">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <strong>Money-Back Guarantee:</strong> 100% refund if not satisfied
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
