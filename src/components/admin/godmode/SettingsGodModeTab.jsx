import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Mail } from "lucide-react";

export default function SettingsGodModeTab() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('estimator');
  const [sending, setSending] = useState(false);

  async function handleInvite(e) {
    e.preventDefault();
    setSending(true);

    try {
      // Send invite email
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: `Invitation to join Aroof as ${inviteRole}`,
        from_name: 'Aroof Admin',
        body: `
          You've been invited to join the Aroof team as a ${inviteRole}.
          
          Please visit https://aroof.build and sign up with this email address.
          After signing up, contact admin to assign your role.
          
          Role: ${inviteRole}
          
          Welcome to the team!
        `
      });

      alert(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err) {
      alert('Failed to send invite: ' + err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite User */}
      <Card>
        <CardHeader>
          <CardTitle>Invite New Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
              >
                <option value="estimator">Estimator</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="crew_lead">Crew Lead</option>
                <option value="external_roofer">External Roofer</option>
              </select>
            </div>

            <Button type="submit" disabled={sending} className="w-full bg-blue-600 hover:bg-blue-700">
              {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Send Invite</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Default Measurement Price</label>
            <Input type="number" defaultValue="3" step="0.01" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Company Email</label>
            <Input type="email" defaultValue="contact@aroof.build" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Company Phone</label>
            <Input type="tel" defaultValue="(850) 238-9727" />
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}