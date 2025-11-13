import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Loader2, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PhotoUpload({ measurement, onPhotosUpdate }) {
  const [photos, setPhotos] = useState(measurement.photos || []);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Validate file sizes
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length} file(s) exceed 10MB limit. Please choose smaller files.`);
      return;
    }
    
    setError("");
    setUploadingCount(files.length);
    
    const uploadedPhotos = [];
    
    for (const file of files) {
      try {
        // Upload using Base44's UploadFile integration
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const newPhoto = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: file_url,
          caption: '',
          size: file.size,
          uploaded_at: new Date().toISOString()
        };
        
        uploadedPhotos.push(newPhoto);
        
      } catch (err) {
        console.error("Failed to upload photo:", err);
        setError(`Failed to upload ${file.name}. Please try again.`);
      }
    }
    
    // Update photos array
    const updatedPhotos = [...photos, ...uploadedPhotos];
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
      console.error("Failed to save photos to database:", err);
      setError("Photos uploaded but failed to save. Please refresh the page.");
    }
    
    setUploadingCount(0);
    event.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError("Please drop image files only");
      return;
    }
    
    // Create a fake event to reuse handleFileSelect
    const fakeEvent = {
      target: { files: imageFiles, value: '' }
    };
    
    await handleFileSelect(fakeEvent);
  };

  const updateCaption = async (photoId, caption) => {
    const updatedPhotos = photos.map(photo =>
      photo.id === photoId ? { ...photo, caption } : photo
    );
    
    setPhotos(updatedPhotos);
    
    // Save to database
    try {
      await base44.entities.Measurement.update(measurement.id, {
        photos: updatedPhotos
      });
    } catch (err) {
      console.error("Failed to update caption:", err);
    }
  };

  const removePhoto = async (photoId) => {
    if (!confirm('Remove this photo from your report?')) return;
    
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
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
      console.error("Failed to remove photo:", err);
      setError("Failed to remove photo. Please try again.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="shadow-xl border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Camera className="w-6 h-6 text-blue-600" />
          Add Site Photos (Optional)
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Upload photos of your roof, damage, or areas of concern to include in your PDF report
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-3 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
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
            
            <div>
              <p className="text-lg font-semibold text-slate-900 mb-1">
                {uploadingCount > 0 ? `Uploading ${uploadingCount} photo(s)...` : 'Click to Upload Photos'}
              </p>
              <p className="text-sm text-slate-600">or drag and drop here</p>
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              📱 JPG, PNG, HEIC • Unlimited photos • Max 10MB per photo
            </p>
          </div>
        </div>

        {/* Uploaded Photos Grid */}
        {photos.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 text-lg">
                Uploaded Photos ({photos.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add More
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <Card key={photo.id} className="overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-all">
                  <div className="relative aspect-video bg-slate-100">
                    <img
                      src={photo.url}
                      alt={photo.caption || `Site photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Uploaded
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
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {formatFileSize(photo.size)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhoto(photo.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {photos.length === 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <ImageIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-900">
              <strong>Pro Tip:</strong> Adding photos helps contractors provide more accurate quotes and shows the condition of your roof for insurance claims.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}