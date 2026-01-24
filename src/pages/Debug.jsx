import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RefreshCw, Database, Globe, Shield, Trash2, Check, X, Play, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Debug() {
  const navigate = useNavigate();
  const [storageData, setStorageData] = useState({});
  const [apiStatus, setApiStatus] = useState({ loading: false, status: 'idle', message: '', code: null });
  const [authStatus, setAuthStatus] = useState({ loading: false, user: null, error: null });

  // 1. Storage Loader
  const loadStorage = () => {
    const keys = ['jobs', 'my_leads', 'leads', 'user_session', 'sb-access-token', 'active_lead_id'];
    const data = {};
    keys.forEach(key => {
        try {
            const raw = localStorage.getItem(key);
            data[key] = raw ? JSON.parse(raw) : null;
        } catch (e) {
            data[key] = localStorage.getItem(key); // Keep raw if not JSON
        }
    });
    setStorageData(data);
  };

  useEffect(() => {
    loadStorage();
    checkAuth();
  }, []);

  // 2. Auth Check
  const checkAuth = async () => {
    setAuthStatus({ loading: true, user: null, error: null });
    try {
        const user = await base44.auth.me();
        setAuthStatus({ loading: false, user, error: null });
    } catch (e) {
        setAuthStatus({ loading: false, user: null, error: e.message });
    }
  };

  // 3. API Test
  const testApi = async () => {
    setApiStatus({ loading: true, status: 'testing', message: 'Connecting...', code: null });
    try {
        // Try to fetch 1 record from Lead entity
        const start = Date.now();
        const res = await base44.entities.Lead.list('-created_date', 1);
        const duration = Date.now() - start;
        
        setApiStatus({
            loading: false,
            status: 'success',
            message: `Success! Fetched ${res.length} records in ${duration}ms`,
            code: 200,
            data: res
        });
        toast.success("API Connection Successful");
    } catch (e) {
        console.error("API Test Failed", e);
        setApiStatus({
            loading: false,
            status: 'error',
            message: e.message || "Unknown Error",
            code: e.code || e.status || 500,
            details: e
        });
        toast.error("API Connection Failed");
    }
  };

  const clearStorage = () => {
    if (confirm("Are you sure? This will clear all local app data.")) {
        localStorage.clear();
        loadStorage();
        toast.success("Local Storage Cleared");
    }
  };

  const injectTestLead = () => {
    const testLead = {
       id: "lead_test_123",
       customer_name: "John Doe",
       address_street: "1 Cowboys Way",
       address_city: "Frisco",
       address_state: "TX",
       status: "New",
       sq_ft: 0
    };
    
    const existing = JSON.parse(localStorage.getItem('my_leads') || '[]');
    const filtered = existing.filter(l => l.id !== testLead.id);
    const updated = [...filtered, testLead];
    
    localStorage.setItem('my_leads', JSON.stringify(updated));
    loadStorage();
    toast.success("Test Lead Injected! ID: lead_test_123");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    System Diagnostic Tool
                </h1>
                <p className="text-slate-500 mt-1">Inspect LocalStorage, API Connectivity, and Auth State</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={loadStorage}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
                </Button>
                <Button variant="destructive" onClick={clearStorage}>
                    <Trash2 className="w-4 h-4 mr-2" /> Clear Storage
                </Button>
            </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
            {/* API Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" /> API Connectivity
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button 
                        onClick={testApi} 
                        className="w-full" 
                        disabled={apiStatus.loading}
                    >
                        {apiStatus.loading ? "Testing Connection..." : "Test Database Connection"}
                    </Button>

                    {apiStatus.status !== 'idle' && (
                        <div className={`p-4 rounded-lg border ${
                            apiStatus.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            <div className="flex items-center gap-2 font-bold mb-2">
                                {apiStatus.status === 'success' ? <Check className="w-5 h-5"/> : <X className="w-5 h-5"/>}
                                {apiStatus.status === 'success' ? "Connection Established" : "Connection Failed"}
                            </div>
                            <p className="text-sm">{apiStatus.message}</p>
                            {apiStatus.code && <p className="text-xs mt-1 opacity-70">Code: {apiStatus.code}</p>}
                            {apiStatus.data && (
                                <pre className="mt-2 text-xs overflow-auto max-h-40 bg-white/50 p-2 rounded">
                                    {JSON.stringify(apiStatus.data, null, 2)}
                                </pre>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Auth Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Authentication State
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {authStatus.loading ? (
                        <div className="text-slate-500">Checking session...</div>
                    ) : authStatus.user ? (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800 font-bold mb-2">
                                <Check className="w-4 h-4" /> Authenticated
                            </div>
                            <div className="space-y-1 text-sm text-green-900">
                                <p><span className="font-semibold">ID:</span> {authStatus.user.id}</p>
                                <p><span className="font-semibold">Email:</span> {authStatus.user.email}</p>
                                <p><span className="font-semibold">Role:</span> {authStatus.user.role} / {authStatus.user.aroof_role}</p>
                                <p><span className="font-semibold">Company:</span> {authStatus.user.company_id || 'None'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-orange-800">
                            <div className="flex items-center gap-2 font-bold">
                                <X className="w-4 h-4" /> Not Authenticated
                            </div>
                            <p className="text-sm mt-1">{authStatus.error || "No active session found"}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Data Injection Tool */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" /> Data Injection
                </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
                <Button onClick={injectTestLead} className="bg-indigo-600 hover:bg-indigo-700">
                    <Database className="w-4 h-4 mr-2" /> Inject Test Lead
                </Button>
                <Button onClick={() => navigate('/measurementpage/lead_test_123')} variant="outline">
                    <PenTool className="w-4 h-4 mr-2" /> Go to Measure
                </Button>
            </CardContent>
        </Card>

        {/* Local Storage Inspector */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" /> Local Storage Inspector
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="summary">
                    <TabsList className="mb-4">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="jobs">jobs ({Array.isArray(storageData.jobs) ? storageData.jobs.length : 0})</TabsTrigger>
                        <TabsTrigger value="my_leads">my_leads ({Array.isArray(storageData.my_leads) ? storageData.my_leads.length : 0})</TabsTrigger>
                        <TabsTrigger value="leads">leads</TabsTrigger>
                        <TabsTrigger value="session">Session</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(storageData).map(([key, val]) => (
                                <div key={key} className="p-4 bg-slate-50 border rounded-lg">
                                    <h4 className="font-bold text-slate-700 text-sm mb-1">{key}</h4>
                                    <p className="text-2xl font-mono text-blue-600">
                                        {Array.isArray(val) ? val.length : (val ? 'Set' : 'Empty')}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {Array.isArray(val) ? 'Items' : (typeof val === 'object' ? 'Object' : 'String')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {Object.entries(storageData).map(([key, val]) => (
                        <TabsContent key={key} value={key === 'user_session' ? 'session' : key}>
                            <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[500px] text-xs">
                                <pre>{JSON.stringify(val, null, 2)}</pre>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}