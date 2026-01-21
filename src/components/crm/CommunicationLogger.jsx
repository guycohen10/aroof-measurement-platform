import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";

export default function CommunicationLogger({ lead, job, onClose, onSaved }) {
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

      // Create the Activity Log
      await base44.entities.ActivityLog.create({
        type: formData.type,
        content: formData.content,
        user_id: user.id,
        user_name: user.full_name,
        lead_id: lead?.id || null,
        company_id: user.company_id,
        timestamp: new Date().toISOString(),
        next_followup_date: formData.next_followup || null,
        outcome: formData.outcome,
        duration: formData.duration ? parseInt(formData.duration) : null
      });

      // Auto-update lead status if interested
      if (lead && formData.outcome === 'interested') {
        await base44.entities.Lead.update(lead.id, { lead_status: 'Contacted' });
      }

      alert('Logged Successfully!');
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Log Communication</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold">Type</label>
              <select className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold">Outcome</label>
              <select className="w-full p-2 border rounded" value={formData.outcome} onChange={e => setFormData({...formData, outcome: e.target.value})}>
                <option value="">None</option>
                <option value="interested">Interested</option>
                <option value="voicemail">Left Voicemail</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
          
          {formData.type === 'call' && (
            <div>
              <label className="block text-sm font-bold">Duration (mins)</label>
              <input type="number" className="w-full p-2 border rounded" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold">Notes *</label>
            <textarea required className="w-full p-2 border rounded" rows="3" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold">Follow Up Date</label>
            <input type="datetime-local" className="w-full p-2 border rounded" value={formData.next_followup} onChange={e => setFormData({...formData, next_followup: e.target.value})} />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold">Cancel</button>
            <button disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
              {saving ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}