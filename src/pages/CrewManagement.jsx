import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Plus, Users, Phone, Edit, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CrewManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [crews, setCrews] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCrew, setEditingCrew] = useState(null);
  const [formData, setFormData] = useState({
    crew_name: '',
    crew_lead_name: '',
    crew_lead_phone: '',
    crew_members: [''],
    specialties: []
  });

  useEffect(() => {
    loadCrews();
  }, []);

  const loadCrews = async () => {
    try {
      const user = await base44.auth.me();
      const allCrews = await base44.entities.Crew.list();
      const companyCrews = allCrews.filter(c => c.company_id === user.company_id);
      setCrews(companyCrews);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load crews:', err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const user = await base44.auth.me();
      const data = {
        ...formData,
        company_id: user.company_id,
        crew_members: formData.crew_members.filter(m => m.trim() !== '')
      };

      if (editingCrew) {
        await base44.entities.Crew.update(editingCrew.id, data);
      } else {
        await base44.entities.Crew.create(data);
      }

      setShowAddModal(false);
      setEditingCrew(null);
      setFormData({ crew_name: '', crew_lead_name: '', crew_lead_phone: '', crew_members: [''], specialties: [] });
      loadCrews();
    } catch (err) {
      alert('Failed to save crew: ' + err.message);
    }
  };

  const handleEdit = (crew) => {
    setEditingCrew(crew);
    setFormData({
      crew_name: crew.crew_name,
      crew_lead_name: crew.crew_lead_name,
      crew_lead_phone: crew.crew_lead_phone,
      crew_members: crew.crew_members || [''],
      specialties: crew.specialties || []
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Crew Management</h1>
                <p className="text-blue-200 text-sm">{crews.length} crews</p>
              </div>
            </div>
            <Link to={createPageUrl("RooferDashboard")}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-6">
          <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Crew
          </Button>
        </div>

        <div className="space-y-4">
          {crews.map(crew => (
            <Card key={crew.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-slate-900">{crew.crew_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        crew.status === 'available' ? 'bg-green-100 text-green-800' :
                        crew.status === 'on_job' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {crew.status === 'available' ? 'Available' :
                         crew.status === 'on_job' ? 'On Job' : 'Off Duty'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold">Lead:</span>
                        <span>{crew.crew_lead_name}</span>
                      </div>

                      {crew.crew_lead_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <span>{crew.crew_lead_phone}</span>
                        </div>
                      )}

                      {crew.crew_members && crew.crew_members.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Members:</span>
                          <span>{crew.crew_members.join(', ')}</span>
                        </div>
                      )}

                      {crew.specialties && crew.specialties.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Specialties:</span>
                          <div className="flex gap-2">
                            {crew.specialties.map((spec, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {crew.current_job_id && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="font-semibold text-blue-900">Current Job: #{crew.current_job_id}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(crew)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCrew ? 'Edit' : 'Add'} Crew</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Crew Name</label>
              <Input
                value={formData.crew_name}
                onChange={(e) => setFormData({...formData, crew_name: e.target.value})}
                placeholder="Crew A"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Crew Lead Name</label>
                <Input
                  value={formData.crew_lead_name}
                  onChange={(e) => setFormData({...formData, crew_lead_name: e.target.value})}
                  placeholder="Mike Jones"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Lead Phone</label>
                <Input
                  value={formData.crew_lead_phone}
                  onChange={(e) => setFormData({...formData, crew_lead_phone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Crew Members</label>
              {formData.crew_members.map((member, i) => (
                <Input
                  key={i}
                  value={member}
                  onChange={(e) => {
                    const newMembers = [...formData.crew_members];
                    newMembers[i] = e.target.value;
                    setFormData({...formData, crew_members: newMembers});
                  }}
                  placeholder="Member name"
                  className="mb-2"
                />
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFormData({...formData, crew_members: [...formData.crew_members, '']})}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Member
              </Button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Save Crew
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}