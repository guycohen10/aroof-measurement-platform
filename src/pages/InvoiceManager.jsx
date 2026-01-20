import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from 'lucide-react';

export default function InvoiceManager() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-blue-600" />
            Invoice Manager
          </h1>
          <p className="text-slate-600 mt-2">Generate and track invoices for completed jobs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Full invoice management with payment tracking, reminders, and integration with accounting software will be available in Phase 2.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}