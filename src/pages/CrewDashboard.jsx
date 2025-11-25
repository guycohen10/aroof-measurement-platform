import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, MapPin, CheckCircle, Clock, Camera, LogOut } from "lucide-react";

export default function CrewDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [todayJobs, setTodayJobs] = useState([]);
  const [clockedIn, setClockedIn] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.aroof_role !== 'crew_lead' && currentUser.role !== 'admin') {
        alert('Access denied. This dashboard is for crew leads only.');
        navigate('/');
        return;
      }
      
      setUser(currentUser);
      
      // Load today's jobs
      const today = new Date().toISOString().split('T')[0];
      const jobs = await base44.entities.Job.filter({
        scheduled_start_date: today,
        assigned_crew_lead: currentUser.email
      });
      
      setTodayJobs(jobs || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      navigate('/');
    }
  }

  async function handleLogout() {
    await base44.auth.logout();
    navigate('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Crew Dashboard</h1>
            <p className="text-sm text-slate-600">Welcome back, {user?.full_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setClockedIn(!clockedIn)}
              variant={clockedIn ? "destructive" : "default"}
              className="h-10"
            >
              {clockedIn ? '⏱️ Clock Out' : '▶️ Clock In'}
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Today's Jobs */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">Today's Schedule</h2>
        
        {todayJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No jobs scheduled for today</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todayJobs.map(job => (
              <Card key={job.id} className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{job.property_address}</span>
                    <span className="text-sm font-normal px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {job.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {job.property_address}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      Crew Size: {job.crew_size || 2}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4" />
                      {job.completion_percentage || 0}% Complete
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}