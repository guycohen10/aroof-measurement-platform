import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Crown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MeasurementLimitCheck({ user, onContinue }) {
  const navigate = useNavigate();
  
  const canMeasure = user.measurements_used_this_month < user.measurements_limit || user.subscription_plan === 'unlimited';
  const isNearLimit = user.measurements_used_this_month >= user.measurements_limit * 0.8;
  
  const nextPlan = {
    free: { name: 'Starter', price: 49, limit: 20 },
    starter: { name: 'Pro', price: 99, limit: 100 },
    pro: { name: 'Unlimited', price: 199, limit: 'Unlimited' }
  }[user.subscription_plan];

  if (!canMeasure) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full border-2 border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Monthly Limit Reached
            </h2>
            
            <p className="text-slate-600 mb-6">
              You've used all <strong>{user.measurements_limit}</strong> measurements this month.
              Upgrade to {nextPlan?.name} for {nextPlan?.limit} measurements per month.
            </p>

            <div className="space-y-3">
              <Button 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate(createPageUrl("RooferPlans"))}
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to {nextPlan?.name} - ${nextPlan?.price}/mo
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate(createPageUrl("RooferDashboard"))}
              >
                Back to Dashboard
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Your usage resets on {user.next_billing_date ? new Date(user.next_billing_date).toLocaleDateString() : 'your billing date'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isNearLimit && user.subscription_plan !== 'unlimited') {
    return (
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900 mb-1">
                Running low on measurements!
              </p>
              <p className="text-sm text-orange-800 mb-2">
                You've used {user.measurements_used_this_month} of {user.measurements_limit} measurements this month.
              </p>
              <Button 
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => navigate(createPageUrl("RooferPlans"))}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}