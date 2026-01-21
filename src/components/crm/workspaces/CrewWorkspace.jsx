import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function CrewWorkspace() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Fetch active jobs assigned to this crew member
      const myJobs = await base44.entities.Job.filter({
        crew_id: userData.id,
        status: { $in: ['scheduled', 'in_progress'] }
      }, '-scheduled_date', 20);
      
      setJobs(myJobs);
    } catch (err) {
      toast.error("Failed to load jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (job) => {
    setCheckingIn(job.id);

    if (!navigator.geolocation) {
      toast.error("GPS not available on this device");
      setCheckingIn(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        try {
          // Log GPS check-in to ActivityLog
          await base44.entities.ActivityLog.create({
            type: 'gps_ping',
            content: `Crew arrived at job site. GPS: ${locationText}. Job: ${job.property_address}`,
            user_id: user.id,
            lead_id: job.measurement_id || null,
            timestamp: new Date().toISOString()
          });

          toast.success("Checked in successfully!");
          
          // Optionally update job status
          if (job.status === 'scheduled') {
            await base44.entities.Job.update(job.id, { status: 'in_progress' });
            loadData(); // Refresh
          }
        } catch (err) {
          toast.error("Failed to check in");
          console.error(err);
        } finally {
          setCheckingIn(null);
        }
      },
      (error) => {
        toast.error("Could not get GPS location");
        console.error(error);
        setCheckingIn(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statusColors = {
    'scheduled': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Jobs</h2>
        <p className="text-slate-600">Active jobs assigned to you: {jobs.length}</p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No active jobs assigned</p>
            <p className="text-slate-500 text-sm mt-2">Check back soon for new assignments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <Card key={job.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{job.customer_name}</CardTitle>
                    <p className="text-slate-600 mt-1">{job.property_address}</p>
                  </div>
                  <Badge className={statusColors[job.status] || 'bg-slate-100'}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Job Type</p>
                      <p className="font-semibold">{job.job_type || 'Replacement'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Area</p>
                      <p className="font-semibold">{job.roof_sqft ? `${job.roof_sqft.toFixed(0)} sqft` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Scheduled</p>
                      <p className="font-semibold">
                        {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Duration</p>
                      <p className="font-semibold">{job.estimated_duration_days || 1} day(s)</p>
                    </div>
                  </div>

                  {job.job_notes && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Notes:</p>
                      <p className="text-sm text-slate-800">{job.job_notes}</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => handleCheckIn(job)}
                    disabled={checkingIn === job.id}
                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                  >
                    {checkingIn === job.id ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Getting GPS...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5 mr-2" />
                        Arrive at Job Site
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}