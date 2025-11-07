import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function MeasurementHistory({ measurements, user }) {
  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-500" />
          Your Recent Measurements
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {measurements.map((measurement) => (
            <div
              key={measurement.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <h3 className="font-medium text-slate-900 truncate">
                    {measurement.property_address}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(measurement.created_date), 'MMM d, yyyy')}
                  </div>
                  <div className="font-medium">
                    {measurement.total_sqft?.toLocaleString() || 0} sq ft
                  </div>
                  {measurement.report_id && (
                    <div className="text-xs bg-slate-200 px-2 py-1 rounded">
                      {measurement.report_id}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Link to={createPageUrl(`Results?measurementId=${measurement.id}`)}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          ))}

          {measurements.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No previous measurements found</p>
            </div>
          )}

          {measurements.length >= 10 && (
            <div className="text-center pt-4">
              <Button variant="outline">
                View All History
              </Button>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{measurements.length + 1}</p>
            <p className="text-sm text-slate-600">Total Measurements</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {(measurements.reduce((sum, m) => sum + (m.total_sqft || 0), 0) + 
               (measurements[0]?.total_sqft || 0)).toLocaleString()}
            </p>
            <p className="text-sm text-slate-600">Total Sq Ft Measured</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              ${(measurements.length + 1) * 5}
            </p>
            <p className="text-sm text-slate-600">Total Spent</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}