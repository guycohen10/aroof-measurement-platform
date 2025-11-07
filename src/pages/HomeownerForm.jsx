import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, ArrowLeft, ArrowRight, Shield, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HomeownerForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    property_address: "",
    agrees_to_quotes: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Form submitted with data:", formData);

    if (!formData.agrees_to_quotes) {
      setError("Please agree to receive quotes from Aroof to continue");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Creating user...");
      
      // Create user
      const userData = await base44.entities.User.create({
        user_type: "homeowner",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        agrees_to_quotes: formData.agrees_to_quotes
      });

      console.log("User created:", userData);

      // Create measurement record (skip payment for now)
      const measurement = await base44.entities.Measurement.create({
        user_id: userData.id,
        property_address: formData.property_address,
        user_type: "homeowner",
        payment_amount: 3,
        payment_status: "completed",
        stripe_payment_id: "demo_" + Date.now(),
        lead_status: "new"
      });

      console.log("Measurement created:", measurement);
      console.log("Navigating to measurement tool...");

      // Navigate directly to measurement tool
      navigate(createPageUrl(`MeasurementTool?measurementId=${measurement.id}`));
    } catch (err) {
      console.error("Error during form submission:", err);
      setError(`Failed to submit form: ${err.message || "Please try again"}`);
      setLoading(false);
    }
  };

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
            <Link to={createPageUrl("UserTypeSelection")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Step 1 of 2</span>
          <span className="text-sm text-slate-500">Contact Information</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-blue-900 h-2 rounded-full" style={{ width: '50%' }}></div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="text-2xl lg:text-3xl text-slate-900">
              Let's Get Started
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Tell us about yourself to receive your personalized Aroof estimate
            </p>
          </CardHeader>
          <CardContent className="p-6 lg:p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 text-lg"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 text-lg"
                  disabled={loading}
                />
                <p className="text-sm text-slate-500">We'll send your estimate and receipt here</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 text-lg"
                  disabled={loading}
                />
                <p className="text-sm text-slate-500">For quick follow-up and scheduling</p>
              </div>

              {/* Property Address */}
              <div className="space-y-2">
                <Label htmlFor="property_address" className="text-slate-700 font-medium">
                  Property Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="property_address"
                  type="text"
                  required
                  placeholder="123 Main St, City, State 12345"
                  value={formData.property_address}
                  onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                  className="h-12 text-lg"
                  disabled={loading}
                />
                <p className="text-sm text-slate-500">The address of the property you want measured</p>
              </div>

              {/* Agreement Checkbox */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agrees_to_quotes"
                    checked={formData.agrees_to_quotes}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, agrees_to_quotes: checked })
                    }
                    className="mt-1"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor="agrees_to_quotes" 
                      className="text-slate-700 font-medium cursor-pointer"
                    >
                      I agree to receive quotes and information from Aroof <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-slate-600 mt-1">
                      By proceeding, you'll receive a personalized cost estimate and may be contacted about your roofing project
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                {[
                  { icon: Shield, text: "Secure & Private" },
                  { icon: CheckCircle, text: "No Obligation" },
                  { icon: Home, text: "Licensed & Insured" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                    <item.icon className="w-4 h-4 text-green-500" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg bg-blue-900 hover:bg-blue-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating your measurement...
                  </>
                ) : (
                  <>
                    Continue to Measurement Tool
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-slate-500">
                Payment temporarily disabled for testing. You'll proceed directly to the measurement tool.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  1
                </div>
                <p className="text-slate-700">Measure your roof using our satellite tool</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  2
                </div>
                <p className="text-slate-700">Get instant Aroof cost estimate</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  3
                </div>
                <p className="text-slate-700">Schedule free consultation and book your project</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info (remove in production) */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> Check your browser console (F12) for detailed logs if the form doesn't submit.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}