import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, ArrowLeft, Lock, CheckCircle, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Payment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);

  // Payment form data
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");

  useEffect(() => {
    // Get order details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('usertype');
    const address = urlParams.get('address');
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    const phone = urlParams.get('phone');

    if (!userType || !address) {
      navigate(createPageUrl("UserTypeSelection"));
      return;
    }

    const amount = userType === 'homeowner' ? 3.00 : 5.00;
    
    setOrderDetails({
      userType,
      address,
      name,
      email,
      phone,
      amount
    });
  }, [navigate]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace('/', '').length <= 4) {
      setExpiry(formatted);
    }
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setCvc(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      setError("Please enter a valid card number");
      return;
    }

    if (!expiry || expiry.length !== 5) {
      setError("Please enter a valid expiry date (MM/YY)");
      return;
    }

    if (!cvc || cvc.length < 3) {
      setError("Please enter a valid CVC code");
      return;
    }

    if (!zipCode || zipCode.length < 5) {
      setError("Please enter a valid ZIP code");
      return;
    }

    if (!nameOnCard) {
      setError("Please enter the name on card");
      return;
    }

    setLoading(true);

    try {
      // DEMO MODE: Simulate payment processing
      // In production, this would call Stripe API
      
      console.log("Processing payment...");
      console.log("Card:", cardNumber);
      console.log("Amount:", orderDetails.amount);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for test card numbers
      const cardDigits = cardNumber.replace(/\s/g, '');
      
      // 4242 4242 4242 4242 = success
      // 4000 0000 0000 9995 = declined
      if (cardDigits === '4000000000009995') {
        throw new Error("Card declined - insufficient funds (test card)");
      }

      // Create measurement record with payment info
      const measurement = await base44.entities.Measurement.create({
        property_address: orderDetails.address,
        user_type: orderDetails.userType,
        customer_name: orderDetails.name,
        customer_email: orderDetails.email,
        customer_phone: orderDetails.phone,
        payment_status: 'completed',
        payment_amount: orderDetails.amount,
        stripe_payment_id: 'demo_' + Date.now(), // In production: real Stripe payment ID
        agrees_to_quotes: true
      });

      console.log("✅ Payment successful, measurement created:", measurement.id);

      // Redirect to measurement page with coordinates if available
      const urlParams = new URLSearchParams(window.location.search);
      const lat = urlParams.get('lat');
      const lng = urlParams.get('lng');

      const measurementUrl = createPageUrl(
        `MeasurementPage?measurementId=${measurement.id}&address=${encodeURIComponent(orderDetails.address)}` +
        (lat && lng ? `&lat=${lat}&lng=${lng}` : '')
      );

      navigate(measurementUrl);

    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading payment page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Complete Your Order</h1>
          <p className="text-lg text-slate-600">Secure payment powered by Stripe</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment Form - 3 columns */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Demo Mode Notice */}
                <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-sm">
                    <strong>DEMO MODE:</strong> Use test card <strong>4242 4242 4242 4242</strong> for success, 
                    or <strong>4000 0000 0000 9995</strong> for decline. Any future date and CVC works.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Card Number */}
                  <div>
                    <Label htmlFor="cardNumber" className="text-base font-medium">
                      Card Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="mt-2 h-12 text-lg"
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Card Details Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <Label htmlFor="expiry" className="text-base font-medium">
                        Expiry <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="mt-2 h-12 text-lg"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <Label htmlFor="cvc" className="text-base font-medium">
                        CVC <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cvc"
                        type="text"
                        placeholder="123"
                        value={cvc}
                        onChange={handleCvcChange}
                        className="mt-2 h-12 text-lg"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <Label htmlFor="zipCode" className="text-base font-medium">
                        ZIP <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="12345"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="mt-2 h-12 text-lg"
                        disabled={loading}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div>
                    <Label htmlFor="nameOnCard" className="text-base font-medium">
                      Name on Card <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nameOnCard"
                      type="text"
                      placeholder="John Smith"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="mt-2 h-12 text-lg"
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-16 text-xl bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-6 h-6 mr-3" />
                        Pay ${orderDetails.amount.toFixed(2)} Securely
                      </>
                    )}
                  </Button>

                  {/* Trust Badges */}
                  <div className="flex flex-wrap justify-center items-center gap-6 pt-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>256-bit Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-600" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Powered by Stripe</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl sticky top-24">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Service</p>
                  <p className="text-lg font-bold text-slate-900">Roof Measurement Service</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Property Address</p>
                  <p className="text-base font-semibold text-slate-900">{orderDetails.address}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">User Type</p>
                  <p className="text-base font-semibold text-slate-900">
                    {orderDetails.userType === 'homeowner' ? 'Homeowner' : 'Professional Roofer'}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-600 mb-3">What's Included:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-700">Accurate satellite measurement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-700">Detailed roof report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-700">Instant results</span>
                    </div>
                    {orderDetails.userType === 'homeowner' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700">Cost estimate included</span>
                      </div>
                    )}
                    {orderDetails.userType === 'roofer' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700">Material calculations</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base text-slate-600">Subtotal</span>
                    <span className="text-base font-semibold text-slate-900">
                      ${orderDetails.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base text-slate-600">Processing Fee</span>
                    <span className="text-base font-semibold text-slate-900">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold">${orderDetails.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-xs text-blue-900">
                    <strong>Money-back guarantee:</strong> If you're not satisfied with your measurement, 
                    contact us within 24 hours for a full refund.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}