import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function RooferSignup() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">Professional Roof Measurements In 60 Seconds</h1>
        <p className="text-xl text-blue-100">Join hundreds of roofing companies getting qualified leads</p>
      </div>

      {/* Pricing Cards Container */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        
        {/* Starter Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
          <div className="text-4xl font-bold text-gray-900 mb-1">$19.95</div>
          <div className="text-gray-600 text-sm mb-6">/month</div>
          <p className="text-gray-700 text-sm mb-8">Essential CRM access. Pay per lead.</p>
          <button
            onClick={() => alert('Button Clicked')}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-bold transition"
          >
            Start 7-Day Free Trial
          </button>
        </div>

        {/* Pro Card (Highlighted) */}
        <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-blue-500 relative transform md:-translate-y-6">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase">
            Most Popular
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
          <div className="text-4xl font-bold text-blue-600 mb-1">$99</div>
          <div className="text-gray-600 text-sm mb-6">/month</div>
          <p className="text-gray-700 text-sm font-medium mb-8">Includes 3 Verified Leads/month</p>
          <button
            onClick={() => alert('Button Clicked')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition shadow-lg"
          >
            Start 7-Day Free Trial
          </button>
        </div>

        {/* Enterprise Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
          <div className="text-4xl font-bold text-gray-900 mb-1">$299</div>
          <div className="text-gray-600 text-sm mb-6">/month</div>
          <p className="text-gray-700 text-sm mb-8">Includes 12 Verified Leads/month</p>
          <button
            onClick={() => alert('Button Clicked')}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-bold transition"
          >
            Start 7-Day Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}