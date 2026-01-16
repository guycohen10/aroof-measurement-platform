import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Building2, Search, Ban, CheckCircle, Edit, Trash2, DollarSign, Users } from "lucide-react";

export default function CompaniesGodModeTab() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, statusFilter, companies]);

  const loadCompanies = async () => {
    try {
      const data = await base44.asServiceRole.entities.Company.list('-created_date', 500);
      setCompanies(data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load companies');
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.subscription_status === statusFilter);
    }

    setFilteredCompanies(filtered);
  };

  const handleEdit = (company) => {
    setEditingCompany({...company});
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await base44.asServiceRole.entities.Company.update(editingCompany.id, {
        subscription_tier: editingCompany.subscription_tier,
        subscription_status: editingCompany.subscription_status,
        monthly_lead_limit: editingCompany.monthly_lead_limit,
        is_active: editingCompany.is_active
      });
      
      toast.success('Company updated successfully');
      setShowEditModal(false);
      loadCompanies();
    } catch (err) {
      toast.error('Failed to update company');
    }
  };

  const handleToggleStatus = async (company) => {
    try {
      const newStatus = company.subscription_status === 'active' ? 'suspended' : 'active';
      await base44.asServiceRole.entities.Company.update(company.id, {
        subscription_status: newStatus
      });
      toast.success(`Company ${newStatus === 'active' ? 'activated' : 'suspended'}`);
      loadCompanies();
    } catch (err) {
      toast.error('Failed to update company status');
    }
  };

  const handleDelete = async () => {
    try {
      await base44.asServiceRole.entities.Company.delete(deleteTarget.id);
      toast.success('Company deleted successfully');
      setDeleteTarget(null);
      loadCompanies();
    } catch (err) {
      toast.error('Failed to delete company');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading companies...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{companies.length}</div>
            <div className="text-sm text-slate-600">Total Companies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.subscription_status === 'active').length}
            </div>
            <div className="text-sm text-slate-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {companies.filter(c => c.subscription_status === 'trial').length}
            </div>
            <div className="text-sm text-slate-600">Trial</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {companies.filter(c => c.subscription_status === 'suspended').length}
            </div>
            <div className="text-sm text-slate-600">Suspended</div>
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
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-sm">Company</th>
                  <th className="text-left p-3 font-semibold text-sm">Contact</th>
                  <th className="text-left p-3 font-semibold text-sm">Tier</th>
                  <th className="text-left p-3 font-semibold text-sm">Status</th>
                  <th className="text-left p-3 font-semibold text-sm">Leads</th>
                  <th className="text-left p-3 font-semibold text-sm">Created</th>
                  <th className="text-left p-3 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium">{company.company_name}</div>
                          <div className="text-xs text-slate-500">{company.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{company.contact_name}</div>
                      <div className="text-xs text-slate-500">{company.contact_email}</div>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-purple-100 text-purple-800">
                        {company.subscription_tier?.toUpperCase() || 'STARTER'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={
                        company.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                        company.subscription_status === 'trial' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {company.subscription_status?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {company.leads_purchased_this_month || 0} / {company.monthly_lead_limit || 0}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {new Date(company.created_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(company)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleStatus(company)}
                        >
                          {company.subscription_status === 'active' ? (
                            <Ban className="w-4 h-4 text-red-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setDeleteTarget(company)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {showEditModal && editingCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Company: {editingCompany.company_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subscription Tier</label>
                <Select 
                  value={editingCompany.subscription_tier} 
                  onValueChange={(val) => setEditingCompany({...editingCompany, subscription_tier: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subscription Status</label>
                <Select 
                  value={editingCompany.subscription_status} 
                  onValueChange={(val) => setEditingCompany({...editingCompany, subscription_status: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Monthly Lead Limit</label>
                <Input
                  type="number"
                  value={editingCompany.monthly_lead_limit || 0}
                  onChange={(e) => setEditingCompany({...editingCompany, monthly_lead_limit: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingCompany.is_active}
                  onChange={(e) => setEditingCompany({...editingCompany, is_active: e.target.checked})}
                />
                <label htmlFor="is_active" className="text-sm font-medium">Account Active</label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.company_name}</strong>? 
              This action cannot be undone and will remove all associated data.
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