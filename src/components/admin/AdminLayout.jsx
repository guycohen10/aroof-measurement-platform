
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, Users, Ruler, Calendar, DollarSign, Settings, LogOut, 
  Bell, Menu, X, Search, Mail // Added Mail icon
} from "lucide-react";

export default function AdminLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/admin/Dashboard" },
    { name: "Leads", icon: Users, path: "/admin/Leads" },
    { name: "Measurements", icon: Ruler, path: "/admin/Measurements" },
    { name: "Appointments", icon: Calendar, path: "/admin/Appointments" },
    { name: "Revenue", icon: DollarSign, path: "/admin/Revenue" },
    { name: "Emails", icon: Mail, path: "/admin/Emails" }, // New nav item
    { name: "Settings", icon: Settings, path: "/admin/Settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate(createPageUrl("admin/Login"));
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">AROOF</h1>
                <p className="text-xs text-blue-200">Admin Dashboard</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:bg-blue-700 p-2 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === createPageUrl(item.path);
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-700 text-white shadow-lg' 
                      : 'text-blue-100 hover:bg-blue-700/50'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-blue-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full
                text-blue-100 hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Menu + Title */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-slate-600 hover:text-slate-900"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                  <p className="text-sm text-slate-500">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Right: Search, Notifications, User */}
              <div className="flex items-center gap-4">
                {/* Search (hidden on small screens) */}
                <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm w-48"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
