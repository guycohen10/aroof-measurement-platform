import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";

export default function TeamActivityFeed({ companyId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActivity = async () => {
    try {
      const logs = await base44.entities.ActivityLog.list();
      const filtered = companyId ? logs.filter(l => l.company_id === companyId) : logs;
      setActivities(filtered.slice(0, 10)); // Show last 10
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
    // Poll for updates every 30 seconds
    const interval = setInterval(loadActivity, 30000);
    return () => clearInterval(interval);
  }, [companyId]);

  const getIcon = (type) => {
    const icons = {
      call: '📞',
      note: '📝',
      gps_ping: '📍',
      status_change: '🔄',
      job_created: '🔨',
      lead_created: '🚀'
    };
    return icons[type] || '📋';
  };

  if (loading) return <div className="p-4 text-center">Loading feed...</div>;

  return (
    <div className="bg-white rounded shadow">
      <div className="overflow-y-auto flex-1 p-0">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No activity yet.</div>
        ) : (
          <div className="divide-y">
            {activities.map(log => (
              <div key={log.id} className="p-3 hover:bg-gray-50 flex gap-3">
                <div className="text-xl pt-1">{getIcon(log.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-sm text-gray-800">{log.user_name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(log.timestamp || log.created_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-tight">{log.content}</p>
                  
                  {log.type === 'gps_ping' && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(log.content.replace('Crew at ', ''))}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs block mt-1 hover:underline"
                    >
                      View on Map 🗺️
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}