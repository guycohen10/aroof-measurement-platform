import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function RooferSignup() {
  const [step, setStep] = useState('pricing');
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    code: ''
  });

  // STRIPE PRICE CONFIGURATION
  const PLANS = {
    starter: 'price_1Ss4y2ICVekHY0FRX1GMrOHC',
    pro: 'price_1Ss4ykICVekHY0FRDjn5nL7h',
    enterprise: 'price_1Ss4zSICVekHY0FRlQlfaYbM'
  };

  // PLAN SELECTION LOGIC
  const selectPlan = async (priceId) => {
    try {
      // DIRECT ACCESS TO GLOBAL BASE44 OBJECT
      const user = await base44.auth.currentAuthenticatedUser();
      startCheckout(priceId, user.username);
    } catch (err) {
      // User not logged in, show registration
      setSelectedPrice(priceId);
      setStep('register');
    }
  };

  // REGISTRATION LOGIC
  const handleRegister = async () => {
    setLoading(true);
    try {
      await base44.auth.signUp({
        username: formData.email,
        password: formData.password,
        attributes: {
          name: formData.name,
          company_name: formData.company
        }
      });
      setStep('verify');
    } catch (error) {
      alert("Error: " + (error.message || JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  };

  // VERIFICATION & PAY LOGIC
  const handleVerifyAndPay = async () => {
    setLoading(true);
    try {
      await base44.auth.confirmSignUp(formData.email, formData.code);
      await base44.auth.signIn(formData.email, formData.password);

      const companyId = 'cmp_' + Date.now();
      await base44.entities.Company.create({
        company_id: companyId,
        name: formData.company,
        email: formData.email,
        subscription_status: 'trial'
      });
      
      await base44.entities.User.update(
        { id: 'me' },
        { company_id: companyId, role: 'owner' }
      );
      
      await startCheckout(selectedPrice, formData.email);
      
    } catch (error) {
      alert("Verification Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // STRIPE HANDOFF
  const startCheckout = async (priceId, email) => {
    try {
      const response = await base44.functions.createSubscriptionCheckoutSession({
        priceId: priceId,
        email: email,
        userId: email
      });
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        alert("Stripe Error: No URL returned.");
      }
    } catch (error) {
      alert("Payment Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-16">
      {/* PRICING CARDS */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative z-10">
        
        {/* STARTER */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-800">Starter</h3>
          <div className="text-4xl font-bold text-blue-600 mt-2">$19.95<span className="text-sm text-gray-500">/mo</span></div>
          <p className="text-gray-500 mt-4 mb-6">Essential CRM access. Pay per lead.</p>
          <button onClick={() => selectPlan(PLANS.starter)} className="mt-auto w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">Start 7-Day Free Trial</button>
        </div>

        {/* PRO (HIGHLIGHTED) */}
        <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-blue-600 relative transform md:-translate-y-4 flex flex-col">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">Most Popular</div>
          <h3 className="text-2xl font-bold text-gray-800">Pro</h3>
          <div className="text-4xl font-bold text-blue-600 mt-2">$99<span className="text-sm text-gray-500">/mo</span></div>
          <p className="text-gray-500 mt-4 font-medium">Includes 3 Verified Leads/mo</p>
          <ul className="mt-6 mb-8 space-y-3 text-gray-600 text-left">
            <li className="flex items-center">✅ <span className="ml-2">3 Leads Included ($150 value)</span></li>
            <li className="flex items-center">✅ <span className="ml-2">Priority Support</span></li>
            <li className="flex items-center">✅ <span className="ml-2">Advanced Reporting</span></li>
          </ul>
          <button onClick={() => selectPlan(PLANS.pro)} className="mt-auto w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition">Start 7-Day Free Trial</button>
        </div>

        {/* ENTERPRISE */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-800">Enterprise</h3>
          <div className="text-4xl font-bold text-blue-600 mt-2">$299<span className="text-sm text-gray-500">/mo</span></div>
          <p className="text-gray-500 mt-4 mb-6">Includes 12 Verified Leads/mo</p>
          <button onClick={() => selectPlan(PLANS.enterprise)} className="mt-auto w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">Start 7-Day Free Trial</button>
        </div>
      </div>

      {/* MODAL */}
      {(step === 'register' || step === 'verify') && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            <button onClick={() => setStep('pricing')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            
            {step === 'register' ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h2>
                <div className="space-y-4">
                  <input placeholder="Full Name" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input placeholder="Company Name" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  <input placeholder="Email" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="password" placeholder="Password" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <button onClick={handleRegister} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Verify Email</h2>
                <p className="text-gray-600 mb-6">Enter the code sent to <strong>{formData.email}</strong></p>
                <div className="space-y-4">
                  <input placeholder="000000" className="w-full p-4 border-2 border-blue-100 rounded text-center text-3xl tracking-widest font-mono focus:border-blue-500 outline-none" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                  <button onClick={handleVerifyAndPay} disabled={loading} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">
                    {loading ? 'Verifying...' : 'Verify & Pay'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}