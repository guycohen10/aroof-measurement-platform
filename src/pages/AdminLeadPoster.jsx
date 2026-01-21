import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLeadPoster() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    headline: '',
    zip_code: '',
    service_needed: 'Roof Replacement',
    price: '',
    private_details: '',
    exclusive: false,
    roof_size_sqft: ''
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        toast.error('Access Denied: Admin only');
        navigate(-1);
        return;
      }
      
      setUser(currentUser);
    } catch (err) {
      console.error('Auth error:', err);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.headline.trim() || !formData.zip_code.trim() || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setPosting(true);

    try {
      await base44.entities.MarketplaceLead.create({
        zip_code: formData.zip_code.trim(),
        service_needed: formData.service_needed,
        price: parseFloat(formData.price),
        status: 'available',
        lead_details: formData.headline.trim(),
        private_details: formData.private_details.trim(),
        exclusive: formData.exclusive,
        roof_size_sqft: formData.roof_size_sqft ? parseFloat(formData.roof_size_sqft) : null
      });

      setSuccess(true);
      setFormData({
        headline: '',
        zip_code: '',
        service_needed: 'Roof Replacement',
        price: '',
        private_details: '',
        exclusive: false,
        roof_size_sqft: ''
      });

      setTimeout(() => setSuccess(false), 3000);
      toast.success('Lead posted to marketplace!');
    } catch (err) {
      console.error('Error posting lead:', err);
      toast.error('Failed to post lead');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Post New Lead</h1>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Lead posted successfully!</p>
              <p className="text-sm text-green-700">It's now available in the marketplace.</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Headline */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Headline (Public) *
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  placeholder="e.g., Shingle Roof in Plano"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Anonymized description shown to buyers</p>
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  placeholder="e.g., 75024"
                  maxLength="5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Service Type *
                </label>
                <select
                  name="service_needed"
                  value={formData.service_needed}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Roof Replacement">Roof Replacement</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 75.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Roof Size (Optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Roof Size (sq ft) - Optional
                </label>
                <input
                  type="number"
                  name="roof_size_sqft"
                  value={formData.roof_size_sqft}
                  onChange={handleInputChange}
                  placeholder="e.g., 2400"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Private Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Private Details - Optional
                </label>
                <textarea
                  name="private_details"
                  value={formData.private_details}
                  onChange={handleInputChange}
                  placeholder="Real contact info, address details, and notes visible ONLY after purchase..."
                  rows="4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Only shown to the company after they purchase the lead</p>
              </div>

              {/* Exclusive Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="exclusive"
                  id="exclusive"
                  checked={formData.exclusive}
                  onChange={handleInputChange}
                  className="w-4 h-4 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="exclusive" className="text-sm font-medium text-slate-700">
                  Exclusive (Can only be sold once)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={posting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={posting}
                >
                  {posting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    'Post Lead'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}