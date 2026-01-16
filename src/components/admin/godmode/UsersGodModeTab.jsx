import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Users, Search, Ban, CheckCircle, Trash2, Key } from "lucide-react";
import { format } from "date-fns";

export default function UsersGodModeTab() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      const data = await base44.asServiceRole.entities.User.list('-created_date', 500);
      setUsers(data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleBanToggle = async (user) => {
    try {
      const newStatus = user.account_status === 'banned' ? 'active' : 'banned';
      await base44.asServiceRole.entities.User.update(user.id, {
        account_status: newStatus
      });
      toast.success(`User ${newStatus === 'active' ? 'unbanned' : 'banned'}`);
      loadUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async () => {
    try {
      await base44.asServiceRole.entities.User.delete(deleteTarget.id);
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  const roofers = users.filter(u => u.aroof_role === 'external_roofer');
  const admins = users.filter(u => u.role === 'admin' || u.aroof_role === 'god_admin');

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-slate-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{roofers.length}</div>
            <div className="text-sm text-slate-600">Roofers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{admins.length}</div>
            <div className="text-sm text-slate-600">Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.account_status === 'banned').length}
            </div>
            <div className="text-sm text-slate-600">Banned</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-sm">Name</th>
                  <th className="text-left p-3 font-semibold text-sm">Email</th>
                  <th className="text-left p-3 font-semibold text-sm">Role</th>
                  <th className="text-left p-3 font-semibold text-sm">Aroof Role</th>
                  <th className="text-left p-3 font-semibold text-sm">Company</th>
                  <th className="text-left p-3 font-semibold text-sm">Status</th>
                  <th className="text-left p-3 font-semibold text-sm">Created</th>
                  <th className="text-left p-3 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.full_name?.[0] || user.email?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-xs text-slate-500">{user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{user.email}</td>
                    <td className="p-3">
                      <Badge className={
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                      }>
                        {user.role?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {user.aroof_role && (
                        <Badge className="bg-purple-100 text-purple-800">
                          {user.aroof_role.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {user.company_id ? user.company_id.slice(0, 8) + '...' : 'N/A'}
                    </td>
                    <td className="p-3">
                      <Badge className={
                        user.account_status === 'banned' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {user.account_status?.toUpperCase() || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {format(new Date(user.created_date), 'MMM d, yyyy')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBanToggle(user)}
                          disabled={user.aroof_role === 'god_admin'}
                        >
                          {user.account_status === 'banned' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Ban className="w-4 h-4 text-red-600" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setDeleteTarget(user)}
                          disabled={user.aroof_role === 'god_admin'}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.full_name}</strong> ({deleteTarget?.email})? 
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