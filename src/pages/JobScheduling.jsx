import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";

export default function JobScheduling() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [jobs, setJobs] = useState([]);
  const [crews, setCrews] = useState([]);

  useEffect(() => {
    loadData();
  }, [currentMonth]);

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

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getJobsForDay = (day) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return isSameDay(jobDate, day);
    });
  };

  const getCrewColor = (crewId) => {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-pink-100'];
    const index = crews.findIndex(c => c.id === crewId);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const days = getDaysInMonth();
  const availableCrews = crews.filter(c => c.status === 'available');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Job Schedule</h1>
                <p className="text-blue-200 text-sm">{format(currentMonth, 'MMMM yyyy')}</p>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} variant="outline">
              ← Previous
            </Button>
            <Button onClick={() => setCurrentMonth(new Date())} variant="outline">
              Today
            </Button>
            <Button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} variant="outline">
              Next →
            </Button>
          </div>

          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule New Job
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold">Available Crews:</span>
              {crews.map(crew => (
                <span key={crew.id} className={`px-3 py-1 rounded ${
                  crew.status === 'available' ? 'bg-green-100 text-green-800' :
                  crew.status === 'on_job' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {crew.crew_name} {crew.status === 'available' ? '✓' : crew.status === 'on_job' ? '(Busy)' : '(Off)'}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-slate-700 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map(day => {
              const dayJobs = getJobsForDay(day);
              return (
                <div key={day.toString()} className="min-h-32 border-r border-b p-2 last:border-r-0">
                  <div className="font-semibold text-sm text-slate-700 mb-2">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayJobs.map(job => {
                      const crew = crews.find(c => c.id === job.crew_id);
                      return (
                        <div
                          key={job.id}
                          className={`text-xs p-2 rounded ${getCrewColor(job.crew_id)} cursor-pointer hover:shadow-md`}
                          onClick={() => navigate(createPageUrl(`JobDetail/${job.id}`))}
                        >
                          <div className="font-semibold">{crew?.crew_name || 'No Crew'}</div>
                          <div className="truncate">{job.property_address.split(',')[0]}</div>
                          {job.estimated_duration_days > 1 && (
                            <div className="text-xs text-slate-600">Day 1/{job.estimated_duration_days}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}