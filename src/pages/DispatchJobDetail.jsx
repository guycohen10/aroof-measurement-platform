import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  Edit,
  Loader2,
  Camera,
  FileText,
  AlertCircle,
  Play,
  Pause,
  Flag
} from "lucide-react";
import { format } from "date-fns";

export default function DispatchJobDetail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadJobDetail();
  }, []);

  const loadJobDetail = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('jobId');

      if (!jobId) {
        navigate(createPageUrl("DispatchDashboard"));
        return;
      }

      const jobs = await base44.entities.Job.filter({ id: jobId });
      
      if (jobs.length === 0) {
        alert('Job not found');
        navigate(createPageUrl("DispatchDashboard"));
        return;
      }

      setJob(jobs[0]);
      setNotes(jobs[0].dispatch_notes || '');
      setLoading(false);
    } catch (err) {
      console.error('Error loading job:', err);
      alert('Failed to load job details');
      navigate(createPageUrl("DispatchDashboard"));
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setSaving(true);
    try {
      const updates = { status: newStatus };
      
      if (newStatus === 'in_progress' && !job.actual_start_date) {
        updates.actual_start_date = new Date().toISOString();
      }
      
      if (newStatus === 'completed') {
        updates.actual_end_date = new Date().toISOString();
        updates.completion_percentage = 100;
      }

      await base44.entities.Job.update(job.id, updates);
      await loadJobDetail();
      alert('✅ Status updated!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProgress = async (percentage) => {
    try {
      await base44.entities.Job.update(job.id, {
        completion_percentage: percentage
      });
      await loadJobDetail();
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleChecklistChange = async (item, checked) => {
    try {
      const updatedChecklist = {
        ...job.checklist,
        [item]: checked
      };

      // Calculate completion percentage based on checklist
      const total = Object.keys(updatedChecklist).length;
      const completed = Object.values(updatedChecklist).filter(v => v).length;
      const percentage = Math.round((completed / total) * 100);

      await base44.entities.Job.update(job.id, {
        checklist: updatedChecklist,
        completion_percentage: percentage
      });
      
      await loadJobDetail();
    } catch (err) {
      console.error('Error updating checklist:', err);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await base44.entities.Job.update(job.id, {
        dispatch_notes: notes
      });
      alert('✅ Notes saved!');
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
      canceled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("DispatchDashboard")}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Job {job.job_number}
                </h1>
                <p className="text-sm text-slate-600">
                  {job.property_address}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(job.status)}>
                {job.status?.replace('_', ' ').toUpperCase()}
              </Badge>
              {job.priority === 'urgent' && (
                <Badge className="bg-red-500 text-white">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  URGENT
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {job.status === 'scheduled' && (
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleUpdateStatus('in_progress')}
                      disabled={saving}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Job
                    </Button>
                  )}
                  {job.status === 'in_progress' && (
                    <>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleUpdateStatus('completed')}
                        disabled={saving}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleUpdateStatus('on_hold')}
                        disabled={saving}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Put On Hold
                      </Button>
                    </>
                  )}
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Job
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Job Progress</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {job.completion_percentage || 0}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={job.completion_percentage || 0} className="mb-6" />
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 mb-3">Completion Checklist:</h4>
                  {[
                    { key: 'materials_delivered', label: 'Materials delivered to site' },
                    { key: 'site_preparation', label: 'Site preparation complete' },
                    { key: 'tearoff_complete', label: 'Old roof tear-off complete' },
                    { key: 'deck_inspection', label: 'Deck inspection passed' },
                    { key: 'underlayment_installed', label: 'Underlayment installed' },
                    { key: 'shingles_installed', label: 'Shingles installed' },
                    { key: 'ridge_cap_complete', label: 'Ridge cap complete' },
                    { key: 'cleanup_complete', label: 'Site cleanup complete' },
                    { key: 'final_inspection', label: 'Final inspection passed' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Checkbox
                        checked={job.checklist?.[item.key] || false}
                        onCheckedChange={(checked) => handleChecklistChange(item.key, checked)}
                      />
                      <label className="text-sm text-slate-700 cursor-pointer flex-1">
                        {item.label}
                      </label>
                      {job.checklist?.[item.key] && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dispatch Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this job..."
                  className="min-h-[150px] mb-4"
                />
                <Button onClick={handleSaveNotes} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Save Notes
                </Button>
              </CardContent>
            </Card>

            {/* Job Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Job Photos</span>
                  <Button size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!job.photos || job.photos.length === 0) ? (
                  <div className="text-center py-8 text-slate-500">
                    <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No photos uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {job.photos.map((photo, idx) => (
                      <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Name</p>
                  <p className="font-semibold text-slate-900">{job.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Phone</p>
                  <a 
                    href={`tel:${job.customer_phone}`}
                    className="font-semibold text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {job.customer_phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Email</p>
                  <a 
                    href={`mailto:${job.customer_email}`}
                    className="font-semibold text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {job.customer_email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Address</p>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(job.property_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    {job.property_address}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Scheduled Start</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {job.scheduled_start_date 
                      ? format(new Date(job.scheduled_start_date), 'MMM d, yyyy')
                      : 'Not scheduled'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Scheduled End</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {job.scheduled_end_date 
                      ? format(new Date(job.scheduled_end_date), 'MMM d, yyyy')
                      : 'Not scheduled'
                    }
                  </p>
                </div>
                {job.actual_start_date && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Actual Start</p>
                    <p className="font-semibold text-green-700">
                      {format(new Date(job.actual_start_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-600 mb-1">Estimated Duration</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {job.estimated_duration_days || 1} day{job.estimated_duration_days !== 1 ? 's' : ''}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Area</p>
                  <p className="font-semibold text-slate-900">
                    {job.total_area_sqft?.toLocaleString()} sq ft
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Job Value</p>
                  <p className="font-semibold text-green-700 flex items-center gap-2 text-xl">
                    <DollarSign className="w-5 h-5" />
                    ${job.job_value?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Crew Size</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    {job.crew_size || 0} members
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Materials Status</p>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      {job.materials_ordered ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                      )}
                      Materials Ordered
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      {job.materials_delivered ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                      )}
                      Materials Delivered
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Permit Status</p>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      {job.permit_required ? (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                      )}
                      Permit Required
                    </p>
                    {job.permit_required && (
                      <p className="text-sm flex items-center gap-2">
                        {job.permit_obtained ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                        )}
                        Permit Obtained
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}