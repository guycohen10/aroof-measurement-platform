import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function LeaveReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const measurementId = searchParams.get('measurementid');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [measurement, setMeasurement] = useState(null);
  
  const [formData, setFormData] = useState({
    rating: 5,
    review_text: "",
    customer_name: "",
    customer_email: "",
    photo_url: ""
  });

  useEffect(() => {
    loadMeasurement();
  }, []);

  const loadMeasurement = async () => {
    try {
      if (!measurementId) {
        toast.error("No measurement found");
        navigate(createPageUrl("Homepage"));
        return;
      }

      const measurements = await base44.entities.Measurement.filter({ id: measurementId });
      if (measurements.length === 0) {
        toast.error("Measurement not found");
        navigate(createPageUrl("Homepage"));
        return;
      }

      const m = measurements[0];
      setMeasurement(m);
      setFormData({
        ...formData,
        customer_name: m.customer_name || "",
        customer_email: m.customer_email || ""
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load measurement");
      navigate(createPageUrl("Homepage"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.review_text.length < 50) {
      toast.error("Review must be at least 50 characters");
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.Review.create({
        measurement_id: measurementId,
        company_id: measurement.purchased_by || measurement.company_id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        rating: parseInt(formData.rating),
        review_text: formData.review_text,
        photo_url: formData.photo_url || null,
        review_date: new Date().toISOString(),
        status: "pending",
        source: "aroof"
      });

      setSubmitted(true);
      
      // Send confirmation email
      try {
        await base44.integrations.Core.SendEmail({
          to: formData.customer_email,
          subject: "Thank You for Your Review!",
          body: `
Hello ${formData.customer_name},

Thank you for taking the time to leave a review! We appreciate your feedback and will review it shortly.

Once approved, your review will be displayed on our website to help other homeowners make informed decisions.

Best regards,
The Aroof Team
          `
        });
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }

      setTimeout(() => {
        navigate(createPageUrl("Homepage"));
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-none">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
            <p className="text-slate-600 mb-6">
              Your review has been submitted successfully. It will appear on our website after approval.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Redirecting in a moment...
            </p>
            <Button onClick={() => navigate(createPageUrl("Homepage"))}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>

        <Card className="shadow-2xl border-none">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Leave a Review</CardTitle>
            <p className="text-blue-100 text-sm mt-1">
              Help other homeowners by sharing your experience
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-3 block">
                  How would you rate your experience? *
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {formData.rating === 5 && "Excellent - Highly recommend!"}
                  {formData.rating === 4 && "Very Good - Very satisfied"}
                  {formData.rating === 3 && "Good - Satisfied"}
                  {formData.rating === 2 && "Fair - Could be better"}
                  {formData.rating === 1 && "Poor - Not satisfied"}
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Your Name *
                </label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  placeholder="John Smith"
                  required
                  className="h-12 text-base"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                  placeholder="john@example.com"
                  required
                  className="h-12 text-base"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Your Review * (minimum 50 characters)
                </label>
                <Textarea
                  value={formData.review_text}
                  onChange={(e) => setFormData({...formData, review_text: e.target.value})}
                  placeholder="Tell us about your experience. What did we do well? Anything we could improve?"
                  required
                  className="h-32 text-base resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {formData.review_text.length} characters (minimum 50)
                </p>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                🔒 Your review will be displayed after approval. Thank you for helping us improve!
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}