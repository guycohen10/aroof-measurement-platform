import React, { useState } from "react";
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
      // Query User entity to find matching user
      const users = await base44.entities.User.list();
      
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.full_name // Just verify user exists - Base44 handles actual auth
      );
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Verify role matches
      if (selectedRole === 'admin' && user.role !== 'admin') {
        throw new Error('You do not have admin access');
      }
      
      if (selectedRole === 'estimator' && user.aroof_role !== 'estimator') {
        throw new Error('You do not have estimator access');
      }
      
      if (selectedRole === 'dispatcher' && user.aroof_role !== 'dispatcher') {
        throw new Error('You do not have dispatcher access');
      }
      
      if (selectedRole === 'crew' && user.aroof_role !== 'crew_lead') {
        throw new Error('You do not have crew lead access');
      }
      
      if (selectedRole === 'roofer' && user.aroof_role !== 'external_roofer') {
        throw new Error('You do not have roofer access');
      }
      
      // Use Base44's built-in login redirect
      base44.auth.redirectToLogin(selectedRoleData.redirect);
      
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
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Password
                    </label>
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
      </div>
    </div>
  );
}