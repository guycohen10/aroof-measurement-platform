import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, ArrowRight, Shield, Briefcase, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RooferForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    business_name: "",
    name: "",
    email: "",
    phone: "",
    license_number: "",
    property_address: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = await base44.entities.User.create({
        user_type: "roofer",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        business_name: formData.business_name,
        license_number: formData.license_number,
        agrees_to_quotes: false
      });

      // Navigate to payment page with user data
      navigate(createPageUrl(`Payment?userId=${userData.id}&address=${encodeURIComponent(formData.property_address)}&type=roofer`));
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
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
          <span className="text-sm font-medium text-orange-500">Step 1 of 3</span>
          <span className="text-sm text-slate-500">Business Information</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '33%' }}></div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-white">
            <CardTitle className="text-2xl lg:text-3xl text-slate-900">
              Professional Measurement Service
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Tell us about your business to access professional-grade measurements
            </p>
          </CardHeader>
          <CardContent className="p-6 lg:p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="business_name" className="text-slate-700 font-medium">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="business_name"
                  type="text"
                  required
                  placeholder="ABC Roofing Company"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="h-12 text-lg"
                />
              </div>

              {/* Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Contact Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 text-lg"
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
                  placeholder="john@abcroofing.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 text-lg"
                />
                <p className="text-sm text-slate-500">Your measurement report will be sent here</p>
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
                />
              </div>

              {/* License Number */}
              <div className="space-y-2">
                <Label htmlFor="license_number" className="text-slate-700 font-medium">
                  License Number <span className="text-slate-400">(Optional)</span>
                </Label>
                <Input
                  id="license_number"
                  type="text"
                  placeholder="ROC123456"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="h-12 text-lg"
                />
                <p className="text-sm text-slate-500">Your contractor license number if applicable</p>
              </div>

              {/* Property Address */}
              <div className="space-y-2">
                <Label htmlFor="property_address" className="text-slate-700 font-medium">
                  Property Address to Measure <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="property_address"
                  type="text"
                  required
                  placeholder="123 Main St, City, State 12345"
                  value={formData.property_address}
                  onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                  className="h-12 text-lg"
                />
                <p className="text-sm text-slate-500">The property you need measurements for</p>
              </div>

              {/* Business Use Notice */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-slate-700 font-medium">
                      This measurement is for your roofing business
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      You'll receive detailed measurements only. No Aroof pricing will be included in your report.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                {[
                  { icon: Shield, text: "Secure Payment" },
                  { icon: Award, text: "Professional Grade" },
                  { icon: Briefcase, text: "Business License" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                    <item.icon className="w-4 h-4 text-orange-500" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600"
              >
                {loading ? "Processing..." : "Continue to Payment"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-center text-sm text-slate-500">
                Your business information is secure and confidential
              </p>
            </form>
          </CardContent>
        </Card>

        {/* What's Included */}
        <Card className="mt-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">What's included in your measurement:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  ✓
                </div>
                <p className="text-slate-700">Precise satellite-based roof measurements</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  ✓
                </div>
                <p className="text-slate-700">Detailed section-by-section breakdown</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  ✓
                </div>
                <p className="text-slate-700">Downloadable PDF report with watermark</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  ✓
                </div>
                <p className="text-slate-700">Business use license included</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}