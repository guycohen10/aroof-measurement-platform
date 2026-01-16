import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, X, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PortfolioManager({ company, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    project_type: "residential"
  });

  const portfolio = company?.portfolio_images || [];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const imageUrl = uploadRes.file_url;

      const newImage = {
        id: Date.now().toString(),
        url: imageUrl,
        project_type: newProject.project_type,
        title: newProject.title || "Project Photo",
        description: newProject.description,
        uploaded_at: new Date().toISOString()
      };

      const updatedPortfolio = [...portfolio, newImage];
      
      if (updatedPortfolio.length > 50) {
        toast.error("Maximum 50 images allowed");
        return;
      }

      await base44.entities.Company.update(company.id, {
        portfolio_images: updatedPortfolio
      });

      toast.success("Photo added to portfolio!");
      onUpdate({ ...company, portfolio_images: updatedPortfolio });
      setNewProject({ title: "", description: "", project_type: "residential" });
    } catch (err) {
      console.error('Upload error:', err);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const updatedPortfolio = portfolio.filter(p => p.id !== deleteTarget.id);
      await base44.entities.Company.update(company.id, {
        portfolio_images: updatedPortfolio
      });

      toast.success("Photo removed");
      onUpdate({ ...company, portfolio_images: updatedPortfolio });
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Failed to delete photo");
    }
  };

  const projectTypes = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "storm_damage", label: "Storm Damage" },
    { value: "other", label: "Other" }
  ];

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Portfolio Gallery
          </span>
          <span className="text-sm font-normal text-slate-500">{portfolio.length}/50</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-purple-300 rounded-lg p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Add New Project Photo</h4>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Project Title</label>
              <Input
                placeholder="e.g., Oak Valley Roof Replacement"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Project Type</label>
              <Select value={newProject.project_type} onValueChange={(value) => setNewProject({...newProject, project_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Description (Optional)</label>
              <Input
                placeholder="Describe the project, materials used, etc."
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
            </div>
          </div>

          <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500">PNG, JPG (Max 10MB)</p>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {uploading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-purple-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          )}
        </div>

        {/* Portfolio Grid */}
        {portfolio.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Your Portfolio ({portfolio.length})</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {portfolio.map((photo) => (
                <div key={photo.id} className="relative group overflow-hidden rounded-lg">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                    <p className="text-white text-sm font-semibold text-center mb-2">{photo.title}</p>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded mb-3">
                      {projectTypes.find(t => t.value === photo.project_type)?.label}
                    </span>
                    <Button
                      onClick={() => setDeleteTarget(photo)}
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {portfolio.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No portfolio photos yet. Upload your first project photo above!</p>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove "{deleteTarget?.title}" from your portfolio.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}