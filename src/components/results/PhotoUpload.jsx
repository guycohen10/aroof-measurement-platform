import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PhotoUpload({ measurement, onPhotosUpdate }) {
  const [photos, setPhotos] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Load photos from measurement on mount
  useEffect(() => {
    if (measurement?.photos && Array.isArray(measurement.photos)) {
      console.log("Loading existing photos:", measurement.photos.length);
      setPhotos(measurement.photos);
    } else {
      setPhotos([]);
    }
  }, [measurement?.id]); // Reload when measurement ID changes

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length} file(s) exceed 10MB limit`);
      return;
    }
    
    setError("");
    setSuccess("");
    setUploadingCount(files.length);
    
    const uploaded = [];
    
    for (const file of files) {
      try {
        console.log("Uploading file:", file.name);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        uploaded.push({
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: file_url,
          caption: '',
          size: file.size,
          uploaded_at: new Date().toISOString()
        });
        
        console.log("File uploaded successfully:", file_url);
      } catch (err) {
        console.error("Upload failed:", err);
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    
    if (uploaded.length === 0) {
      setUploadingCount(0);
      return;
    }
    
    const updatedPhotos = [...photos, ...uploaded];
    console.log("Saving photos to database:", updatedPhotos.length, "total photos");
    
    // Save to database immediately
    try {
      await base44.entities.Measurement.update(measurement.id, {
        photos: updatedPhotos
      });
      
      console.log("Photos saved successfully to database");
      setPhotos(updatedPhotos);
      setSuccess(`${uploaded.length} photo(s) uploaded successfully!`);
      
      if (onPhotosUpdate) {
        onPhotosUpdate(updatedPhotos);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error("Failed to save photos to database:", err);
      setError(`Photos uploaded but failed to save: ${err.message}. Please try again.`);
    }
    
    setUploadingCount(0);
    event.target.value = '';
  };

  const updateCaption = async (photoId, caption) => {
    const updated = photos.map(p =>
      p.id === photoId ? { ...p, caption } : p
    );
    
    setPhotos(updated);
    
    try {
      await base44.entities.Measurement.update(measurement.id, {
        photos: updated
      });
      console.log("Caption updated successfully");
    } catch (err) {
      console.error("Failed to update caption:", err);
      setError("Failed to update caption");
    }
  };

  const removePhoto = async (photoId) => {
    if (!confirm('Remove this photo? This cannot be undone.')) return;
    
    const updated = photos.filter(p => p.id !== photoId);
    setPhotos(updated);
    
    try {
      await base44.entities.Measurement.update(measurement.id, {
        photos: updated
      });
      
      console.log("Photo removed successfully");
      setSuccess("Photo removed");
      
      if (onPhotosUpdate) {
        onPhotosUpdate(updated);
      }
      
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error("Failed to remove photo:", err);
      setError("Failed to remove photo");
    }
  };

  return (
    <Card className="shadow-xl border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Camera className="w-6 h-6 text-blue-600" />
          Add Site Photos
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Upload photos to include in your PDF report - photos will be saved automatically
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">{success}</AlertDescription>
          </Alert>
        )}

        <div
          className="border-3 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {uploadingCount > 0 ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-blue-600" />
              )}
            </div>
            
            <p className="text-lg font-semibold text-slate-900">
              {uploadingCount > 0 ? `Uploading ${uploadingCount} photo(s)...` : 'Click to Upload Photos'}
            </p>
            <p className="text-sm text-slate-600">or drag and drop</p>
            <p className="text-xs text-slate-500">Max 10MB per photo • Supported: JPG, PNG, HEIC</p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 text-lg">
                Uploaded Photos ({photos.length})
              </h4>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Add More
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-slate-100">
                    <img
                      src={photo.url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400"><span>Failed to load</span></div>';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Saved
                    </div>
                  </div>
                  
                  <CardContent className="p-3 space-y-2">
                    <Input
                      type="text"
                      placeholder="Add caption (optional)"
                      value={photo.caption || ''}
                      onChange={(e) => updateCaption(photo.id, e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhoto(photo.id)}
                      className="text-red-600 hover:bg-red-50 w-full"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {photos.length === 0 && (
          <p className="text-center text-slate-500 text-sm mt-4">
            No photos uploaded yet. Add photos to enhance your report.
          </p>
        )}
      </CardContent>
    </Card>
  );
}