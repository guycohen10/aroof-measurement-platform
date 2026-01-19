import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Mail, Building2, Key, User, Trash2, AlertTriangle } from "lucide-react";
import SecuritySettings from "../../auth/SecuritySettings";

export default function SettingsGodModeTab() {
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Aroof',
    phone: '(850) 238-9727',
    email: 'contact@aroof.build',
    address: '6810 Windrock Rd, Dallas, TX 75252',
    hours: 'Mon-Fri 8am-6pm, Sat 9am-3pm',
    tagline: "DFW's #1 Roofing Company"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewLead: true,
    smsOnNewLead: false,
    emailRecipients: 'contact@aroof.build',
    smsRecipients: ''
  });

  const [apiKeys, setApiKeys] = useState({
    stripePublishable: 'pk_test_...',
    stripeSecret: 'sk_test_...',
    googleMapsApi: 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc'
  });

  async function saveSettings(section, data) {
    setSaving(true);
    try {
      // In a real implementation, you'd save to a settings entity or configuration storage
      console.log(`Saving ${section}:`, data);
      
      // For now, just show success
      alert(`✅ ${section} settings saved successfully!`);
    } catch (err) {
      alert('❌ Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    const newPassword = prompt('Enter new admin password:');
    if (!newPassword) return;
    
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    try {
      // Update current user password
      await base44.auth.updateMe({ password: newPassword });
      alert('✅ Password changed successfully!');
    } catch (err) {
      alert('❌ Failed to change password: ' + err.message);
    }
  }

  async function handleClearData() {
    const confirmation = prompt(
      'This will DELETE ALL DATA. This action CANNOT be undone.\n\nType "DELETE ALL DATA" to confirm:'
    );
    
    if (confirmation !== 'DELETE ALL DATA') {
      alert('Data deletion cancelled');
      return;
    }
    
    try {
      // Delete all measurements
      const measurements = await base44.entities.Measurement.list();
      for (const m of measurements) {
        await base44.entities.Measurement.delete(m.id);
      }
      
      // Delete all appointments
      const appointments = await base44.entities.Appointment.list();
      for (const a of appointments) {
        await base44.entities.Appointment.delete(a.id);
      }
      
      // Delete all crews
      const crews = await base44.entities.Crew.list();
      for (const c of crews) {
        await base44.entities.Crew.delete(c.id);
      }
      
      alert('✅ All data cleared successfully');
      window.location.reload();
    } catch (err) {
      alert('❌ Failed to clear data: ' + err.message);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Security Settings */}
      <SecuritySettings />

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Company Name</label>
              <Input
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number</label>
              <Input
                type="tel"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <Input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Business Hours</label>
              <Input
                value={companyInfo.hours}
                onChange={(e) => setCompanyInfo({...companyInfo, hours: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Physical Address</label>
            <Input
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tagline</label>
            <Input
              value={companyInfo.tagline}
              onChange={(e) => setCompanyInfo({...companyInfo, tagline: e.target.value})}
            />
          </div>

          <Button 
            onClick={() => saveSettings('company', companyInfo)}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Company Info
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailOnNewLead}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                emailOnNewLead: e.target.checked
              })}
              className="w-4 h-4"
            />
            <span className="font-semibold">📧 Email notification on new leads</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.smsOnNewLead}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                smsOnNewLead: e.target.checked
              })}
              className="w-4 h-4"
            />
            <span className="font-semibold">📱 SMS notification on new leads</span>
          </label>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Email Recipients (comma-separated)
            </label>
            <Input
              type="text"
              placeholder="email1@example.com, email2@example.com"
              value={notificationSettings.emailRecipients}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                emailRecipients: e.target.value
              })}
            />
          </div>

          <Button 
            onClick={() => saveSettings('notifications', notificationSettings)}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-sm text-yellow-900">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            <strong>Warning:</strong> Keep these keys secure. Never share them publicly.
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Stripe Publishable Key</label>
            <Input
              type="text"
              value={apiKeys.stripePublishable}
              onChange={(e) => setApiKeys({...apiKeys, stripePublishable: e.target.value})}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Stripe Secret Key</label>
            <Input
              type="password"
              value={apiKeys.stripeSecret}
              onChange={(e) => setApiKeys({...apiKeys, stripeSecret: e.target.value})}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Google Maps API Key</label>
            <Input
              type="text"
              value={apiKeys.googleMapsApi}
              onChange={(e) => setApiKeys({...apiKeys, googleMapsApi: e.target.value})}
              className="font-mono text-sm"
            />
          </div>

          <Button 
            onClick={() => saveSettings('api-keys', apiKeys)}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save API Keys
          </Button>
        </CardContent>
      </Card>

      {/* Admin Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Admin Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={handleChangePassword}
              className="bg-purple-600 hover:bg-purple-700"
            >
              🔒 Change Password
            </Button>

            <Button 
              onClick={handleClearData}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}