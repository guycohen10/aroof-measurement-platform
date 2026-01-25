import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Phone, Mail, MapPin, Calculator } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-150px)] p-4">
      {Object.values(COLUMNS).map(col => (
        <div key={col.id} className="min-w-[300px] bg-slate-100 rounded-lg p-3 flex flex-col">
          <div className={`p-3 rounded-t-lg text-white font-bold flex justify-between ${col.color}`}>
             <span>{col.title}</span>
             <span className="bg-white/20 px-2 rounded text-sm">{getLeadsByStatus(col.id).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 mt-3">
             {getLeadsByStatus(col.id).map((lead, index) => (
                <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedLead(lead)}>
                   <CardContent className="p-4">
                      <div className="font-bold mb-1">{lead.name || lead.customer_name || 'Unknown Customer'}</div>
                      <div className="text-xs text-slate-500 flex items-center mb-1">
                        <MapPin className="w-3 h-3 mr-1"/> 
                        {lead.address || lead.property_address || lead.address_street}
                      </div>
                      {lead.roof_sqft && <div className="text-xs font-bold text-slate-700 bg-slate-200 inline-block px-2 py-0.5 rounded">{lead.roof_sqft} sq ft</div>}
                   </CardContent>
                </Card>
             ))}
          </div>
        </div>
      ))}

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
                        <label className="text-xs font-bold text-slate-500 uppercase">Customer</label>
                        <div className="font-bold text-lg">{selectedLead.name || selectedLead.customer_name}</div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Contact</label>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4"/> 
                            {selectedLead.phone || selectedLead.phone_number || 'No Phone'}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4"/> 
                            {selectedLead.email || selectedLead.email_address || 'No Email'}
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Property</label>
                        <div className="text-sm">{selectedLead.address || selectedLead.property_address || selectedLead.address_street}</div>
                     </div>
                     <div className="flex gap-2 mt-4">
                        <Button className="flex-1 bg-green-600" onClick={() => navigate(`/quotebuilder?leadId=${selectedLead.id}`)}>
                           <Calculator className="w-4 h-4 mr-2"/> Build Quote
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => navigate(`/roofermeasurement?leadId=${selectedLead.id}`)}>
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