import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Edit, Mail, Phone } from "lucide-react";

export default function DispatchersGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [dispatchers, setDispatchers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const allUsers = await base44.entities.User.list();
      const dispatcherUsers = allUsers.filter(u => u.aroof_role === 'dispatcher');
      setDispatchers(dispatcherUsers);
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
          phone: formData.phone,
          aroof_role: 'dispatcher'
        });
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
        <p className="text-slate-600">Total Dispatchers: {dispatchers.length}</p>
        <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Dispatcher
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dispatchers.map(dispatcher => (
          <Card key={dispatcher.id}>
            <CardContent className="p-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                {(dispatcher.full_name || 'D')[0].toUpperCase()}
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">{dispatcher.full_name}</h3>
              
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  {dispatcher.email}
                </div>
                {dispatcher.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    {dispatcher.phone}
                  </div>
                )}
              </div>

              <Button size="sm" variant="outline" onClick={() => setEditingUser(dispatcher)} className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {dispatchers.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            No dispatchers found
          </CardContent>
        </Card>
      )}
    </div>
  );
}