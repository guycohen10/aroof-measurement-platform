import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function NotificationBell({ userId }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    
    // Real-time subscription to notifications
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data.user_id === userId) {
        setNotifications(prev => [event.data, ...prev]);
        setUnreadCount(prev => prev + 1);
      } else if (event.type === 'update' && event.data.user_id === userId) {
        setNotifications(prev => prev.map(n => n.id === event.data.id ? event.data : n));
        if (event.data.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    });

    return unsubscribe;
  }, [userId]);

  const loadNotifications = async () => {
    const notifs = await base44.entities.Notification.filter({
      user_id: userId
    }, '-created_date', 10);
    
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.is_read).length);
  };

  const markAsRead = async (notification) => {
    await base44.entities.Notification.update(notification.id, { is_read: true });
    if (notification.link) {
      navigate(notification.link);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif)}
                  className={`p-4 cursor-pointer transition-colors ${
                    notif.is_read
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notif.is_read && (
                      <div className="mt-1 h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}