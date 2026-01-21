import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function CrewWorkspace() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allJobs = await base44.entities.Job.list();
      const myJobs = allJobs.filter(j => 
        j.crew_id === currentUser.id && 
        j.status !== 'completed'
      );
      setJobs(myJobs);
    } catch (err) {
      console.error(err);
    }
  };

  const sendPing = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await base44.entities.ActivityLog.create({
            type: 'gps_ping',
            content: `Crew at ${pos.coords.latitude}, ${pos.coords.longitude}`,
            user_id: user.id,
            user_name: user.full_name || user.email,
            company_id: user.company_id,
            timestamp: new Date().toISOString()
          });
          alert("Location Sent! 📍");
        } catch (err) {
          alert("Failed to send location");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        alert("GPS Error: " + err.message);
        setLoading(false);
      }
    );
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Crew Workspace</h1>
          <Button onClick={sendPing} disabled={loading}>
            <MapPin className="w-4 h-4 mr-2" />
            {loading ? 'Sending...' : 'Send Location'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Active Jobs ({jobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active jobs assigned to you.</p>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="border rounded p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{job.customer_name}</h3>
                      <p className="text-sm text-gray-600">{job.property_address}</p>
                      <p className="text-sm text-gray-600">Status: {job.status}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(createPageUrl(`JobDetail?id=${job.id}`))}
                    >
                      View Job
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}