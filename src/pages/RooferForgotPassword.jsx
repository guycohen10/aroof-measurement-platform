import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RooferForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter email, 2: Reset success

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Find company by email
      const companies = await base44.entities.Company.filter({ contact_email: email });
      
      if (!companies || companies.length === 0) {
        toast.error("No account found with this email");
        setIsLoading(false);
        return;
      }

      const company = companies[0];

      // Update the password
      await base44.entities.Company.update(company.id, {
        password: newPassword
      });

      toast.success("Password reset successfully!");
      setStep(2);
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
                <p className="text-xs text-blue-300 font-semibold">Password Recovery</p>
              </div>
            </Link>
            <Link to={createPageUrl("RooferLogin")}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {step === 1 ? (
            <Card className="shadow-2xl border-none">
              <CardHeader className="text-center pb-8 pt-12">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Mail className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                  Reset Password
                </CardTitle>
                <p className="text-slate-600 text-lg">
                  Enter your details to reset your password
                </p>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-base"
                      placeholder="your@company.com"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                      New Password
                    </Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-12 text-base"
                      placeholder="Enter new password"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Confirm Password
                    </Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 text-base"
                      placeholder="Confirm new password"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base bg-orange-600 hover:bg-orange-700 font-semibold"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                  <Link to={createPageUrl("RooferLogin")} className="text-blue-600 hover:text-blue-700 font-semibold">
                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                    Back to Login
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-2xl border-none">
              <CardHeader className="text-center pb-8 pt-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                  Password Reset!
                </CardTitle>
                <p className="text-slate-600 text-lg">
                  Your password has been successfully reset
                </p>
              </CardHeader>

              <CardContent className="px-8 pb-8 text-center">
                <p className="text-slate-700 mb-6">
                  You can now login with your new password
                </p>
                <Link to={createPageUrl("RooferLogin")}>
                  <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 font-semibold">
                    Continue to Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}