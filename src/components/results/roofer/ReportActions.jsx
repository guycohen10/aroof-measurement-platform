import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Mail, 
  Share2, 
  Edit2, 
  Plus,
  FileText,
  Copy,
  Check
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ReportActions({ measurement, user, reportId, compact = false }) {
  const [notes, setNotes] = useState(measurement?.roofer_notes || "");
  const [saving, setSaving] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await base44.entities.Measurement.update(measurement.id, {
        roofer_notes: notes,
        notes_added: notes.length > 0
      });
      setSuccessMessage("Notes saved successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const currentCount = measurement.pdf_download_count || 0;
      await base44.entities.Measurement.update(measurement.id, {
        pdf_download_count: currentCount + 1
      });
      alert("PDF download will be generated with all measurements and watermarked images");
    } catch (err) {
      console.error("Failed to update download count:", err);
    }
  };

  const handleEmailReport = async () => {
    if (!clientEmail) {
      alert("Please enter client email address");
      return;
    }

    try {
      await base44.entities.Measurement.update(measurement.id, {
        email_sent: true,
        email_sent_date: new Date().toISOString()
      });

      // In production, this would trigger email sending
      setSuccessMessage(`Report sent to ${clientEmail}`);
      setShowEmailForm(false);
      setClientEmail("");
      setEmailMessage("");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (compact) {
    return (
      <Card className="border-none shadow-xl">
        <CardContent className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button 
              onClick={handleDownloadPDF}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF Report
            </Button>

            <Button 
              onClick={() => setShowEmailForm(!showEmailForm)}
              variant="outline" 
              className="w-full" 
              size="lg"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email to Client
            </Button>

            <Link to={createPageUrl(`MeasurementTool?measurementId=${measurement?.id}`)}>
              <Button variant="outline" className="w-full" size="lg">
                <Edit2 className="w-5 h-5 mr-2" />
                Edit Measurement
              </Button>
            </Link>

            <Link to={createPageUrl("RooferForm")}>
              <Button variant="outline" className="w-full" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                New Measurement
              </Button>
            </Link>
          </div>

          {/* Notes Section */}
          <div className="mt-6 pt-6 border-t">
            <Label htmlFor="notes" className="font-bold">Report Notes</Label>
            <p className="text-sm text-slate-600 mb-2">Add custom notes (saved to PDF)</p>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this measurement (e.g., special conditions, client requests, etc.)"
              className="min-h-24 mb-2"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">{notes.length}/500</span>
              <Button onClick={handleSaveNotes} disabled={saving} size="sm">
                {saving ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="mt-4">
            <Button onClick={handleCopyLink} variant="ghost" className="w-full" size="sm">
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Report Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="border-none shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold mb-1">Download Your Report</h3>
              <p className="text-orange-100">
                Professional PDF with all measurements and watermarked images
              </p>
            </div>
            <Button 
              onClick={handleDownloadPDF}
              size="lg" 
              className="bg-white text-orange-600 hover:bg-orange-50 h-14 px-8 text-lg font-bold whitespace-nowrap"
            >
              <Download className="w-6 h-6 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4">
        <Button 
          onClick={() => setShowEmailForm(!showEmailForm)}
          variant="outline" 
          size="lg"
          className="h-auto py-4"
        >
          <Mail className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-bold">Email Report</div>
            <div className="text-xs text-slate-600">Send to client</div>
          </div>
        </Button>

        <Link to={createPageUrl(`MeasurementTool?measurementId=${measurement?.id}`)}>
          <Button variant="outline" size="lg" className="w-full h-auto py-4">
            <Edit2 className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-bold">Edit Measurement</div>
              <div className="text-xs text-slate-600">Adjust sections</div>
            </div>
          </Button>
        </Link>

        <Link to={createPageUrl("RooferForm")}>
          <Button variant="outline" size="lg" className="w-full h-auto py-4">
            <Plus className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-bold">New Measurement</div>
              <div className="text-xs text-slate-600">Measure another</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Email Form */}
      {showEmailForm && (
        <Card className="border-2 border-orange-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Email Report to Client</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientEmail">Client Email Address *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emailMessage">Optional Message</Label>
                <Textarea
                  id="emailMessage"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Add a message for your client..."
                  className="mt-1 min-h-20"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEmailReport} className="bg-orange-500 hover:bg-orange-600">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Report
                </Button>
                <Button onClick={() => setShowEmailForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-slate-600">
                Email will include: "This measurement report was prepared by {user?.business_name || user?.name} using Aroof.build measurement technology"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}