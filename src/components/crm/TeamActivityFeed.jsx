import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Phone, Mail, MessageSquare, MapPin, RefreshCw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TeamActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const logs = await base44.entities.ActivityLog.list('-timestamp', 20);
      setActivities(logs);
    } catch (err) {
      console.error("Failed to load activity feed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      call: <Phone className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      note: <MessageSquare className="w-4 h-4" />,
      gps_ping: <MapPin className="w-4 h-4" />,
      status_change: <Activity className="w-4 h-4" />
    };
    return icons[type] || <Activity className="w-4 h-4" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      call: 'bg-blue-100 text-blue-800',
      email: 'bg-purple-100 text-purple-800',
      note: 'bg-slate-100 text-slate-800',
      gps_ping: 'bg-green-100 text-green-800',
      status_change: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-slate-100 text-slate-800';
  };

  const extractGPSCoords = (content) => {
    const match = content.match(/GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (match) {
      return { lat: match[1], lng: match[2] };
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Team Activity Feed
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => loadActivities(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            No team activity yet
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity) => {
              const coords = activity.type === 'gps_ping' ? extractGPSCoords(activity.content) : null;
              
              return (
                <div key={activity.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-slate-900 text-sm">
                        {activity.user_id?.slice(0, 8) || 'Team Member'}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-1 line-clamp-2">
                      {activity.content}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                      
                      {coords && (
                        <a
                          href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}