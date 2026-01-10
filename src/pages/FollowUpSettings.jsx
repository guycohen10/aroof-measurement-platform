import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Home, Plus, Trash2, Edit, Save, X, Loader2, MessageSquare, Mail, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FollowUpSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [sequence, setSequence] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [showAddStep, setShowAddStep] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.aroof_role !== 'external_roofer') {
        alert('Access denied');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setUser(currentUser);

      // Load or create default sequence
      const sequences = await base44.entities.FollowUpSequence.filter({ 
        company_id: currentUser.company_id,
        trigger_event: 'new_measurement'
      });

      if (sequences.length > 0) {
        setSequence(sequences[0]);
      } else {
        // Create default sequence
        const defaultSequence = await base44.entities.FollowUpSequence.create({
          company_id: currentUser.company_id,
          sequence_name: "New Lead Follow-Up",
          trigger_event: "new_measurement",
          is_active: true,
          steps: [
            {
              delay_minutes: 5,
              channel: "sms",
              subject: "",
              message: "Hi {{customer_name}}! This is {{company_name}}. Thanks for measuring your roof with us ({{total_sqft}} sq ft). We'd love to provide a free inspection. When works best for you?",
              send_if_status: ["new"]
            },
            {
              delay_minutes: 60,
              channel: "email",
              subject: "Your Roof Measurement Results - {{property_address}}",
              message: "Hi {{customer_name}},\n\nThanks for using our roof measurement tool! Your roof is approximately {{total_sqft}} square feet.\n\nWe'd like to offer you a FREE in-person inspection to provide an accurate quote.\n\nWhen would be a good time to schedule?\n\nBest regards,\n{{company_name}}\n{{company_phone}}",
              send_if_status: ["new", "contacted"]
            },
            {
              delay_minutes: 1440,
              channel: "sms",
              subject: "",
              message: "Quick follow-up about your {{property_address}} roof measurement. Still interested in a free inspection? Reply YES and we'll get you scheduled.",
              send_if_status: ["new", "contacted"]
            },
            {
              delay_minutes: 4320,
              channel: "email",
              subject: "Last chance - Free roof inspection at {{property_address}}",
              message: "Hi {{customer_name}},\n\nI don't want you to miss out on our free roof inspection offer for your property at {{property_address}}.\n\nIf you're still interested, just reply to this email or call us at {{company_phone}}.\n\nThanks!\n{{company_name}}",
              send_if_status: ["new", "contacted"]
            }
          ]
        });
        setSequence(defaultSequence);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      alert('Failed to load follow-up settings');
      navigate(createPageUrl("RooferDashboard"));
    }
  };

  const handleToggleActive = async () => {
    setSaving(true);
    try {
      await base44.entities.FollowUpSequence.update(sequence.id, {
        is_active: !sequence.is_active
      });
      setSequence({ ...sequence, is_active: !sequence.is_active });
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
    setSaving(false);
  };

  const handleDeleteStep = async (index) => {
    if (!confirm('Delete this step?')) return;

    const newSteps = sequence.steps.filter((_, i) => i !== index);
    setSaving(true);
    try {
      await base44.entities.FollowUpSequence.update(sequence.id, { steps: newSteps });
      setSequence({ ...sequence, steps: newSteps });
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
    setSaving(false);
  };

  const handleSaveStep = async (stepData, index) => {
    const newSteps = [...sequence.steps];
    if (index !== null) {
      newSteps[index] = stepData;
    } else {
      newSteps.push(stepData);
    }

    setSaving(true);
    try {
      await base44.entities.FollowUpSequence.update(sequence.id, { steps: newSteps });
      setSequence({ ...sequence, steps: newSteps });
      setEditingStep(null);
      setShowAddStep(false);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
    setSaving(false);
  };

  const formatDelay = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hour${minutes >= 120 ? 's' : ''}`;
    return `${Math.round(minutes / 1440)} day${minutes >= 2880 ? 's' : ''}`;
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
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Follow-Up Automation</h1>
                <p className="text-blue-200 text-sm">Manage automated lead follow-ups</p>
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
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Note:</strong> Automated sending requires backend functions to be enabled. 
            Sequences are configured here and will execute once backend is set up.
          </AlertDescription>
        </Alert>

        <Card className="shadow-xl mb-6">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{sequence.sequence_name}</CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Active</span>
                <Switch
                  checked={sequence.is_active}
                  onCheckedChange={handleToggleActive}
                  disabled={saving}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {sequence.steps.map((step, index) => (
                <Card key={index} className="border-2 border-slate-200">
                  <CardContent className="p-5">
                    {editingStep === index ? (
                      <StepEditor
                        step={step}
                        onSave={(data) => handleSaveStep(data, index)}
                        onCancel={() => setEditingStep(null)}
                        saving={saving}
                      />
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              step.channel === 'sms' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              {step.channel === 'sms' ? (
                                <MessageSquare className="w-5 h-5 text-green-600" />
                              ) : (
                                <Mail className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">
                                Step {index + 1}: {step.channel === 'sms' ? 'SMS' : 'Email'}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="w-3 h-3" />
                                <span>{formatDelay(step.delay_minutes)} after measurement</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingStep(index)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStep(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {step.subject && (
                          <div className="mb-2">
                            <span className="text-sm font-semibold text-slate-700">Subject:</span>
                            <p className="text-sm text-slate-600">{step.subject}</p>
                          </div>
                        )}

                        <div className="bg-slate-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {step.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold">Sends if status:</span>
                          {step.send_if_status.map((status, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-200 rounded">
                              {status}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {showAddStep ? (
                <Card className="border-2 border-blue-300">
                  <CardContent className="p-5">
                    <StepEditor
                      step={{
                        delay_minutes: 60,
                        channel: 'email',
                        subject: '',
                        message: '',
                        send_if_status: ['new']
                      }}
                      onSave={(data) => handleSaveStep(data, null)}
                      onCancel={() => setShowAddStep(false)}
                      saving={saving}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Button
                  onClick={() => setShowAddStep(true)}
                  variant="outline"
                  className="w-full h-16 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Step
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg">Available Merge Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                '{{customer_name}}',
                '{{company_name}}',
                '{{company_phone}}',
                '{{total_sqft}}',
                '{{property_address}}'
              ].map((tag) => (
                <code key={tag} className="px-3 py-2 bg-white rounded border text-blue-600 font-mono">
                  {tag}
                </code>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepEditor({ step, onSave, onCancel, saving }) {
  const [data, setData] = useState(step);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Channel
          </label>
          <Select value={data.channel} onValueChange={(v) => setData({ ...data, channel: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Delay (minutes)
          </label>
          <Input
            type="number"
            value={data.delay_minutes}
            onChange={(e) => setData({ ...data, delay_minutes: parseInt(e.target.value) })}
            min="0"
          />
          <p className="text-xs text-slate-500 mt-1">
            5=5min, 60=1hr, 1440=1day, 4320=3days
          </p>
        </div>
      </div>

      {data.channel === 'email' && (
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Subject
          </label>
          <Input
            value={data.subject}
            onChange={(e) => setData({ ...data, subject: e.target.value })}
            placeholder="Email subject..."
          />
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">
          Message
        </label>
        <Textarea
          value={data.message}
          onChange={(e) => setData({ ...data, message: e.target.value })}
          rows={6}
          placeholder="Type your message..."
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={() => onSave(data)} disabled={saving} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Step'}
        </Button>
        <Button onClick={onCancel} variant="outline" disabled={saving}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}