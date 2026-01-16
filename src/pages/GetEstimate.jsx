import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function GetEstimate() {
  const navigate = useNavigate();
  const [addressData, setAddressData] = useState(null);
  const [measurementId, setMeasurementId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    agreedToQuotes: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const selectedAddress = sessionStorage.getItem("selectedAddress");
    const addressJSON = sessionStorage.getItem("addressData");
    const measId = sessionStorage.getItem("measurementId");

    if (!selectedAddress || !addressJSON || !measId) {
      navigate(createPageUrl("Start"));
      return;
    }

    try {
      setAddressData(JSON.parse(addressJSON));
      setMeasurementId(measId);
    } catch {
      navigate(createPageUrl("Start"));
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Invalid phone format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      // Update measurement with contact info
      await base44.entities.Measurement.update(measurementId, {
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        agrees_to_quotes: formData.agreedToQuotes,
        available_for_purchase: formData.agreedToQuotes,
        lead_status: formData.agreedToQuotes ? "new" : "new",
        lead_price: formData.agreedToQuotes ? 25.0 : null,
      });

      // If they agreed to quotes, notify roofers
      if (formData.agreedToQuotes) {
        try {
          await base44.functions.invoke("NotifyRoofersNewLead", {
            measurement_id: measurementId,
          });
        } catch (err) {
          console.error("Error notifying roofers:", err);
        }
      }

      // Clear funnel session data and redirect to results
      sessionStorage.removeItem("selectedAddress");
      sessionStorage.removeItem("addressData");
      sessionStorage.removeItem("measurementId");

      // Redirect to results page
      window.location.href = `/results?id=${measurementId}`;
    } catch (err) {
      console.error("Error updating measurement:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!addressData || !measurementId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Almost there!
          </h1>
          <p className="text-lg text-slate-600">
            Just need a few details to show your complete estimate
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                placeholder="John Smith"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className={`h-12 ${
                  errors.fullName ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`h-12 ${
                  errors.email ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setFormData({ ...formData, phone: formatted });
                }}
                maxLength="14"
                className={`h-12 ${
                  errors.phone ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address Display */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Property Address
              </label>
              <div className="h-12 px-4 py-3 bg-slate-100 rounded-lg border border-slate-300 flex items-center text-slate-600">
                {addressData.formatted_address}
              </div>
            </div>

            {/* Roofer Opt-in */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreedToQuotes"
                  checked={formData.agreedToQuotes}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreedToQuotes: checked })
                  }
                  className="mt-1"
                />
                <div>
                  <label
                    htmlFor="agreedToQuotes"
                    className="block font-semibold text-slate-900 cursor-pointer"
                  >
                    Connect me with top-rated roofers for free quotes
                  </label>
                  <p className="text-sm text-slate-600 mt-1">
                    We'll share your measurements with 3 qualified contractors
                    in your area who can provide personalized estimates within
                    24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-slate-500 text-center">
              We respect your privacy.{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                See our privacy policy
              </a>
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
              disabled={loading}
            >
              {loading ? "Processing..." : "Show My Complete Estimate"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </div>

        {/* Trust Badge */}
        <div className="text-center">
          <p className="text-sm text-slate-600">
            ✓ Secure • Instant results • No obligation
          </p>
        </div>
      </div>
    </div>
  );
}