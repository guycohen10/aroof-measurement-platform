import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  ShoppingCart, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  Receipt,
  Settings,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Briefcase,
  TrendingUp,
  CreditCard,
  LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils";

const navSections = [
  {
    title: 'Main',
    items: [
      { label: 'Overview', icon: Home, path: 'RooferDashboard' },
      { label: 'My Tasks', icon: ListTodo, path: 'LeadManagement' }
    ]
  },
  {
    title: 'Lead Center',
    items: [
      { label: 'Buy Leads', icon: ShoppingCart, path: 'RooferBrowseLeads' },
      { label: 'My Leads', icon: Users, path: 'LeadManagement' }
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Job Board', icon: Briefcase, path: 'JobBoard' },
      { label: 'Dispatch Calendar', icon: Calendar, path: 'JobScheduling' }
    ]
  },
  {
    title: 'Financials',
    items: [
      { label: 'Estimates', icon: FileText, path: 'EstimateManager' },
      { label: 'Invoices', icon: Receipt, path: 'InvoiceManager' },
      { label: 'Transactions', icon: CreditCard, path: 'WalletHistory' }
    ]
  },
  {
    title: 'Company',
    items: [
      { label: 'Team Management', icon: Users, path: 'TeamManager' },
      { label: 'Settings', icon: Settings, path: 'CompanySettings' }
    ],
    ownerOnly: true
  }
];

export default function RooferSidebar({ className }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['Main', 'Lead Center']);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setUserProfile(user);
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      company_owner: 'bg-purple-500 text-white',
      admin: 'bg-red-500 text-white',
      external_roofer: 'bg-blue-500 text-white',
      sales: 'bg-green-500 text-white',
      estimator: 'bg-blue-500 text-white',
      dispatcher: 'bg-yellow-500 text-white',
      crew: 'bg-gray-500 text-white'
    };
    return colors[role] || 'bg-gray-500 text-white';
  };

  const getRoleLabel = (role) => {
    const labels = {
      company_owner: 'Owner',
      admin: 'Admin',
      external_roofer: 'Roofer',
      sales: 'Sales',
      estimator: 'Estimator',
      dispatcher: 'Dispatcher',
      crew: 'Crew'
    };
    return labels[role] || role;
  };

  const toggleSection = (title) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (path) => {
    return location.pathname === createPageUrl(path);
  };

  const canViewSection = (section) => {
    if (!userProfile) return true; // Show all until role is loaded
    
    const role = userProfile.aroof_role;
    const isOwnerOrAdmin = role === 'company_owner' || userProfile.role === 'admin';
    
    // STRICT: Hide Company section for non-owners/non-admins
    if (section.ownerOnly && !isOwnerOrAdmin) {
      return false;
    }

    // Crew members can't see Financials
    if (role === 'crew' && section.title === 'Financials') {
      return false;
    }

    return true;
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className={cn("bg-white border-r border-slate-200 h-full overflow-y-auto flex flex-col", className)}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-slate-900">Aroof CRM</h2>
        <p className="text-xs text-slate-500">Business Operating System</p>
      </div>

      {/* User Identity Card */}
      {userProfile && (
        <div className="p-4 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {userProfile.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">
                {userProfile.full_name || userProfile.email}
              </p>
              <Badge className={cn("text-xs mt-1", getRoleBadgeColor(userProfile.aroof_role))}>
                {getRoleLabel(userProfile.aroof_role)}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <nav className="p-4 space-y-2 flex-1">
        {navSections.filter(section => canViewSection(section)).map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <span>{section.title}</span>
              {expandedSections.includes(section.title) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {expandedSections.includes(section.title) && (
              <div className="mt-1 space-y-1 ml-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={createPageUrl(item.path)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}