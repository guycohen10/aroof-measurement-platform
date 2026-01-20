import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from "@/utils";
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
  CreditCard
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
    ]
  }
];

export default function RooferSidebar({ className }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['Main', 'Lead Center']);

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

  return (
    <div className={cn("bg-white border-r border-slate-200 h-full overflow-y-auto", className)}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-slate-900">Aroof CRM</h2>
        <p className="text-xs text-slate-500">Business Operating System</p>
      </div>

      <nav className="p-4 space-y-2">
        {navSections.map((section) => (
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
    </div>
  );
}