import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, MapPin, Phone, Mail, Trash2 } from "lucide-react";

export default function AppointmentsGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await base44.entities.Appointment.list('-created_date', 500);
      setAppointments(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await base44.entities.Appointment.update(id, { status: newStatus });
      await loadData();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  }

  async function deleteAppointment(id) {
    if (!confirm('Delete this appointment?')) return;
    try {
      await base44.entities.Appointment.delete(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  const filteredAppointments = appointments.filter(a => 
    statusFilter === 'all' || a.status === statusFilter
  );

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Appointments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredAppointments.map(apt => (
          <Card key={apt.id} className="border-l-4 border-l-blue-600">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{apt.customer_name}</h3>
                  <p className="text-sm text-slate-600">{apt.property_address}</p>
                </div>
                <Select value={apt.status} onValueChange={(value) => updateStatus(apt.id, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {apt.appointment_date} at {apt.appointment_time}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {apt.customer_phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {apt.customer_email}
                </div>
              </div>

              <div className="flex gap-2">
                <a href={`tel:${apt.customer_phone}`} className="flex-1">
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </a>
                <Button size="sm" variant="outline" onClick={() => deleteAppointment(apt.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            No appointments found
          </CardContent>
        </Card>
      )}
    </div>
  );
}