import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DndContext, DragOverlay, useDroppable, closestCorners } from '@hello-pangea/dnd';
import { addDays, startOfWeek, format, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Truck, LayoutGrid, Calendar as CalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import JobCard from '@/components/dispatch/JobCard';
import JobBriefModal from '@/components/dispatch/JobBriefModal';

// --- Internal Droppable Cell Component ---
function CalendarCell({ date, crewId, children }) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const { setNodeRef, isOver } = useDroppable({
        id: `${crewId}::${dateStr}`,
        data: { crewId, date: dateStr }
    });

    return (
        <div 
            ref={setNodeRef} 
            className={`h-32 border-r border-b p-1 transition-colors ${isOver ? 'bg-blue-100' : ''}`}
        >
            {children}
        </div>
    );
}

function SidebarDroppable({ children }) {
    const { setNodeRef, isOver } = useDroppable({ id: 'pool' });
    return (
        <div ref={setNodeRef} className={`flex-1 p-4 ${isOver ? 'bg-slate-100' : ''}`}>
            {children}
        </div>
    );
}


export default function DispatchBoard() {
  // State
  const [currentDate, setCurrentDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [crews, setCrews] = useState([]);
  const [unassignedJobs, setUnassignedJobs] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [activeJob, setActiveJob] = useState(null); // For Drag Overlay
  const [selectedJob, setSelectedJob] = useState(null); // For Modal
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    try {
        const [crewsData, jobsData, dispatchesData] = await Promise.all([
            base44.entities.Crew.list(),
            base44.entities.Job.filter({ stage: 'Sold' }),
            base44.entities.Dispatch.list() // Ideally filter by date range, but fetching all for now for simplicity
        ]);
        
        // Active Crews Only
        setCrews(crewsData.filter(c => c.status === 'Active'));

        // Identify dispatched Job IDs
        const dispatchedJobIds = new Set(dispatchesData.map(d => d.job_id));
        
        // Unassigned = Sold Jobs NOT in dispatch list
        setUnassignedJobs(jobsData.filter(j => !dispatchedJobIds.has(j.id)));

        // Enrich dispatches with Job Data
        // We need to fetch the job details for each dispatch
        const fullDispatches = await Promise.all(dispatchesData.map(async (d) => {
             const job = jobsData.find(j => j.id === d.job_id) || await base44.entities.Job.get(d.job_id).catch(() => null);
             return { ...d, job };
        }));

        setDispatches(fullDispatches.filter(d => d.job));

    } catch (e) {
        console.error(e);
        toast.error("Failed to load dispatch data");
    } finally {
        setLoading(false);
    }
  };

  // Date Nav
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i));

  // Drag Handlers
  const handleDragStart = (event) => {
    setActiveJob(event.active.data.current.job);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const jobId = active.id;
    const sourcePool = !active.data.current.dispatchId; // If from sidebar
    
    // Dropped on Calendar Cell
    if (over.id.includes('::')) {
        const [crewId, dateStr] = over.id.split('::');
        
        // Calculate new times
        const start = `${dateStr}T08:00:00`;
        const end = `${dateStr}T17:00:00`;

        toast.loading("Scheduling...");

        try {
            if (sourcePool) {
                // CREATE DISPATCH
                const newDispatch = await base44.entities.Dispatch.create({
                    job_id: jobId,
                    crew_id: crewId,
                    scheduled_start: start,
                    scheduled_end: end,
                    status: 'Scheduled',
                    company_id: 'default' // Should be handled by backend usually
                });
                
                // UPDATE JOB STAGE
                await base44.entities.Job.update(jobId, { 
                    stage: 'Scheduled',
                    start_date: start,
                    end_date: end
                });

                // Update Local State
                const job = unassignedJobs.find(j => j.id === jobId);
                setUnassignedJobs(prev => prev.filter(j => j.id !== jobId));
                setDispatches(prev => [...prev, { ...newDispatch, job: { ...job, stage: 'Scheduled' } }]);
                toast.dismiss();
                toast.success("Job Dispatched");

            } else {
                // MOVE EXISTING DISPATCH
                const dispatchId = active.data.current.dispatchId;
                await base44.entities.Dispatch.update(dispatchId, {
                    crew_id: crewId,
                    scheduled_start: start,
                    scheduled_end: end
                });
                 // Update Job Dates too
                 await base44.entities.Job.update(jobId, { start_date: start, end_date: end });

                // Update Local State
                setDispatches(prev => prev.map(d => 
                    d.id === dispatchId ? { ...d, crew_id: crewId, scheduled_start: start, scheduled_end: end } : d
                ));
                toast.dismiss();
                toast.success("Rescheduled");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to schedule");
        }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
        {/* HEADER */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-slate-50">
            <div className="flex items-center gap-4">
                <Truck className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-800">Dispatch Command Center</h1>
            </div>
            <div className="flex items-center gap-4 bg-white p-1 rounded-lg border shadow-sm">
                <Button variant="ghost" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
                <div className="flex items-center gap-2 px-2 font-medium w-40 justify-center">
                    <CalIcon className="w-4 h-4 text-slate-500" />
                    {format(currentDate, 'MMM d')} - {format(addDays(currentDate, 6), 'MMM d')}
                </div>
                <Button variant="ghost" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
            </div>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR: POOL */}
                <div className="w-80 border-r flex flex-col bg-slate-50">
                    <div className="p-4 border-b flex items-center justify-between bg-white">
                        <h2 className="font-semibold flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-slate-500" /> Job Pool
                        </h2>
                        <Badge variant="secondary">{unassignedJobs.length}</Badge>
                    </div>
                    <ScrollArea className="flex-1">
                        <SidebarDroppable>
                            {unassignedJobs.map(job => (
                                <JobCard key={job.id} job={job} onClick={setSelectedJob} />
                            ))}
                            {unassignedJobs.length === 0 && (
                                <div className="text-center text-slate-400 text-sm mt-10">No unassigned jobs</div>
                            )}
                        </SidebarDroppable>
                    </ScrollArea>
                </div>

                {/* MAIN: CALENDAR */}
                <div className="flex-1 flex flex-col overflow-x-auto">
                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 border-b bg-white min-w-[1000px]">
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className={`p-3 text-center border-r last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}>
                                <div className="text-xs font-semibold text-slate-500 uppercase">{format(day, 'EEE')}</div>
                                <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-800'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Crew Lanes */}
                    <ScrollArea className="flex-1 min-w-[1000px]">
                        {crews.map(crew => (
                            <div key={crew.id} className="flex border-b min-h-[8rem]">
                                {/* Crew Header (Sticky-ish via logic or just layout) */}
                                <div className="w-0" /> {/* Hack for grid alignment if needed, but we use grid below */}
                                
                                <div className="grid grid-cols-7 flex-1">
                                    {weekDays.map(day => {
                                        // Find jobs for this cell
                                        const cellJobs = dispatches.filter(d => 
                                            d.crew_id === crew.id && 
                                            isSameDay(parseISO(d.scheduled_start), day)
                                        );

                                        return (
                                            <CalendarCell key={day.toISOString()} date={day} crewId={crew.id}>
                                                {/* Mobile/Crew Label Overlay on first cell or separate sidebar? 
                                                    Let's put crew name in background or separate column. 
                                                    Actually, user asked for Crew Lanes. Let's add a left column for names.
                                                */}
                                                {cellJobs.map(d => (
                                                    <JobCard 
                                                        key={d.job.id} 
                                                        job={{...d.job, dispatchId: d.id}} // Attach dispatch ID for identifying move
                                                        onClick={setSelectedJob}
                                                        isCompact
                                                    />
                                                ))}
                                            </CalendarCell>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {crews.length === 0 && !loading && (
                             <div className="text-center p-10 text-slate-500">No active crews found. Add crews in settings.</div>
                        )}
                    </ScrollArea>
                    
                    {/* Fixed Crew Column overlay for visual clarity if needed, or just let them scroll together. 
                        Better approach: Use a Grid with fixed first col.
                        Re-implementing layout slightly to show Crew Names on left.
                    */}
                </div>
                 {/* Crew Names Sidebar (Left of Calendar) */}
                 <div className="w-48 border-r bg-white flex flex-col pt-[calc(3.5rem+1px)] border-l"> {/* Offset for header height */}
                     <div className="h-[4.5rem] border-b bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs uppercase tracking-wider">
                         Crews
                     </div>
                     <ScrollArea className="flex-1">
                        {crews.map(crew => (
                            <div key={crew.id} className="h-32 border-b flex items-center px-4 gap-3 bg-slate-50/50">
                                <div className="w-3 h-12 rounded-full" style={{backgroundColor: crew.color_code || '#3b82f6'}} />
                                <div>
                                    <div className="font-bold text-sm text-slate-800">{crew.crew_name}</div>
                                    <div className="text-xs text-slate-500">{crew.foreman_name}</div>
                                </div>
                            </div>
                        ))}
                     </ScrollArea>
                 </div>
            </div>

            <DragOverlay>
                {activeJob ? (
                    <div className="w-64 opacity-90 rotate-3">
                        <JobCard job={activeJob} onClick={()=>{}} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>

        <JobBriefModal 
            job={selectedJob} 
            isOpen={!!selectedJob} 
            onClose={() => setSelectedJob(null)} 
        />
    </div>
  );
}