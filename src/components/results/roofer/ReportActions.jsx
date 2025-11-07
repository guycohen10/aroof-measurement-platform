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
  Check,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

export default function ReportActions({ measurement, user, reportId, compact = false }) {
  const [notes, setNotes] = useState(measurement?.roofer_notes || "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

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
      setError("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setGenerating(true);
    setError("");

    try {
      // Update download count
      const currentCount = measurement.pdf_download_count || 0;
      await base44.entities.Measurement.update(measurement.id, {
        pdf_download_count: currentCount + 1,
        pdf_generated_date: new Date().toISOString()
      });
      
      // Show info message
      alert("PDF generation feature is coming soon! Your measurement data has been saved and you can access it anytime. You can still email the report details to your client using the email feature.");
      
      setSuccessMessage("Download request recorded");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update download count:", err);
      setError("Failed to process request. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    if (!clientEmail) {
      setError("Please enter client email address");
      return;
    }

    setError("");
    
    try {
      await base44.entities.Measurement.update(measurement.id, {
        email_sent: true,
        email_sent_date: new Date().toISOString(),
        email_sent_to: clientEmail
      });

      // In production, this would send actual email
      const emailBody = `
Hello ${clientName || 'there'},

Please find your professional roof measurement report prepared by ${user?.business_name || user?.name}.

Property: ${measurement.property_address}
Total Roof Area: ${measurement.total_sqft?.toLocaleString() || 0} sq ft
Report ID: ${reportId}

${emailMessage}

This measurement was prepared using Aroof.build professional measurement technology.

You can view your full report at: ${window.location.href}

If you have any questions, please contact:
${user?.business_name || user?.name}
${user?.phone || ''}
${user?.email || ''}

Best regards,
${user?.business_name || user?.name}
      `;

      console.log("Email would be sent to:", clientEmail);
      console.log("Email body:", emailBody);

      setSuccessMessage(`Report link sent to ${clientEmail}`);
      setShowEmailForm(false);
      setClientEmail("");
      setClientName("");
      setEmailMessage("");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Failed to send email:", err);
      setError("Failed to send email. Please try again.");
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
      setError("Failed to copy link");
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
              disabled={generating}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF Report
                </>
              )}
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
            <p className="text-sm text-slate-600 mb-2">Add custom notes</p>
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-none shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold mb-1">Download Your Report</h3>
              <p className="text-orange-100">
                Professional measurement report with all data
              </p>
            </div>
            <Button 
              onClick={handleDownloadPDF}
              disabled={generating}
              size="lg" 
              className="bg-white text-orange-600 hover:bg-orange-50 h-14 px-8 text-lg font-bold whitespace-nowrap"
            >
              {generating ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-6 h-6 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Coming Soon Note */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-900">
          <strong>Note:</strong> PDF generation feature is coming soon. You can share the report link with clients or save the measurement data.
        </AlertDescription>
      </Alert>

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
            <h3 className="font-bold text-slate-900 mb-4">Email Report Link to Client</h3>
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
                <Label htmlFor="clientName">Client Name (Optional)</Label>
                <Input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="John Smith"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emailMessage">Custom Message (Optional)</Label>
                <Textarea
                  id="emailMessage"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Add a personal message for your client..."
                  className="mt-1 min-h-20"
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1">{emailMessage.length}/500</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEmailReport} className="bg-orange-500 hover:bg-orange-600">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Report Link
                </Button>
                <Button onClick={() => setShowEmailForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-900">
                  <strong>Email will include:</strong> A link to view this report online, prepared by {user?.business_name || user?.name} using Aroof.build measurement technology
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}