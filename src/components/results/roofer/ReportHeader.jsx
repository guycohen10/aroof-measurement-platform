import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Calendar, FileText, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function ReportHeader({ measurement, user, reportId }) {
  return (
    <Card className="border-none shadow-xl">
      <CardContent className="p-6 lg:p-8">
        <div className="space-y-6">
          {/* Property Address - Most Prominent */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-slate-500">PROPERTY ADDRESS</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              {measurement?.property_address}
            </h1>
          </div>

          {/* Report Details Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Report ID</span>
              </div>
              <p className="font-bold text-slate-900">{reportId}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Measurement Date</span>
              </div>
              <p className="font-bold text-slate-900">
                {measurement?.created_date 
                  ? format(new Date(measurement.created_date), 'MMM d, yyyy')
                  : 'Today'
                }
              </p>
              <p className="text-sm text-slate-600">
                {measurement?.created_date 
                  ? format(new Date(measurement.created_date), 'h:mm a')
                  : ''
                }
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Measured By</span>
              </div>
              <p className="font-bold text-slate-900">
                {user?.business_name || user?.name}
              </p>
              {user?.license_number && (
                <p className="text-sm text-slate-600">
                  Lic: {user.license_number}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Method</span>
              </div>
              <p className="font-medium text-slate-900">Satellite Imagery</p>
              <p className="text-sm text-slate-600">Analysis</p>
            </div>
          </div>

          {/* Professional Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              <strong>Professional Report:</strong> This measurement report was prepared using 
              Aroof.build satellite imagery technology. All measurements have ±2% accuracy.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}