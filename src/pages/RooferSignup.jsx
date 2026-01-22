import React, { useState } from 'react';

export default function RooferSignup() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-slate-50">
      {/* HERO SECTION */}
      <div className="bg-blue-900 text-white py-32 text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-6">Professional Roof Measurements In 60 Seconds</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">Join hundreds of roofing companies getting qualified leads</p>
      </div>

      {/* PRICING GRID */}
      <section className="max-w-6xl mx-auto px-4 -mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full pb-20">
        
        {/* STARTER */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col h-full">
          <h3 className="text-xl font-bold text-slate-800">Starter</h3>
          <div className="text-4xl font-black text-slate-900 mt-2">$19.95<span className="text-sm font-medium text-slate-500">/mo</span></div>
          <p className="text-slate-500 mt-4 text-sm mb-8">Essential tools for individual roofers. Pay per lead.</p>
          <button onClick={() => {setSelectedPlan('Starter'); setShowModal(true)}} className="mt-auto w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform">Start 7-Day Free Trial</button>
        </div>

        {/* PRO (HIGHLIGHTED) */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-blue-500 relative transform md:-translate-y-6 flex flex-col h-full z-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Most Popular</div>
          <h3 className="text-xl font-bold text-slate-800">Pro</h3>
          <div className="text-4xl font-black text-blue-600 mt-2">$99<span className="text-sm font-medium text-slate-500">/mo</span></div>
          <p className="text-blue-600 mt-4 text-sm font-bold mb-8">Includes 3 FREE Verified Leads/mo</p>
          <ul className="space-y-4 mb-8 text-sm text-slate-600">
            <li className="flex items-center">✅ <span className="ml-3">3 Leads/mo Included</span></li>
            <li className="flex items-center">✅ <span className="ml-3">Priority AI Processing</span></li>
            <li className="flex items-center">✅ <span className="ml-3">Advanced CRM Suite</span></li>
          </ul>
          <button onClick={() => {setSelectedPlan('Pro'); setShowModal(true)}} className="mt-auto w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-xl shadow-blue-200 text-lg">Start Trial - $99/mo</button>
        </div>

        {/* ENTERPRISE */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col h-full">
          <h3 className="text-xl font-bold text-slate-800">Enterprise</h3>
          <div className="text-4xl font-black text-slate-900 mt-2">$299<span className="text-sm font-medium text-slate-500">/mo</span></div>
          <p className="text-slate-500 mt-4 text-sm mb-8">Unlimited scale with 12 FREE leads/month.</p>
          <button onClick={() => {setSelectedPlan('Enterprise'); setShowModal(true)}} className="mt-auto w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform">Start Trial - $299/mo</button>
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">✕</button>
            <h2 className="text-2xl font-black mb-2 text-slate-900">Join Aroof {selectedPlan}</h2>
            <p className="text-slate-500 mb-8 text-sm">Create your contractor account to begin.</p>
            <div className="space-y-4">
              <input placeholder="Full Name" className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <input placeholder="Work Email" className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <button onClick={() => alert('Design is fixed! Ready for signup logic.')} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-colors mt-4">Create Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}