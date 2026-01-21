import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CommunicationLogger from './CommunicationLogger';
import { Bell, CheckSquare, Phone, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ActionCenter({ userId, companyId }) {
  const [activeTab, setActiveTab] = useState('followups');
  const [followUps, setFollowUps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogger, setShowLogger] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    refresh();
  }, [userId, companyId]);

  const refresh = async () => {
    setLoading(true);
    try {
      // 1. Load Follow-Ups (ActivityLogs with due/overdue next_followup_date)
      const logs = await base44.entities.ActivityLog.list('-next_followup_date', 100);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      const due = logs.filter(l => 
        l.next_followup_date && 
        new Date(l.next_followup_date) <= today &&
        l.company_id === companyId
      );
      setFollowUps(due);

      // 2. Load Tasks
      const allTasks = await base44.entities.Task.list('-created_date', 50);
      const myTasks = allTasks.filter(t => 
        t.assigned_to === userId && 
        !t.is_completed &&
        t.company_id === companyId
      );
      setTasks(myTasks);
    } catch (err) {
      console.error('Failed to load action center:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (id) => {
    try {
      await base44.entities.Task.update(id, { is_completed: true });
      toast.success('Task completed!');
      refresh();
    } catch (err) {
      toast.error('Failed to complete task');
      console.error(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setAddingTask(true);
    try {
      await base44.entities.Task.create({
        title: newTaskTitle,
        priority: 'medium',
        assigned_to: userId,
        company_id: companyId,
        is_completed: false
      });
      setNewTaskTitle('');
      toast.success('Task added!');
      refresh();
    } catch (err) {
      toast.error('Failed to add task');
      console.error(err);
    } finally {
      setAddingTask(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Action Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b">
          <button
            onClick={() => setActiveTab('followups')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'followups'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Follow-Ups
            {followUps.length > 0 && (
              <Badge className="ml-2 bg-red-600 text-white">{followUps.length}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Tasks
            {tasks.length > 0 && (
              <Badge className="ml-2 bg-blue-600 text-white">{tasks.length}</Badge>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'followups' ? (
              <div className="space-y-2">
                {followUps.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-bold text-red-900">
                        Follow up on {item.type}
                      </div>
                      <div className="text-xs text-red-700 mt-1 line-clamp-1">
                        {item.content}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Due: {new Date(item.next_followup_date).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedLead({ id: item.lead_id });
                        setShowLogger(true);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call Now
                    </Button>
                  </div>
                ))}
                {followUps.length === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>All caught up! No follow-ups due.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Add Task Form */}
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1"
                    disabled={addingTask}
                  />
                  <Button 
                    type="submit" 
                    disabled={addingTask || !newTaskTitle.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>

                {/* Task List */}
                {tasks.map(t => (
                  <div 
                    key={t.id} 
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <input
                      type="checkbox"
                      onChange={() => handleTaskComplete(t.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-slate-800 font-medium">{t.title}</span>
                      {t.due_date && (
                        <p className="text-xs text-slate-500 mt-1">
                          Due: {new Date(t.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {t.priority && (
                      <Badge className={getPriorityColor(t.priority)}>
                        {t.priority}
                      </Badge>
                    )}
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No active tasks. Add one above!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Logger Modal */}
        {showLogger && selectedLead && (
          <CommunicationLogger
            lead={selectedLead}
            onClose={() => {
              setShowLogger(false);
              setSelectedLead(null);
              refresh();
            }}
            onSaved={refresh}
          />
        )}
      </CardContent>
    </Card>
  );
}