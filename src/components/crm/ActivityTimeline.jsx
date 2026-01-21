import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Loader2, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityTimeline({ leadId, companyId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) loadLogs();
  }, [leadId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await base44.entities.ActivityLog.list('-timestamp', 100);
      const filtered = allLogs.filter(log => 
        log.lead_id === leadId && log.company_id === companyId
      );
      setLogs(filtered);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    const map = {
      call: '📞',
      email: '📧',
      note: '📝',
      gps_ping: '📍',
      meeting: '🤝',
      status_change: '🔄'
    };
    return map[type] || '📋';
  };

  const extractGPSFromContent = (content) => {
    // Extract GPS coordinates from format "GPS: lat, lng"
    const match = content.match(/GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (match) {
      return { lat: match[1], lng: match[2] };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map(log => {
        const gpsCoords = log.type === 'gps_ping' ? extractGPSFromContent(log.content) : null;
        
        return (
          <div key={log.id} className="flex gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-2xl flex-shrink-0">{getIcon(log.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="font-bold text-slate-900 text-sm">
                  {log.user_name || 'Team Member'}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </span>
              </div>

              <div className="text-sm text-slate-800 mb-2">{log.content}</div>

              {/* Duration Badge */}
              {log.duration > 0 && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                  ⏱️ {log.duration} min{log.duration !== 1 ? 's' : ''}
                </span>
              )}

              {/* Outcome Badge */}
              {log.outcome && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                  Result: {log.outcome}
                </span>
              )}

              {/* Follow-up Date */}
              {log.next_followup_date && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  📅 Follow up: {new Date(log.next_followup_date).toLocaleDateString()}
                </span>
              )}

              {/* GPS Map Link */}
              {gpsCoords && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${gpsCoords.lat},${gpsCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold mt-2"
                >
                  <MapPin className="w-3 h-3" />
                  View Location on Map 🗺️
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}