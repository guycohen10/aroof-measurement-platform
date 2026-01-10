import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X, User, Mail, Phone, MapPin, Ruler, Calendar, MessageSquare, FileText } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LeadDetailModal({ lead, isOpen, onClose, onUpdate }) {
  const [note, setNote] = useState("");
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(lead?.lead_status || 'new');
  const [priority, setPriority] = useState(lead?.priority || 'medium');

  useEffect(() => {
    if (lead && isOpen) {
      loadCommunications();
      setStatus(lead.lead_status || 'new');
      setPriority(lead.priority || 'medium');
    }
  }, [lead, isOpen]);

  const loadCommunications = async () => {
    try {
      const comms = await base44.entities.LeadCommunication.filter({
        measurement_id: lead.id
      });
      setCommunications(comms);
    } catch (err) {
      console.error('Failed to load communications:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;

    setLoading(true);
    try {
      await base44.entities.LeadCommunication.create({
        measurement_id: lead.id,
        company_id: lead.company_id,
        channel: 'note',
        direction: 'inbound',
        message: note,
        sent_via: 'manual'
      });
      
      setNote("");
      loadCommunications();
    } catch (err) {
      alert('Failed to save note: ' + err.message);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await base44.entities.Measurement.update(lead.id, {
        lead_status: status,
        priority: priority
      });
      onUpdate();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
    setLoading(false);
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Lead Details - {lead.property_address}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Customer & Property Info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold">{lead.customer_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{lead.customer_email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{lead.customer_phone || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Property Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{lead.property_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold">
                      {Math.round(lead.total_adjusted_sqft || lead.total_sqft || 0).toLocaleString()} sq ft
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Measured: {format(new Date(lead.created_date), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Type: {lead.measurement_type === 'quick_estimate' ? 'Quick Estimate' : 'Detailed Measurement'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleUpdate} disabled={loading} className="w-full">
              Save Changes
            </Button>
          </div>

          {/* Right Column - Notes & Communications */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Add Note
                </h3>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Type your note..."
                  rows={4}
                  className="mb-3"
                />
                <Button onClick={handleSaveNote} disabled={loading || !note.trim()} size="sm">
                  Save Note
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Communication History
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {communications.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No communications yet</p>
                  ) : (
                    communications.map((comm) => (
                      <div key={comm.id} className="border-l-2 border-slate-300 pl-3 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            comm.channel === 'sms' ? 'bg-green-100 text-green-800' :
                            comm.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                            comm.channel === 'call' ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {comm.channel}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(comm.created_date), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        {comm.subject && (
                          <div className="text-sm font-semibold text-slate-700 mb-1">
                            {comm.subject}
                          </div>
                        )}
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">
                          {comm.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button className="flex-1">
            View Full Measurement
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            Schedule Inspection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}