import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { toast } from "sonner";

export default function CommunicationLogger({ lead, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: 'call',
    content: '',
    duration: '',
    outcome: '',
    next_followup: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const user = await base44.auth.me();

      // 1. Create Activity Log
      await base44.entities.ActivityLog.create({
        type: formData.type,
        content: formData.content,
        user_id: user.id,
        user_name: user.full_name || user.email,
        lead_id: lead.id,
        company_id: user.company_id,
        next_followup_date: formData.next_followup || null,
        outcome: formData.outcome || null,
        duration: formData.duration ? parseInt(formData.duration) : 0,
        timestamp: new Date().toISOString()
      });

      // 2. Auto-Update Lead Status based on outcome
      if (formData.outcome === 'interested') {
        await base44.entities.Measurement.update(lead.id, { 
          lead_status: 'contacted' 
        });
      }

      toast.success('Activity logged successfully!');
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (err) {
      toast.error('Failed to log activity: ' + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Log Activity</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Activity Type *</label>
            <select 
              required
              className="w-full p-2 border rounded-lg"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="call">📞 Phone Call</option>
              <option value="email">📧 Email</option>
              <option value="meeting">🤝 Meeting</option>
              <option value="note">📝 Note</option>
            </select>
          </div>

          {(formData.type === 'call' || formData.type === 'meeting') && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Duration (minutes)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-lg" 
                value={formData.duration}
                placeholder="e.g., 15"
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notes *</label>
            <textarea 
              required
              className="w-full p-2 border rounded-lg" 
              rows="4"
              placeholder="What happened during this interaction?"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Outcome</label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={formData.outcome}
              onChange={e => setFormData({...formData, outcome: e.target.value})}
            >
              <option value="">Select outcome...</option>
              <option value="interested">✅ Interested</option>
              <option value="needs_time">⏰ Needs Time</option>
              <option value="voicemail">📞 Left Voicemail</option>
              <option value="no_answer">❌ No Answer</option>
              <option value="not_interested">🚫 Not Interested</option>
              <option value="scheduled">📅 Scheduled Appointment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Follow Up Date</label>
            <input 
              type="datetime-local" 
              className="w-full p-2 border rounded-lg"
              value={formData.next_followup}
              onChange={e => setFormData({...formData, next_followup: e.target.value})}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}