import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

export default function RooferSignup() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFormData({ name: '', company: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-slate-50">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Professional Roof Measurements In 60 Seconds</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Join hundreds of roofing companies getting qualified leads. Start your free trial today.</p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative z-10">
        
        {/* Starter Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Starter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-4xl font-bold text-gray-900">$19.95</div>
              <div className="text-sm text-gray-600 mt-1">/month</div>
            </div>
            <p className="text-gray-700 text-sm">Essential CRM access. Pay per lead.</p>
            <Button
              onClick={() => setShowModal(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 font-semibold"
            >
              Start 7-Day Free Trial
            </Button>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>✓ Basic CRM</li>
              <li>✓ Lead tracking</li>
              <li>✓ Email support</li>
            </ul>
          </CardContent>
        </Card>

        {/* Pro Card (Highlighted) */}
        <Card className="shadow-2xl border-2 border-blue-500 transform md:-translate-y-6">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
            Most Popular
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-4xl font-bold text-blue-600">$99</div>
              <div className="text-sm text-gray-600 mt-1">/month</div>
            </div>
            <p className="text-gray-700 text-sm font-medium">Includes 3 Verified Leads/month</p>
            <Button
              onClick={() => setShowModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold shadow-lg"
            >
              Start 7-Day Free Trial
            </Button>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>✓ Full CRM suite</li>
              <li>✓ 3 verified leads included</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
            </ul>
          </CardContent>
        </Card>

        {/* Enterprise Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Enterprise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-4xl font-bold text-gray-900">$299</div>
              <div className="text-sm text-gray-600 mt-1">/month</div>
            </div>
            <p className="text-gray-700 text-sm">Includes 12 Verified Leads/month</p>
            <Button
              onClick={() => setShowModal(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 font-semibold"
            >
              Start 7-Day Free Trial
            </Button>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>✓ Everything in Pro</li>
              <li>✓ 12 verified leads included</li>
              <li>✓ Dedicated account manager</li>
              <li>✓ Custom integrations</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <Input
                  placeholder="ABC Roofing Co."
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full"
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold mt-6">
                Create Account
              </Button>
              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}