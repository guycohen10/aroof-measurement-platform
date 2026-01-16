import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Star, Search, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function ReviewsGodModeTab() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchTerm, statusFilter, reviews]);

  const loadReviews = async () => {
    try {
      const data = await base44.asServiceRole.entities.Review.list('-created_date', 500);
      setReviews(data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load reviews');
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.review_text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    setFilteredReviews(filtered);
  };

  const handleApprove = async (review) => {
    try {
      await base44.asServiceRole.entities.Review.update(review.id, {
        status: "approved"
      });
      toast.success('Review approved');
      loadReviews();
    } catch (err) {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (review) => {
    try {
      await base44.asServiceRole.entities.Review.update(review.id, {
        status: "rejected"
      });
      toast.success('Review rejected');
      loadReviews();
    } catch (err) {
      toast.error('Failed to reject review');
    }
  };

  const handleToggleFeatured = async (review) => {
    try {
      await base44.asServiceRole.entities.Review.update(review.id, {
        featured: !review.featured
      });
      toast.success(review.featured ? 'Removed from featured' : 'Added to featured');
      loadReviews();
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  };

  const handleDelete = async () => {
    try {
      await base44.asServiceRole.entities.Review.delete(deleteTarget.id);
      toast.success('Review deleted');
      setDeleteTarget(null);
      loadReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading reviews...</div>;
  }

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{reviews.length}</div>
            <div className="text-sm text-slate-600">Total Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-sm text-slate-600">Pending Approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-slate-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{avgRating}★</div>
            <div className="text-sm text-slate-600">Average Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-slate-900">{review.customer_name}</span>
                    <Badge className={
                      review.status === 'approved' ? 'bg-green-100 text-green-800' :
                      review.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {review.status?.toUpperCase()}
                    </Badge>
                    {review.featured && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-3">
                    {review.customer_email} • {format(new Date(review.review_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              <p className="text-slate-700 mb-4 leading-relaxed">"{review.review_text}"</p>

              <div className="flex gap-2">
                {review.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(review)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReject(review)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                
                {review.status === 'approved' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleToggleFeatured(review)}
                  >
                    {review.featured ? '⭐ Remove from Featured' : '☆ Add to Featured'}
                  </Button>
                )}

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setDeleteTarget(review)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the review from <strong>{deleteTarget?.customer_name}</strong>. 
              This action cannot be undone.
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
    </div>
  );
}