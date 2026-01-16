import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function GetEstimate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    agrees_to_quotes: true
  });

  useEffect(() => {
    const storedAddress = sessionStorage.getItem('funnel_address');
    if (!storedAddress) {
      navigate(createPageUrl("StartFunnel"));
      return;
    }
    setAddress(storedAddress);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create measurement record
      const measurement = await base44.entities.Measurement.create({
        property_address: address,
        user_type: "homeowner",
        measurement_type: "quick_estimate",
        estimation_method: "building_sqft_multiplier",
        customer_name: formData.full_name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        agrees_to_quotes: formData.agrees_to_quotes,
        lead_status: "new",
        total_sqft: 2500, // Placeholder - would come from satellite API in production
        total_adjusted_sqft: 3000,
        measurement_data: {
          method: "quick_estimate",
          source: "funnel"
        }
      });

      // Store measurement ID for results page
      sessionStorage.setItem('funnel_measurement_id', measurement.id);

      // Track event
      base44.analytics.track({
        eventName: "funnel_contact_captured",
        properties: {
          opted_in_quotes: formData.agrees_to_quotes,
          measurement_id: measurement.id
        }
      });

      // If they opted in, notify roofers
      if (formData.agrees_to_quotes) {
        try {
          await base44.functions.invoke('NotifyRoofersNewLead', {
            measurement_id: measurement.id
          });
        } catch (err) {
          console.error('Failed to notify roofers:', err);
        }
      }

      // Redirect to results
      navigate(createPageUrl("Results"));
    } catch (err) {
      console.error('Error creating measurement:', err);
      toast.error("Failed to create estimate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white pt-24 pb-12">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Almost there!
        </h1>
        <p className="text-xl text-slate-600">
          Just need a few details to show your estimate
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="full_name" className="text-sm font-semibold mb-2 block">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Smith"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold mb-2 block">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>

              {/* Address (Read-only) */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  Property Address
                </Label>
                <div className="bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-700">
                  {address}
                </div>
              </div>

              {/* Opt-in Checkbox */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agrees_to_quotes"
                    name="agrees_to_quotes"
                    checked={formData.agrees_to_quotes}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, agrees_to_quotes: checked }))
                    }
                    className="mt-1"
                  />
                  <label htmlFor="agrees_to_quotes" className="text-sm text-slate-700 cursor-pointer flex-1">
                    <span className="font-semibold">Connect me with top-rated roofers for free quotes</span>
                    <p className="text-slate-600 mt-1">
                      We'll share your project with 3 verified contractors. You can choose who to work with.
                    </p>
                  </label>
                </div>
              </div>

              {/* Privacy Note */}
              <div className="flex gap-2 text-xs text-slate-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  We respect your privacy.{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    See our privacy policy
                  </a>
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Estimate...
                  </>
                ) : (
                  "Show My Complete Estimate"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}