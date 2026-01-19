import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, ShieldAlert, Pencil, Ban, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UserManager() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [selectedTier, setSelectedTier] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allUsers, allCompanies] = await Promise.all([
        base44.asServiceRole.entities.User.list(),
        base44.asServiceRole.entities.Company.list()
      ]);

      setUsers(allUsers || []);
      
      // Create a map of company_id -> company
      const companyMap = {};
      (allCompanies || []).forEach(company => {
        companyMap[company.id] = company;
      });
      setCompanies(companyMap);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openCreditModal = (user) => {
    setEditingUser(user);
    setCreditAmount(0);
  };

  const handleCreditUpdate = async () => {
    if (!editingUser) return;

    try {
      // Find user's company
      const userCompany = Object.values(companies).find(c => c.owner_user_id === editingUser.id);
      
      if (!userCompany) {
        toast.error("User has no associated company");
        return;
      }

      const newCredits = (userCompany.lead_credits || 0) + creditAmount;
      
      if (newCredits < 0) {
        toast.error("Cannot reduce credits below zero");
        return;
      }

      await base44.asServiceRole.entities.Company.update(userCompany.id, {
        lead_credits: newCredits
      });

      toast.success(`Credits updated: ${creditAmount > 0 ? '+' : ''}${creditAmount}`);
      setEditingUser(null);
      setCreditAmount(0);
      loadData();
    } catch (error) {
      console.error("Failed to update credits:", error);
      toast.error("Failed to update credits");
    }
  };

  const handleTierChange = async (userId, newTier) => {
    try {
      const userCompany = Object.values(companies).find(c => c.owner_user_id === userId);
      
      if (!userCompany) {
        toast.error("User has no associated company");
        return;
      }

      await base44.asServiceRole.entities.Company.update(userCompany.id, {
        subscription_tier: newTier
      });

      toast.success(`Subscription tier updated to ${newTier}`);
      loadData();
    } catch (error) {
      console.error("Failed to update tier:", error);
      toast.error("Failed to update tier");
    }
  };

  const handleBanToggle = async (user) => {
    try {
      const newStatus = user.aroof_role === "banned" ? "external_roofer" : "banned";
      
      await base44.asServiceRole.entities.User.update(user.id, {
        aroof_role: newStatus
      });

      toast.success(newStatus === "banned" ? "User banned" : "User unbanned");
      loadData();
    } catch (error) {
      console.error("Failed to toggle ban:", error);
      toast.error("Failed to update user status");
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
    <>
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            User Manager ({users.length} Users)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Credits</th>
                  <th className="text-left py-3 px-4 font-semibold">Tier</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userCompany = Object.values(companies).find(c => c.owner_user_id === user.id);
                  const isBanned = user.aroof_role === "banned";

                  return (
                    <tr key={user.id} className={`border-b hover:bg-slate-50 ${isBanned ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-4">{user.full_name || "N/A"}</td>
                      <td className="py-3 px-4 text-sm">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          {userCompany?.lead_credits || 0}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {userCompany ? (
                          <Select
                            value={userCompany.subscription_tier || "starter"}
                            onValueChange={(value) => handleTierChange(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="starter">Starter</SelectItem>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-slate-400 text-sm">No Company</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCreditModal(user)}
                            disabled={!userCompany}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Credits
                          </Button>
                          <Button
                            size="sm"
                            variant={isBanned ? "default" : "destructive"}
                            onClick={() => handleBanToggle(user)}
                          >
                            {isBanned ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-1" />
                                Ban
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Credits Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Credits: {editingUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Balance</Label>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(companies).find(c => c.owner_user_id === editingUser?.id)?.lead_credits || 0} Credits
              </div>
            </div>
            <div className="space-y-2">
              <Label>Add/Remove Credits</Label>
              <Input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                placeholder="Enter amount (use negative to remove)"
              />
              <p className="text-sm text-slate-500">
                Use positive numbers to add credits, negative to remove
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreditUpdate} className="bg-green-600 hover:bg-green-700">
              Update Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}