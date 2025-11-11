import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, CheckCircle, Calendar, Download, Phone, Mail, MapPin, Clock, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function BookingSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAppointment();
  }, []);

  const loadAppointment = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get('appointmentid');

    if (!appointmentId) {
      navigate(createPageUrl("Homepage"));
      return;
    }

    try {
      const appointments = await base44.entities.Appointment.filter({ id: appointmentId });
      
      if (appointments.length > 0) {
        setAppointment(appointments[0]);
      } else {
        setError("Appointment not found");
      }
    } catch (err) {
      console.error("Error loading appointment:", err);
      setError("Failed to load appointment data");
    } finally {
      setLoading(false);
    }
  };

  const generateICS = () => {
    if (!appointment) return;

    const appointmentDate = parseISO(appointment.appointment_date);
    const [time, period] = appointment.appointment_time.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(hour, parseInt(minutes), 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + 1);

    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aroof//Roof Inspection//EN
BEGIN:VEVENT
UID:${appointment.confirmation_number}@aroof.build
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDateTime)}
DTEND:${formatICSDate(endDateTime)}
SUMMARY:Aroof Roof Inspection - ${appointment.property_address}
DESCRIPTION:Free roof inspection at ${appointment.property_address}\\n\\nRoof Area: ${appointment.roof_area_sqft?.toLocaleString()} sq ft\\nEstimated Cost: $${appointment.estimated_cost_low?.toLocaleString()} - $${appointment.estimated_cost_high?.toLocaleString()}\\n\\nConfirmation: ${appointment.confirmation_number}\\nPhone: (850) 238-9727
LOCATION:${appointment.property_address}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT24H
DESCRIPTION:Reminder: Roof inspection tomorrow
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
DESCRIPTION:Reminder: Roof inspection in 2 hours
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aroof_Inspection_${format(appointmentDate, 'yyyy-MM-dd')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadConfirmationPDF = () => {
    if (!appointment) return;

    const appointmentDate = parseISO(appointment.appointment_date);
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Appointment Confirmation - Aroof</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 48px; font-weight: bold; color: #2563eb; }
    .checkmark { font-size: 72px; color: #10b981; }
    .details { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .detail-row { margin: 15px 0; }
    .label { font-weight: bold; color: #64748b; }
    .value { color: #1e293b; font-size: 18px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Aroof</div>
    <div class="checkmark">✓</div>
    <h1>Appointment Confirmed</h1>
  </div>
  
  <div class="details">
    <div class="detail-row">
      <div class="label">Confirmation Number</div>
      <div class="value">${appointment.confirmation_number}</div>
    </div>
    <div class="detail-row">
      <div class="label">Date</div>
      <div class="value">${format(appointmentDate, 'EEEE, MMMM d, yyyy')}</div>
    </div>
    <div class="detail-row">
      <div class="label">Time</div>
      <div class="value">${appointment.appointment_time}</div>
    </div>
    <div class="detail-row">
      <div class="label">Location</div>
      <div class="value">${appointment.property_address}</div>
    </div>
    <div class="detail-row">
      <div class="label">Customer</div>
      <div class="value">${appointment.customer_name}</div>
    </div>
    <div class="detail-row">
      <div class="label">Phone</div>
      <div class="value">${appointment.customer_phone}</div>
    </div>
    <div class="detail-row">
      <div class="label">Email</div>
      <div class="value">${appointment.customer_email}</div>
    </div>
  </div>
  
  <div style="margin-top: 40px; text-align: center;">
    <p>For questions or to reschedule, contact us:</p>
    <p style="font-size: 20px; font-weight: bold; color: #2563eb;">
      (850) 238-9727<br>
      contact@aroof.build
    </p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aroof_Confirmation_${appointment.confirmation_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error || "Appointment not found"}</p>
            <Link to={createPageUrl("Homepage")}>
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appointmentDate = parseISO(appointment.appointment_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Header */}
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

      {/* Success Animation */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Appointment Confirmed! ✓
          </h1>
          <p className="text-2xl text-slate-600">
            We'll see you on {format(appointmentDate, 'MMMM d, yyyy')} at {appointment.appointment_time}
          </p>
        </div>

        {/* Confirmation Details */}
        <Card className="shadow-2xl mb-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <CardTitle className="text-2xl text-center">Your Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Confirmation Number */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-blue-600 mb-1">Confirmation Number</p>
              <p className="text-3xl font-bold text-blue-900">{appointment.confirmation_number}</p>
            </div>

            {/* Appointment Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Date</p>
                  <p className="text-lg font-bold text-slate-900">
                    {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Time</p>
                  <p className="text-lg font-bold text-slate-900">{appointment.appointment_time}</p>
                  <p className="text-sm text-slate-500">45-60 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg md:col-span-2">
                <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Location</p>
                  <p className="text-lg font-bold text-slate-900">{appointment.property_address}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-slate-900 mb-3">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Name</p>
                  <p className="text-slate-900">{appointment.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Phone</p>
                  <p className="text-slate-900">{appointment.customer_phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="text-slate-900">{appointment.customer_email}</p>
                </div>
              </div>
            </div>

            {appointment.special_requests && (
              <div className="border-t pt-4">
                <h3 className="font-bold text-slate-900 mb-2">Special Requests</h3>
                <p className="text-slate-700 bg-yellow-50 p-3 rounded">{appointment.special_requests}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button
            size="lg"
            className="h-16 bg-blue-600 hover:bg-blue-700"
            onClick={generateICS}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Add to Calendar
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-16"
            onClick={downloadConfirmationPDF}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Confirmation
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-16"
            asChild
          >
            <Link to={createPageUrl("Homepage")}>
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* What's Next */}
        <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-xl">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Mail, text: "You'll receive a confirmation email with all details" },
              { icon: Calendar, text: "We'll send you reminders 24 hours and 2 hours before" },
              { icon: Phone, text: "Our team will call to confirm 1 day before your appointment" },
              { icon: CheckCircle, text: "On the day, our licensed inspector will arrive on time" }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-slate-700 pt-2">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mt-8 bg-slate-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Need to Reschedule?</h3>
            <p className="text-slate-600 mb-4">Contact us anytime</p>
            <div className="space-y-2">
              <a href="tel:+18502389727" className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
                <Phone className="w-4 h-4" />
                (850) 238-9727
              </a>
              <a href="mailto:contact@aroof.build" className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
                <Mail className="w-4 h-4" />
                contact@aroof.build
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}