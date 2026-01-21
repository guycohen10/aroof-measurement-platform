import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';

export default function Automations() {
  const [user, setUser] = useState(null);
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    trigger_entity: 'lead',
    trigger_event: 'created',
    conditions: { field: '', operator: 'equals', value: '' },
    action_type: 'create_notification',
    action_payload: { title: '', message: '' }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const rulesData = await base44.entities.AutomationRule.filter({
        company_id: currentUser.company_id
      });
      setRules(rulesData || []);
    } catch (err) {
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.conditions.field || !formData.conditions.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await base44.entities.AutomationRule.create({
        company_id: user.company_id,
        ...formData,
        is_active: true
      });

      toast.success('Automation rule created');
      setFormData({
        name: '',
        trigger_entity: 'lead',
        trigger_event: 'created',
        conditions: { field: '', operator: 'equals', value: '' },
        action_type: 'create_notification',
        action_payload: { title: '', message: '' }
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error('Failed to create rule');
    }
  };

  const toggleRule = async (rule) => {
    try {
      await base44.entities.AutomationRule.update(rule.id, {
        is_active: !rule.is_active
      });
      loadData();
      toast.success(rule.is_active ? 'Rule disabled' : 'Rule enabled');
    } catch (err) {
      toast.error('Failed to toggle rule');
    }
  };

  const deleteRule = async (id) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await base44.entities.AutomationRule.delete(id);
      toast.success('Rule deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Automation Rules</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Rule
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Create New Automation Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rule Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Auto-Create Job on Sale"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">When [Entity] is [Event]</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.trigger_entity}
                      onChange={(e) => setFormData({ ...formData, trigger_entity: e.target.value })}
                      className="flex-1 border rounded px-3 py-2"
                    >
                      <option value="lead">Lead</option>
                      <option value="job">Job</option>
                      <option value="measurement">Measurement</option>
                    </select>
                    <select
                      value={formData.trigger_event}
                      onChange={(e) => setFormData({ ...formData, trigger_event: e.target.value })}
                      className="flex-1 border rounded px-3 py-2"
                    >
                      <option value="created">Created</option>
                      <option value="updated">Updated</option>
                      <option value="status_change">Status Changed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Field *</label>
                  <input
                    type="text"
                    value={formData.conditions.field}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      conditions: { ...formData.conditions, field: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., lead_status"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Operator</label>
                  <select
                    value={formData.conditions.operator}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      conditions: { ...formData.conditions, operator: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Greater Than</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Value *</label>
                  <input
                    type="text"
                    value={formData.conditions.value}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      conditions: { ...formData.conditions, value: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Sold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Then [Action]</label>
                  <select
                    value={formData.action_type}
                    onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="create_notification">Send Notification</option>
                    <option value="create_task">Create Task</option>
                    <option value="send_email">Send Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notification Title</label>
                  <input
                    type="text"
                    value={formData.action_payload.title}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      action_payload: { ...formData.action_payload, title: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Alert title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notification Message</label>
                <textarea
                  value={formData.action_payload.message}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    action_payload: { ...formData.action_payload, message: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2"
                  rows="2"
                  placeholder="Alert message"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Rule</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {rules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No automation rules yet. Create one to get started.
          </div>
        ) : (
          rules.map(rule => (
            <Card key={rule.id} className={rule.is_active ? '' : 'opacity-60'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{rule.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      When <span className="font-mono bg-gray-100 px-2 py-1">{rule.trigger_entity}</span> is <span className="font-mono bg-gray-100 px-2 py-1">{rule.trigger_event}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      And <span className="font-mono bg-gray-100 px-2 py-1">{rule.conditions.field}</span> <span className="font-mono bg-gray-100 px-2 py-1">{rule.conditions.operator}</span> <span className="font-mono bg-gray-100 px-2 py-1">{rule.conditions.value}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Then <span className="font-mono bg-gray-100 px-2 py-1">{rule.action_type}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleRule(rule)}
                      className={`p-2 rounded transition-colors ${
                        rule.is_active
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={rule.is_active ? 'Disable rule' : 'Enable rule'}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}