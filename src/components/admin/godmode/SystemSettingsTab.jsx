import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DollarSign, Save, TrendingUp } from "lucide-react";

export default function SystemSettingsTab() {
  const [settings, setSettings] = useState({
    default_lead_price: 25.00,
    starter_price: 49.00,
    pro_price: 99.00,
    enterprise_price: 199.00,
    starter_lead_limit: 20,
    pro_lead_limit: 100,
    enterprise_lead_limit: 999999,
    auto_approve_roofers: false
  });

  const handleSave = () => {
    // In a real implementation, this would save to a SystemSettings entity
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Lead Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Lead Marketplace Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default Lead Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.default_lead_price}
              onChange={(e) => setSettings({...settings, default_lead_price: parseFloat(e.target.value)})}
            />
            <p className="text-xs text-slate-500 mt-1">
              Default price charged to roofers per lead purchase
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Subscription Tiers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Starter Tier</h4>
              <div className="space-y-3">
                <div>
                  <Label>Monthly Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.starter_price}
                    onChange={(e) => setSettings({...settings, starter_price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Lead Limit</Label>
                  <Input
                    type="number"
                    value={settings.starter_lead_limit}
                    onChange={(e) => setSettings({...settings, starter_lead_limit: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Pro Tier</h4>
              <div className="space-y-3">
                <div>
                  <Label>Monthly Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.pro_price}
                    onChange={(e) => setSettings({...settings, pro_price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Lead Limit</Label>
                  <Input
                    type="number"
                    value={settings.pro_lead_limit}
                    onChange={(e) => setSettings({...settings, pro_lead_limit: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Enterprise Tier</h4>
              <div className="space-y-3">
                <div>
                  <Label>Monthly Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.enterprise_price}
                    onChange={(e) => setSettings({...settings, enterprise_price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Lead Limit</Label>
                  <Input
                    type="number"
                    value={settings.enterprise_lead_limit}
                    onChange={(e) => setSettings({...settings, enterprise_lead_limit: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto_approve"
              checked={settings.auto_approve_roofers}
              onChange={(e) => setSettings({...settings, auto_approve_roofers: e.target.checked})}
            />
            <Label htmlFor="auto_approve" className="font-normal cursor-pointer">
              Auto-approve new roofer signups (no manual review required)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}