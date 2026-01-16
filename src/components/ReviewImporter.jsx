import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Star, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function ReviewImporter({ company, onUpdate }) {
  const [importing, setImporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    reviewer_name: "",
    rating: "5",
    review_text: "",
    source: "google",
    review_url: "",
    review_date: new Date().toISOString().split('T')[0]
  });

  const reviews = company?.imported_reviews || [];

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!formData.reviewer_name || !formData.review_text) {
      toast.error("Please fill in all required fields");
      return;
    }

    setImporting(true);
    try {
      const newReview = {
        id: Date.now().toString(),
        reviewer_name: formData.reviewer_name,
        rating: parseInt(formData.rating),
        review_text: formData.review_text,
        source: formData.source,
        review_url: formData.review_url || null,
        review_date: new Date(formData.review_date).toISOString(),
        imported_at: new Date().toISOString()
      };

      const updatedReviews = [...reviews, newReview];

      await base44.entities.Company.update(company.id, {
        imported_reviews: updatedReviews
      });

      toast.success("Review imported successfully!");
      onUpdate({ ...company, imported_reviews: updatedReviews });
      setFormData({
        reviewer_name: "",
        rating: "5",
        review_text: "",
        source: "google",
        review_url: "",
        review_date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Import error:', err);
      toast.error("Failed to import review");
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const updatedReviews = reviews.filter(r => r.id !== deleteTarget.id);
      await base44.entities.Company.update(company.id, {
        imported_reviews: updatedReviews
      });

      toast.success("Review removed");
      onUpdate({ ...company, imported_reviews: updatedReviews });
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const sourceIcons = {
    google: "🔍",
    yelp: "⭐",
    facebook: "👥",
    manual: "✏️"
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Manage Reviews
          </span>
          <span className="text-sm font-normal text-slate-500">{reviews.length} imported</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Form */}
        <form onSubmit={handleImport} className="space-y-4 bg-blue-50 p-6 rounded-lg">
          <h4 className="font-semibold text-slate-900">Import Review Manually</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Reviewer Name *</label>
              <Input
                placeholder="John Smith"
                value={formData.reviewer_name}
                onChange={(e) => setFormData({...formData, reviewer_name: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Rating *</label>
              <Select value={formData.rating} onValueChange={(value) => setFormData({...formData, rating: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Source</label>
            <Select value={formData.source} onValueChange={(value) => setFormData({...formData, source: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Reviews</SelectItem>
                <SelectItem value="yelp">Yelp</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Review Text *</label>
            <Textarea
              placeholder="Paste the review text here..."
              value={formData.review_text}
              onChange={(e) => setFormData({...formData, review_text: e.target.value})}
              required
              className="h-24"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Review URL (Optional)</label>
            <Input
              placeholder="https://google.com/reviews/..."
              value={formData.review_url}
              onChange={(e) => setFormData({...formData, review_url: e.target.value})}
              type="url"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Review Date</label>
            <Input
              type="date"
              value={formData.review_date}
              onChange={(e) => setFormData({...formData, review_date: e.target.value})}
            />
          </div>

          <Button 
            type="submit" 
            disabled={importing}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {importing ? "Importing..." : <>
              <Plus className="w-4 h-4 mr-2" />
              Import Review
            </>}
          </Button>
        </form>

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Imported Reviews</h4>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-l-4 border-blue-400 bg-slate-50 p-4 rounded">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{sourceIcons[review.source]}</span>
                        <p className="font-semibold text-slate-900">{review.reviewer_name}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                          {review.source}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => setDeleteTarget(review)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{review.review_text}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {new Date(review.review_date).toLocaleDateString()}
                    </p>
                    {review.review_url && (
                      <a href={review.review_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No imported reviews yet. Import your first review above!</p>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Review?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the review from "{deleteTarget?.reviewer_name}" from your profile.
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