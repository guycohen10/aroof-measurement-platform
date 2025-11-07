import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Phone, Star, CheckCircle, DollarSign, Mail, Share2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CTASection({ measurement, user }) {
  const [bookingClicked, setBookingClicked] = useState(measurement?.clicked_booking || false);
  const [quoteRequested, setQuoteRequested] = useState(measurement?.requested_quote || false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [actionType, setActionType] = useState("");

  const handleScheduleInspection = async () => {
    setBookingClicked(true);
    setActionType("inspection");
    setShowSuccessMessage(true);

    try {
      await base44.entities.Measurement.update(measurement.id, {
        clicked_booking: true,
        lead_status: "contacted"
      });
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }

    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const handleRequestQuote = async () => {
    setQuoteRequested(true);
    setActionType("quote");
    setShowSuccessMessage(true);

    try {
      await base44.entities.Measurement.update(measurement.id, {
        requested_quote: true,
        lead_status: "quoted"
      });
    } catch (err) {
      console.error("Failed to update quote status:", err);
    }

    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const handleEmailResults = async () => {
    setActionType("email");
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleShareLink = async () => {
    try {
      await base44.entities.Measurement.update(measurement.id, {
        shared_results: true
      });
      
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setActionType("share");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccessMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {actionType === "inspection" && "Great! An Aroof specialist will contact you within 24 hours to schedule your free inspection."}
            {actionType === "quote" && "Your quote request has been received! We'll send you a detailed proposal within 24 hours."}
            {actionType === "email" && "Results sent to your email!"}
            {actionType === "share" && "Link copied to clipboard!"}
          </AlertDescription>
        </Alert>
      )}

      {/* Main CTA Card */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-900 to-blue-700 text-white overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Ready to Get Your New Roof?
            </h2>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8">
              Aroof - Licensed & Insured Roofing Experts
            </p>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Button
                onClick={handleScheduleInspection}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white h-auto py-4 px-6 text-lg font-bold"
              >
                <Calendar className="w-6 h-6 mr-2" />
                <div className="text-left">
                  <div>Schedule Free</div>
                  <div>Inspection</div>
                </div>
              </Button>

              <Button
                onClick={handleRequestQuote}
                size="lg"
                variant="outline"
                className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-blue-900 h-auto py-4 px-6 text-lg font-bold"
              >
                <FileText className="w-6 h-6 mr-2" />
                <div className="text-left">
                  <div>Request Detailed</div>
                  <div>Quote</div>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-blue-900 h-auto py-4 px-6 text-lg font-bold"
                asChild
              >
                <a href="tel:5551234567">
                  <Phone className="w-6 h-6 mr-2" />
                  <div className="text-left">
                    <div>Call Now</div>
                    <div className="text-base">(555) 123-4567</div>
                  </div>
                </a>
              </Button>
            </div>

            {/* Additional Actions */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button
                onClick={handleEmailResults}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Results
              </Button>
              <Button
                onClick={handleShareLink}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </div>

            {/* Trust Elements */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-blue-600">
              <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-blue-100 text-sm">1,000+ 5-Star Reviews</p>
              </div>

              <div className="flex flex-col items-center">
                <CheckCircle className="w-10 h-10 mb-2 text-green-400" />
                <p className="text-blue-100 text-sm">Free Inspection Included</p>
              </div>

              <div className="flex flex-col items-center">
                <DollarSign className="w-10 h-10 mb-2 text-green-400" />
                <p className="text-blue-100 text-sm">Financing Options Available</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects Gallery */}
      <Card className="border-none shadow-xl">
        <CardContent className="p-6 lg:p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Recent Aroof Projects
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center"
              >
                <p className="text-slate-500">Project Photo {i}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-600 mt-6">
            Join thousands of satisfied homeowners who trust Aroof for their roofing needs
          </p>
        </CardContent>
      </Card>

      {/* Contact Info Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Have Questions?</h4>
              <p className="text-slate-600">
                Our roofing experts are here to help. Contact: <strong>{user?.email}</strong>
              </p>
            </div>
            <Button size="lg" className="bg-blue-900 hover:bg-blue-800 whitespace-nowrap">
              <Phone className="w-4 h-4 mr-2" />
              Call (555) 123-4567
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}