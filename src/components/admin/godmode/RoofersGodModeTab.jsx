import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Phone, Calendar } from "lucide-react";

export default function RoofersGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [roofers, setRoofers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const allUsers = await base44.entities.User.list();
      const rooferUsers = allUsers.filter(u => u.aroof_role === 'external_roofer');
      setRoofers(rooferUsers);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load:', err);
      setLoading(false);
    }
  }

  async function updateSubscription(userId, plan) {
    try {
      await base44.entities.User.update(userId, {
        subscription_plan: plan,
        measurements_limit: plan === 'basic' ? 3 : plan === 'pro' ? 10 : 999
      });
      await loadData();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-slate-600">Total External Roofers: {roofers.length}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roofers.map(roofer => (
          <Card key={roofer.id} className="border-l-4 border-l-green-600">
            <CardContent className="p-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                {(roofer.full_name || 'R')[0].toUpperCase()}
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">{roofer.full_name}</h3>
              
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  {roofer.email}
                </div>
                {roofer.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    {roofer.phone}
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Plan:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    roofer.subscription_plan === 'unlimited' ? 'bg-purple-100 text-purple-700' :
                    roofer.subscription_plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {roofer.subscription_plan || 'basic'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Usage:</span>
                  <span className="ml-2 font-semibold">
                    {roofer.measurements_used_this_month || 0} / {roofer.measurements_limit || 3}
                  </span>
                </div>
              </div>

              <select
                value={roofer.subscription_plan || 'basic'}
                onChange={(e) => updateSubscription(roofer.id, e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm mb-3"
              >
                <option value="basic">Basic (3/month)</option>
                <option value="pro">Pro (10/month)</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </CardContent>
          </Card>
        ))}
      </div>

      {roofers.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            No external roofers registered yet
          </CardContent>
        </Card>
      )}
    </div>
  );
}