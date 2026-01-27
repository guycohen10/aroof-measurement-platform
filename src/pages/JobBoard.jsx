import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Plus, Search, MoreHorizontal, Trash2, Save, MapPin, 
  LayoutGrid, List as ListIcon, Calendar, DollarSign, Filter,
  ArrowUpRight, Users, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const STAGES = ['New Lead', 'Measured', 'Quote Sent', 'Sold', 'In Progress', 'Completed'];

export default function JobBoard() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' or 'active'
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({ totalValue: 0, activeCount: 0, winRate: 0 });

    // 1. LOAD & CALCULATE
    const fetchJobs = async () => {
        try {
            const data = await base44.entities.Job.list();
            const companyId = localStorage.getItem('company_id');

            // Filter by Company & Sort Newest
            const myJobs = companyId 
                ? data.filter(j => j.company_id === companyId).sort((a,b) => (b.id||"").localeCompare(a.id||""))
                : data.sort((a,b) => (b.id||"").localeCompare(a.id||""));
            
            setJobs(myJobs);
            applyFilters(myJobs, search, statusFilter);
            calculateStats(myJobs);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    // 2. SMART SEARCH & STATS
    const applyFilters = (data, query, status) => {
        let result = [...data];
        
        // Status Filter
        if (status === 'active') {
            result = result.filter(j => j.stage !== 'Completed');
        }

        // Search Filter
        if(query) {
            const lowerQ = query.toLowerCase();
            result = result.filter(j => 
                j.job_name?.toLowerCase().includes(lowerQ) || 
                j.address?.toLowerCase().includes(lowerQ) || 
                j.stage?.toLowerCase().includes(lowerQ)
            );
        }
        
        setFilteredJobs(result);
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        applyFilters(jobs, val, statusFilter);
    };

    const handleStatusFilterChange = (val) => {
        setStatusFilter(val);
        applyFilters(jobs, search, val);
    };

    const calculateStats = (data) => {
        const totalVal = data.reduce((acc, j) => acc + (j.contract_price || 0), 0);
        const active = data.filter(j => j.stage !== 'Completed').length;
        const sold = data.filter(j => j.stage === 'Sold' || j.stage === 'In Progress' || j.stage === 'Completed').length;
        const rate = data.length ? Math.round((sold / data.length) * 100) : 0;
        setStats({ totalValue: totalVal, activeCount: active, winRate: rate });
    };

    // 3. ACTIONS
    const handleEdit = (job) => {
        setSelectedJob({ ...job });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        toast.loading("Updating...");
        try {
            await base44.entities.Job.update(selectedJob.id, {
                job_name: selectedJob.job_name,
                stage: selectedJob.stage,
                contract_price: Number(selectedJob.contract_price)
            });
            toast.dismiss();
            toast.success("Saved");
            setIsModalOpen(false);
            fetchJobs();
        } catch(e) {
            toast.dismiss();
            toast.error("Error updating");
        }
    };

    const handleDelete = async () => {
        if(!window.confirm("Delete this job permanently?")) return;
        try {
            await base44.entities.Job.delete(selectedJob.id);
            toast.success("Deleted");
            setIsModalOpen(false);
            fetchJobs();
        } catch(e) {
            toast.error("Error deleting");
        }
    };

    // 4. RENDERERS
    const renderBoardColumn = (stage) => {
        const colJobs = filteredJobs.filter(j => j.stage === stage || (stage === 'New Lead' && !j.stage));
        const colorClass = {
            'New Lead': 'border-blue-400',
            'Measured': 'border-purple-400',
            'Quote Sent': 'border-orange-400',
            'Sold': 'border-green-400',
            'In Progress': 'border-yellow-400',
            'Completed': 'border-slate-400'
        }[stage] || 'border-slate-300';

        return (
            <div key={stage} className="flex-1 min-w-[300px] bg-slate-100/50 rounded-xl p-4 flex flex-col h-full border border-slate-200">
                <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${colorClass}`}>
                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{stage}</h3>
                    <Badge variant="secondary" className="bg-white">{colJobs.length}</Badge>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                    {colJobs.map(job => (
                        <Card 
                            key={job.id} 
                            onClick={() => handleEdit(job)}
                            className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group bg-white border-slate-200"
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-slate-900 leading-tight">{job.job_name}</div>
                                    {job.contract_price > 0 && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                                            ${Number(job.contract_price).toLocaleString()}
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
                    {colJobs.length === 0 && <div className="text-center text-slate-400 text-xs py-10 italic opacity-50">Empty</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
            {/* TOP BAR: KPI & SEARCH */}
            <div className="bg-white border-b px-6 py-4 space-y-4 shadow-sm z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Operations Command</h1>
                        <p className="text-slate-500 text-sm">Manage {jobs.length} total jobs across all stages</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            <DollarSign className="w-4 h-4 text-blue-600"/>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-blue-400">Pipeline Value</div>
                                <div className="font-bold text-blue-900">${stats.totalValue.toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                            <Trophy className="w-4 h-4 text-green-600"/>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-green-400">Win Rate</div>
                                <div className="font-bold text-green-900">{stats.winRate}%</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                            <Users className="w-4 h-4 text-purple-600"/>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-purple-400">Active Jobs</div>
                                <div className="font-bold text-purple-900">{stats.activeCount}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-md flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                            <Input 
                                placeholder="Search clients, addresses, or stages..." 
                                className="pl-9 bg-slate-100 border-0"
                                value={search}
                                onChange={handleSearch}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="w-[140px] bg-slate-100 border-0">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Jobs</SelectItem>
                                <SelectItem value="active">Active Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Tabs value={viewMode} onValueChange={setViewMode} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="board"><LayoutGrid className="w-4 h-4 mr-2"/> Board</TabsTrigger>
                            <TabsTrigger value="list"><ListIcon className="w-4 h-4 mr-2"/> List</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden p-6">
                {viewMode === 'board' ? (
                    <div className="flex gap-4 h-full overflow-x-auto pb-4">
                        {STAGES.map(stage => renderBoardColumn(stage))}
                    </div>
                ) : (
                    <Card className="h-full overflow-hidden border-0 shadow-sm">
                        <div className="overflow-y-auto h-full">
                            <Table>
                                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead>Job Name</TableHead>
                                        <TableHead>Stage</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredJobs.map(job => (
                                        <TableRow key={job.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleEdit(job)}>
                                            <TableCell className="font-medium text-slate-900">{job.job_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600">{job.stage}</Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-green-600">
                                                {job.contract_price ? `$${Number(job.contract_price).toLocaleString()}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-slate-500 truncate max-w-[200px]">{job.address}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredJobs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-slate-400">No jobs found matching your filters.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}
            </div>

            {/* EDIT MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Manage Project</DialogTitle></DialogHeader>
                    {selectedJob && (
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-xs uppercase font-bold text-slate-500">Client / Job Name</label>
                                <Input value={selectedJob.job_name} onChange={e => setSelectedJob({...selectedJob, job_name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-slate-500">Stage</label>
                                    <Select value={selectedJob.stage} onValueChange={v => setSelectedJob({...selectedJob, stage: v})}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-slate-500">Contract Value</label>
                                    <Input type="number" value={selectedJob.contract_price} onChange={e => setSelectedJob({...selectedJob, contract_price: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4 border-t">
                                <Button className="flex-1 bg-blue-600" onClick={handleSave}><Save className="w-4 h-4 mr-2"/> Save Changes</Button>
                                <Button variant="destructive" size="icon" onClick={handleDelete}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}