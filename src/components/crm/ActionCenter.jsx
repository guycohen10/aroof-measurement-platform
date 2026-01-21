import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Phone } from "lucide-react";
import CommunicationLogger from './CommunicationLogger';

export default function ActionCenter({ userId, companyId }) {
  const [activeTab, setActiveTab] = useState('followups');
  const [followUps, setFollowUps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showLogger, setShowLogger] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    refresh();
  }, [userId, companyId]);

  const refresh = async () => {
    try {
      const logs = await base44.entities.ActivityLog.list();
      const filtered = logs.filter(l => 
        l.company_id === companyId && 
        l.next_followup_date
      ).slice(0, 5);
      setFollowUps(filtered);

      const allTasks = await base44.entities.Task.list();
      const myTasks = allTasks.filter(t => 
        t.assigned_to === userId && 
        !t.is_completed
      );
      setTasks(myTasks);
    } catch (err) {
      console.error(err);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await base44.entities.Task.update(taskId, { is_completed: true });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Center</CardTitle>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant={activeTab === 'followups' ? 'default' : 'outline'}
            onClick={() => setActiveTab('followups')}
          >
            Follow-Ups ({followUps.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'tasks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks ({tasks.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'followups' && (
          <div className="space-y-2">
            {followUps.length === 0 ? (
              <p className="text-gray-500 text-sm">No follow-ups due</p>
            ) : (
              followUps.map(log => (
                <div key={log.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-sm">{log.user_name}</p>
                    <p className="text-xs text-gray-500">{log.content}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Phone className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks assigned</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.priority}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => completeTask(task.id)}
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {showLogger && selectedLead && (
          <CommunicationLogger
            lead={selectedLead}
            onClose={() => {
              setShowLogger(false);
              setSelectedLead(null);
            }}
            onSaved={() => {
              refresh();
              setShowLogger(false);
              setSelectedLead(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}