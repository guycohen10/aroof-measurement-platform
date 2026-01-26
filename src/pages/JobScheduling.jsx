import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Calendar as CalIcon, User, MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function JobScheduling() {
    const navigate = useNavigate();
    const [crews, setCrews] = useState([]);
    const [unscheduledJobs, setUnscheduledJobs] = useState([]);
    const [allJobsCache, setAllJobsCache] = useState([]);
    const [dispatches, setDispatches] = useState([]);
    const [dates, setDates] = useState([]);
    const [draggedJob, setDraggedJob] = useState(null);

    // 1. INIT & LOAD
    useEffect(() => {
        const init = async () => {
            // Generate next 5 days
            const d = [];
            for(let i=0; i<5; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                d.push(date);
            }
            setDates(d);

            try {
                // 1. Load Crews (Seed if empty)
                let c = await base44.entities.Crew?.list().catch(()=>[]) || [];
                if(c.length === 0) {
                    await Promise.all([
                        base44.entities.Crew.create({ crew_name: 'Team Alpha', color_code: 'bg-blue-100', status: 'Active' }),
                        base44.entities.Crew.create({ crew_name: 'Team Bravo', color_code: 'bg-green-100', status: 'Active' }),
                        base44.entities.Crew.create({ crew_name: 'Repair Unit', color_code: 'bg-orange-100', status: 'Active' })
                    ]);
                    c = await base44.entities.Crew.list();
                }
                setCrews(c);

                // 2. Load Jobs & Dispatches
                const allJobs = await base44.entities.Job.list();
                setAllJobsCache(allJobs);
                const allDisp = await base44.entities.Dispatch?.list().catch(()=>[]) || [];
                setDispatches(allDisp);
                
                // 3. Filter: Show 'Sold' AND 'Quote Sent' jobs that aren't scheduled
                const scheduledIds = allDisp.map(d => d.job_id);
                const pending = allJobs.filter(j => 
                    (j.stage === 'Sold' || j.stage === 'Quote Sent') && 
                    !scheduledIds.includes(j.id)
                );
                setUnscheduledJobs(pending);
                
            } catch(e) { console.error("Load Error:", e); }
        };
        init();
    }, []);

    // 2. DRAG HANDLERS
    const handleDragStart = (e, job) => {
        setDraggedJob(job);
        e.dataTransfer.setData('jobId', job.id);
    };

    const handleDrop = async (e, crewId, dateObj) => {
        e.preventDefault();
        const jobId = e.dataTransfer.getData('jobId');
        if(!jobId) return;

        // Optimistic UI Update
        const job = unscheduledJobs.find(j => j.id === jobId) || draggedJob;
        if(!job) return;

        const dateStr = dateObj.toISOString();
        setUnscheduledJobs(prev => prev.filter(j => j.id !== jobId));
        
        const tempDispatch = { 
            id: 'temp_'+Date.now(), 
            job_id: jobId, 
            crew_id: crewId, 
            scheduled_start: dateStr,
            job_snapshot: job 
        };
        setDispatches(prev => [...prev, tempDispatch]);

        // Database Save
        try {
            await base44.entities.Dispatch.create({
                job_id: jobId,
                crew_id: crewId,
                scheduled_start: dateStr,
                status: 'Scheduled'
            });
            toast.success(`Job Assigned to Crew`);
        } catch(e) {
            toast.error("Failed to schedule");
            console.error(e);
        }
        setDraggedJob(null);
    };

    const getJobForCell = (crewId, dateObj) => {
        return dispatches.find(d => 
            d.crew_id === crewId && 
            new Date(d.scheduled_start).toDateString() === dateObj.toDateString() 
        );
    };

    const getDispatchJobDetails = (dispatch) => {
        if (dispatch.job_snapshot) return dispatch.job_snapshot;
        return allJobsCache.find(j => j.id === dispatch.job_id);
    };

    // 3. RENDER
    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* SIDEBAR: Unscheduled Jobs */}
            <div className="w-80 bg-white border-r flex flex-col shadow-xl z-20">
                <div className="p-4 border-b bg-slate-50">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-slate-500">
                        <ArrowLeft className="w-4 h-4 mr-1"/> Back
                    </Button>
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600"/> Job Pool
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">{unscheduledJobs.length} jobs ready to schedule</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {unscheduledJobs.length === 0 && (
                        <div className="text-center py-10 text-slate-400 text-sm">No jobs available</div>
                    )}
                    {unscheduledJobs.map(job => (
                        <Card 
                            key={job.id}
                            draggable 
                            onDragStart={(e) => handleDragStart(e, job)}
                            className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing border-l-4 border-l-blue-500"
                        >
                            <CardContent className="p-3">
                                <div className="font-bold text-slate-800 mb-1">{job.job_name || 'Roof Replacement'}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                                    <MapPin className="w-3 h-3"/> {job.address || 'No Address'}
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {job.stage}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* CALENDAR BOARD */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="h-16 bg-white border-b flex items-center px-6 justify-between">
                    <h1 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                        <CalIcon className="w-5 h-5 text-blue-600"/> Dispatch Schedule
                    </h1>
                </div>
                
                {/* HEADER ROW (DATES) */}
                <div className="flex border-b bg-slate-50">
                    <div className="w-40 flex-shrink-0 p-4 font-bold text-slate-400 text-xs uppercase tracking-wider border-r bg-slate-100">Crew Name</div>
                    {dates.map((date, i) => (
                        <div key={i} className="flex-1 p-3 text-center border-r last:border-r-0">
                            <div className="font-black text-slate-700">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div className="text-xs text-slate-400">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                    ))}
                </div>

                {/* CREW ROWS */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50">
                    {crews.map(crew => (
                        <div key={crew.id} className="flex border-b min-h-[140px] bg-white">
                            {/* Crew Header */}
                            <div className={`w-40 flex-shrink-0 p-4 border-r flex flex-col justify-center ${crew.color_code || 'bg-slate-100'}`}>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <User className="w-4 h-4 opacity-50"/> {crew.crew_name}
                                </div>
                            </div>
                            {/* Drop Zones */}
                            {dates.map((date, i) => {
                                const dispatch = getJobForCell(crew.id, date);
                                const jobInfo = dispatch ? getDispatchJobDetails(dispatch) : null;
                                
                                return (
                                    <div 
                                        key={i} 
                                        className={`flex-1 border-r last:border-r-0 p-2 transition-colors relative ${draggedJob ? 'bg-blue-50/50 hover:bg-blue-100' : 'bg-white'}`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => handleDrop(e, crew.id, date)}
                                    >
                                        {dispatch ? (
                                            <Card className="h-full bg-slate-800 text-white shadow-lg border-0 overflow-hidden">
                                                <CardContent className="p-3 flex flex-col justify-between h-full">
                                                    <div>
                                                        <div className="text-[10px] font-bold text-blue-300 uppercase mb-1">Scheduled</div>
                                                        <div className="font-bold text-xs leading-tight line-clamp-2">
                                                            {jobInfo?.job_name || `Job #${dispatch.job_id.slice(-4)}`}
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 truncate mt-2 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3"/> {jobInfo?.address || 'No Address'}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}