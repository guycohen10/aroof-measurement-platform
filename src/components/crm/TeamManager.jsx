import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";

export default function TeamManager({ userProfile }) {
  const [copiedRole, setCopiedRole] = useState('');

  // Generate invite links for the existing JoinTeam page
  const generateInviteLink = (role) => {
    const baseUrl = window.location.origin;
    const name = encodeURIComponent(userProfile.company_name || 'Your Company');
    // This matches the parameters JoinTeam.jsx expects
    return `${baseUrl}${createPageUrl('JoinTeam')}?c=${userProfile.company_id}&n=${name}&r=${role}`;
  };

  const copyLink = (role) => {
    const link = generateInviteLink(role);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedRole(role);
      setTimeout(() => setCopiedRole(''), 3000);
    });
  };

  const roles = [
    { id: 'estimator', name: 'Estimator', icon: '📐', color: 'blue', desc: 'Can measure roofs and create quotes' },
    { id: 'sales', name: 'Sales Rep', icon: '💼', color: 'green', desc: 'Can view leads and manage customers' },
    { id: 'dispatcher', name: 'Dispatcher', icon: '📅', color: 'purple', desc: 'Can schedule jobs and manage crews' },
    { id: 'crew', name: 'Crew Member', icon: '👷', color: 'orange', desc: 'Can view assigned jobs' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Invite Team Members</CardTitle>
          <p className="text-slate-600 mt-2">
            Share invite links with your team. Each person will create their own account.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => (
              <div 
                key={role.id} 
                className={`p-6 border-2 rounded-lg bg-${role.color}-50 hover:bg-${role.color}-100 border-${role.color}-200 transition-colors`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{role.icon}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{role.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{role.desc}</p>
                  <Button
                    onClick={() => copyLink(role.id)}
                    className="w-full"
                    variant={copiedRole === role.id ? "default" : "outline"}
                  >
                    {copiedRole === role.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Invite Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 How it works:</strong> Each team member will receive their invite link, 
              create their own account, and automatically join your company with the correct role assigned.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}