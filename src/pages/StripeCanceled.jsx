import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function StripeCanceled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-orange-600" />
          </div>
          <CardTitle className="text-3xl text-slate-900 mb-2">Payment Canceled</CardTitle>
          <p className="text-slate-600">
            Your subscription setup was canceled. No charges were made.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Still want to subscribe?</strong>
              <br />
              You can choose a plan anytime from your dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full h-14 bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate(createPageUrl("RooferPlans"))}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again - View Plans
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-14"
              onClick={() => navigate(createPageUrl("RooferDashboard"))}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-center text-sm text-slate-600">
              Need help? Contact us at{' '}
              <a href="mailto:support@aroof.build" className="text-blue-600 hover:underline">
                support@aroof.build
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}