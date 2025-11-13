
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Phone, ChevronDown, ArrowRight } from "lucide-react";

export default function Navigation() {
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

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
          
          <div className="hidden md:flex items-center gap-8">
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
                    {/* Column 1: Roofing Services */}
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
                    
                    {/* Column 2: Exterior Services */}
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
                    
                    {/* Column 3: Specialized */}
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
                  
                  {/* View All Services Link */}
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
            <a href="#reviews" className="text-slate-600 hover:text-blue-900 font-medium">Reviews</a>

            <Link to={createPageUrl("RooferSignup")} className="text-blue-600 hover:text-blue-900 font-semibold">
              For Contractors
            </Link>
            
            <a href="tel:+18502389727" className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
              <Phone className="w-4 h-4" />
              (850) 238-9727
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
