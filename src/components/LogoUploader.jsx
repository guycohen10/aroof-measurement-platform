import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LogoUploader({ company, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(company?.company_logo_url || null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error("Only PNG, JPG, and SVG files allowed");
      return;
    }

    setUploading(true);
    try {
      // Upload file
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const logoUrl = uploadRes.file_url;

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);

      // Save to company
      await base44.entities.Company.update(company.id, {
        company_logo_url: logoUrl
      });

      toast.success("Logo uploaded successfully!");
      onUpdate({ ...company, company_logo_url: logoUrl });
    } catch (err) {
      console.error('Upload error:', err);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setUploading(true);
    try {
      await base44.entities.Company.update(company.id, {
        company_logo_url: null
      });
      setPreview(null);
      toast.success("Logo removed");
      onUpdate({ ...company, company_logo_url: null });
    } catch (err) {
      toast.error("Failed to remove logo");
    } finally {
      setUploading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Company Logo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        {preview && (
          <div className="relative">
            <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 flex items-center justify-center min-h-48">
              <img
                src={preview}
                alt="Logo preview"
                className="max-h-40 max-w-full object-contain"
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Uploaded</span>
              </div>
            </div>
          </div>
        )}

        {!preview && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold mb-2">Drag logo here or click to browse</p>
            <p className="text-sm text-slate-500">PNG, JPG, or SVG • Max 2MB</p>
          </div>
        )}

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {preview ? "Change Logo" : "Upload Logo"}
              </>
            )}
          </Button>

          {preview && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={uploading}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Logo Tips:</strong> Use a PNG or SVG with transparent background for best results. Your logo will appear on customer-facing documents, emails, and your directory listing.
          </p>
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Logo?</AlertDialogTitle>
              <AlertDialogDescription>
                Your logo will be removed from all customer-facing pages and documents. You can upload a new one anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Remove Logo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}