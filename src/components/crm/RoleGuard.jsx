import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function RoleGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-red-600">Failed to load user</p>
        </div>
      </div>
    );
  }

  const role = user.aroof_role || user.role || 'user';
  const roleName = {
    'admin': 'Owner',
    'external_roofer': 'Owner',
    'estimator': 'Estimator',
    'sales': 'Sales Rep',
    'dispatcher': 'Dispatcher',
    'crew': 'Crew Member'
  }[role] || role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Logged in as</p>
            <p className="text-xl font-bold">{roleName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">{user.full_name || user.email}</p>
            <p className="text-xs opacity-75">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              🚀 Loading {roleName} Workspace...
            </h2>
            <p className="text-blue-700">
              Your personalized dashboard is being prepared
            </p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}