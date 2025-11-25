import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";

export default function CrewsGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [crews, setCrews] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCrew, setEditingCrew] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [crewsData, usersData] = await Promise.all([
        base44.entities.Crew.list(),
        base44.entities.User.list()
      ]);
      
      setCrews(crewsData || []);
      setAllUsers(usersData || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      setLoading(false);
    }
  }

  async function deleteCrew(id) {
    if (!confirm('Delete this crew?')) return;
    try {
      await base44.entities.Crew.delete(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  async function handleSave(formData) {
    try {
      if (editingCrew) {
        await base44.entities.Crew.update(editingCrew.id, formData);
      } else {
        await base44.entities.Crew.create(formData);
      }
      
      await loadData();
      setShowAddModal(false);
      setEditingCrew(null);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Total Crews: {crews.length}</p>
        <Button onClick={() => setShowAddModal(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Crew
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crews.map(crew => {
          const crewLead = allUsers.find(u => u.email === crew.crew_lead_id);
          
          return (
            <Card key={crew.id} className="border-l-4 border-l-orange-600">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">{crew.crew_name}</h3>
                
                <div className="space-y-2 mb-4 text-sm">
                  <div>
                    <span className="text-slate-500">Crew Lead:</span>
                    <span className="ml-2 font-semibold">{crewLead?.full_name || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Members:</span>
                    <span className="ml-2 font-semibold">{crew.crew_member_ids?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Max Jobs:</span>
                    <span className="ml-2 font-semibold">{crew.max_concurrent_jobs || 1}</span>
                  </div>
                  <div>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      crew.availability_status === 'available' ? 'bg-green-100 text-green-700' :
                      crew.availability_status === 'busy' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {crew.availability_status || 'available'}
                    </span>
                  </div>
                </div>

                {crew.specialties && crew.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {crew.specialties.map((specialty, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingCrew(crew)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteCrew(crew.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {crews.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            No crews found
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingCrew) && (
        <CrewFormModal
          crew={editingCrew}
          allUsers={allUsers}
          onClose={() => {
            setShowAddModal(false);
            setEditingCrew(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function CrewFormModal({ crew, allUsers, onClose, onSave }) {
  const [formData, setFormData] = useState({
    crew_name: crew?.crew_name || '',
    crew_lead_id: crew?.crew_lead_id || '',
    crew_member_ids: crew?.crew_member_ids || [],
    max_concurrent_jobs: crew?.max_concurrent_jobs || 1,
    specialties: crew?.specialties || [],
    active: crew?.active !== false
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold mb-6">{crew ? 'Edit Crew' : 'Add New Crew'}</h3>
          
          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Crew Name</label>
              <Input
                value={formData.crew_name}
                onChange={(e) => setFormData({...formData, crew_name: e.target.value})}
                placeholder="e.g., Crew Alpha"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Crew Lead</label>
              <select
                value={formData.crew_lead_id}
                onChange={(e) => setFormData({...formData, crew_lead_id: e.target.value})}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
                required
              >
                <option value="">Select crew lead...</option>
                {allUsers.filter(u => u.aroof_role === 'crew_lead' || u.role === 'admin').map(u => (
                  <option key={u.email} value={u.email}>{u.full_name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Max Concurrent Jobs</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.max_concurrent_jobs}
                onChange={(e) => setFormData({...formData, max_concurrent_jobs: parseInt(e.target.value)})}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                {crew ? 'Update' : 'Create'} Crew
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}