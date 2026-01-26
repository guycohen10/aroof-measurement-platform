import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Calendar, FileText, CheckSquare, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function JobBriefModal({ job, isOpen, onClose }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job?.quote_id && isOpen) {
      setLoading(true);
      base44.entities.Quote.get(job.quote_id)
        .then(setQuote)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [job, isOpen]);

  if (!job) return null;

  const lineItems = quote?.line_items_json ? JSON.parse(quote.line_items_json) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Job Brief: {job.job_name || 'Unnamed Job'}
          </DialogTitle>
          <DialogDescription>
            Reference ID: {job.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4 flex-1 overflow-hidden">
          {/* LEFT: Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4" /> Location
              </h3>
              <div className="p-3 bg-slate-50 rounded-lg border text-sm">
                <p className="font-medium">{job.address}</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-2"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4" /> Schedule
              </h3>
              <div className="p-3 bg-slate-50 rounded-lg border text-sm">
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                        <span className="text-xs text-slate-500 block">Start</span>
                        {job.start_date ? format(new Date(job.start_date), 'MMM d, yyyy') : 'Not scheduled'}
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 block">End</span>
                        {job.end_date ? format(new Date(job.end_date), 'MMM d, yyyy') : '-'}
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="space-y-2">
                <h3 className="font-semibold text-slate-700">Status</h3>
                <Badge className={
                    job.stage === 'Complete' ? 'bg-green-100 text-green-800' : 
                    job.stage === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                }>
                    {job.stage}
                </Badge>
            </div>
          </div>

          {/* RIGHT: Materials */}
          <div className="flex flex-col h-full overflow-hidden">
            <h3 className="font-semibold flex items-center gap-2 text-slate-700 mb-2">
              <CheckSquare className="w-4 h-4" /> Material List
            </h3>
            <ScrollArea className="flex-1 bg-slate-50 rounded-lg border p-4">
              {loading ? (
                <div className="text-center text-sm text-slate-500 py-4">Loading materials...</div>
              ) : lineItems.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {lineItems.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-start border-b pb-2 last:border-0">
                      <span className="font-medium text-slate-700">{item.name || item.description}</span>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {item.qty || item.quantity} {item.unit || ''}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-sm text-slate-400 py-4">No material list available</div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button className="bg-blue-600" onClick={() => window.print()}>Print Brief</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}