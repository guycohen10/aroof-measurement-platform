import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Calendar, User, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DispatchBoard() { 
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(true); 
  const [crews, setCrews] = useState([]); 
  const [jobs, setJobs] = useState([]); 
  const [dispatches, setDispatches] = useState([]);

  useEffect(() => { 
    const load = async () => { 
      try { 
        // Load Crews (Mock if empty) 
        let c = await base44.entities.Crew?.list().catch(()=>[]) || []; 
        if(c.length === 0) { 
          c = [ { id: 'c1', crew_name: 'Team Alpha', color_code: 'bg-blue-100' }, { id: 'c2', crew_name: 'Team Bravo', color_code: 'bg-green-100' } ]; 
        } 
        setCrews(c);

        // Load Sold Jobs
        const allJobs = await base44.entities.Job?.list().catch(()=>[]) || [];
        setJobs(allJobs.filter(j => j.stage === 'Sold'));
        
        // Load Dispatches
        const d = await base44.entities.Dispatch?.list().catch(()=>[]) || [];
        setDispatches(d);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading Dispatch Board...</div>;

  return (
    <div className="flex h-screen w-full bg-slate-50">
        {/* Sidebar for Jobs (Restored based on context) */}
        <div className="w-72 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-bold text-lg">Job Pool</h2>
                <p className="text-xs text-slate-500">{jobs.length} Unassigned</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {jobs.map(job => (
                    <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                            <div className="font-bold text-sm mb-1">{job.job_name || 'Roofing Job'}</div>
                            <div className="flex items-center text-xs text-slate-500 gap-1">
                                <MapPin className="w-3 h-3"/> {job.address || 'No Address'}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {jobs.length === 0 && <div className="text-center text-sm text-slate-400 mt-10">No jobs found</div>}
            </div>
        </div>

        {/* MAIN BOARD */}
        <div className="flex-1 flex flex-col">
            <div className="h-16 border-b bg-white flex items-center px-6 justify-between">
                <h1 className="font-bold text-lg flex items-center gap-2"><Calendar className="w-5 h-5"/> Crew Schedule</h1>
                <Button variant="outline" onClick={() => navigate('/rooferdashboard')}>Back to Dashboard</Button>
            </div>
            <div className="flex-1 overflow-x-auto p-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(crews.length, 1)}, minmax(300px, 1fr))` }}>
                    {crews.map(crew => (
                        <div key={crew.id} className="bg-white rounded-xl shadow-sm border flex flex-col h-[calc(100vh-140px)]">
                            <div className={`p-4 font-bold border-b flex justify-between items-center ${crew.color_code || 'bg-slate-100'}`}>
                                <span className="flex items-center gap-2"><User className="w-4 h-4"/> {crew.crew_name}</span>
                            </div>
                            <div className="flex-1 p-2 bg-slate-50 space-y-2 overflow-y-auto">
                                {dispatches.filter(d => d.crew_id === crew.id).map(d => (
                                    <Card key={d.id}>
                                        <CardContent className="p-3">
                                            <div className="font-bold text-sm">Scheduled Job</div>
                                            <div className="text-xs text-slate-500"><Clock className="w-3 h-3 inline mr-1"/>{new Date(d.scheduled_start).toLocaleDateString()}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <div className="h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm p-4 text-center">
                                    Drag Jobs Here (Coming Soon)
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  ); 
}