import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Home, ArrowLeft, Calendar, Clock, CheckCircle, Loader2, MapPin, User, Mail, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, addDays, isSunday, startOfDay } from "date-fns";

export default function Booking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [measurement, setMeasurement] = useState(null);
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [serviceType, setServiceType] = useState("free_inspection");
  const [specialNotes, setSpecialNotes] = useState("");

  // Available dates and times
  const [availableDates, setAvailableDates] = useState([]);
  const availableTimes = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  useEffect(() => {
    const loadMeasurement = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const measurementId = urlParams.get('measurementid');

      if (!measurementId) {
        navigate(createPageUrl("Homepage"));
        return;
      }

      try {
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        
        if (measurements.length > 0) {
          const m = measurements[0];
          setMeasurement(m);
          
          // Pre-fill customer data
          setCustomerName(m.customer_name || "");
          setCustomerEmail(m.customer_email || "");
          setCustomerPhone(m.customer_phone || "");
          
          // Generate available dates (next 30 days, excluding Sundays)
          const dates = [];
          for (let i = 1; i <= 30; i++) {
            const date = addDays(new Date(), i);
            if (!isSunday(date)) {
              dates.push(date);
            }
          }
          setAvailableDates(dates);
        } else {
          navigate(createPageUrl("Homepage"));
        }
      } catch (err) {
        console.error("Error loading measurement:", err);
        setError("Failed to load measurement data");
      } finally {
        setLoading(false);
      }
    };

    loadMeasurement();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedDate) {
      setError("Please select an appointment date");
      return;
    }

    if (!selectedTime) {
      setError("Please select an appointment time");
      return;
    }

    setSubmitting(true);

    try {
      // Calculate estimated cost range
      const area = measurement.total_sqft || 0;
      const lowEstimate = Math.round(area * 4 * 0.9);
      const highEstimate = Math.round(area * 4 * 1.1);
      const costRange = `$${lowEstimate.toLocaleString()} - $${highEstimate.toLocaleString()}`;

      // Create appointment
      const appointment = await base44.entities.Appointment.create({
        measurement_id: measurement.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        property_address: measurement.property_address,
        roof_area_sqft: measurement.total_sqft,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        service_type: serviceType,
        duration_minutes: serviceType === 'free_inspection' ? 90 : 30,
        special_notes: specialNotes,
        status: 'pending',
        estimated_cost_range: costRange
      });

      // Send confirmation email to customer
      try {
        await base44.integrations.Core.SendEmail({
          to: customerEmail,
          subject: `Your Aroof Roof Inspection - ${format(selectedDate, 'MMMM d, yyyy')}`,
          body: `
Hi ${customerName},

Your roof inspection has been scheduled!

APPOINTMENT DETAILS:
Date: ${format(selectedDate, 'EEEE, MMMM d, yyyy')}
Time: ${selectedTime}
Address: ${measurement.property_address}
Service: ${serviceType === 'free_inspection' ? 'Free Roof Inspection (90 minutes)' : 'Quick Assessment (30 minutes)'}

WHAT TO EXPECT:
• Our certified inspector will arrive on time
• We'll perform a thorough roof inspection
• You'll receive a detailed assessment report
• We'll answer all your questions
• No obligation - completely free inspection

PREPARING FOR YOUR INSPECTION:
• Please ensure driveway access for our truck
• We'll need to access your roof (exterior only)
• Feel free to ask any questions during the visit

ESTIMATED PROJECT COST:
Based on your roof area of ${measurement.total_sqft.toLocaleString()} sq ft, your project is estimated at ${costRange}.

NEED TO RESCHEDULE?
Call us at (214) 555-0123 or reply to this email.

Thank you for choosing Aroof!

Best regards,
The Aroof Team
(214) 555-0123
info@aroof.build
          `
        });

        // Send notification to Aroof team
        await base44.integrations.Core.SendEmail({
          to: 'appointments@aroof.build',
          subject: `NEW APPOINTMENT: ${customerName} - ${format(selectedDate, 'MM/dd/yyyy')}`,
          body: `
NEW ROOF INSPECTION APPOINTMENT

CUSTOMER DETAILS:
Name: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}

APPOINTMENT:
Date: ${format(selectedDate, 'EEEE, MMMM d, yyyy')}
Time: ${selectedTime}
Duration: ${serviceType === 'free_inspection' ? '90 minutes' : '30 minutes'}

PROPERTY:
Address: ${measurement.property_address}
Roof Area: ${measurement.total_sqft.toLocaleString()} sq ft
Estimated Cost: ${costRange}

SPECIAL NOTES:
${specialNotes || 'None'}

MEASUREMENT REPORT:
View report: ${window.location.origin}${createPageUrl(`Results?measurementid=${measurement.id}`)}

ACTION REQUIRED:
Please confirm this appointment in the admin dashboard.
          `
        });
      } catch (emailErr) {
        console.error("Error sending emails:", emailErr);
        // Don't fail the booking if email fails
      }

      // Update measurement to track booking
      await base44.entities.Measurement.update(measurement.id, {
        clicked_booking: true,
        lead_status: 'booked'
      });

      // Redirect to confirmation page
      navigate(createPageUrl(`BookingConfirmation?appointmentid=${appointment.id}`));

    } catch (err) {
      console.error("Error creating appointment:", err);
      setError(`Failed to create appointment: ${err.message}. Please try again.`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (error && !measurement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const area = measurement?.total_sqft || 0;
  const lowEstimate = Math.round(area * 4 * 0.9);
  const highEstimate = Math.round(area * 4 * 1.1);

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
            <Link to={createPageUrl(`Results?measurementid=${measurement?.id}`)}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Schedule Your Free Inspection</h1>
          <p className="text-xl text-slate-600">Choose a date and time that works for you</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Booking Form - 3 columns */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <CardTitle className="text-2xl">Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Contact Information</h3>
                    
                    <div>
                      <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="mt-2"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="mt-2"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="mt-2"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <Label className="text-base font-bold mb-3 block">
                      Select Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableDates.slice(0, 12).map((date, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? "default" : "outline"}
                          className="h-auto py-3 flex flex-col"
                          onClick={() => setSelectedDate(date)}
                          disabled={submitting}
                        >
                          <span className="text-xs">{format(date, 'EEE')}</span>
                          <span className="text-lg font-bold">{format(date, 'd')}</span>
                          <span className="text-xs">{format(date, 'MMM')}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <Label className="text-base font-bold mb-3 block">
                        Select Time <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-4 gap-2">
                        {availableTimes.map((time, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant={selectedTime === time ? "default" : "outline"}
                            className="h-12"
                            onClick={() => setSelectedTime(time)}
                            disabled={submitting}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Type */}
                  <div>
                    <Label className="text-base font-bold mb-3 block">Service Type</Label>
                    <div className="space-y-3">
                      <Card 
                        className={`cursor-pointer border-2 ${serviceType === 'free_inspection' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}
                        onClick={() => setServiceType('free_inspection')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="font-bold text-slate-900">Free Roof Inspection (Recommended)</p>
                              <p className="text-sm text-slate-600 mt-1">90 minutes - Comprehensive roof assessment</p>
                            </div>
                            {serviceType === 'free_inspection' && (
                              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card 
                        className={`cursor-pointer border-2 ${serviceType === 'quick_assessment' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}
                        onClick={() => setServiceType('quick_assessment')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="font-bold text-slate-900">Quick Assessment</p>
                              <p className="text-sm text-slate-600 mt-1">30 minutes - Basic roof evaluation</p>
                            </div>
                            {serviceType === 'quick_assessment' && (
                              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Special Notes */}
                  <div>
                    <Label htmlFor="notes">Special Requests or Concerns</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific areas you'd like us to look at? Access instructions?"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      className="mt-2 h-24"
                      disabled={submitting}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-16 text-xl bg-green-600 hover:bg-green-700"
                    disabled={submitting || !selectedDate || !selectedTime}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Booking Appointment...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 mr-3" />
                        Confirm Free Inspection
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl sticky top-24">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                <CardTitle className="text-xl">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Property Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-base font-semibold text-slate-900">{measurement?.property_address}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Roof Area</p>
                  <p className="text-base font-semibold text-slate-900">{area.toLocaleString()} sq ft</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Estimated Project Cost</p>
                  <p className="text-lg font-bold text-green-600">
                    ${lowEstimate.toLocaleString()} - ${highEstimate.toLocaleString()}
                  </p>
                </div>

                {selectedDate && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-slate-600 mb-2">Selected Appointment</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-900">
                          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </span>
                      </div>
                      {selectedTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-900">{selectedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-600 mb-3">What's Included:</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">Thorough roof inspection by certified professional</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">Detailed assessment report with photos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">Honest recommendations and pricing</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">No obligation - completely free</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-green-900 mb-1">100% Free Inspection</p>
                  <p className="text-xs text-green-800">No hidden fees. No pressure. Just honest advice from roofing experts.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}