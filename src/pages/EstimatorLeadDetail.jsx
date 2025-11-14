
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Home,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Save,
  Send,
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Briefcase
} from "lucide-react";
import InteractiveMapView from "../components/results/InteractiveMapView";

export default function EstimatorLeadDetail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [measurement, setMeasurement] = useState(null);
  const [user, setUser] = useState(null);
  const [sections, setSections] = useState([]);
  
  // Pricing state
  const [materialCost, setMaterialCost] = useState(4.00);
  const [laborCost, setLaborCost] = useState(3.00);
  const [wasteFactor, setWasteFactor] = useState(12);
  const [additionalCosts, setAdditionalCosts] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [totalEstimate, setTotalEstimate] = useState(0);
  
  // Notes state
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("internal");
  const [notes, setNotes] = useState([]);
  
  // Status state
  const [leadStatus, setLeadStatus] = useState("new");
  const [priority, setPriority] = useState("medium");
  const [followUpDate, setFollowUpDate] = useState("");

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [materialCost, laborCost, wasteFactor, additionalCosts, discountPercent, measurement]);

  const checkAuthAndLoad = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.role !== 'admin' && currentUser.aroof_role !== 'estimator') {
        alert('Access denied. Estimator role required.');
        navigate(createPageUrl("EstimatorDashboard"));
        return;
      }

      setUser(currentUser);
      await loadLeadData();
    } catch (err) {
      console.error('Auth error:', err);
      navigate(createPageUrl("EstimatorDashboard"));
    }
  };

  const loadLeadData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const measurementId = urlParams.get('id');
    
    if (!measurementId) {
      alert('No measurement ID provided');
      navigate(createPageUrl("EstimatorDashboard"));
      return;
    }

    try {
      const measurements = await base44.entities.Measurement.filter({ id: measurementId });
      
      if (measurements.length === 0) {
        alert('Measurement not found');
        navigate(createPageUrl("EstimatorDashboard"));
        return;
      }

      const lead = measurements[0];
      setMeasurement(lead);
      setSections(lead.measurement_data?.sections || []);
      setLeadStatus(lead.lead_status || 'new');
      setPriority(lead.priority || 'medium');
      setFollowUpDate(lead.follow_up_date || '');
      setNotes(lead.estimator_notes || []);
      
      // Load pricing overrides if they exist
      if (lead.pricing_override) {
        setMaterialCost(lead.pricing_override.material_cost_per_sqft || 4.00);
        setLaborCost(lead.pricing_override.labor_cost_per_sqft || 3.00);
        setWasteFactor(lead.pricing_override.waste_factor_percent || 12);
        setAdditionalCosts(lead.pricing_override.additional_costs || []);
        setDiscountPercent(lead.pricing_override.discount_percent || 0);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading lead:', err);
      alert('Failed to load lead data');
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!measurement) return;
    
    const area = measurement.total_adjusted_sqft || measurement.total_sqft || 0;
    
    const materialSubtotal = area * materialCost;
    const laborSubtotal = area * laborCost;
    const wasteAmount = (materialSubtotal + laborSubtotal) * (wasteFactor / 100);
    
    const additionalTotal = additionalCosts.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const subtotal = materialSubtotal + laborSubtotal + wasteAmount + additionalTotal;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;
    
    setTotalEstimate(Math.round(total));
  };

  const handleSavePricing = async () => {
    setSaving(true);
    try {
      const pricingOverride = {
        material_cost_per_sqft: materialCost,
        labor_cost_per_sqft: laborCost,
        waste_factor_percent: wasteFactor,
        additional_costs: additionalCosts,
        discount_percent: discountPercent,
        total_override: totalEstimate,
        updated_at: new Date().toISOString(),
        updated_by: user.email
      };

      await base44.entities.Measurement.update(measurement.id, {
        pricing_override: pricingOverride,
        quote_amount: totalEstimate,
        quote_version: (measurement.quote_version || 0) + 1
      });

      alert('✅ Pricing saved successfully!');
      await loadLeadData();
    } catch (err) {
      console.error('Error saving pricing:', err);
      alert('Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setSaving(true);
    try {
      const note = {
        id: Date.now().toString(),
        text: newNote,
        note_type: noteType,
        created_at: new Date().toISOString(),
        created_by: user.email
      };

      const updatedNotes = [...notes, note];

      await base44.entities.Measurement.update(measurement.id, {
        estimator_notes: updatedNotes,
        last_contact_date: new Date().toISOString()
      });

      setNotes(updatedNotes);
      setNewNote("");
      alert('✅ Note added successfully!');
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      await base44.entities.Measurement.update(measurement.id, {
        lead_status: newStatus
      });
      
      setLeadStatus(newStatus);
      alert('✅ Status updated!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setSaving(true);
    try {
      await base44.entities.Measurement.update(measurement.id, {
        priority: newPriority
      });
      
      setPriority(newPriority);
      alert('✅ Priority updated!');
    } catch (err) {
      console.error('Error updating priority:', err);
      alert('Failed to update priority');
    } finally {
      setSaving(false);
    }
  };

  const handleSendReport = async () => {
    setSaving(true);
    try {
      await base44.entities.Measurement.update(measurement.id, {
        report_sent_count: (measurement.report_sent_count || 0) + 1,
        last_report_sent: new Date().toISOString(),
        quote_sent_date: new Date().toISOString()
      });

      alert('✅ Report sent successfully! (Email functionality would be implemented here)');
      await loadLeadData();
    } catch (err) {
      console.error('Error sending report:', err);
      alert('Failed to send report');
    } finally {
      setSaving(false);
    }
  };

  const addAdditionalCost = () => {
    setAdditionalCosts([...additionalCosts, { id: Date.now(), name: '', amount: 0 }]);
  };

  const updateAdditionalCost = (id, field, value) => {
    setAdditionalCosts(additionalCosts.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeAdditionalCost = (id) => {
    setAdditionalCosts(additionalCosts.filter(item => item.id !== id));
  };

  const handleConvertToJob = async () => {
    // Check if lead is in appropriate status
    if (leadStatus !== 'quoted' && leadStatus !== 'booked') {
      alert('Lead must be in "Quoted" or "Booked" status to convert to job');
      return;
    }

    const confirm = window.confirm(
      '🚀 Convert this lead to a scheduled job?\n\n' +
      'This will:\n' +
      '• Create a new job in dispatch system\n' +
      '• Mark lead as "Booked"\n' +
      '• Allow dispatchers to assign crews\n\n' +
      'Continue?'
    );

    if (!confirm) return;

    setSaving(true);
    try {
      // Generate job number
      const jobNumber = `JOB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      // Create job
      const newJob = await base44.entities.Job.create({
        job_number: jobNumber,
        measurement_id: measurement.id,
        customer_name: measurement.customer_name,
        customer_email: measurement.customer_email,
        customer_phone: measurement.customer_phone,
        property_address: measurement.property_address,
        status: 'scheduled',
        priority: priority === 'urgent' ? 'urgent' : 'normal',
        total_area_sqft: measurement.total_adjusted_sqft || measurement.total_sqft,
        job_value: totalEstimate,
        estimated_duration_days: Math.ceil((measurement.total_adjusted_sqft || measurement.total_sqft) / 2000) || 1,
        crew_size: 3,
        materials_ordered: false,
        materials_delivered: false,
        permit_required: false,
        permit_obtained: false,
        completion_percentage: 0,
        weather_dependent: true,
        special_instructions: measurement.roofer_notes || '',
        checklist: {
          materials_delivered: false,
          site_preparation: false,
          tearoff_complete: false,
          deck_inspection: false,
          underlayment_installed: false,
          shingles_installed: false,
          ridge_cap_complete: false,
          cleanup_complete: false,
          final_inspection: false
        },
        timeline: [{
          action: 'job_created',
          description: 'Job created from lead by estimator',
          user: user.email,
          timestamp: new Date().toISOString()
        }]
      });

      // Update lead status
      await base44.entities.Measurement.update(measurement.id, {
        lead_status: 'booked'
      });

      alert(`✅ Job created successfully!\n\nJob Number: ${jobNumber}\n\nRedirecting to dispatch dashboard...`);
      
      // Redirect to dispatch dashboard
      navigate(createPageUrl(`DispatchJobDetail?jobId=${newJob.id}`));

    } catch (err) {
      console.error('Error converting to job:', err);
      alert('Failed to convert to job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!measurement) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Lead Not Found</h2>
            <Button onClick={() => navigate(createPageUrl("EstimatorDashboard"))}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const area = measurement.total_adjusted_sqft || measurement.total_sqft || 0;
  const materialSubtotal = area * materialCost;
  const laborSubtotal = area * laborCost;
  const wasteAmount = (materialSubtotal + laborSubtotal) * (wasteFactor / 100);
  const additionalTotal = additionalCosts.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => navigate(createPageUrl("EstimatorDashboard"))}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <Home className="w-4 h-4" />
              <span>/</span>
              <Link to={createPageUrl("EstimatorDashboard")} className="hover:text-white">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-white">Lead Details</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section - Lead Overview */}
        <Card className="mb-8 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left: Property & Customer Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  {measurement.property_address}
                </h1>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-slate-600">Customer</p>
                        <p className="font-semibold text-slate-900">
                          {measurement.customer_name || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    {measurement.customer_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-slate-600">Phone</p>
                          <a 
                            href={`tel:${measurement.customer_phone}`}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            {measurement.customer_phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {measurement.customer_email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-slate-600">Email</p>
                          <a 
                            href={`mailto:${measurement.customer_email}`}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            {measurement.customer_email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-slate-600">Created</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(measurement.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-slate-600">Lead ID</p>
                        <p className="font-mono text-sm text-slate-700">
                          {measurement.id.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Status Controls */}
              <div className="space-y-4 lg:w-80">
                <div>
                  <Label className="mb-2 block text-sm font-medium">Status</Label>
                  <Select value={leadStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">🆕 New</SelectItem>
                      <SelectItem value="contacted">📞 Contacted</SelectItem>
                      <SelectItem value="quoted">💰 Quoted</SelectItem>
                      <SelectItem value="booked">✅ Booked</SelectItem>
                      <SelectItem value="completed">🎉 Completed</SelectItem>
                      <SelectItem value="lost">❌ Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium">Priority</Label>
                  <Select value={priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">🔥 Urgent</SelectItem>
                      <SelectItem value="high">⬆️ High</SelectItem>
                      <SelectItem value="medium">➡️ Medium</SelectItem>
                      <SelectItem value="low">⬇️ Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium">Follow-up Date</Label>
                  <Input 
                    type="date" 
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* LEFT COLUMN - 60% */}
          <div className="lg:col-span-3 space-y-8">
            {/* Satellite Image */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Property View</CardTitle>
              </CardHeader>
              <CardContent>
                <div id="lead-detail-map">
                  <InteractiveMapView measurement={measurement} sections={sections} />
                </div>
              </CardContent>
            </Card>

            {/* Section Breakdown */}
            {sections.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Roof Sections ({sections.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sections.map((section, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-l-4"
                        style={{ borderColor: section.color || '#3b82f6' }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: section.color || '#3b82f6' }}
                          />
                          <div>
                            <p className="font-semibold">{section.name || `Section ${idx + 1}`}</p>
                            <p className="text-sm text-slate-600">
                              Pitch: {section.pitch || 'flat'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {Math.round(section.adjusted_area_sqft || section.flat_area_sqft || 0).toLocaleString()} sq ft
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Line Measurements */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Line Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Eaves', value: measurement.eaves_ft },
                    { label: 'Rakes', value: measurement.rakes_ft },
                    { label: 'Ridges', value: measurement.ridges_ft },
                    { label: 'Hips', value: measurement.hips_ft },
                    { label: 'Valleys', value: measurement.valleys_ft },
                    { label: 'Steps', value: measurement.steps_ft }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-bold text-slate-900">
                        {(item.value || 0).toFixed(1)} ft
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            {measurement.photos && measurement.photos.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Site Photos ({measurement.photos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {measurement.photos.map((photo, idx) => (
                      <div key={idx} className="border rounded-lg overflow-hidden">
                        <img 
                          src={photo.url} 
                          alt={photo.caption || `Photo ${idx + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        {photo.caption && (
                          <div className="p-2 bg-slate-50 text-sm text-slate-700">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN - 40% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <p className="text-sm text-slate-600 mb-1">Total Area</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.round(area).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">square feet</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border text-center">
                    <p className="text-xs text-slate-600">Squares</p>
                    <p className="text-xl font-bold text-slate-900">
                      {(area / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border text-center">
                    <p className="text-xs text-slate-600">Sections</p>
                    <p className="text-xl font-bold text-slate-900">
                      {sections.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Editor */}
            <Card className="shadow-lg border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
                <CardTitle className="flex items-center gap-2">
                  💰 Pricing Override
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <strong>Total Area:</strong> {Math.round(area).toLocaleString()} sq ft
                </div>

                <div>
                  <Label className="mb-2">Material Cost (per sq ft)</Label>
                  <div className="flex gap-2">
                    <span className="flex items-center text-lg font-bold">$</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Subtotal: ${Math.round(materialSubtotal).toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label className="mb-2">Labor Cost (per sq ft)</Label>
                  <div className="flex gap-2">
                    <span className="flex items-center text-lg font-bold">$</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={laborCost}
                      onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Subtotal: ${Math.round(laborSubtotal).toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label className="mb-2">Waste Factor (%)</Label>
                  <Input 
                    type="number"
                    value={wasteFactor}
                    onChange={(e) => setWasteFactor(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-slate-600 mt-1">
                    Add: ${Math.round(wasteAmount).toLocaleString()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Additional Costs</Label>
                    <Button size="sm" variant="outline" onClick={addAdditionalCost}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {additionalCosts.map((item) => (
                      <div key={item.id} className="flex gap-2">
                        <Input 
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => updateAdditionalCost(item.id, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input 
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateAdditionalCost(item.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-32"
                        />
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeAdditionalCost(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {additionalTotal > 0 && (
                    <p className="text-sm text-slate-600 mt-1">
                      Total: ${Math.round(additionalTotal).toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2">Discount (%)</Label>
                  <Input 
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="border-t-2 border-slate-200 pt-4">
                  <div className="bg-green-600 text-white p-4 rounded-lg text-center">
                    <p className="text-sm opacity-90 mb-1">TOTAL ESTIMATE</p>
                    <p className="text-3xl font-bold">
                      ${totalEstimate.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleSavePricing}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Pricing
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setMaterialCost(4.00);
                      setLaborCost(3.00);
                      setWasteFactor(12);
                      setAdditionalCosts([]);
                      setDiscountPercent(0);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSendReport}
                  disabled={saving}
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Report to Customer
                </Button>
                
                <Button 
                  className="w-full h-12"
                  variant="outline"
                  onClick={() => navigate(createPageUrl(`Results?measurementid=${measurement.id}`))}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  View Full Report
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    Schedule
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleConvertToJob}
                    disabled={saving || (leadStatus !== 'quoted' && leadStatus !== 'booked')}
                    className={leadStatus === 'quoted' || leadStatus === 'booked' ? 'border-green-600 text-green-600 hover:bg-green-50' : ''}
                  >
                    <Briefcase className="w-4 h-4 mr-1" />
                    Convert to Job
                  </Button>
                </div>

                {(leadStatus === 'quoted' || leadStatus === 'booked') && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Ready to convert to dispatch job
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Notes & Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">📝 Internal Note</SelectItem>
                      <SelectItem value="call">📞 Phone Call</SelectItem>
                      <SelectItem value="email">✉️ Email</SelectItem>
                      <SelectItem value="meeting">🤝 Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Textarea 
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  
                  <Button 
                    className="w-full"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Add Note
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-3 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-sm text-slate-700">History</h4>
                  {notes.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No notes yet</p>
                  ) : (
                    notes.slice().reverse().map((note) => (
                      <div key={note.id} className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-600">
                            {note.note_type === 'call' && '📞'}
                            {note.note_type === 'email' && '✉️'}
                            {note.note_type === 'meeting' && '🤝'}
                            {note.note_type === 'internal' && '📝'}
                            {' '}{note.note_type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{note.text}</p>
                        <p className="text-xs text-slate-500 mt-1">by {note.created_by}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
