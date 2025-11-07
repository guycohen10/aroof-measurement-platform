import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Loader2 } from "lucide-react";
import ReportHeader from "./roofer/ReportHeader";
import DetailedMeasurements from "./roofer/DetailedMeasurements";
import WatermarkedMapView from "./roofer/WatermarkedMapView";
import MaterialEstimator from "./roofer/MaterialEstimator";
import ReportActions from "./roofer/ReportActions";
import MeasurementHistory from "./roofer/MeasurementHistory";

export default function RooferResults({ measurement, user }) {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState("");

  useEffect(() => {
    loadData();
  }, [measurement, user]);

  const loadData = async () => {
    try {
      // Update last accessed date
      if (measurement?.id) {
        await base44.entities.Measurement.update(measurement.id, {
          last_accessed_date: new Date().toISOString()
        });

        // Generate or load report ID
        if (!measurement.report_id) {
          const newReportId = `ARM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
          await base44.entities.Measurement.update(measurement.id, {
            report_id: newReportId
          });
          setReportId(newReportId);
        } else {
          setReportId(measurement.report_id);
        }
      }

      // Load roofer's measurement history
      if (user?.email) {
        const allMeasurements = await base44.entities.Measurement.filter(
          { created_by: user.email, user_type: "roofer" },
          "-created_date",
          10
        );
        setMeasurements(allMeasurements.filter(m => m.id !== measurement?.id));
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const sections = measurement?.measurement_data?.sections || [];
  const totalArea = measurement?.total_sqft || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <CheckCircle className="w-12 h-12 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-bold mb-1">Professional Measurement Report</h2>
              <p className="text-orange-100 text-lg">
                Your measurement data is ready for download
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Actions - Top */}
        <div className="mb-8">
          <ReportActions
            measurement={measurement}
            user={user}
            reportId={reportId}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Report Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Report Header */}
            <ReportHeader
              measurement={measurement}
              user={user}
              reportId={reportId}
            />

            {/* Detailed Measurements */}
            <DetailedMeasurements
              sections={sections}
              totalArea={totalArea}
            />

            {/* Watermarked Map */}
            <WatermarkedMapView
              propertyAddress={measurement?.property_address}
              sections={sections}
              measurementId={measurement?.id}
            />

            {/* Material Estimator */}
            <MaterialEstimator
              totalArea={totalArea}
              sections={sections}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions - Duplicate for visibility */}
            <ReportActions
              measurement={measurement}
              user={user}
              reportId={reportId}
              compact={true}
            />
          </div>
        </div>

        {/* Measurement History */}
        {measurements.length > 0 && (
          <div className="mt-12">
            <MeasurementHistory
              measurements={measurements}
              user={user}
            />
          </div>
        )}
      </div>
    </>
  );
}