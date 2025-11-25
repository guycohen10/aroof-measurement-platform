import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2, Save } from "lucide-react";

export default function PricingGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await base44.entities.PricingConfig.list();
      setConfigs(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      setLoading(false);
    }
  }

  async function handleUpdate(id, updates) {
    try {
      await base44.entities.PricingConfig.update(id, updates);
      await loadData();
      setEditingId(null);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this pricing config?')) return;
    try {
      await base44.entities.PricingConfig.delete(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  async function handleAdd(formData) {
    try {
      await base44.entities.PricingConfig.create(formData);
      await loadData();
      setShowAddModal(false);
    } catch (err) {
      alert('Failed to add: ' + err.message);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Manage pricing for different materials</p>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Pricing
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {configs.map(config => (
          <Card key={config.id} className={!config.is_active ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{config.material_type}</span>
                {!config.is_active && (
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Inactive</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingId === config.id ? (
                <PricingEditForm config={config} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">Price per sq ft</div>
                      <div className="font-bold text-lg">${config.price_per_sqft}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Labor rate</div>
                      <div className="font-bold text-lg">${config.labor_rate}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Warranty cost</div>
                      <div className="font-bold">${config.warranty_cost || 0}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Additional fees</div>
                      <div className="font-bold">${config.additional_fees || 0}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(config.id)} className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(config.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {configs.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            No pricing configurations found
          </CardContent>
        </Card>
      )}

      {showAddModal && (
        <PricingFormModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />
      )}
    </div>
  );
}

function PricingEditForm({ config, onSave, onCancel }) {
  const [data, setData] = useState(config);

  return (
    <div className="space-y-3">
      <Input
        type="number"
        step="0.01"
        value={data.price_per_sqft}
        onChange={(e) => setData({...data, price_per_sqft: parseFloat(e.target.value)})}
        placeholder="Price per sq ft"
      />
      <Input
        type="number"
        step="0.01"
        value={data.labor_rate}
        onChange={(e) => setData({...data, labor_rate: parseFloat(e.target.value)})}
        placeholder="Labor rate"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(config.id, data)} className="flex-1 bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function PricingFormModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    material_type: '',
    price_per_sqft: 0,
    labor_rate: 0,
    warranty_cost: 0,
    additional_fees: 0,
    is_active: true
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold mb-6">Add Pricing Config</h3>
          
          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Material Type</label>
              <Input
                value={formData.material_type}
                onChange={(e) => setFormData({...formData, material_type: e.target.value})}
                placeholder="e.g., Asphalt Shingles"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Price per sq ft ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price_per_sqft}
                onChange={(e) => setFormData({...formData, price_per_sqft: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Labor rate ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.labor_rate}
                onChange={(e) => setFormData({...formData, labor_rate: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}