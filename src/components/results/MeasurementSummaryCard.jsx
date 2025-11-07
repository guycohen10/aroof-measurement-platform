import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Layers, MapPin, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { generateHomeownerPDF, downloadPDF } from "../PDFGenerator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SECTION_COLORS = ["#4A90E2", "#50C878", "#FF8C42", "#9B59B6", "#E74C3C"];

export default function MeasurementSummaryCard({ measurement, sections, totalArea, user, estimate }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleDownloadPDF = async () => {
    setGenerating(true);
    setError("");

    try {
      // Generate PDF
      const doc = await generateHomeownerPDF(measurement, user, estimate);
      
      // Create filename
      const addressSlug = measurement.property_address
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 50);
      const filename = `Aroof_Estimate_${addressSlug}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Download
      downloadPDF(doc, filename);
      
      // Update download count
      const currentCount = measurement.pdf_download_count || 0;
      await base44.entities.Measurement.update(measurement.id, {
        pdf_download_count: currentCount + 1,
        pdf_generated_date: new Date().toISOString()
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF. Please try again or contact support.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-none shadow-xl h-full">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
        <CardTitle className="text-xl">Measurement Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Property Address */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-500">Property Address</p>
            </div>
            <p className="font-bold text-slate-900 text-lg leading-tight">
              {measurement?.property_address}
            </p>
          </div>

          {/* Total Area - Most Prominent */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <p className="text-blue-100 text-sm mb-2">Total Roof Area</p>
            <p className="text-5xl font-bold mb-1">
              {totalArea > 0 ? totalArea.toLocaleString() : '0'}
            </p>
            <p className="text-2xl font-medium text-blue-100">square feet</p>
          </div>

          {/* Section Breakdown */}
          {sections.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-slate-600" />
                <h3 className="font-bold text-slate-900">Section Breakdown</h3>
              </div>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: SECTION_COLORS[index % SECTION_COLORS.length] }}
                      />
                      <span className="font-medium text-slate-900">{section.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {section.area_sqft.toLocaleString()} sq ft
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Measurement Date */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-500">Measurement Date</p>
            </div>
            <p className="font-medium text-slate-900">
              {measurement?.created_date 
                ? format(new Date(measurement.created_date), 'MMMM d, yyyy')
                : 'Today'
              }
            </p>
          </div>

          {/* Download Button */}
          <Button 
            onClick={handleDownloadPDF}
            disabled={generating}
            variant="outline" 
            className="w-full" 
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Full Report (PDF)
              </>
            )}
          </Button>

          {/* Additional Info */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              This measurement was created using satellite imagery and may vary slightly from actual measurements. 
              A final inspection will provide exact figures.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}