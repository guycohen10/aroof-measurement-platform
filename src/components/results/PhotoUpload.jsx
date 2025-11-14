import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Loader2, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PhotoUpload({ measurement, onPhotosUpdate }) {
  const [photos, setPhotos] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Load photos from measurement on mount
  useEffect(() => {
    if (measurement?.photos) {
      setPhotos(measurement.photos);
    }
  }, [measurement]);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length} file(s) exceed 10MB`);
      return;
    }
    
    setError("");
    setUploadingCount(files.length);
    
    const uploaded = [];
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        uploaded.push({
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: file_url,
          caption: '',
          size: file.size,
          uploaded_at: new Date().toISOString()
        });
      } catch (err) {
        console.error("Upload failed:", err);
        setError(`Failed to upload ${file.name}`);
      }
    }
    
    const updatedPhotos = [...photos, ...uploaded];
    setPhotos(updatedPhotos);
    
    // Save to database
    try {
      await base44.entities.Measurement.update(measurement.id, {
        photos: updatedPhotos
      });
      
      if (onPhotosUpdate) {
        onPhotosUpdate(updatedPhotos);
      }
    } catch (err) {
      console.error("Failed to save photos:", err);
      setError("Upload succeeded but failed to save");
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
    } catch (err) {
      console.error("Failed to update caption:", err);
    }
  };

  const removePhoto = async (photoId) => {
    if (!confirm('Remove this photo?')) return;
    
    const updated = photos.filter(p => p.id !== photoId);
    setPhotos(updated);
    
    try {
      await base44.entities.Measurement.update(measurement.id, {
        photos: updated
      });
      
      if (onPhotosUpdate) {
        onPhotosUpdate(updated);
      }
    } catch (err) {
      console.error("Failed to remove:", err);
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
          Upload photos to include in your PDF report
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
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
            <p className="text-xs text-slate-500">Max 10MB per photo</p>
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
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Saved
                    </div>
                  </div>
                  
                  <CardContent className="p-3 space-y-2">
                    <Input
                      type="text"
                      placeholder="Add caption"
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
      </CardContent>
    </Card>
  );
}