import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Building2, DollarSign, Mail } from "lucide-react";

export default function SettingsTab({ settings, onSaveSettings }) {
  const [formData, setFormData] = useState(settings || {
    companyName: "Aroof",
    companyAddress: "6810 Windrock Rd, Dallas, TX 75252",
    companyPhone: "(850) 238-9727",
    companyEmail: "contact@aroof.build",
    defaultMaterialCost: 4.00,
    defaultLaborCost: 3.00,
    defaultWasteFactor: 12,
    emailSignature: ""
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSaveSettings(formData);
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Company Info */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input 
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input 
                value={formData.companyPhone}
                onChange={(e) => setFormData({...formData, companyPhone: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Email Address</Label>
              <Input 
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({...formData, companyEmail: e.target.value})}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input 
                value={formData.companyAddress}
                onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Defaults */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Default Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            These are the default values used when estimators create new quotes
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Material Cost (per sq ft)</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold">$</span>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.defaultMaterialCost}
                  onChange={(e) => setFormData({...formData, defaultMaterialCost: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            
            <div>
              <Label>Labor Cost (per sq ft)</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold">$</span>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.defaultLaborCost}
                  onChange={(e) => setFormData({...formData, defaultLaborCost: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            
            <div>
              <Label>Waste Factor (%)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input 
                  type="number"
                  value={formData.defaultWasteFactor}
                  onChange={(e) => setFormData({...formData, defaultWasteFactor: parseFloat(e.target.value)})}
                />
                <span className="text-lg font-bold">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email Signature</Label>
            <Textarea 
              rows={6}
              placeholder="Enter default email signature..."
              value={formData.emailSignature}
              onChange={(e) => setFormData({...formData, emailSignature: e.target.value})}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          size="lg"
          className="bg-green-600 hover:bg-green-700 px-8"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}