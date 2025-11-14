import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Phone,
  MapPin,
  Filter,
  Download,
  Play,
  Loader2,
  Home,
  LogOut,
  TrendingUp,
  Settings
} from "lucide-react";
import { format, isToday, startOfDay, endOfDay } from "date-fns";

export default function DispatchDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [crews, setCrews] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");
  const [crewFilter, setCrewFilter] = useState("all");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Check access
      if (currentUser.aroof_role !== 'dispatcher' && currentUser.role !== 'admin') {
        alert('Access denied. Dispatcher access required.');
        navigate(createPageUrl("Homepage"));
        return;
      }

      setUser(currentUser);

      // Load jobs and crews
      const [allJobs, allCrews] = await Promise.all([
        base44.entities.Job.list('-created_date'),
        base44.entities.Crew.list()
      ]);

      setJobs(allJobs);
      setCrews(allCrews);
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      alert('Failed to load dashboard');
      navigate(createPageUrl("Homepage"));
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl("Homepage"));
  };

  const getTodayJobs = () => {
    const today = new Date();
    return jobs.filter(job => {
      if (!job.scheduled_start_date) return false;
      const jobDate = new Date(job.scheduled_start_date);
      return isToday(jobDate);
    });
  };

  const getStats = () => {
    const todayJobs = getTodayJobs();
    const inProgress = jobs.filter(j => j.status === 'in_progress').length;
    const completedThisWeek = jobs.filter(j => {
      if (j.status !== 'completed' || !j.actual_end_date) return false;
      const endDate = new Date(j.actual_end_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return endDate >= weekAgo;
    }).length;

    return {
      today: todayJobs.length,
      inProgress,
      completedThisWeek
    };
  };

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

  const getPriorityColor = (priority) => {
    return priority === 'urgent' 
      ? 'bg-red-500 text-white' 
      : 'bg-blue-500 text-white';
  };

  const handleStartJob = async (job) => {
    try {
      await base44.entities.Job.update(job.id, {
        status: 'in_progress',
        actual_start_date: new Date().toISOString(),
        timeline: [
          ...(job.timeline || []),
          {
            action: 'job_started',
            description: 'Job started',
            user: user.email,
            timestamp: new Date().toISOString()
          }
        ]
      });
      await loadDashboardData();
      alert('✅ Job started!');
    } catch (err) {
      console.error('Error starting job:', err);
      alert('Failed to start job');
    }
  };

  const handleCompleteJob = async (job) => {
    const confirm = window.confirm('Mark this job as completed?');
    if (!confirm) return;

    try {
      await base44.entities.Job.update(job.id, {
        status: 'completed',
        actual_end_date: new Date().toISOString(),
        completion_percentage: 100,
        timeline: [
          ...(job.timeline || []),
          {
            action: 'job_completed',
            description: 'Job marked as completed',
            user: user.email,
            timestamp: new Date().toISOString()
          }
        ]
      });
      await loadDashboardData();
      alert('✅ Job completed!');
    } catch (err) {
      console.error('Error completing job:', err);
      alert('Failed to complete job');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dispatch dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const todayJobs = getTodayJobs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dispatch Dashboard</h1>
                <p className="text-sm text-slate-600">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {user?.full_name || user?.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Jobs Today</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.today}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">In Progress</p>
                    <p className="text-3xl font-bold text-yellow-900">{stats.inProgress}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Completed This Week</p>
                    <p className="text-3xl font-bold text-green-900">{stats.completedThisWeek}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="today">Today's Schedule</TabsTrigger>
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="crews">Crew Management</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          {/* TODAY'S SCHEDULE TAB */}
          <TabsContent value="today" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Today's Jobs ({todayJobs.length})
              </h2>
              <Link to={createPageUrl("CreateJob")}>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Job
                </Button>
              </Link>
            </div>

            {todayJobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">No jobs scheduled for today</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {todayJobs.map(job => (
                  <Card 
                    key={job.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(createPageUrl(`DispatchJobDetail?jobId=${job.id}`))}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge className={getPriorityColor(job.priority)}>
                            {job.priority?.toUpperCase()}
                          </Badge>
                          <span className="font-mono text-sm text-slate-600">
                            {job.job_number}
                          </span>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Property Address</p>
                          <p className="font-semibold text-slate-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {job.property_address}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Customer</p>
                          <p className="font-semibold text-slate-900 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {job.customer_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>🏗️ {job.total_area_sqft?.toLocaleString()} sq ft</span>
                          <span>👥 Crew: {job.crew_size || 0}</span>
                          <span>💰 ${job.job_value?.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {job.status === 'scheduled' && (
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStartJob(job)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start Job
                            </Button>
                          )}
                          {job.status === 'in_progress' && (
                            <Button 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleCompleteJob(job)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ALL JOBS TAB */}
          <TabsContent value="all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                All Jobs ({jobs.length})
              </h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Link to={createPageUrl("CreateJob")}>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Job
                  </Button>
                </Link>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-slate-700">Job #</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Date</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Address</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Customer</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Value</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Progress</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.slice(0, 20).map(job => (
                        <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4">
                            <span className="font-mono text-sm">{job.job_number}</span>
                          </td>
                          <td className="p-4 text-sm">
                            {job.scheduled_start_date 
                              ? format(new Date(job.scheduled_start_date), 'MMM d, yyyy')
                              : 'Not scheduled'
                            }
                          </td>
                          <td className="p-4 text-sm">{job.property_address}</td>
                          <td className="p-4 text-sm">{job.customer_name}</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(job.status)}>
                              {job.status?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm font-semibold">
                            ${job.job_value?.toLocaleString()}
                          </td>
                          <td className="p-4 text-sm">
                            {job.completion_percentage || 0}%
                          </td>
                          <td className="p-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(createPageUrl(`DispatchJobDetail?jobId=${job.id}`))}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CREWS TAB */}
          <TabsContent value="crews">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Crew Management ({crews.length} crews)
              </h2>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Crew
              </Button>
            </div>

            {crews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg mb-4">No crews created yet</p>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Crew
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crews.map(crew => (
                  <Card key={crew.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{crew.crew_name}</span>
                        <Badge className={
                          crew.availability_status === 'available' ? 'bg-green-100 text-green-800' :
                          crew.availability_status === 'busy' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {crew.availability_status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-600">Crew Lead</p>
                          <p className="font-semibold text-slate-900">
                            {crew.crew_lead_id || 'Not assigned'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Team Size</p>
                          <p className="font-semibold text-slate-900">
                            {crew.crew_member_ids?.length || 0} members
                          </p>
                        </div>
                        {crew.specialties && crew.specialties.length > 0 && (
                          <div>
                            <p className="text-sm text-slate-600 mb-2">Specialties</p>
                            <div className="flex flex-wrap gap-2">
                              {crew.specialties.map((spec, idx) => (
                                <Badge key={idx} variant="outline">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CALENDAR TAB */}
          <TabsContent value="calendar">
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg mb-2">Calendar View</p>
                <p className="text-sm text-slate-500">
                  Coming soon - visual calendar with drag & drop scheduling
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}