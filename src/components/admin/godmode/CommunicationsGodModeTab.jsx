import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare, Mail, Phone, FileText, Search } from "lucide-react";
import { format } from "date-fns";

export default function CommunicationsGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [communications, setCommunications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [viaFilter, setViaFilter] = useState("all");

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    try {
      const comms = await base44.entities.LeadCommunication.list('-created_date', 100);
      setCommunications(comms);
    } catch (err) {
      console.error('Failed to load communications:', err);
    }
    setLoading(false);
  };

  const filteredComms = communications.filter(comm => {
    const matchesSearch = searchTerm === "" || 
      comm.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChannel = channelFilter === "all" || comm.channel === channelFilter;
    const matchesVia = viaFilter === "all" || comm.sent_via === viaFilter;

    return matchesSearch && matchesChannel && matchesVia;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">All Communications</h2>
        <Button onClick={loadCommunications} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
            <Select value={viaFilter} onValueChange={setViaFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automated">Automated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredComms.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No communications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredComms.map((comm) => (
            <Card key={comm.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    comm.channel === 'sms' ? 'bg-green-100' :
                    comm.channel === 'email' ? 'bg-blue-100' :
                    comm.channel === 'call' ? 'bg-orange-100' :
                    'bg-slate-100'
                  }`}>
                    {comm.channel === 'sms' && <MessageSquare className="w-5 h-5 text-green-600" />}
                    {comm.channel === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                    {comm.channel === 'call' && <Phone className="w-5 h-5 text-orange-600" />}
                    {comm.channel === 'note' && <FileText className="w-5 h-5 text-slate-600" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 capitalize">
                            {comm.channel}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            comm.sent_via === 'automated' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {comm.sent_via}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            comm.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            comm.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            comm.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {comm.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {format(new Date(comm.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>

                    {comm.subject && (
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-slate-700">Subject: </span>
                        <span className="text-sm text-slate-600">{comm.subject}</span>
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {comm.message}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}