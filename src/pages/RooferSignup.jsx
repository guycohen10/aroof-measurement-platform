import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function RooferSignup() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  // STRIPE PRICE CONFIGURATION
  const PLANS = {
    starter: 'price_1Ss4y2ICVekHY0FRX1GMrOHC',
    pro: 'price_1Ss4ykICVekHY0FRDjn5nL7h',
    enterprise: 'price_1Ss4zSICVekHY0FRlQlfaYbM'
  };

  const handlePlanClick = (planName) => {
    setSelectedPlan(planName);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-gray-50">
      {/* 1. HERO SECTION */}
      <div className="bg-blue-900 text-white py-32 text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Professional Roof Measurements In 60 Seconds</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">Join hundreds of roofing companies getting qualified leads</p>
      </div>

      {/* 2. PRICING GRID */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        
        {/* STARTER */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-800">Starter</h3>
          <div className="text-5xl font-extrabold text-gray-900 mt-4 mb-2">$19.95<span className="text-lg font-medium text-gray-500">/mo</span></div>
          <p className="text-gray-500 mb-8">Essential CRM access. Pay per lead.</p>
          
          <div className="space-y-4 mb-8 flex-1">
            {['Dashboard Access', 'Estimate Builder', 'Measurement Tools', 'Pay Per Lead Access'].map(feature => (
              <div key={feature} className="flex items-center text-gray-700">
                <span className="text-green-500 mr-3 text-xl">✓</span> {feature}
              </div>
            ))}
          </div>
          
          <button onClick={() => handlePlanClick('Starter')} className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg">Start 7-Day Free Trial</button>
          <p className="text-center text-xs text-gray-400 mt-4">No credit card required</p>
        </div>

        {/* PRO (HIGHLIGHTED) */}
        <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-blue-600 relative transform md:-translate-y-6 flex flex-col z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">Most Popular</div>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">Pro</h3>
          <div className="text-5xl font-extrabold text-blue-600 mt-4 mb-2">$99<span className="text-lg font-medium text-gray-500">/mo</span></div>
          <p className="text-gray-500 mb-8">Includes <strong>3 Verified Leads</strong>/mo</p>
          
          <div className="space-y-4 mb-8 flex-1">
            {['Includes 3 Verified Leads/mo', 'Priority Support', 'Advanced Reporting', 'All Starter Features'].map(feature => (
              <div key={feature} className="flex items-center text-gray-700 font-medium">
                <span className="text-green-500 mr-3 text-xl">✓</span> {feature}
              </div>
            ))}
          </div>
          
          <button onClick={() => handlePlanClick('Pro')} className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-200/50">Start 7-Day Free Trial</button>
          <p className="text-center text-xs text-gray-400 mt-4">No credit card required</p>
        </div>

        {/* ENTERPRISE */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-800">Enterprise</h3>
          <div className="text-5xl font-extrabold text-gray-900 mt-4 mb-2">$299<span className="text-lg font-medium text-gray-500">/mo</span></div>
          <p className="text-gray-500 mb-8">Includes <strong>12 Verified Leads</strong>/mo</p>
          
          <div className="space-y-4 mb-8 flex-1">
            {['Includes 12 Verified Leads/mo', 'Dedicated Account Manager', 'API Access', 'White-Glove Onboarding'].map(feature => (
              <div key={feature} className="flex items-center text-gray-700">
                <span className="text-green-500 mr-3 text-xl">✓</span> {feature}
              </div>
            ))}
          </div>
          
          <button onClick={() => handlePlanClick('Enterprise')} className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg">Start 7-Day Free Trial</button>
          <p className="text-center text-xs text-gray-400 mt-4">No credit card required</p>
        </div>
      </div>

      {/* 3. TESTIMONIALS */}
      <div className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-12">Trusted by Roofing Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {text: "This tool cut my estimate time in half. I can respond in minutes now.", author: "Mike Rodriguez", company: "Lone Star Roofing"},
              {text: "The accuracy is impressive. We've used it for 50+ jobs and it's always within 2-5%.", author: "Sarah Chen", company: "Premium Roofing Co."},
              {text: "Best $99 I spend every month. The Pro plan pays for itself with just 2 sales.", author: "Tom Anderson", company: "Anderson Brothers Roofing"}
            ].map((t, i) => (
              <div key={i} className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                <div className="text-yellow-400 text-sm mb-4">★★★★★</div>
                <p className="text-gray-300 mb-6 italic">"{t.text}"</p>
                <div>
                  <div className="font-bold">{t.author}</div>
                  <div className="text-sm text-blue-400">{t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. FOOTER CTA */}
      <div className="bg-blue-600 text-white py-20 text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to Measure Faster?</h2>
        <p className="opacity-90 mb-8 text-lg">Join 150+ roofing companies using Aroof today.</p>
        <button onClick={() => handlePlanClick('Pro')} className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition shadow-xl">Start Your Free Trial</button>
      </div>

      {/* 5. MODAL (SAFE MODE) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Create Account</h2>
            <p className="text-gray-500 mb-6">Start your 7-day free trial for the <strong>{selectedPlan}</strong> plan.</p>
            
            <div className="space-y-4">
              <input placeholder="Full Name" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              <input placeholder="Company Name" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              <input placeholder="Email Address" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="password" placeholder="Password" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              <button onClick={() => alert('Design is Perfect! Now we activate the logic.')} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition">Create Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}