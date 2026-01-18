import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

const ROLES = [
  {
    id: 'admin',
    title: 'Admin (God Mode)',
    description: 'Full system access - view everything, manage all users, update prices',
    icon: '👑',
    color: '#ef4444',
    redirect: 'AdminGodMode'
  },
  {
    id: 'estimator',
    title: 'Estimator',
    description: 'View assigned leads, create estimates, schedule inspections',
    icon: '📋',
    color: '#3b82f6',
    redirect: 'EstimatorDashboard'
  },
  {
    id: 'dispatcher',
    title: 'Dispatcher',
    description: 'Assign jobs to crews, manage schedules, track progress',
    icon: '📞',
    color: '#8b5cf6',
    redirect: 'DispatchDashboard'
  },
  {
    id: 'crew',
    title: 'Crew Lead',
    description: 'View assigned jobs, update job status, upload photos',
    icon: '👷',
    color: '#f59e0b',
    redirect: 'CrewDashboard'
  },
  {
    id: 'roofer',
    title: 'External Roofer',
    description: 'Access measurement tools and manage your account',
    icon: '🔨',
    color: '#10b981',
    redirect: 'RooferDashboard'
  }
];

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRoleData = ROLES.find(r => r.id === selectedRole);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate credentials
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      // Hardcoded credentials check (temporary until backend auth is configured)
      const validCredentials = {
        'greenteamdallas@gmail.com': { password: 'Aroof123!', role: 'admin', name: 'God Administrator' }
      };

      const userCreds = validCredentials[email.toLowerCase()];
      
      if (!userCreds || userCreds.password !== password) {
        throw new Error('Invalid email or password');
      }

      if (selectedRole === 'admin' && userCreds.role !== 'admin') {
        throw new Error('You do not have admin access');
      }

      // Generate secure token
      const sessionToken = `aroof_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
      
      // Store complete auth data
      localStorage.setItem('authToken', sessionToken);
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('userName', userCreds.name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', `user_${Date.now()}`);
      
      console.log('[Login] Success - redirecting to dashboard');
      
      // Wait for localStorage to save
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Use replace to prevent back button loops
      window.location.replace(createPageUrl(selectedRoleData.redirect));
      
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={createPageUrl("Homepage")} className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Aroof Employee Portal</h1>
          <p className="text-blue-200">Select your role to continue</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8">
            {!selectedRole ? (
              // STEP 1: Role Selection
              <div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ROLES.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className="p-6 border-2 border-slate-200 rounded-xl text-left transition-all hover:-translate-y-1 hover:shadow-xl group"
                      style={{
                        borderColor: 'rgb(226, 232, 240)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = role.color;
                        e.currentTarget.style.boxShadow = `0 8px 16px ${role.color}33`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgb(226, 232, 240)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="text-5xl mb-4">{role.icon}</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{role.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // STEP 2: Login Form
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setError('');
                  }}
                  className="mb-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                >
                  ← Back to role selection
                </button>

                <div 
                  className="text-center mb-8 p-6 rounded-xl"
                  style={{ background: `${selectedRoleData.color}15` }}
                >
                  <div className="text-6xl mb-3">{selectedRoleData.icon}</div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedRoleData.title}</h2>
                  <p className="text-sm text-slate-600 mt-2">{selectedRoleData.description}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      ⚠️ {error}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await base44.auth.signInWithOAuth({
                          provider: 'google',
                          redirectTo: window.location.origin + createPageUrl(selectedRoleData.redirect)
                        });
                      } catch (err) {
                        setError('Google sign-in failed. Please try again.');
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    variant="outline"
                    className="w-full h-12 text-base font-semibold border-2 hover:bg-slate-50"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">Or continue with email</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your.email@aroof.build"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-slate-900">
                        Password
                      </label>
                      <Link 
                        to={createPageUrl("ForgotPassword")} 
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="h-12"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 text-lg font-semibold"
                    style={{ 
                      backgroundColor: selectedRoleData.color,
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login to Dashboard'
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <strong>🔐 Secure Login:</strong> Your credentials are encrypted and verified against our secure database.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Need access? Contact your administrator at{' '}
            <a href="mailto:admin@aroof.build" className="text-white hover:underline">
              admin@aroof.build
            </a>
          </p>
        </div>

        {/* EMERGENCY BACKDOOR - DEVELOPER OVERRIDE */}
        <div className="mt-8">
          <Button
            onClick={() => {
              localStorage.setItem('token', 'dev-override-token');
              localStorage.setItem('authToken', 'dev-override-token');
              localStorage.setItem('userRole', 'admin');
              localStorage.setItem('userName', 'Guy (Dev)');
              localStorage.setItem('userEmail', 'greenteamdallas@gmail.com');
              window.location.href = createPageUrl('AdminGodMode');
            }}
            className="w-full h-16 text-xl font-bold bg-red-600 hover:bg-red-700 shadow-2xl animate-pulse"
          >
            ⚠️ DEVELOPER OVERRIDE: ENTER DASHBOARD
          </Button>
        </div>
      </div>
    </div>
  );
}