import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Users, AlertCircle } from "lucide-react";

export default function JoinTeam() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const companyId = searchParams.get('c');
  const companyName = searchParams.get('n') || 'the Company';
  const roleToAssign = searchParams.get('r') || 'estimator';

  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Invalid Invite Link</h2>
            <p className="text-slate-600 mb-6">
              This invite link is invalid or expired. Please ask your manager for a new link.
            </p>
            <Link to={createPageUrl("Homepage")}>
              <Button className="w-full">Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('🔵 Registering employee account...');
      
      // 1. REGISTER (Standard Auth)
      await base44.auth.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        aroof_role: roleToAssign,
        company_name: companyName,
      });

      console.log('✅ Registration successful - now linking to company...');

      // 2. LINK TO COMPANY (After email verification, this will be done in verification step)
      // For now, we'll redirect to verification
      alert(`Account created! Check ${formData.email} for a verification code.`);
      
      // Store invite details for post-verification
      sessionStorage.setItem('pending_company_link', JSON.stringify({
        company_id: companyId,
        aroof_role: roleToAssign
      }));

      // Redirect to RooferLogin which handles verification
      navigate(createPageUrl("RooferLogin"));

    } catch (err) {
      console.error("Signup Failed:", err);
      setError(err.message || "Failed to join. Email might already be registered.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role) => {
    const roleMap = {
      'estimator': 'Estimator',
      'dispatcher': 'Dispatcher',
      'crew': 'Crew Lead',
      'external_roofer': 'Roofer',
      'sales': 'Sales Rep'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Aroof</span>
                <p className="text-xs text-blue-300 font-semibold">Team Invitation</p>
              </div>
            </Link>
            <Link to={createPageUrl("RooferLogin")}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-none">
            <CardHeader className="text-center pb-8 pt-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                Join {companyName}
              </CardTitle>
              <p className="text-slate-600 text-lg">
                Create your account to join the team
              </p>
              <Badge className="mt-4 bg-blue-100 text-blue-800">
                Role: {getRoleName(roleToAssign)}
              </Badge>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <form onSubmit={handleJoin} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                    className="h-12 text-base"
                    placeholder="John Smith"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="h-12 text-base"
                    placeholder="john@company.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      className="h-12 text-base pr-12"
                      placeholder="Create a password (min 8 characters)"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    className="h-12 text-base"
                    placeholder="Re-enter your password"
                    disabled={loading}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>You are joining as:</strong> {getRoleName(roleToAssign)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    You'll receive an email verification code after clicking below.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  {loading ? 'Creating Account...' : 'Create Account & Join Team'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                <p className="text-slate-600 text-sm mb-2">
                  Already have an account?
                </p>
                <Link to={createPageUrl("RooferLogin")} className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                  Login Here
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link to={createPageUrl("Homepage")} className="text-white/80 hover:text-white text-sm">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}