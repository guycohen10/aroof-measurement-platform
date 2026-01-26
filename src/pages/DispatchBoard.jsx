import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Calendar as CalIcon, User, MapPin, Briefcase, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DispatchBoard() {
    const navigate = useNavigate();
    const [crews, setCrews] = useState([]);
    const [unscheduledJobs, setUnscheduledJobs] = useState([]);
    const [dispatches, setDispatches] = useState([]);
    const [dates, setDates] = useState([]);
    const [draggedJob, setDraggedJob] = useState(null);
    const [allJobs, setAllJobs] = useState([]);

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
                // Load Crews (Seed if empty)
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
                
                // Load Jobs & Dispatches
                const jobsList = await base44.entities.Job.list();
                setAllJobs(jobsList);

                const allDisp = await base44.entities.Dispatch?.list().catch(()=>[]) || [];
                setDispatches(allDisp);
                
                // Filter Unscheduled: Sold jobs that are NOT in the dispatch list
                const scheduledIds = allDisp.map(d => d.job_id);
                const pending = jobsList.filter(j => j.stage === 'Sold' && !scheduledIds.includes(j.id));
                setUnscheduledJobs(pending);
                
            } catch(e) { console.error(e); }
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

        // Optimistic Update
        const job = allJobs.find(j => j.id === jobId);
        if(!job) return; 

        const dateStr = dateObj.toISOString();
        
        // Remove from pool
        setUnscheduledJobs(prev => prev.filter(j => j.id !== jobId));
        
        // Add temp dispatch to UI
        const tempDispatch = { 
            id: 'temp_'+Date.now(), 
            job_id: jobId, 
            crew_id: crewId, 
            scheduled_start: dateStr,
            job_snapshot: job // Store for display
        };
        setDispatches(prev => [...prev, tempDispatch]);
        
        // Save to DB
        try {
            await base44.entities.Dispatch.create({
                job_id: jobId,
                crew_id: crewId,
                scheduled_start: dateStr,
                status: 'Scheduled'
            });
            toast.success(`Assigned to Crew`);
        } catch(e) {
            toast.error("Failed to schedule");
            // Revert on fail (Reload logic omitted for brevity)
        }
        setDraggedJob(null);
    };

    const getJobForCell = (crewId, dateObj) => {
        return dispatches.find(d => 
            d.crew_id === crewId && 
            new Date(d.scheduled_start).toDateString() === dateObj.toDateString()
        );
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* SIDEBAR: Unscheduled Jobs */}
            <div className="w-80 bg-white border-r flex flex-col shadow-xl z-10">
                <div className="p-4 border-b bg-slate-50">
                    <h2 className="font-black text-slate-800 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-slate-500"/> Unassigned Jobs
                    </h2>
                    <div className="text-xs text-slate-400 mt-1">{unscheduledJobs.length} jobs pending schedule</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {unscheduledJobs.length === 0 && (
                        <div className="text-center py-10 text-slate-400 text-sm">No pending jobs found.</div>
                    )}
                    {unscheduledJobs.map(job => (
                        <div 
                            key={job.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, job)}
                            className="bg-white p-4 rounded-xl border shadow-sm cursor-grab hover:shadow-md hover:border-blue-300 transition-all active:cursor-grabbing group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-slate-800 text-sm line-clamp-1">{job.job_name || 'Roofing Job'}</div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500"/>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                                <MapPin className="w-3 h-3"/> <span className="truncate">{job.address || 'No Address'}</span>
                            </div>
                            <div className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                READY FOR INSTALL
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => navigate('/rooferdashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard
                    </Button>
                </div>
            </div>

            {/* CALENDAR BOARD */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="h-16 bg-white border-b flex items-center px-6 justify-between">
                    <h1 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                        <CalIcon className="w-5 h-5 text-blue-600"/> Dispatch Schedule
                    </h1>
                    <div className="text-xs text-slate-400 hidden md:block">Drag jobs from the sidebar to assign crews</div>
                </div>
                
                {/* HEADER ROW (DATES) */}
                <div className="flex border-b bg-slate-50 overflow-hidden">
                    <div className="w-40 flex-shrink-0 p-4 font-bold text-slate-400 text-xs uppercase tracking-wider border-r bg-slate-100">Crew Name</div>
                    {dates.map((date, i) => (
                        <div key={i} className="flex-1 p-3 text-center border-r last:border-r-0 min-w-[120px]">
                            <div className="font-black text-slate-700">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div className="text-xs text-slate-400">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                    ))}
                </div>

                {/* CREW ROWS */}
                <div className="flex-1 overflow-y-auto">
                    {crews.map(crew => (
                        <div key={crew.id} className="flex border-b min-h-[140px]">
                            {/* Crew Header */}
                            <div className={`w-40 flex-shrink-0 p-4 border-r flex flex-col justify-center ${crew.color_code || 'bg-slate-50'}`}>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <User className="w-4 h-4 opacity-50"/> {crew.crew_name}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Active Crew</div>
                            </div>
                            
                            {/* Drop Zones */}
                            {dates.map((date, i) => {
                                const dispatch = getJobForCell(crew.id, date);
                                // Resolve job details
                                const jobDetails = dispatch ? allJobs.find(j => j.id === dispatch.job_id) || dispatch.job_snapshot : null;
                                
                                return (
                                    <div 
                                        key={i} 
                                        className={`flex-1 border-r last:border-r-0 p-2 transition-colors relative min-w-[120px] ${draggedJob ? 'bg-blue-50/30 hover:bg-blue-100' : 'bg-white'}`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => handleDrop(e, crew.id, date)}
                                    >
                                        {dispatch ? (
                                            <Card className="h-full bg-slate-800 text-white shadow-lg border-0 animate-in zoom-in duration-200 overflow-hidden">
                                                <CardContent className="p-3 flex flex-col justify-center h-full">
                                                    <div className="text-[10px] font-bold text-blue-300 uppercase mb-1 truncate">Scheduled</div>
                                                    <div className="font-bold text-sm leading-tight mb-2 line-clamp-2">
                                                        {jobDetails?.job_name || 'Job Assigned'}
                                                    </div>
                                                    <div className="mt-auto">
                                                        <Button size="sm" variant="secondary" className="h-6 text-[10px] w-full bg-slate-700 text-white hover:bg-slate-600 border-0">
                                                            View
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                 {draggedJob && (
                                                     <div className="text-blue-400 text-xs font-medium dashed-border px-3 py-1 rounded-full border-2 border-dashed border-blue-300 bg-blue-50">
                                                         Drop Here
                                                     </div>
                                                 )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {crews.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            Loading crews...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}