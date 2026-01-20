import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MapPin, Ruler, Calendar, Flame, AlertTriangle, TrendingUp, Briefcase } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function LeadPipelineView({ leads, onStatusChange, onLeadClick }) {
  const navigate = useNavigate();
  const columns = [
    { id: 'new', title: 'New', color: 'bg-blue-500' },
    { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500' },
    { id: 'quoted', title: 'Quoted', color: 'bg-purple-500' },
    { id: 'booked', title: 'Booked', color: 'bg-green-500' },
    { id: 'completed', title: 'Completed', color: 'bg-slate-500' }
  ];

  const getLeadsByStatus = (status) => {
    return leads.filter(lead => lead.lead_status === status);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getPriorityLabel = (priority) => {
    return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '';
  };

  const handleStartJob = async (lead, e) => {
    e.stopPropagation();
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Job.create({
        company_id: user.company_id,
        assigned_company_id: user.company_id,
        source_measurement_id: lead.id,
        customer_name: lead.customer_name || 'Unnamed Customer',
        customer_email: lead.customer_email,
        customer_phone: lead.customer_phone,
        property_address: lead.property_address,
        roof_sqft: lead.total_adjusted_sqft || lead.total_sqft,
        status: 'scheduled',
        scheduled_date: new Date().toISOString()
      });
      
      toast.success('Job created! Redirecting to Job Board...');
      setTimeout(() => navigate(createPageUrl('JobBoard')), 1000);
    } catch (err) {
      console.error('Failed to create job:', err);
      toast.error('Failed to create job');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const leadId = draggableId;

    onStatusChange(leadId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnLeads = getLeadsByStatus(column.id);
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} text-white px-4 py-3 rounded-t-lg font-bold text-center`}>
                {column.title} ({columnLeads.length})
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 bg-slate-100 rounded-b-lg p-3 space-y-3 min-h-[600px] ${
                      snapshot.isDraggingOver ? 'bg-slate-200' : ''
                    }`}
                  >
                    {columnLeads.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-pointer hover:shadow-lg transition-shadow ${
                              snapshot.isDragging ? 'shadow-2xl' : ''
                            }`}
                            onClick={() => onLeadClick(lead)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-slate-500" />
                                  <span className="font-bold text-sm text-slate-900 line-clamp-1">
                                    {lead.property_address?.split(',')[0] || 'Unknown'}
                                  </span>
                                </div>
                                {getPriorityIcon(lead.priority)}
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-1 text-slate-600">
                                  <Ruler className="w-3 h-3" />
                                  <span>{Math.round(lead.total_adjusted_sqft || lead.total_sqft || 0).toLocaleString()} sq ft</span>
                                </div>

                                {lead.customer_name && (
                                  <div className="text-slate-700 font-medium">
                                    {lead.customer_name}
                                  </div>
                                )}

                                <div className="flex items-center gap-1 text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(new Date(lead.created_date), 'MMM d')}</span>
                                </div>

                                {lead.priority && (
                                 <Badge className={`text-xs ${
                                   lead.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                   lead.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                   lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                   'bg-slate-100 text-slate-800'
                                 }`}>
                                   {getPriorityLabel(lead.priority)}
                                 </Badge>
                                )}

                                <Button 
                                 size="sm" 
                                 className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-xs"
                                 onClick={(e) => handleStartJob(lead, e)}
                                >
                                 <Briefcase className="w-3 h-3 mr-1" />
                                 Start Job
                                </Button>
                                </div>
                                </CardContent>
                                </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}