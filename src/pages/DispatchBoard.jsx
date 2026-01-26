import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { addDays, startOfWeek, format, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Truck, LayoutGrid, Calendar as CalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import JobCard from '@/components/dispatch/JobCard';
import JobBriefModal from '@/components/dispatch/JobBriefModal';

// --- Internal Droppable Cell Component ---
function CalendarCell({ date, crewId, children }) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const droppableId = `${crewId}::${dateStr}`;
    
    return (
        <Droppable droppableId={droppableId}>
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`h-32 border-r border-b p-1 transition-colors overflow-y-auto ${snapshot.isDraggingOver ? 'bg-blue-100' : ''}`}
                >
                    {children}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
}

function SidebarDroppable({ children }) {
    return (
        <Droppable droppableId="pool">
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-slate-100' : ''}`}
                >
                    {children}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
}


export default function DispatchBoard() {
  // State
  const [currentDate, setCurrentDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [crews, setCrews] = useState([]);
  const [unassignedJobs, setUnassignedJobs] = useState([]);
  const [dispatches, setDispatches] = useState([]);
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
            base44.entities.Dispatch.list() 
        ]);
        
        setCrews(crewsData.filter(c => c.status === 'Active'));

        // Identify dispatched Job IDs
        const dispatchedJobIds = new Set(dispatchesData.map(d => d.job_id));
        
        // Unassigned = Sold Jobs NOT in dispatch list
        setUnassignedJobs(jobsData.filter(j => !dispatchedJobIds.has(j.id)));

        // Enrich dispatches with Job Data
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
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside
    if (!destination) return;

    // Dropped in same place
    if (source.droppableId === destination.droppableId) return;

    // Logic
    const jobId = draggableId;
    const isSourcePool = source.droppableId === 'pool';
    const isDestPool = destination.droppableId === 'pool';

    // 1. Pool -> Calendar (Schedule)
    if (isSourcePool && !isDestPool) {
        const [crewId, dateStr] = destination.droppableId.split('::');
        const start = `${dateStr}T08:00:00`;
        const end = `${dateStr}T17:00:00`;

        toast.loading("Scheduling...");
        try {
            // Optimistic UI Update
            const jobToMove = unassignedJobs.find(j => j.id === jobId);
            
            // Create Dispatch
            const newDispatch = await base44.entities.Dispatch.create({
                job_id: jobId,
                crew_id: crewId,
                scheduled_start: start,
                scheduled_end: end,
                status: 'Scheduled',
                company_id: 'default'
            });

            // Update Job
            await base44.entities.Job.update(jobId, { 
                stage: 'Scheduled',
                start_date: start,
                end_date: end
            });

            // Update State
            setUnassignedJobs(prev => prev.filter(j => j.id !== jobId));
            setDispatches(prev => [...prev, { ...newDispatch, job: { ...jobToMove, stage: 'Scheduled' } }]);
            toast.dismiss();
            toast.success("Job Scheduled");
        } catch(e) {
            console.error(e);
            toast.error("Failed to schedule");
            loadData(); // Revert on error
        }
    }

    // 2. Calendar -> Calendar (Reschedule)
    else if (!isSourcePool && !isDestPool) {
        const [crewId, dateStr] = destination.droppableId.split('::');
        const start = `${dateStr}T08:00:00`;
        const end = `${dateStr}T17:00:00`;
        
        // Find existing dispatch
        const dispatch = dispatches.find(d => d.job.id === jobId);
        if(!dispatch) return;

        toast.loading("Rescheduling...");
        try {
             // Update Dispatch
             await base44.entities.Dispatch.update(dispatch.id, {
                crew_id: crewId,
                scheduled_start: start,
                scheduled_end: end
            });
            // Update Job
            await base44.entities.Job.update(jobId, { start_date: start, end_date: end });

            // Update State
            setDispatches(prev => prev.map(d => 
                d.id === dispatch.id ? { ...d, crew_id: crewId, scheduled_start: start, scheduled_end: end } : d
            ));
            toast.dismiss();
            toast.success("Rescheduled");
        } catch(e) {
            console.error(e);
            toast.error("Failed to move");
        }
    }

    // 3. Calendar -> Pool (Unschedule)
    else if (!isSourcePool && isDestPool) {
         const dispatch = dispatches.find(d => d.job.id === jobId);
         if(!dispatch) return;

         toast.loading("Unscheduling...");
         try {
             await base44.entities.Dispatch.delete(dispatch.id);
             await base44.entities.Job.update(jobId, { stage: 'Sold', start_date: null, end_date: null });

             setDispatches(prev => prev.filter(d => d.id !== dispatch.id));
             setUnassignedJobs(prev => [...prev, { ...dispatch.job, stage: 'Sold' }]);
             toast.dismiss();
             toast.success("Job returned to pool");
         } catch(e) {
             console.error(e);
             toast.error("Failed to unschedule");
         }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
                            {unassignedJobs.map((job, index) => (
                                <JobCard key={job.id} job={job} index={index} onClick={setSelectedJob} />
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
                                <div className="grid grid-cols-7 flex-1">
                                    {weekDays.map(day => {
                                        const cellJobs = dispatches.filter(d => 
                                            d.crew_id === crew.id && 
                                            isSameDay(parseISO(d.scheduled_start), day)
                                        );

                                        return (
                                            <CalendarCell key={day.toISOString()} date={day} crewId={crew.id}>
                                                {cellJobs.map((d, index) => (
                                                    <JobCard 
                                                        key={d.job.id} 
                                                        job={{...d.job, dispatchId: d.id}} 
                                                        index={index}
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
                </div>
                 {/* Crew Names Sidebar (Left of Calendar) */}
                 <div className="w-48 border-r bg-white flex flex-col pt-[calc(3.5rem+1px)] border-l shadow-lg z-10"> 
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

            <JobBriefModal 
                job={selectedJob} 
                isOpen={!!selectedJob} 
                onClose={() => setSelectedJob(null)} 
            />
        </div>
    </DragDropContext>
  );
}