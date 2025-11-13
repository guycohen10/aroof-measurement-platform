import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Home, Phone, ChevronDown, ArrowRight, User, LogOut, Building2 } from "lucide-react";

export default function Navigation() {
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      window.location.href = createPageUrl("Homepage");
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isExternalRoofer = user?.aroof_role === 'external_roofer';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={createPageUrl("Homepage")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Aroof</h1>
              <p className="text-xs text-blue-600 font-semibold">DFW's #1 Roofing Company</p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-slate-600 hover:text-blue-900 font-medium transition-colors">
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {servicesDropdownOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3 text-sm">Roofing Services</h4>
                      <div className="space-y-2">
                        <Link to={createPageUrl("RoofReplacement")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Roof Replacement
                        </Link>
                        <Link to={createPageUrl("RoofRepair")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Roof Repair
                        </Link>
                        <Link to={createPageUrl("RoofInspection")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Roof Inspection
                        </Link>
                        <Link to={createPageUrl("EmergencyRoofing")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Emergency Roofing
                        </Link>
                        <Link to={createPageUrl("StormDamage")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Storm Damage
                        </Link>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3 text-sm">Exterior Services</h4>
                      <div className="space-y-2">
                        <Link to={createPageUrl("Gutters")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Gutter Installation
                        </Link>
                        <Link to={createPageUrl("Siding")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Siding Installation
                        </Link>
                        <Link to={createPageUrl("Windows")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Window Replacement
                        </Link>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3 text-sm">Specialized</h4>
                      <div className="space-y-2">
                        <Link to={createPageUrl("Commercial")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Commercial Roofing
                        </Link>
                        <Link to={createPageUrl("Insurance")} className="block text-sm text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all">
                          Insurance Claims
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                    <Link to={createPageUrl("Services")} className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center gap-1">
                      View All Services
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <a href="#how-it-works" className="text-slate-600 hover:text-blue-900 font-medium">How It Works</a>
            <a href="#benefits" className="text-slate-600 hover:text-blue-900 font-medium">Why Aroof</a>
            
            {/* User Menu or Login/Signup */}
            {!loading && (
              <>
                {user ? (
                  isExternalRoofer ? (
                    // Roofer is logged in
                    <div className="flex items-center gap-4">
                      <Link to={createPageUrl("RooferDashboard")}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span className="font-semibold">{user.company_name || 'Dashboard'}</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-slate-600 hover:text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    // Other user logged in
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">
                        {user.full_name || user.email}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Logout
                      </Button>
                    </div>
                  )
                ) : (
                  // Not logged in
                  <div className="flex items-center gap-3">
                    <Link to={createPageUrl("RooferLogin")}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Contractor Login
                      </Button>
                    </Link>
                    <Link to={createPageUrl("RooferSignup")}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
            
            <a href="tel:+18502389727" className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
              <Phone className="w-4 h-4" />
              (850) 238-9727
            </a>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            {!loading && user && isExternalRoofer && (
              <Link to={createPageUrl("RooferDashboard")}>
                <Button variant="outline" size="sm">
                  <Building2 className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <a href="tel:+18502389727" className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 rounded-lg font-bold text-sm">
              <Phone className="w-4 h-4" />
              Call
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}