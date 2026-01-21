import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function RooferSignup() {
  const [step, setStep] = useState('pricing'); // Options: 'pricing', 'register', 'verify'
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    code: ''
  });

  // 1. Configuration - Replace these with your REAL Price IDs
  const PLANS = {
    starter: 'price_1Ss4y2ICVekHY0FRX1GMrOHC',
    pro: 'price_1Ss4ykICVekHY0FRDjn5nL7h',
    enterprise: 'price_1Ss4zSICVekHY0FRlQlfaYbM'
  };

  // 2. Handle Plan Selection
  const selectPlan = (priceId) => {
    // Check if user is already logged in
    base44.auth.currentAuthenticatedUser()
      .then(user => {
        // If logged in, go straight to payment
        startCheckout(priceId, user.username);
      })
      .catch(() => {
        // If not logged in, open registration modal
        setSelectedPrice(priceId);
        setStep('register');
      });
  };

  // 3. Handle Registration (Step 1)
  const handleRegister = async () => {
    setLoading(true);
    try {
      // EXPLICIT CALL to base44.auth
      await base44.auth.signUp({
        username: formData.email,
        password: formData.password,
        attributes: {
          name: formData.name,
          company_name: formData.company
        }
      });
      setStep('verify'); // FLIP TO VERIFY SCREEN
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Registration Failed: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Verification & Payment (Step 2)
  const handleVerifyAndPay = async () => {
    setLoading(true);
    try {
      // A. Confirm Email
      await base44.auth.confirmSignUp(formData.email, formData.code);

      // B. Sign In
      await base44.auth.signIn(formData.email, formData.password);

      // C. Create Company Record
      const companyId = 'cmp_' + Date.now();
      await base44.entities.Company.create({
        company_id: companyId,
        name: formData.company,
        email: formData.email,
        subscription_status: 'trial'
      });

      // D. Update User Record
      await base44.entities.User.update(
        { id: 'me' }, // Target current user
        { company_id: companyId, role: 'owner' }
      );

      // E. Go to Stripe
      await startCheckout(selectedPrice, formData.email);
    } catch (error) {
      console.error("Verify Error:", error);
      alert("Verification Failed: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  // 5. Backend Checkout Call
  const startCheckout = async (priceId, email) => {
    try {
      const response = await base44.functions.invoke('createSubscriptionCheckoutSession', {
        priceId: priceId,
        email: email,
        userId: email
      });
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert("Payment Error: No URL returned");
      }
    } catch (error) {
      alert("Payment System Error: " + error.message);
    }
  };

  // 6. Render Logic
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Pricing Grid */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        
        {/* STARTER */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Starter</h3>
          <div className="text-4xl font-bold text-blue-600 mt-2">$19.95<span className="text-sm text-gray-500">/mo</span></div>
          <p className="text-gray-500 mt-2">Essential CRM access. Pay per lead.</p>
          <button onClick={() => selectPlan(PLANS.starter)} className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800">Start 7-Day Free Trial</button>
        </div>

        {/* PRO (Highlighted) */}
        <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-blue-500 relative transform -translate-y-4">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">Most Popular</div>
          <h3 className="text-2xl font-bold text-gray-800">Pro</h3>
          <div className="text-4xl font-bold text-blue-600 mt-2">$99<span className="text-sm text-gray-500">/mo</span></div>
          <p className="text-gray-500 mt-2">Includes <strong>3 Verified Leads</strong> per month.</p>
          <ul className="mt-6 space-y-3 text-gray-600">
            <li>✅ 3 Leads Included ($150 value)</li>
            <li>✅ Priority Support</li>
            <li>✅ Advanced Reporting</li>
          </ul>
          <button onClick={() => selectPlan(PLANS.pro)} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-lg">Start 7-Day Free Trial</button>
        </div>

        {/* ENTERPRISE */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Enterprise</h3>
          <div className="text-4xl font-bold text-blue-600 mt-2">$299<span className="text-sm text-gray-500">/mo</span></div>
          <p className="text-gray-500 mt-2">Maximum scale for growing teams.</p>
          <p className="text-gray-500 mt-2">Includes <strong>12 Verified Leads</strong> per month.</p>
          <button onClick={() => selectPlan(PLANS.enterprise)} className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800">Start 7-Day Free Trial</button>
        </div>
      </div>

      {/* MODAL */}
      {(step === 'register' || step === 'verify') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setStep('pricing')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            
            {step === 'register' ? (
              <>
                <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>
                <div className="space-y-4">
                  <input placeholder="Full Name" className="w-full p-3 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input placeholder="Company Name" className="w-full p-3 border rounded" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  <input placeholder="Email" className="w-full p-3 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="password" placeholder="Password" className="w-full p-3 border rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <button onClick={handleRegister} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Verify Email</h2>
                <p className="text-gray-600 mb-6">We sent a code to {formData.email}. Enter it below.</p>
                <div className="space-y-4">
                  <input placeholder="000000" className="w-full p-3 border rounded text-center text-2xl tracking-widest" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                  <button onClick={handleVerifyAndPay} disabled={loading} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">
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