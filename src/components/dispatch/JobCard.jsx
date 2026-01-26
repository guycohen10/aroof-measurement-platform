import React from 'react';
import { useDraggable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { MapPin, Hammer } from 'lucide-react';

export default function JobCard({ job, onClick, isCompact = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
    data: { job }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  const stageColors = {
    'Scheduled': 'border-l-blue-500 bg-blue-50',
    'In Progress': 'border-l-yellow-500 bg-yellow-50',
    'Complete': 'border-l-green-500 bg-green-50',
    'Sold': 'border-l-slate-500 bg-white'
  };

  const statusColor = stageColors[job.stage] || stageColors['Sold'];

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none mb-2">
      <Card 
        className={`p-2 text-xs shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-l-4 ${statusColor} ${isDragging ? 'opacity-50' : ''}`}
        onClick={() => onClick(job)}
      >
        <div className="font-bold truncate text-slate-800">{job.job_name || 'Job #' + job.id.slice(0,6)}</div>
        {!isCompact && (
            <div className="flex items-center gap-1 text-slate-500 mt-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{job.address}</span>
            </div>
        )}
        {isCompact && (
            <div className="mt-1 text-[10px] text-slate-500 flex justify-between">
                <span>{job.address?.split(',')[0]}</span>
            </div>
        )}
      </Card>
    </div>
  );
}