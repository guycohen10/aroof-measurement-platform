import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Search, MoreHorizontal, Trash2, Save, X, FileText, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STAGES = ['New Lead', 'Measured', 'Quote Sent', 'Sold', 'In Progress', 'Completed'];

export default function JobBoard() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null); // For Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load Jobs
    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.Job.list();
            // Client-side Sort: Newest First
            setJobs(data.sort((a,b) => (b.id || "").localeCompare(a.id || "")));
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => { fetchJobs(); }, []);

    // Actions
    const handleCardClick = (job) => {
        setSelectedJob({ ...job }); // Clone to edit
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if(!selectedJob) return;
        toast.loading("Updating...");
        try {
            await base44.entities.Job.update(selectedJob.id, {
                job_name: selectedJob.job_name,
                stage: selectedJob.stage,
                contract_price: Number(selectedJob.contract_price)
            });

            // If stage changed to 'Sold', maybe update Lead too? (Optional)
            
            toast.dismiss();
            toast.success("Job Updated");
            setIsModalOpen(false);
            fetchJobs(); // Refresh board
        } catch(e) {
            toast.dismiss();
            toast.error("Update failed");
        }
    };

    const handleDelete = async () => {
        if(!window.confirm("Are you sure you want to delete this job? This cannot be undone.")) return;
        toast.loading("Deleting...");
        try {
            await base44.entities.Job.delete(selectedJob.id);
            toast.dismiss();
            toast.success("Job Deleted");
            setIsModalOpen(false);
            fetchJobs();
        } catch(e) {
            toast.dismiss();
            toast.error("Delete failed");
        }
    };

    // Render Columns
    const renderColumn = (stageName, colorClass) => {
        const stageJobs = jobs.filter(j => j.stage === stageName || (stageName === 'New Lead' && !j.stage));

        return (
            <div className="flex-1 min-w-[300px] bg-slate-100/50 rounded-xl p-4 flex flex-col h-full border border-slate-200">
                <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${colorClass}`}>
                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{stageName}</h3>
                    <Badge variant="secondary" className="bg-white">{stageJobs.length}</Badge>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                    {stageJobs.map(job => (
                        <Card 
                            key={job.id} 
                            onClick={() => handleCardClick(job)}
                            className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group bg-white border-slate-200"
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-slate-900 leading-tight">{job.job_name}</div>
                                    {job.contract_price > 0 && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                                            ${job.contract_price.toLocaleString()}
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                                    <MapPin className="w-3 h-3"/> {job.address || 'No Address'}
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-400">
                                    <span>{new Date(job.created_at || Date.now()).toLocaleDateString()}</span>
                                    <MoreHorizontal className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {stageJobs.length === 0 && <div className="text-center text-slate-400 text-xs py-10 italic opacity-50">Empty</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
             <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Job Board</h1>
                    <p className="text-slate-500 text-sm">Manage your pipeline</p>
                </div>
                <Button onClick={() => navigate('/leadmanagement')} className="bg-blue-600">
                    <Plus className="w-4 h-4 mr-2"/> New Lead
                </Button>
            </div>

            {/* BOARD SCROLL AREA */}
            <div className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-6 h-full min-w-max">
                    {renderColumn('New Lead', 'border-blue-400')}
                    {renderColumn('Measured', 'border-purple-400')}
                    {renderColumn('Quote Sent', 'border-orange-400')}
                    {renderColumn('Sold', 'border-green-400')}
                    {renderColumn('In Progress', 'border-yellow-400')}
                    {renderColumn('Completed', 'border-slate-400')}
                </div>
            </div>
            {/* EDIT MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Job</DialogTitle>
                    </DialogHeader>
                    {selectedJob && (
                        <div className="space-y-4 py-2">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Job Name</label>
                                <Input 
                                    value={selectedJob.job_name} 
                                    onChange={e => setSelectedJob({...selectedJob, job_name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Stage</label>
                                    <Select 
                                        value={selectedJob.stage} 
                                        onValueChange={v => setSelectedJob({...selectedJob, stage: v})}
                                    >
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                                    <Input 
                                        type="number"
                                        value={selectedJob.contract_price} 
                                        onChange={e => setSelectedJob({...selectedJob, contract_price: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-2">
                                <Button className="flex-1 bg-blue-600" onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2"/> Save Changes
                                </Button>
                                <Button variant="destructive" size="icon" onClick={handleDelete}>
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}