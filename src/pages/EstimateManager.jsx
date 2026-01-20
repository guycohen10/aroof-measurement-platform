import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';

export default function EstimateManager() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Estimate Manager
          </h1>
          <p className="text-slate-600 mt-2">Create and send professional estimates</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Full estimate builder with line items, PDF generation, and e-signatures will be available in Phase 2.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}