import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function RooferSignup() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openSignup = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
    setError('');
    setFormData({ fullName: '', email: '', password: '' });
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      // Sign up with base44
      const response = await base44.auth.signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        aroof_role: 'external_roofer',
        company_name: formData.fullName
      });

      if (response) {
        // Redirect to dashboard
        navigate(createPageUrl('RooferDashboard'));
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-gray-50">
      {/* HERO SECTION */}
      <div className="bg-blue-900 text-white py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Professional Roof Measurements In 60 Seconds</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">Join hundreds of roofing companies getting qualified leads</p>
      </div>

      {/* PRICING GRID */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20 relative z-10">
        
        {/* STARTER */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800">Starter</h3>
          <div className="text-4xl font-bold text-gray-900 mt-2">$19.95<span className="text-sm text-gray-500">/mo</span></div>
          <p className="text-gray-500 mt-4 text-sm mb-6">Essential CRM access. Pay per lead as you need them.</p>
          <button onClick={() => openSignup('Starter')} className="mt-auto w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">Start 7-Day Free Trial</button>
        </div>

        {/* PRO (HIGHLIGHTED) */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-blue-500 relative transform md:-translate-y-4 flex flex-col">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Most Popular</div>
          <h3 className="text-xl font-bold text-gray-800">Pro</h3>
          <div className="text-4xl font-bold text-blue-600 mt-2">$99<span className="text-sm text-gray-500">/mo</span></div>
          <p className="text-gray-500 mt-4 text-sm font-medium mb-6 text-blue-600">Includes 3 free leads/month</p>
          <ul className="space-y-4 mb-8 text-sm text-gray-600">
            <li className="flex items-center">✅ <span className="ml-3">3 Free leads/month</span></li>
            <li className="flex items-center">✅ <span className="ml-3">Priority Support</span></li>
            <li className="flex items-center">✅ <span className="ml-3">Advanced Reporting</span></li>
          </ul>
          <button onClick={() => openSignup('Pro')} className="mt-auto w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all text-lg">Start Trial - $99/mo</button>
        </div>

        {/* ENTERPRISE */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800">Enterprise</h3>
          <div className="text-4xl font-bold text-gray-900 mt-2">$299<span className="text-sm text-gray-500">/mo</span></div>
          <p className="text-gray-500 mt-4 text-sm mb-6">Unlimited leads + premium features for large teams.</p>
          <button onClick={() => openSignup('Enterprise')} className="mt-auto w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">Start Trial - $299/mo</button>
        </div>
      </div>

      {/* SIMPLE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-2xl font-bold mb-2">Join Aroof {selectedPlan}</h2>
            <p className="text-gray-500 mb-6 text-sm">Create your account to start your 7-day trial.</p>
            <div className="space-y-4">
              <input placeholder="Full Name" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Email Address" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => alert('Account creation logic coming next!')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Create Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}