import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ActivityTimeline from '../components/crm/ActivityTimeline';
import CommunicationLogger from '../components/crm/CommunicationLogger';
import { ArrowLeft, Upload, Phone, Mail, MapPin, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function JobDetail() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const jobId = searchParams.get('id');

  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogger, setShowLogger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (jobId) loadData();
  }, [jobId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);

      const jobs = await base44.entities.Job.list();
      const foundJob = jobs.find(j => j.id === jobId);
      
      if (!foundJob) {
        toast.error('Job not found');
        navigate(createPageUrl("RooferDashboard"));
        return;
      }

      setJob(foundJob);
    } catch (err) {
      toast.error('Failed to load job');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await base44.entities.Job.update(jobId, { status });
      
      await base44.entities.ActivityLog.create({
        type: 'status_change',
        content: `Status updated to ${status}`,
        user_id: user.id,
        user_name: user.full_name || user.email,
        lead_id: job.source_lead_id || null,
        company_id: user.company_id,
        timestamp: new Date().toISOString()
      });

      toast.success('Status updated!');
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result;
        const current = job[field] || [];
        
        await base44.entities.Job.update(jobId, {
          [field]: [...current, base64]
        });

        await base44.entities.ActivityLog.create({
          type: 'note',
          content: `Uploaded photo to ${field.replace('_', ' ')}`,
          user_id: user.id,
          user_name: user.full_name || user.email,
          lead_id: job.source_lead_id || null,
          company_id: user.company_id,
          timestamp: new Date().toISOString()
        });

        toast.success('Photo uploaded!');
        loadData();
      } catch (err) {
        toast.error('Failed to upload photo');
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Job not found</p>
          <Button onClick={() => navigate(createPageUrl("RooferDashboard"))}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    on_hold: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {job.customer_name || 'Job Detail'}
                </h1>
                <p className="text-slate-600">{job.property_address}</p>
              </div>
            </div>
            <Badge className={statusColors[job.status] || 'bg-slate-100'}>
              {job.status}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Photos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Control */}
            <Card>
              <CardHeader>
                <CardTitle>Job Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {['scheduled', 'in_progress', 'on_hold', 'completed'].map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant={job.status === status ? 'default' : 'outline'}
                      onClick={() => updateStatus(status)}
                      disabled={updating}
                    >
                      {status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photo Sections */}
            {['before_photos', 'progress_photos', 'after_photos'].map(type => (
              <Card key={type}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="capitalize">
                      {type.replace('_', ' ')}
                    </CardTitle>
                    <label className="cursor-pointer">
                      <Button size="sm" variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </span>
                      </Button>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleUpload(e, type)} 
                      />
                    </label>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 overflow-x-auto py-2">
                    {(!job[type] || job[type].length === 0) && (
                      <span className="text-slate-400 text-sm italic">No photos yet</span>
                    )}
                    {(job[type] || []).map((src, i) => (
                      <img 
                        key={i} 
                        src={src} 
                        alt={`${type} ${i + 1}`}
                        className="h-32 w-32 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <a href={`tel:${job.customer_phone}`} className="text-blue-600 hover:underline">
                    {job.customer_phone || 'N/A'}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <a href={`mailto:${job.customer_email}`} className="text-blue-600 hover:underline">
                    {job.customer_email || 'N/A'}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 mt-1" />
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.property_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {job.property_address}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Job History</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline 
                  leadId={job.source_lead_id}
                  companyId={user?.company_id}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showLogger && (
        <CommunicationLogger
          lead={{ id: job.source_lead_id }}
          onClose={() => setShowLogger(false)}
          onSaved={() => loadData()}
        />
      )}
    </div>
  );
}