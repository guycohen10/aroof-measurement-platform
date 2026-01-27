import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Plus, Search, Filter, ArrowUpDown, 
  MoreHorizontal, MapPin, Calendar, DollarSign, Trash2, 
  Save, X, Phone, Mail, LayoutGrid, List as ListIcon, Settings, Bell, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const STAGES = ['New Lead', 'Measured', 'Quote Sent', 'Sold', 'In Progress', 'Completed'];

export default function JobBoard() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [viewMode, setViewMode] = useState('board');
    const [search, setSearch] = useState('');
    const [filterStage, setFilterStage] = useState('All');
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draggedJob, setDraggedJob] = useState(null);

    // 1. DATA LOADING
    const fetchJobs = async () => {
        try {
            const data = await base44.entities.Job.list();
            const companyId = localStorage.getItem('company_id');
            const myJobs = companyId ? data.filter(j => j.company_id === companyId) : data;

            // Sort Newest First by default
            const sorted = myJobs.sort((a,b) => (b.id || "").localeCompare(a.id || ""));
            setJobs(sorted);
            applyFilters(sorted, search, filterStage);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    // 2. FILTERS & SEARCH
    const applyFilters = (data, q, stage) => {
        let res = data;
        if (stage !== 'All') res = res.filter(j => j.stage === stage);
        if (q) {
            const lower = q.toLowerCase();
            res = res.filter(j => 
                j.job_name?.toLowerCase().includes(lower) || 
                j.address?.toLowerCase().includes(lower) ||
                j.customer_phone?.toLowerCase().includes(lower)
            );
        }
        setFilteredJobs(res);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        applyFilters(jobs, e.target.value, filterStage);
    };

    const handleStageFilter = (val) => {
        setFilterStage(val);
        applyFilters(jobs, search, val);
    };

    // 3. ACTIONS (Edit/Delete/Move)
    const handleEdit = (job) => {
        setSelectedJob({ ...job });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        toast.loading("Saving...");
        try {
            await base44.entities.Job.update(selectedJob.id, {
                job_name: selectedJob.job_name,
                stage: selectedJob.stage,
                contract_price: Number(selectedJob.contract_price)
            });
            // Optional: If 'Sold', sync Lead status
            if(selectedJob.stage === 'Sold' && selectedJob.customer_id) {
                try {
                    await base44.entities.Lead.update(selectedJob.customer_id, { lead_status: 'Sold' });
                } catch(err) { console.log('Lead update skipped'); }
            }
            toast.dismiss();
            toast.success("Saved");
            setIsModalOpen(false);
            fetchJobs();
        } catch(e) {
            toast.dismiss();
            toast.error("Error saving");
        }
    };

    const handleDelete = async () => {
        if(!window.confirm("Permanently delete this project?")) return;
        try {
            await base44.entities.Job.delete(selectedJob.id);
            toast.success("Project Deleted");
            setIsModalOpen(false);
            fetchJobs();
        } catch(e) {
            toast.error("Delete failed");
        }
    };

    // 4. DRAG AND DROP LOGIC
    const onDragStart = (e, job) => {
        setDraggedJob(job);
        e.dataTransfer.setData('jobId', job.id);
    };

    const onDrop = async (e, newStage) => {
        e.preventDefault();
        if(!draggedJob) return;
        if(draggedJob.stage === newStage) return;

        // Optimistic Update
        const updated = { ...draggedJob, stage: newStage };
        const newJobs = jobs.map(j => j.id === draggedJob.id ? updated : j);
        setJobs(newJobs);
        applyFilters(newJobs, search, filterStage);
        
        try {
            await base44.entities.Job.update(draggedJob.id, { stage: newStage });
            toast.success(`Moved to ${newStage}`);
        } catch(e) {
            toast.error("Move failed");
            fetchJobs(); // Revert
        }
        setDraggedJob(null);
    };

    // 5. RENDER BOARD
    const renderColumn = (stage) => {
        const items = filteredJobs.filter(j => j.stage === stage || (stage === 'New Lead' && !j.stage));
        const colorMap = {
            'New Lead': 'bg-blue-500',
            'Measured': 'bg-purple-500',
            'Quote Sent': 'bg-orange-500',
            'Sold': 'bg-green-500',
            'In Progress': 'bg-yellow-500',
            'Completed': 'bg-slate-500'
        };

        return (
            <div 
                key={stage}
                className="flex-1 min-w-[320px] bg-slate-100/50 rounded-xl flex flex-col h-full border border-slate-200"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, stage)}
            >
                <div className="p-3 border-b border-slate-200 bg-white/50 rounded-t-xl flex justify-between items-center sticky top-0 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colorMap[stage] || 'bg-slate-400'}`} />
                        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">{stage}</h3>
                    </div>
                    <Badge variant="secondary" className="bg-white border shadow-sm text-slate-600">
                        {items.length}
                    </Badge>
                </div>
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                    {items.map(job => (
                        <Card 
                            key={job.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, job)}
                            onClick={() => handleEdit(job)}
                            className="cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all bg-white group active:scale-[0.98] duration-200"
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-slate-800 leading-snug">{job.job_name}</div>
                                    {job.contract_price > 0 && (
                                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                            ${Number(job.contract_price).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-2 truncate">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0"/> 
                                    {job.address || 'No Address Provided'}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
                                    <div className="text-[10px] text-slate-400 font-medium">
                                        {new Date(job.created_at || Date.now()).toLocaleDateString()}
                                    </div>
                                    <MoreHorizontal className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors"/>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {items.length === 0 && (
                        <div className="h-24 flex items-center justify-center text-slate-300 text-xs italic border-2 border-dashed border-slate-200 rounded-lg m-2">
                            Drop Here
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* 1. GLOBAL HEADER */}
            <div className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">A</div>
                        <span className="font-bold text-lg tracking-tight">Aroof OS</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            className="text-slate-300 hover:text-white hover:bg-slate-800"
                            onClick={() => navigate('/rooferdashboard')}
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2"/> Dashboard
                        </Button>
                        <Button variant="ghost" className="text-white bg-slate-800">
                            <LayoutGrid className="w-4 h-4 mr-2"/> Pipeline
                        </Button>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <Bell className="w-5 h-5"/>
                    </Button>
                    <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold">
                        JD
                    </div>
                </div>
            </div>

            {/* 2. CONTROL BAR */}
            <div className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 gap-4 shadow-sm z-10">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                        <Input 
                            placeholder="Search pipeline..." 
                            className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            value={search} onChange={handleSearch}
                        />
                    </div>
                    <Select value={filterStage} onValueChange={handleStageFilter}>
                        <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200">
                            <Filter className="w-3.5 h-3.5 mr-2 text-slate-500"/> <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Stages</SelectItem>
                            {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1 rounded-lg flex gap-1 border border-slate-200">
                        <Button 
                            variant="ghost" 
                            size="sm" onClick={() => setViewMode('board')}
                            className={`h-8 px-3 rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid className="w-4 h-4 mr-2"/> Board
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" onClick={() => setViewMode('list')}
                            className={`h-8 px-3 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ListIcon className="w-4 h-4 mr-2"/> List
                        </Button>
                    </div>
                    <div className="h-8 w-px bg-slate-200 mx-1"></div>
                    <Button 
                        className="h-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 px-6 font-medium" 
                        onClick={() => navigate('/newleadform')}
                    >
                        <Plus className="w-4 h-4 mr-2"/> New Opportunity
                    </Button>
                </div>
            </div>

            {/* 3. MAIN CONTENT */}
            <div className="flex-1 overflow-hidden p-6">
                {viewMode === 'board' ? (
                    <div className="flex gap-4 h-full overflow-x-auto pb-2 px-2">
                        {STAGES.map(stage => renderColumn(stage))}
                    </div>
                ) : (
                    <Card className="h-full border shadow-sm flex flex-col rounded-xl overflow-hidden">
                        <div className="overflow-auto flex-1">
                            <Table>
                                <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead className="w-[300px]">Opportunity Name</TableHead>
                                        <TableHead>Stage</TableHead>
                                        <TableHead>Contract Value</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredJobs.map(job => (
                                        <TableRow key={job.id} className="hover:bg-blue-50/50 cursor-pointer group transition-colors" onClick={() => handleEdit(job)}>
                                            <TableCell className="font-medium text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        {(job.job_name || 'U').substring(0,2).toUpperCase()}
                                                    </div>
                                                    {job.job_name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal bg-white">{job.stage}</Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-green-600">
                                                {job.contract_price ? `$${Number(job.contract_price).toLocaleString()}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400"/>
                                                    {job.address}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                {new Date(job.created_at || Date.now()).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="w-4 h-4 text-slate-400 hover:text-blue-600"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredJobs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                                                No opportunities found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}
            </div>

            {/* 4. EDIT MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Edit Opportunity</DialogTitle>
                    </DialogHeader>
                    {selectedJob && (
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opportunity Name</label>
                                <Input 
                                    value={selectedJob.job_name} 
                                    onChange={e => setSelectedJob({...selectedJob, job_name: e.target.value})}
                                    className="font-medium text-lg"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stage</label>
                                    <Select value={selectedJob.stage} onValueChange={v => setSelectedJob({...selectedJob, stage: v})}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Value</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                                        <Input 
                                            type="number" 
                                            className="pl-9"
                                            value={selectedJob.contract_price} 
                                            onChange={e => setSelectedJob({...selectedJob, contract_price: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                <div className="text-xs font-bold text-slate-500 uppercase">Details</div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 text-slate-400"/> {selectedJob.address || 'No address'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4 text-slate-400"/> Created: {new Date(selectedJob.created_at || Date.now()).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex justify-between pt-4 border-t">
                                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100" onClick={handleDelete}>
                                    <Trash2 className="w-4 h-4 mr-2"/> Delete
                                </Button>
                                <Button className="bg-blue-600 hover:bg-blue-700 px-8" onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2"/> Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}