import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Briefcase, MapPin, Calendar, DollarSign, User, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';

const stages = [
  { id: 'new', label: 'New Lead', color: 'bg-slate-100' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-100' },
  { id: 'quoted', label: 'Estimate Sent', color: 'bg-purple-100' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-yellow-100' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-orange-100' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100' }
];

export default function JobBoard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.company_id) {
        toast.error('No company associated with your account');
        return;
      }

      // CRITICAL: Filter by assigned_company_id, NOT user_id
      const allMeasurements = await base44.entities.Measurement.list('-created_date', 100);
      const companyMeasurements = allMeasurements.filter(m => 
        m.assigned_company_id === currentUser.company_id ||
        m.purchased_by === currentUser.company_id ||
        m.company_id === currentUser.company_id
      );
      setMeasurements(companyMeasurements);

      // Load jobs for this company
      const allJobs = await base44.entities.Job.list('-created_date', 100);
      const companyJobs = allJobs.filter(j => 
        j.assigned_company_id === currentUser.company_id ||
        j.company_id === currentUser.company_id
      );
      setJobs(companyJobs);

      // Load employees for assignment
      const allUsers = await base44.entities.User.list();
      const companyEmployees = allUsers.filter(u => u.company_id === currentUser.company_id);
      setEmployees(companyEmployees);

      setLoading(false);
    } catch (err) {
      console.error('Error loading job board:', err);
      toast.error('Failed to load job board');
      setLoading(false);
    }
  };

  const getLeadsByStage = (stageId) => {
    // Map measurement lead_status to stages
    if (stageId === 'new') {
      return measurements.filter(m => !m.lead_status || m.lead_status === 'new');
    } else if (stageId === 'contacted') {
      return measurements.filter(m => m.lead_status === 'contacted');
    } else if (stageId === 'quoted') {
      return measurements.filter(m => m.lead_status === 'quoted');
    } else if (stageId === 'scheduled') {
      return jobs.filter(j => j.status === 'scheduled');
    } else if (stageId === 'in_progress') {
      return jobs.filter(j => j.status === 'in_progress');
    } else if (stageId === 'completed') {
      return jobs.filter(j => j.status === 'completed');
    }
    return [];
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleQuickAssign = async (itemId, userId, itemType, e) => {
    e.stopPropagation();
    try {
      if (itemType === 'job') {
        await base44.entities.Job.update(itemId, { assigned_to: userId });
      } else {
        await base44.entities.Measurement.update(itemId, { assigned_to: userId });
      }
      toast.success('Assigned successfully!');
      loadData();
    } catch (err) {
      console.error('Failed to assign:', err);
      toast.error('Failed to assign');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-blue-600" />
          Job Pipeline
        </h1>
        <p className="text-slate-600 mt-2">Visual workflow for all company leads and jobs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map(stage => {
          const items = getLeadsByStage(stage.id);
          
          return (
            <div key={stage.id} className="flex flex-col">
              <div className={`${stage.color} rounded-t-lg p-4 border-b-2 border-slate-300`}>
                <h3 className="font-bold text-slate-900">{stage.label}</h3>
                <p className="text-sm text-slate-600">{items.length} items</p>
              </div>
              
              <div className="bg-slate-100 rounded-b-lg p-2 space-y-2 min-h-[500px]">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-400">No items</p>
                  </div>
                ) : (
                  items.map(item => {
                    const isJob = item.job_type !== undefined;
                    
                    return (
                      <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick(item)}>
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <p className="font-bold text-sm text-slate-900 line-clamp-1">
                                {item.customer_name || 'Unnamed Customer'}
                              </p>
                              {item.priority === 'high' && (
                                <Badge className="bg-red-100 text-red-800 text-xs">High</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-2 font-medium">{item.property_address}</span>
                            </div>
                            
                            {isJob && item.scheduled_date && (
                              <div className="flex items-center gap-1 text-xs text-slate-600">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(item.scheduled_date), 'MMM d')}</span>
                              </div>
                            )}
                            
                            {item.quoted_amount && (
                              <div className="flex items-center gap-1 text-xs text-green-700 font-semibold">
                                <DollarSign className="w-3 h-3" />
                                <span>${item.quoted_amount.toLocaleString()}</span>
                              </div>
                            )}
                            
                            {item.total_sqft && (
                              <div className="text-xs text-slate-500">
                                {Math.round(item.total_sqft).toLocaleString()} sq ft
                              </div>
                            )}

                            <div className="pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                              <select 
                                className="w-full text-xs p-1.5 border rounded bg-white"
                                value={item.assigned_to || ''}
                                onChange={(e) => handleQuickAssign(item.id, e.target.value, isJob ? 'job' : 'lead', e)}
                              >
                                <option value="">Assign to...</option>
                                {employees.map(emp => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.full_name || emp.email}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Customer Name</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {selectedItem.customer_name || 'Unnamed Customer'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Property Address</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedItem.property_address}
                  </p>
                </div>
              </div>

              {selectedItem.customer_email && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Email</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedItem.customer_email}
                  </p>
                </div>
              )}

              {selectedItem.customer_phone && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Phone</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedItem.customer_phone}
                  </p>
                </div>
              )}

              {selectedItem.total_sqft && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Roof Area</p>
                  <p className="font-semibold text-slate-900">
                    {Math.round(selectedItem.total_sqft).toLocaleString()} sq ft
                  </p>
                </div>
              )}

              {selectedItem.quoted_amount && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Quoted Amount</p>
                  <p className="font-semibold text-green-700 text-xl">
                    ${selectedItem.quoted_amount.toLocaleString()}
                  </p>
                </div>
              )}

              {selectedItem.scheduled_date && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Scheduled Date</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedItem.scheduled_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}