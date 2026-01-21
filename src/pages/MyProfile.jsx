import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    profile_photo_url: '',
    phone: '',
    home_address: '',
    bio_skills: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      setProfile({
        profile_photo_url: user.profile_photo_url || '',
        phone: user.phone || '',
        home_address: user.home_address || '',
        bio_skills: user.bio_skills || ''
      });
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await base44.auth.updateMe({
        profile_photo_url: profile.profile_photo_url,
        phone: profile.phone,
        home_address: profile.home_address,
        bio_skills: profile.bio_skills
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to save profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-1">Manage your professional information</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Professional Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <Label>Profile Photo URL</Label>
                <Input
                  type="url"
                  value={profile.profile_photo_url}
                  onChange={(e) => setProfile({...profile, profile_photo_url: e.target.value})}
                  placeholder="https://example.com/photo.jpg"
                  className="mt-2"
                />
                {profile.profile_photo_url && (
                  <img 
                    src={profile.profile_photo_url} 
                    alt="Profile preview" 
                    className="w-24 h-24 rounded-full object-cover mt-3 border-2 border-slate-200"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Home Address</Label>
                <Input
                  type="text"
                  value={profile.home_address}
                  onChange={(e) => setProfile({...profile, home_address: e.target.value})}
                  placeholder="123 Main St, City, State 12345"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Bio / Skills</Label>
                <Textarea
                  value={profile.bio_skills}
                  onChange={(e) => setProfile({...profile, bio_skills: e.target.value})}
                  placeholder="Tell us about your experience, specialties, and skills..."
                  rows={5}
                  className="mt-2"
                />
              </div>

              <Button 
                type="submit" 
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}