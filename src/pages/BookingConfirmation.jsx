import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, CheckCircle, Calendar, Clock, MapPin, Phone, Mail, Download, Loader2 } from "lucide-react";
import { format, parse } from "date-fns";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
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
        setError("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [navigate]);

  const generateICS = () => {
    if (!appointment) return;

    const date = parse(appointment.appointment_date, 'yyyy-MM-dd', new Date());
    const startDate = format(date, 'yyyyMMdd');
    const startTime = appointment.appointment_time.replace(/[:\s]/g, '').replace('AM', '').replace('PM', '');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aroof//Roof Inspection//EN
BEGIN:VEVENT
UID:${appointment.id}@aroof.build
DTSTAMP:${format(new Date(), 'yyyyMMdd')}T${format(new Date(), 'HHmmss')}Z
DTSTART:${startDate}T${startTime}00
DURATION:PT${appointment.duration_minutes}M
SUMMARY:Aroof Roof Inspection
DESCRIPTION:Free roof inspection at ${appointment.property_address}
LOCATION:${appointment.property_address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aroof-inspection.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-slate-900 mb-4">{error || "Appointment not found"}</p>
            <Link to={createPageUrl("Homepage")}>
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appointmentDate = parse(appointment.appointment_date, 'yyyy-MM-dd', new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
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

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-8 mb-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Appointment Confirmed!</h1>
          <p className="text-xl opacity-90">Your free roof inspection is scheduled</p>
        </div>

        {/* Appointment Details */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
            <CardTitle className="text-2xl">Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Date</p>
                  <p className="text-lg font-bold text-slate-900">
                    {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Time</p>
                  <p className="text-lg font-bold text-slate-900">{appointment.appointment_time}</p>
                  <p className="text-sm text-slate-500">{appointment.duration_minutes} minutes</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Location</p>
                <p className="text-lg font-bold text-slate-900">{appointment.property_address}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-bold text-blue-900 mb-2">Service Type</p>
              <p className="text-base text-blue-800">
                {appointment.service_type === 'free_inspection' 
                  ? 'Free Roof Inspection - Comprehensive Assessment' 
                  : 'Quick Assessment'}
              </p>
            </div>

            {appointment.special_notes && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Your Notes</p>
                <p className="text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {appointment.special_notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What to Expect */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
            <CardTitle className="text-xl">What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <p className="font-bold text-slate-900">Arrival</p>
                <p className="text-sm text-slate-600">Our certified inspector will arrive on time in a marked Aroof vehicle</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <p className="font-bold text-slate-900">Inspection</p>
                <p className="text-sm text-slate-600">Thorough roof examination including photos and measurements</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <p className="font-bold text-slate-900">Discussion</p>
                <p className="text-sm text-slate-600">We'll review findings and answer all your questions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <p className="font-bold text-slate-900">Report</p>
                <p className="text-sm text-slate-600">Receive a detailed written report with recommendations and pricing</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-bold text-yellow-900 mb-1">Please Prepare:</p>
              <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                <li>Ensure driveway access for our truck</li>
                <li>We'll need exterior roof access (no interior needed)</li>
                <li>Any questions you'd like answered</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button
            size="lg"
            variant="outline"
            className="h-14 text-lg border-2"
            onClick={generateICS}
          >
            <Download className="w-5 h-5 mr-2" />
            Add to Calendar
          </Button>

          <Button
            size="lg"
            className="h-14 text-lg bg-blue-600 hover:bg-blue-700"
            asChild
          >
            <Link to={createPageUrl("Homepage")}>
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>

        {/* Contact Card */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">Need to Make Changes?</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-slate-700">
                <Phone className="w-4 h-4" />
                <span className="font-medium">Call us: (214) 555-0123</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-700">
                <Mail className="w-4 h-4" />
                <span className="font-medium">Email: appointments@aroof.build</span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              We'll also send you a confirmation email with these details
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}