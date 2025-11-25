import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, MapPin, Phone, Mail, Trash2, Edit, Plus } from "lucide-react";

export default function AppointmentsGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [crews, setCrews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [aptsData, measurementsData, crewsData] = await Promise.all([
        base44.entities.Appointment.list('-created_date', 500),
        base44.entities.Measurement.list('-created_date', 500),
        base44.entities.Crew.list()
      ]);
      
      setAppointments(aptsData || []);
      setMeasurements(measurementsData || []);
      setCrews(crewsData || []);
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

  async function assignCrew(id, crewId) {
    try {
      await base44.entities.Appointment.update(id, { assigned_crew_id: crewId });
      await loadData();
    } catch (err) {
      alert('Failed to assign: ' + err.message);
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                viewMode === 'list' ? 'bg-white shadow' : 'text-slate-600'
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                viewMode === 'calendar' ? 'bg-white shadow' : 'text-slate-600'
              }`}
            >
              📅 Calendar
            </button>
          </div>
        </div>

        <Button onClick={() => { setEditingApt(null); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Assigned Crew</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt, idx) => (
                    <tr key={apt.id} className={`border-b hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-4 py-4">
                        <div className="font-semibold">{apt.appointment_date}</div>
                        <div className="text-xs text-slate-600">{apt.appointment_time}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold">{apt.customer_name}</div>
                        <div className="text-xs text-slate-600">{apt.customer_phone}</div>
                      </td>
                      <td className="px-4 py-4 text-sm max-w-xs truncate">
                        {apt.property_address}
                      </td>
                      <td className="px-4 py-4">
                        <Select 
                          value={apt.assigned_crew_id || ''} 
                          onValueChange={(value) => assignCrew(apt.id, value)}
                        >
                          <SelectTrigger className="w-32 text-xs">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>Unassigned</SelectItem>
                            {crews.map(crew => (
                              <SelectItem key={crew.id} value={crew.id}>{crew.crew_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-4">
                        <Select 
                          value={apt.status} 
                          onValueChange={(value) => updateStatus(apt.id, value)}
                        >
                          <SelectTrigger className="w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingApt(apt); setShowModal(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteAppointment(apt.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAppointments.length === 0 && (
                <div className="py-20 text-center text-slate-400">No appointments found</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardContent className="p-6">
            <div className="py-20 text-center text-slate-400">
              📅 Calendar view - Integrate with a calendar library like react-big-calendar
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <AppointmentModal
          appointment={editingApt}
          measurements={measurements}
          crews={crews}
          onClose={() => { setShowModal(false); setEditingApt(null); }}
          onSave={loadData}
        />
      )}
    </div>
  );
}

function AppointmentModal({ appointment, measurements, crews, onClose, onSave }) {
  const [formData, setFormData] = useState(appointment || {
    measurement_id: '',
    appointment_date: '',
    appointment_time: '',
    assigned_crew_id: '',
    special_requests: ''
  });

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      if (appointment) {
        await base44.entities.Appointment.update(appointment.id, formData);
      } else {
        const selectedMeasurement = measurements.find(m => m.id === formData.measurement_id);
        await base44.entities.Appointment.create({
          ...formData,
          customer_name: selectedMeasurement?.customer_name,
          customer_email: selectedMeasurement?.customer_email,
          customer_phone: selectedMeasurement?.customer_phone,
          property_address: selectedMeasurement?.property_address,
          confirmation_number: `AROOF-${Date.now()}`
        });
      }
      
      await onSave();
      onClose();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold mb-6">{appointment ? 'Edit' : 'Schedule'} Appointment</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!appointment && (
              <div>
                <label className="block text-sm font-semibold mb-2">Select Lead</label>
                <select
                  required
                  value={formData.measurement_id}
                  onChange={(e) => setFormData({...formData, measurement_id: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
                >
                  <option value="">Choose a lead...</option>
                  {measurements.filter(m => m.customer_name).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.customer_name} - {m.property_address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Date</label>
                <Input
                  type="date"
                  required
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Time</label>
                <Input
                  type="time"
                  required
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Assign Crew</label>
              <select
                value={formData.assigned_crew_id || ''}
                onChange={(e) => setFormData({...formData, assigned_crew_id: e.target.value})}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
              >
                <option value="">Unassigned</option>
                {crews.map(crew => (
                  <option key={crew.id} value={crew.id}>{crew.crew_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Special Requests</label>
              <textarea
                value={formData.special_requests || ''}
                onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
                rows="3"
                placeholder="Any special instructions..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {appointment ? 'Update' : 'Schedule'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}