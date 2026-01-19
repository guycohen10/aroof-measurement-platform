import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Terminal, AlertCircle, Info, AlertTriangle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function SystemHealth() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SystemLog.list('-created_date', 500);
      setLogs(data || []);
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    return log.level === filter;
  });

  const getLevelIcon = (level) => {
    switch (level) {
      case "error": return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getLevelBadge = (level) => {
    const styles = {
      error: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800"
    };
    return <Badge className={styles[level]}>{level.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-green-600">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            🔧 System Health - Event Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All ({logs.length})
            </Button>
            <Button
              size="sm"
              variant={filter === "info" ? "default" : "outline"}
              onClick={() => setFilter("info")}
            >
              Info ({logs.filter(l => l.level === "info").length})
            </Button>
            <Button
              size="sm"
              variant={filter === "warning" ? "default" : "outline"}
              onClick={() => setFilter("warning")}
            >
              Warnings ({logs.filter(l => l.level === "warning").length})
            </Button>
            <Button
              size="sm"
              variant={filter === "error" ? "default" : "outline"}
              onClick={() => setFilter("error")}
            >
              Errors ({logs.filter(l => l.level === "error").length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={loadLogs}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>

          {/* Console-style Log Viewer */}
          <div className="bg-slate-900 text-green-400 font-mono text-xs rounded-lg p-4 h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="mb-2 hover:bg-slate-800 p-2 rounded">
                <div className="flex items-start gap-3">
                  <span className="text-slate-500 flex-shrink-0">
                    {format(new Date(log.created_date), 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                  <span className={`flex-shrink-0 ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="text-cyan-400 flex-shrink-0">[{log.source}]</span>
                  <span className="text-white">{log.message}</span>
                </div>
                {log.metadata && (
                  <div className="ml-32 mt-1 text-slate-400 text-xs">
                    {JSON.stringify(log.metadata, null, 2)}
                  </div>
                )}
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-center text-slate-500 py-12">
                No logs found for this filter
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {logs.filter(l => l.level === "info").length}
            </div>
            <div className="text-sm text-slate-600">Info Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {logs.filter(l => l.level === "warning").length}
            </div>
            <div className="text-sm text-slate-600">Warnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(l => l.level === "error").length}
            </div>
            <div className="text-sm text-slate-600">Errors</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to log system events
export async function logSystemEvent(source, message, level = "info", metadata = null) {
  try {
    await base44.entities.SystemLog.create({
      level,
      source,
      message,
      metadata
    });
  } catch (error) {
    console.error("Failed to log system event:", error);
  }
}