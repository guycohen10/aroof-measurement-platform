import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Edit, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EstimatorsGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const allUsers = await base44.entities.User.list();
      const estimators = allUsers.filter(u => u.aroof_role === 'estimator');
      setUsers(estimators);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      setLoading(false);
    }
  }

  async function handleSave(formData) {
    try {
      if (editingUser) {
        await base44.entities.User.update(editingUser.id, {
          full_name: formData.name,
          aroof_role: 'estimator',
          phone: formData.phone,
          active: formData.active
        });
      } else {
        // Note: Can't create users directly - they must be invited
        alert('To add a new estimator, use the User Invite feature in Settings tab');
        return;
      }
      
      await loadData();
      setShowAddModal(false);
      setEditingUser(null);
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
        <div>
          <p className="text-slate-600">Total Estimators: {users.length}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Estimator
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {(user.full_name || 'E')[0].toUpperCase()}
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">{user.full_name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingUser(user)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            No estimators found. Add one to get started.
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingUser) && (
        <EstimatorFormModal
          user={editingUser}
          onClose={() => {
            setShowAddModal(false);
            setEditingUser(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function EstimatorFormModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    active: user?.active !== false
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold mb-6">{user ? 'Edit Estimator' : 'Add Estimator'}</h3>
          
          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                disabled={!!user}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {user ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}