import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Edit3, Plus, Cloud } from "lucide-react";

export default function StormDataGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState([]);
  const [editingZone, setEditingZone] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const allZones = await base44.entities.HailZone.list('-created_date');
      setZones(allZones);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load zones:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this storm zone?')) return;
    
    try {
      await base44.entities.HailZone.delete(id);
      loadZones();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Storm Data Management</h2>
          <p className="text-slate-600">View and manage all hail zone records</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Zone
        </Button>
      </div>

      {zones.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Cloud className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 text-lg mb-2">No Storm Data</p>
            <p className="text-slate-500 text-sm">Add storm events to track high-value leads</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {zones.map((zone) => (
            <Card key={zone.id} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold">{zone.zip_code}</span>
                      <span className="text-lg text-slate-600">{zone.city}, {zone.state}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        zone.risk_score >= 80 ? 'bg-red-600 text-white' :
                        zone.risk_score >= 60 ? 'bg-orange-600 text-white' :
                        zone.risk_score >= 40 ? 'bg-yellow-600 text-white' :
                        'bg-green-600 text-white'
                      }`}>
                        Risk: {zone.risk_score}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Last Storm</p>
                        <p className="font-semibold">{new Date(zone.last_hail_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Hail Size</p>
                        <p className="font-semibold">{zone.hail_size_inches}"</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Events (30d)</p>
                        <p className="font-semibold">{zone.events_last_30_days}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Events (Year)</p>
                        <p className="font-semibold">{zone.events_last_year}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingZone(zone)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(zone.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}