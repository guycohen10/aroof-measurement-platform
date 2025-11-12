import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Phone } from "lucide-react";

export default function StormDamage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="border-b bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl("Services")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-8xl mb-8">🌪️</div>
        <h1 className="text-5xl font-bold text-slate-900 mb-6">Storm Damage Repair</h1>
        <p className="text-xl text-slate-600 mb-8">
          Complete information about this service coming soon.
        </p>
        <p className="text-lg text-slate-700 mb-12">
          For immediate assistance or to schedule a free consultation, please call us at:
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button size="lg" className="h-16 px-10 text-xl bg-blue-600 hover:bg-blue-700" asChild>
            <a href="tel:+18502389727">
              <Phone className="w-5 h-5 mr-2" />
              (850) 238-9727
            </a>
          </Button>
          <Link to={createPageUrl("Services")}>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl">
              <ArrowLeft className="w-5 h-5 mr-2" />
              All Services
            </Button>
          </Link>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <p className="text-sm text-blue-900">
              We're currently building out detailed service pages. In the meantime, our team is ready to help you with any questions about storm damage repair services.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}