import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Building2,
  UserCheck,
  MapPin
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: measurements = [], isLoading: loadingMeasurements } = useQuery({
    queryKey: ['measurements'],
    queryFn: () => base44.entities.Measurement.list('-created_date'),
    initialData: [],
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date'),
    initialData: [],
  });

  const stats = {
    totalRevenue: measurements.reduce((sum, m) => sum + (m.payment_amount || 0), 0),
    totalMeasurements: measurements.length,
    homeowners: users.filter(u => u.user_type === 'homeowner').length,
    roofers: users.filter(u => u.user_type === 'roofer').length,
    newLeads: measurements.filter(m => m.lead_status === 'new' && m.user_type === 'homeowner').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Aroof Admin</h1>
                <p className="text-xs text-slate-500">Dashboard</p>
              </div>
            </Link>
            <Link to={createPageUrl("Homepage")}>
              <Button variant="outline">Back to Site</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Measurements</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalMeasurements}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Homeowners</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.homeowners}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Roofers</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.roofers}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">New Leads</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.newLeads}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="measurements">All Measurements</TabsTrigger>
            <TabsTrigger value="leads">Homeowner Leads</TabsTrigger>
            <TabsTrigger value="roofers">Roofer Clients</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurements.slice(0, 5).map((measurement) => (
                      <TableRow key={measurement.id}>
                        <TableCell>
                          {format(new Date(measurement.created_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={measurement.user_type === 'homeowner' ? 'default' : 'secondary'}>
                            {measurement.user_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {measurement.property_address}
                        </TableCell>
                        <TableCell>${measurement.payment_amount}</TableCell>
                        <TableCell>
                          <Badge variant={measurement.payment_status === 'completed' ? 'default' : 'outline'}>
                            {measurement.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Measurements Tab */}
          <TabsContent value="measurements">
            <Card>
              <CardHeader>
                <CardTitle>All Measurements ({measurements.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurements.map((measurement) => {
                      const user = users.find(u => u.id === measurement.user_id);
                      return (
                        <TableRow key={measurement.id}>
                          <TableCell>
                            {format(new Date(measurement.created_date), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={measurement.user_type === 'homeowner' ? 'default' : 'secondary'}>
                              {measurement.user_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="truncate">{measurement.property_address}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user?.name}</p>
                              <p className="text-sm text-slate-500">{user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${measurement.payment_amount}</TableCell>
                          <TableCell>
                            <Badge variant={measurement.payment_status === 'completed' ? 'default' : 'outline'}>
                              {measurement.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link to={createPageUrl(`Results?measurementId=${measurement.id}`)}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Homeowner Leads ({measurements.filter(m => m.user_type === 'homeowner').length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Lead Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurements
                      .filter(m => m.user_type === 'homeowner')
                      .map((measurement) => {
                        const user = users.find(u => u.id === measurement.user_id);
                        return (
                          <TableRow key={measurement.id}>
                            <TableCell>
                              {format(new Date(measurement.created_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{user?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{user?.email}</p>
                                <p className="text-slate-500">{user?.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {measurement.property_address}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={measurement.lead_status === 'new' ? 'default' : 'outline'}
                                className={measurement.lead_status === 'new' ? 'bg-green-500' : ''}
                              >
                                {measurement.lead_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link to={createPageUrl(`Results?measurementId=${measurement.id}`)}>
                                <Button variant="outline" size="sm">View Details</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roofers Tab */}
          <TabsContent value="roofers">
            <Card>
              <CardHeader>
                <CardTitle>Roofer Clients ({users.filter(u => u.user_type === 'roofer').length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Measurements</TableHead>
                      <TableHead>Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter(u => u.user_type === 'roofer')
                      .map((user) => {
                        const userMeasurements = measurements.filter(m => m.user_id === user.id);
                        const totalSpent = userMeasurements.reduce((sum, m) => sum + (m.payment_amount || 0), 0);
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-orange-600" />
                                <span className="font-medium">{user.business_name || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-slate-500">{user.email}</p>
                                <p className="text-slate-500">{user.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.license_number || 
                                <span className="text-slate-400">Not provided</span>
                              }
                            </TableCell>
                            <TableCell className="font-medium">{userMeasurements.length}</TableCell>
                            <TableCell className="font-medium text-green-600">${totalSpent}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}