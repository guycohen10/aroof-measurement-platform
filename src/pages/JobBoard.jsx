import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Phone, Mail, MapPin, Calculator, ArrowLeft, LayoutDashboard, Settings, Trello } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createPageUrl } from '@/utils';

const COLUMNS = { 
  'New': { id: 'New', title: 'New Lead', color: 'bg-blue-500' }, 
  'Contacted': { id: 'Contacted', title: 'Contacted', color: 'bg-yellow-500' }, 
  'Measured': { id: 'Measured', title: 'Measured', color: 'bg-purple-500' }, 
  'Quoted': { id: 'Quoted', title: 'Estimate Sent', color: 'bg-pink-500' }, 
  'Sold': { id: 'Sold', title: 'Job Sold', color: 'bg-green-500' } 
};

export default function JobBoard() { 
  const navigate = useNavigate(); 
  const [leads, setLeads] = useState([]); 
  const [columns, setColumns] = useState(COLUMNS); 
  const [selectedLead, setSelectedLead] = useState(null);

  // HYBRID DATA LOADER 
  useEffect(() => { 
    const loadData = async () => { 
      // 1. Get Local 
      const localRaw = localStorage.getItem('my_leads'); 
      const localLeads = localRaw ? JSON.parse(localRaw) : []; 
      console.log("Local Leads Found:", localLeads.length, localLeads);

      // 2. Get API
      let apiLeads = [];
      try {
        apiLeads = await base44.entities.Lead.list();
      } catch (e) {
        console.warn("API Load Failed (Offline Mode)", e);
      }
      
      // 3. Merge (Prefer API if ID matches)
      const apiIds = new Set(apiLeads.map(l => l.id));
      const uniqueLocal = localLeads.filter(l => !apiIds.has(l.id));
      const merged = [...uniqueLocal, ...apiLeads];
      setLeads(merged);
    };
    loadData();
  }, []);

  // Helper: Get leads for column 
  const getLeadsByStatus = (status) => { 
    // Normalize status (e.g. 'new' -> 'New') 
    // Handle both 'lead_status' (API) and 'status' (Local)
    return leads.filter(l => {
      const s = l.lead_status || l.status || 'New';
      return s.toLowerCase() === status.toLowerCase();
    }); 
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Button variant="ghost" onClick={() => navigate(createPageUrl('RooferDashboard'))} className="text-slate-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-8 w-px bg-slate-200"></div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" className="text-slate-600" onClick={() => navigate(createPageUrl('RooferDashboard'))}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="secondary" className="bg-blue-50 text-blue-700 font-bold">
              <Trello className="w-4 h-4 mr-2" />
              Pipeline
            </Button>
            <Button variant="ghost" className="text-slate-600" onClick={() => navigate(createPageUrl('RooferSettings'))}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </nav>
        </div>
        <div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate(createPageUrl('NewLeadForm'))}>
            <Plus className="w-4 h-4 mr-2" /> New Lead
          </Button>
        </div>
      </header>

      {/* BOARD CONTENT */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-6 h-full min-w-max">
          {Object.values(COLUMNS).map(col => (
            <div key={col.id} className="w-[320px] bg-slate-100/50 rounded-xl flex flex-col border border-slate-200 shadow-sm h-full">
              <div className={`p-4 rounded-t-xl text-white font-bold flex justify-between items-center ${col.color}`}>
                 <span>{col.title}</span>
                 <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">{getLeadsByStatus(col.id).length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                 {getLeadsByStatus(col.id).map((lead, index) => (
                    <Card key={lead.id} className="cursor-pointer hover:shadow-lg transition-all border-none shadow-sm group" onClick={() => setSelectedLead(lead)}>
                       <CardContent className="p-4">
                          <div className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                            {lead.name || lead.customer_name || 'Unknown Customer'}
                          </div>
                          <div className="text-xs text-slate-500 flex items-start mb-2">
                            <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0"/> 
                            <span className="line-clamp-2">{lead.address || lead.property_address || lead.address_street}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {lead.roof_sqft && (
                              <div className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                {lead.roof_sqft} sq ft
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 ml-auto">
                              #{lead.id.slice(0,4)}
                            </div>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LEAD DETAIL MODAL */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
         <DialogContent className="max-w-2xl">
            <DialogHeader>
               <DialogTitle>Lead Details</DialogTitle>
            </DialogHeader>
            {selectedLead && (
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</label>
                        <div className="font-bold text-xl text-slate-900 mt-1">{selectedLead.name || selectedLead.customer_name}</div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Phone className="w-4 h-4"/>
                              </div>
                              {selectedLead.phone || selectedLead.phone_number || 'No Phone'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Mail className="w-4 h-4"/>
                              </div>
                              {selectedLead.email || selectedLead.email_address || 'No Email'}
                          </div>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Address</label>
                        <div className="text-sm mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {selectedLead.address || selectedLead.property_address || selectedLead.address_street}
                        </div>
                     </div>
                     <div className="flex gap-3 mt-6">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => navigate(`/quotebuilder?leadId=${selectedLead.id}`)}>
                           <Calculator className="w-4 h-4 mr-2"/> Build Quote
                        </Button>
                        <Button variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => navigate(`/roofermeasurement?leadId=${selectedLead.id}`)}>
                           <MapPin className="w-4 h-4 mr-2"/> Measure
                        </Button>
                     </div>
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>
    </div>
  ); 
}