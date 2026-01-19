import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DollarSign, Coins, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EconomyControl() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [settings, setSettings] = useState({
    lead_price_credits: 50,
    subscription_price_monthly: 99,
    subscription_price_yearly: 990,
    free_credits_on_signup: 10
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const allSettings = await base44.entities.PlatformSettings.list();
      
      if (allSettings && allSettings.length > 0) {
        setSettings(allSettings[0]);
        setSettingsId(allSettings[0].id);
      } else {
        // Create default settings if none exist
        const created = await base44.entities.PlatformSettings.create({
          lead_price_credits: 50,
          subscription_price_monthly: 99,
          subscription_price_yearly: 990,
          free_credits_on_signup: 10
        });
        setSettings(created);
        setSettingsId(created.id);
      }
    } catch (error) {
      console.error("Failed to load platform settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.PlatformSettings.update(settingsId, settings);
      toast.success("Platform pricing updated successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Platform Pricing & Economy
        </CardTitle>
        <CardDescription className="text-green-100">
          Control global pricing and credit settings
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Lead Pricing */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <Coins className="w-5 h-5 text-blue-600" />
            Cost per Lead (Credits)
          </Label>
          <Input
            type="number"
            value={settings.lead_price_credits}
            onChange={(e) => setSettings({ ...settings, lead_price_credits: Number(e.target.value) })}
            className="text-lg"
          />
          <p className="text-sm text-slate-500">Credits required to purchase a lead</p>
        </div>

        {/* Monthly Subscription */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <DollarSign className="w-5 h-5 text-green-600" />
            Monthly Subscription Price ($)
          </Label>
          <Input
            type="number"
            value={settings.subscription_price_monthly}
            onChange={(e) => setSettings({ ...settings, subscription_price_monthly: Number(e.target.value) })}
            className="text-lg"
          />
          <p className="text-sm text-slate-500">Monthly subscription cost in USD</p>
        </div>

        {/* Yearly Subscription */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <DollarSign className="w-5 h-5 text-green-600" />
            Yearly Subscription Price ($)
          </Label>
          <Input
            type="number"
            value={settings.subscription_price_yearly}
            onChange={(e) => setSettings({ ...settings, subscription_price_yearly: Number(e.target.value) })}
            className="text-lg"
          />
          <p className="text-sm text-slate-500">Yearly subscription cost in USD</p>
        </div>

        {/* Signup Bonus */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <Gift className="w-5 h-5 text-purple-600" />
            Signup Bonus (Free Credits)
          </Label>
          <Input
            type="number"
            value={settings.free_credits_on_signup}
            onChange={(e) => setSettings({ ...settings, free_credits_on_signup: Number(e.target.value) })}
            className="text-lg"
          />
          <p className="text-sm text-slate-500">Free credits given to new contractors</p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-lg h-12"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : (
            "Save Economy Settings"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}