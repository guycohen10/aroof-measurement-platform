import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function RooferSignup() {
  const [step, setStep] = useState('pricing'); // 'pricing' | 'register' | 'success'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', company: '', email: '', password: '', code: '', companyId: '' });
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // STRIPE CONFIG
  const PLANS = {
    starter: 'price_1Ss4y2ICVekHY0FRX1GMrOHC',
    pro: 'price_1Ss4ykICVekHY0FRDjn5nL7h',
    enterprise: 'price_1Ss4zSICVekHY0FRlQlfaYbM'
  };

  // ACTIONS
  const handlePlanSelect = (plan, name) => {
    setSelectedPlan({ id: plan, name: name });
    setStep('register');
  };

  const handleRegister = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      const response = await base44.functions.invoke('registerUser', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        company: formData.company
      });

      if (response.data.success) {
        // Store company ID for later
        setFormData({...formData, companyId: response.data.companyId});
        setErrorMessage('');
        setStep('success');
      } else {
        setErrorMessage(response.data.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndPay = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      // Setup user after they've logged in via invitation link
      const response = await base44.functions.invoke('verifyAndSetup', {
        email: formData.email,
        companyId: formData.companyId
      });

      if (response.data.success) {
        // Redirect to Stripe checkout
        const checkoutResponse = await base44.functions.invoke('createSubscriptionCheckoutSession', {
          priceId: selectedPlan.id,
          email: formData.email,
          userId: formData.email
        });

        if (checkoutResponse.data.url) {
          window.location.href = checkoutResponse.data.url;
        }
      } else {
        setErrorMessage(response.data.error || 'Setup failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FAQ DATA
  const faqs = [
    { q: "Do I need to visit the property?", a: "No. Our AI uses high-resolution satellite imagery to measure the roof remotely with 98% accuracy." },
    { q: "How accurate are the measurements?", a: "We guarantee 95-99% accuracy, verified against EagleView and hands-on measurements." },
    { q: "Can I cancel my trial?", a: "Yes. You can cancel instantly from your dashboard. If you cancel within 7 days, you won't be charged a penny." },
    { q: "What happens after the trial?", a: "You will be enrolled in the plan you selected. You can upgrade or downgrade at any time." }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="bg-slate-900 text-white pt-24 pb-48 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-blue-300 tracking-wide">TRUSTED BY 150+ ROOFING PROS</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
            Stop Driving. <br/><span className="text-blue-500">Start Closing.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get instant, AI-powered roof measurements without leaving your office. Save 2+ hours per estimate.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm font-medium text-slate-400">
            <span className="flex items-center">✓ No Credit Card Required</span>
            <span className="hidden md:block">•</span>
            <span className="flex items-center">✓ 7-Day Free Trial</span>
            <span className="hidden md:block">•</span>
            <span className="flex items-center">✓ Cancel Anytime</span>
          </div>
        </div>
      </section>

      {/* 2. PRICING GRID */}
      <section className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {/* STARTER */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 flex flex-col hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-bold text-slate-800">Starter</h3>
          <div className="text-4xl font-black text-slate-900 mt-4 mb-2">$19.95<span className="text-sm font-medium text-slate-500">/mo</span></div>
          <p className="text-slate-500 text-sm mb-8">Perfect for solo contractors.</p>
          <ul className="space-y-4 mb-8 flex-1 text-slate-600 text-sm">
            {['Unlimited Estimates', 'Basic CRM', 'Pay-Per-Lead Access'].map(f => (
              <li key={f} className="flex items-center"><span className="text-green-500 mr-3">✓</span>{f}</li>
            ))}
          </ul>
          <button onClick={() => handlePlanSelect(PLANS.starter, 'Starter')} className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition">Start Free Trial</button>
        </div>

        {/* PRO */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-blue-600 relative transform md:-translate-y-6 flex flex-col z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Most Popular</div>
          <h3 className="text-xl font-bold text-slate-800 mt-2">Pro</h3>
          <div className="text-4xl font-black text-blue-600 mt-4 mb-2">$99<span className="text-sm font-medium text-slate-500">/mo</span></div>
          <p className="text-slate-500 text-sm mb-8">Includes <strong>3 FREE Leads</strong> ($150 Value)</p>
          <ul className="space-y-4 mb-8 flex-1 text-slate-700 font-medium text-sm">
            {['Everything in Starter', '3 Verified Leads/mo', 'Priority Support', 'Advanced Reports'].map(f => (
              <li key={f} className="flex items-center"><span className="text-blue-500 mr-3">✓</span>{f}</li>
            ))}
          </ul>
          <button onClick={() => handlePlanSelect(PLANS.pro, 'Pro')} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Start Free Trial</button>
        </div>

        {/* ENTERPRISE */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 flex flex-col hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-bold text-slate-800">Enterprise</h3>
          <div className="text-4xl font-black text-slate-900 mt-4 mb-2">$299<span className="text-sm font-medium text-slate-500">/mo</span></div>
          <p className="text-slate-500 text-sm mb-8">For scaling teams.</p>
          <ul className="space-y-4 mb-8 flex-1 text-slate-600 text-sm">
            {['Everything in Pro', '12 Verified Leads/mo', 'API Access', 'Account Manager'].map(f => (
              <li key={f} className="flex items-center"><span className="text-green-500 mr-3">✓</span>{f}</li>
            ))}
          </ul>
          <button onClick={() => handlePlanSelect(PLANS.enterprise, 'Enterprise')} className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition">Start Free Trial</button>
        </div>
      </section>

      {/* 3. TESTIMONIALS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Why Roofers Switch to Aroof</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {t: "I used to spend 15 hours a week driving to estimates. Now I do it in 15 minutes.", n: "Mike R.", c: "Lone Star Roofing"},
              {t: "The lead quality is insane. The 'Pro' plan pays for itself with one job.", n: "Sarah J.", c: "Top Tier Construction"},
              {t: "Finally, software that doesn't need a PhD to use. Simple, fast, profitable.", n: "Tom B.", c: "Benchmark Roofing"}
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <div className="flex text-yellow-400 mb-4">★★★★★</div>
                <p className="text-slate-600 mb-6 italic">"{item.t}"</p>
                <div>
                  <div className="font-bold text-slate-900">{item.n}</div>
                  <div className="text-sm text-blue-600">{item.c}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button onClick={() => setActiveFAQ(activeFAQ === i ? null : i)} className="w-full flex justify-between items-center p-6 text-left font-bold text-slate-800 hover:bg-slate-50 transition">
                  {faq.q}
                  <span className="text-blue-500 text-2xl">{activeFAQ === i ? '−' : '+'}</span>
                </button>
                {activeFAQ === i && (
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <p className="mb-4">© 2026 Aroof Inc. Built for Roofers, by Roofers.</p>
        <div className="flex justify-center gap-6 text-sm">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Support</a>
        </div>
      </footer>

      {/* MODAL (2-STEP) */}
      {(step === 'register' || step === 'success') && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            <button onClick={() => setStep('pricing')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            
            {step === 'register' ? (
              <>
                <h2 className="text-2xl font-bold mb-2">Create Account</h2>
                <p className="text-slate-500 mb-6 text-sm">Set up your account for the <strong>{selectedPlan?.name}</strong> plan.</p>
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {errorMessage}
                  </div>
                )}
                <div className="space-y-4">
                  <input placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input placeholder="Company Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  <input placeholder="Email Address" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <button onClick={handleRegister} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
                  <p className="text-slate-600 mb-4">We have sent a verification link to</p>
                  <p className="text-blue-600 font-semibold mb-6">{formData.email}</p>
                  <p className="text-slate-500 text-sm mb-8">Please click the link in your email to activate your account and set your password.</p>
                  <button onClick={() => window.location.href = '/rooferlogin'} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    Go to Login
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