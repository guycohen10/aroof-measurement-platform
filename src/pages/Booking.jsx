import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, CheckCircle, Loader2, AlertCircle, ChevronLeft, ChevronRight, Ruler, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay, addMonths, subMonths, getDay } from "date-fns";

export default function Booking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [measurement, setMeasurement] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [specialRequests, setSpecialRequests] = useState("");
  const [sendReminders, setSendReminders] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [showConfirmation, setShowConfirmation] = useState(false);

  const BUSINESS_HOURS = {
    0: { open: true, start: "08:00", end: "19:00" },
    1: { open: true, start: "08:00", end: "19:00" },
    2: { open: true, start: "08:00", end: "19:00" },
    3: { open: true, start: "08:00", end: "19:00" },
    4: { open: true, start: "08:00", end: "19:00" },
    5: { open: true, start: "08:00", end: "14:00" },
    6: { open: false, start: null, end: null }
  };

  const MAX_APPOINTMENTS_PER_DAY = 20;

  useEffect(() => {
    loadBookingData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadBookingData = async () => {
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
        setCustomerInfo({
          name: m.customer_name || "",
          email: m.customer_email || "",
          phone: m.customer_phone || ""
        });
      } else {
        setError("Measurement not found");
      }
    } catch (err) {
      console.error("Error loading measurement:", err);
      setError("Failed to load measurement data");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = getDay(date);
      
      const businessHours = BUSINESS_HOURS[dayOfWeek];
      if (!businessHours.open) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return;
      }

      const appointments = await base44.entities.Appointment.filter({
        appointment_date: dateStr,
        status: { $in: ["pending", "confirmed"] }
      });

      const slots = generateTimeSlots(businessHours.start, businessHours.end);
      const bookedTimes = appointments.map(apt => apt.appointment_time);
      const slotsWithAvailability = slots.map(slot => ({
        time: slot,
        available: !bookedTimes.includes(slot)
      }));

      setAvailableSlots(slotsWithAvailability);
      setBookedSlots(prev => ({
        ...prev,
        [dateStr]: appointments.length
      }));
      
    } catch (err) {
      console.error("Error loading slots:", err);
      setError("Failed to load available time slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    let [startHour, startMin] = startTime.split(':').map(Number);
    let [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const hour12 = currentHour % 12 || 12;
      const ampm = currentHour < 12 ? 'AM' : 'PM';
      const timeStr = `${hour12}:${currentMin.toString().padStart(2, '0')} ${ampm}`;
      slots.push(timeStr);
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    
    return slots;
  };

  const isDateAvailable = (date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return false;
    
    const dayOfWeek = getDay(date);
    if (!BUSINESS_HOURS[dayOfWeek].open) return false;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const bookedCount = bookedSlots[dateStr] || 0;
    
    return bookedCount < MAX_APPOINTMENTS_PER_DAY;
  };

  const getDayAppointmentCount = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookedSlots[dateStr] || 0;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time");
      return;
    }
    
    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const confirmationNumber = `AROOF-${Date.now()}`;
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const area = measurement.total_sqft || 0;
      const lowEstimate = Math.round(area * 4 * 0.9);
      const highEstimate = Math.round(area * 4 * 1.1);

      const appointment = await base44.entities.Appointment.create({
        measurement_id: measurement.id,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        property_address: measurement.property_address,
        roof_area_sqft: measurement.total_sqft,
        estimated_cost_low: lowEstimate,
        estimated_cost_high: highEstimate,
        appointment_date: dateStr,
        appointment_time: selectedTime,
        appointment_duration: 60,
        special_requests: specialRequests,
        status: "confirmed",
        confirmation_number: confirmationNumber,
        send_reminders: sendReminders,
        terms_accepted: termsAccepted
      });

      const appointmentDateFormatted = format(selectedDate, 'EEEE, MMMM d, yyyy');
      
      await base44.integrations.Core.SendEmail({
        from_name: "Aroof Roofing",
        to: customerInfo.email,
        subject: "Appointment Confirmed - Free Roof Inspection | Aroof",
        body: `Hi ${customerInfo.name},

Your free roof inspection is confirmed! ✓

APPOINTMENT DETAILS:
📅 Date: ${appointmentDateFormatted}
🕐 Time: ${selectedTime}
⏱ Duration: Approximately 45-60 minutes
📍 Location: ${measurement.property_address}

WHAT TO EXPECT:
Our licensed roofing professional will:
✓ Conduct a thorough roof inspection
✓ Assess current condition and identify any issues
✓ Review your measurement report (${measurement.total_sqft?.toLocaleString()} sq ft)
✓ Provide detailed recommendations
✓ Answer all your questions
✓ Give you a final written quote

NEED TO RESCHEDULE?
Call us: (850) 238-9727
Email: contact@aroof.build

PREPARE FOR YOUR INSPECTION:
- No need to be home (we can inspect from outside)
- Please ensure clear access to all sides of your property
- Have any previous roof documents ready (optional)

Confirmation Number: ${confirmationNumber}

Questions? Reply to this email or call (850) 238-9727

Best regards,
The Aroof Team
6810 Windrock Rd, Dallas, TX 75252
Phone: (850) 238-9727
www.aroof.build`
      });

      await base44.integrations.Core.SendEmail({
        to: 'contact@aroof.build',
        subject: `🔔 NEW APPOINTMENT BOOKED - ${appointmentDateFormatted} at ${selectedTime}`,
        body: `New roof inspection appointment:

Customer: ${customerInfo.name}
Phone: ${customerInfo.phone}
Email: ${customerInfo.email}
Address: ${measurement.property_address}
Roof Size: ${measurement.total_sqft?.toLocaleString()} sq ft
Estimated Value: $${lowEstimate.toLocaleString()} - $${highEstimate.toLocaleString()}

Date: ${appointmentDateFormatted}
Time: ${selectedTime}

Special Requests: ${specialRequests || 'None'}

Confirmation #: ${confirmationNumber}

Action Required:
- Assign crew member
- Add to schedule
- Prepare inspection materials`
      });

      await base44.entities.Measurement.update(measurement.id, {
        clicked_booking: true,
        lead_status: 'booked'
      });

      navigate(createPageUrl(`BookingSuccess?appointmentid=${appointment.id}`));

    } catch (err) {
      console.error("Error creating appointment:", err);
      setError(`Failed to create appointment: ${err.message}. Please try again.`);
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const firstDayOfWeek = getDay(monthStart);
    const paddingDays = Array(firstDayOfWeek).fill(null);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-xl font-bold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-600">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {paddingDays.map((_, index) => (
            <div key={`pad-${index}`} className="aspect-square"></div>
          ))}
          {days.map((day) => {
            const available = isDateAvailable(day);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);
            const appointmentCount = getDayAppointmentCount(day);
            const limitedAvailability = appointmentCount >= 15;

            return (
              <button
                key={day.toISOString()}
                onClick={() => available && handleDateSelect(day)}
                disabled={!available}
                className={`
                  aspect-square p-2 rounded-lg text-sm font-medium transition-all relative
                  ${selected ? 'bg-green-600 text-white shadow-lg scale-105' : ''}
                  ${today && !selected ? 'ring-2 ring-blue-600' : ''}
                  ${available && !selected ? 'bg-white hover:bg-green-50 border-2 border-slate-200 hover:border-green-300' : ''}
                  ${!available ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}
                `}
              >
                <div>{format(day, 'd')}</div>
                {available && limitedAvailability && !selected && (
                  <div className="absolute bottom-0 left-0 right-0 text-[8px] text-orange-600 font-bold">
                    Limited
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const area = measurement?.total_sqft || 0;
  const lowEstimate = Math.round(area * 4 * 0.9);
  const highEstimate = Math.round(area * 4 * 1.1);

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="text-2xl text-center">Confirm Your Appointment</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Date & Time</p>
                    <p className="text-lg font-bold text-slate-900">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-md font-semibold text-blue-600">{selectedTime}</p>
                    <p className="text-sm text-slate-500">(approximately 45-60 minutes)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Location</p>
                    <p className="text-lg font-semibold text-slate-900">{measurement.property_address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <Ruler className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Roof Area</p>
                    <p className="text-lg font-semibold text-slate-900">{area.toLocaleString()} sq ft</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-slate-900 mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {customerInfo.name}</p>
                    <p><strong>Phone:</strong> {customerInfo.phone}</p>
                    <p><strong>Email:</strong> {customerInfo.email}</p>
                  </div>
                </div>

                {specialRequests && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-slate-900 mb-2">Special Requests</h4>
                    <p className="text-sm text-slate-700">{specialRequests}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  size="lg"
                  className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Appointment
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowConfirmation(false)}
                  disabled={submitting}
                >
                  Go Back to Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Schedule Your Free Inspection</h1>
          <p className="text-xl text-slate-600">Choose a convenient date and time for your roof inspection</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b">
                <CardTitle className="text-xl">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Address</p>
                    <p className="font-semibold text-slate-900">{measurement?.property_address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Ruler className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Roof Area</p>
                    <p className="font-semibold text-slate-900">{area.toLocaleString()} sq ft</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Estimated Cost</p>
                    <p className="font-semibold text-green-600">
                      ${lowEstimate.toLocaleString()} - ${highEstimate.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="border-b bg-green-100/50">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Free Roof Inspection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-slate-600 mb-4">45-60 minutes comprehensive inspection</p>
                <h4 className="font-bold text-slate-900 mb-3">What to Expect:</h4>
                <ul className="space-y-2">
                  {[
                    "Thorough roof inspection",
                    "Condition assessment",
                    "Detailed recommendations",
                    "Final written quote",
                    "No obligation"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {selectedDate && selectedTime && (
              <Card className="shadow-lg border-2 border-blue-200">
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="text-lg">Selected Appointment</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      {format(selectedDate, 'EEEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">{selectedTime}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <CardTitle className="text-xl">Select Date</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {renderCalendar()}
                <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border-2 border-slate-200 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-100 rounded"></div>
                    <span>Unavailable</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedDate && (
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
                  <CardTitle className="text-xl">Select Time</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-slate-600">Loading available times...</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">No appointments available on this date</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-700 mb-3">Morning (8 AM - 12 PM)</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots
                            .filter(slot => slot.time.includes('AM') && !slot.time.startsWith('12'))
                            .map((slot, index) => (
                              <Button
                                key={index}
                                variant={selectedTime === slot.time ? "default" : "outline"}
                                className={`h-12 ${
                                  selectedTime === slot.time
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : slot.available
                                    ? 'hover:bg-green-50 hover:border-green-300'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                                onClick={() => slot.available && handleTimeSelect(slot.time)}
                                disabled={!slot.available}
                              >
                                {slot.time}
                              </Button>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-700 mb-3">Afternoon (12 PM - 7 PM)</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots
                            .filter(slot => slot.time.includes('PM') || slot.time.startsWith('12'))
                            .map((slot, index) => (
                              <Button
                                key={index}
                                variant={selectedTime === slot.time ? "default" : "outline"}
                                className={`h-12 ${
                                  selectedTime === slot.time
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : slot.available
                                    ? 'hover:bg-green-50 hover:border-green-300'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                                onClick={() => slot.available && handleTimeSelect(slot.time)}
                                disabled={!slot.available}
                              >
                                {slot.time}
                              </Button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedTime && (
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                  <CardTitle className="text-xl">Special Requests (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    placeholder="Example: Leak above master bedroom, storm damage on west side, etc."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value.slice(0, 500))}
                    className="h-32 mb-2"
                  />
                  <p className="text-xs text-slate-500 text-right">
                    {specialRequests.length}/500 characters
                  </p>
                </CardContent>
              </Card>
            )}

            {selectedTime && (
              <Card className="shadow-xl border-2 border-green-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="reminders"
                      checked={sendReminders}
                      onCheckedChange={setSendReminders}
                    />
                    <label htmlFor="reminders" className="text-sm text-slate-700 cursor-pointer">
                      Send me appointment reminders (email + SMS)
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={setTermsAccepted}
                    />
                    <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                      I agree to Aroof's terms and conditions
                    </label>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-16 text-xl bg-green-600 hover:bg-green-700 shadow-lg"
                    onClick={handleConfirmBooking}
                    disabled={!termsAccepted}
                  >
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Review & Confirm Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}