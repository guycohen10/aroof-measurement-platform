import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Phone, Eye, Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

export default function DispatchDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [crews, setCrews] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      
      const allJobs = await base44.entities.Job.list('-scheduled_date', 100);
      const companyJobs = allJobs.filter(j => j.company_id === user.company_id);
      setJobs(companyJobs);

      const allCrews = await base44.entities.Crew.list();
      const companyCrews = allCrews.filter(c => c.company_id === user.company_id);
      setCrews(companyCrews);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      setLoading(false);
    }
  };

  const todayJobs = jobs.filter(j => isToday(new Date(j.scheduled_date)));
  const activeJobs = todayJobs.filter(j => j.status === 'in_progress');
  const completedToday = todayJobs.filter(j => j.status === 'completed');
  const upcomingJobs = jobs.filter(j => {
    const date = new Date(j.scheduled_date);
    return isTomorrow(date);
  });

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
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dispatch Dashboard</h1>
                <p className="text-blue-200 text-sm">Today's Jobs - {format(new Date(), 'MMM d, yyyy')}</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Active Jobs */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Active Jobs ({activeJobs.length})</h2>
              <div className="space-y-3">
                {activeJobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-slate-500">
                      No active jobs right now
                    </CardContent>
                  </Card>
                ) : (
                  activeJobs.map(job => {
                    const crew = crews.find(c => c.id === job.crew_id);
                    return (
                      <Card key={job.id} className="border-l-4 border-l-blue-600">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg text-slate-900">
                                  Job #{job.id.slice(-6)} - {job.property_address.split(',')[0]}
                                </h3>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                                  In Progress
                                </span>
                              </div>

                              <div className="space-y-1 text-sm text-slate-600">
                                <div>{crew?.crew_name || 'No Crew'} | Started {format(new Date(job.scheduled_date), 'h:mm a')}</div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{width: `${job.completion_percentage || 0}%`}}
                                    />
                                  </div>
                                  <span className="font-semibold">{job.completion_percentage || 0}%</span>
                                </div>
                                {job.estimated_duration_days > 1 && (
                                  <div className="text-slate-500">Est. Finish: {job.estimated_duration_days} days</div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Phone className="w-4 h-4 mr-1" />
                                Call
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => navigate(createPageUrl(`JobDetail/${job.id}`))}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

            {/* Upcoming Jobs */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Upcoming ({upcomingJobs.length})</h2>
              <div className="space-y-3">
                {upcomingJobs.slice(0, 3).map(job => {
                  const crew = crews.find(c => c.id === job.crew_id);
                  return (
                    <Card key={job.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">{job.property_address}</div>
                            <div className="text-sm text-slate-600">
                              {crew?.crew_name || 'No Crew'} - Tomorrow
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => navigate(createPageUrl(`JobDetail/${job.id}`))}>
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Completed Today */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Completed Today ({completedToday.length})</h2>
              {completedToday.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-slate-500">
                    No jobs completed yet today
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {completedToday.map(job => (
                    <Card key={job.id} className="border-l-4 border-l-green-600">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-slate-900">{job.property_address}</span>
                          <span className="text-sm text-slate-500">
                            completed at {format(new Date(job.completed_date), 'h:mm a')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Crew Status Sidebar */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Crew Status</h2>
            <div className="space-y-3">
              {crews.map(crew => (
                <Card key={crew.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900">{crew.crew_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        crew.status === 'available' ? 'bg-green-100 text-green-800' :
                        crew.status === 'on_job' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {crew.status === 'available' ? 'Available' :
                         crew.status === 'on_job' ? 'On Job' : 'Off Duty'}
                      </span>
                    </div>
                    {crew.current_job_id && (
                      <div className="text-sm text-slate-600">
                        Working on Job #{crew.current_job_id.slice(-6)}
                      </div>
                    )}
                    <div className="text-sm text-slate-500 mt-1">
                      Lead: {crew.crew_lead_name}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}