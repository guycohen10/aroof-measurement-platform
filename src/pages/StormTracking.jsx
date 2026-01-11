import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Search, Download, Plus, AlertCircle, Loader2, Cloud, MapPin, Calendar, TrendingUp } from "lucide-react";

function calculateRiskScore(hailData) {
  let score = 0;
  
  // Hail size scoring
  if (hailData.hail_size_inches >= 1.0) score += 40;
  else if (hailData.hail_size_inches >= 0.75) score += 30;
  else if (hailData.hail_size_inches >= 0.5) score += 20;
  
  // Recency scoring
  const daysSinceStorm = (Date.now() - new Date(hailData.last_hail_date).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceStorm <= 7) score += 30;
  else if (daysSinceStorm <= 30) score += 20;
  else if (daysSinceStorm <= 90) score += 10;
  
  // Frequency scoring
  if (hailData.events_last_30_days >= 2) score += 20;
  else if (hailData.events_last_year >= 3) score += 10;
  
  return Math.min(score, 100);
}

export default function StormTracking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hotZones, setHotZones] = useState([]);
  const [searchZip, setSearchZip] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    zip_code: "",
    city: "",
    state: "TX",
    event_date: "",
    hail_size: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await base44.auth.me();
      if (user.aroof_role !== 'external_roofer') {
        navigate(createPageUrl("Homepage"));
        return;
      }
      loadHotZones();
    } catch (err) {
      navigate(createPageUrl("RooferLogin"));
    }
  };

  const loadHotZones = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const zones = await base44.entities.HailZone.list();
      
      // Filter and sort manually
      const filtered = zones
        .filter(zone => new Date(zone.last_hail_date) >= thirtyDaysAgo)
        .sort((a, b) => b.risk_score - a.risk_score);
      
      setHotZones(filtered);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load zones:", err);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchZip.trim()) {
      setMessage("Please enter a zip code");
      return;
    }

    try {
      const zones = await base44.entities.HailZone.filter({ zip_code: searchZip.trim() });
      
      if (zones.length === 0) {
        setMessage(`No storm data found for zip code ${searchZip}`);
        setSearchResults([]);
      } else {
        setSearchResults(zones);
        setMessage("");
      }
    } catch (err) {
      setMessage("Search failed: " + err.message);
    }
  };

  const handleAddStorm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const eventDate = new Date(formData.event_date);
      const hailSize = parseFloat(formData.hail_size);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isRecent = eventDate >= thirtyDaysAgo;

      // Check if zone exists
      const existing = await base44.entities.HailZone.filter({ zip_code: formData.zip_code });

      if (existing.length > 0) {
        const zone = existing[0];
        const updatedData = {
          last_hail_date: eventDate.toISOString(),
          hail_size_inches: Math.max(zone.hail_size_inches, hailSize),
          events_last_year: zone.events_last_year + 1,
          events_last_30_days: isRecent ? zone.events_last_30_days + 1 : zone.events_last_30_days,
          city: formData.city || zone.city,
          state: formData.state || zone.state
        };
        
        updatedData.risk_score = calculateRiskScore({
          hail_size_inches: updatedData.hail_size_inches,
          last_hail_date: updatedData.last_hail_date,
          events_last_30_days: updatedData.events_last_30_days,
          events_last_year: updatedData.events_last_year
        });

        await base44.entities.HailZone.update(zone.id, updatedData);
        setMessage("Storm event updated successfully!");
      } else {
        const newZone = {
          zip_code: formData.zip_code,
          city: formData.city,
          state: formData.state,
          last_hail_date: eventDate.toISOString(),
          hail_size_inches: hailSize,
          events_last_year: 1,
          events_last_30_days: isRecent ? 1 : 0
        };
        
        newZone.risk_score = calculateRiskScore(newZone);
        
        await base44.entities.HailZone.create(newZone);
        setMessage("Storm event added successfully!");
      }

      setFormData({ zip_code: "", city: "", state: "TX", event_date: "", hail_size: "" });
      setShowAddForm(false);
      loadHotZones();
    } catch (err) {
      setMessage("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportHotZones = () => {
    const header = 'Zip Code,City,Last Storm,Hail Size (inches),Risk Score\n';
    const csv = hotZones.map(zone => 
      `${zone.zip_code},${zone.city || ''},${new Date(zone.last_hail_date).toLocaleDateString()},${zone.hail_size_inches},${zone.risk_score}`
    ).join('\n');
    
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `hot-zones-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'bg-red-100 border-red-300 text-red-900';
    if (score >= 60) return 'bg-orange-100 border-orange-300 text-orange-900';
    if (score >= 40) return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    return 'bg-green-100 border-green-300 text-green-900';
  };

  const getRiskBadge = (score) => {
    if (score >= 80) return { label: 'URGENT', color: 'bg-red-600' };
    if (score >= 60) return { label: 'HIGH', color: 'bg-orange-600' };
    if (score >= 40) return { label: 'MEDIUM', color: 'bg-yellow-600' };
    return { label: 'LOW', color: 'bg-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("RooferDashboard")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Storm Tracking</span>
                <p className="text-xs text-blue-200">High-Value Lead Intelligence</p>
              </div>
            </Link>
            <Link to={createPageUrl("RooferDashboard")}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none">
            <CardContent className="p-6">
              <Cloud className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Hot Zones (30 days)</p>
              <p className="text-4xl font-bold">{hotZones.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">High Risk Zones</p>
              <p className="text-4xl font-bold">{hotZones.filter(z => z.risk_score >= 60).length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
            <CardContent className="p-6">
              <MapPin className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Urgent Leads</p>
              <p className="text-4xl font-bold">{hotZones.filter(z => z.risk_score >= 80).length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    🌩️ Hot Zones (Last 30 Days)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={exportHotZones} variant="outline" size="sm" disabled={hotZones.length === 0}>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {hotZones.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">No Recent Storm Activity</p>
                    <p className="text-sm">Add storm events to track high-value leads</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hotZones.map((zone) => {
                      const badge = getRiskBadge(zone.risk_score);
                      return (
                        <div key={zone.id} className={`p-4 rounded-lg border-2 ${getRiskColor(zone.risk_score)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl font-bold">{zone.zip_code}</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${badge.color}`}>
                                  {badge.label}
                                </span>
                                <span className="text-sm font-semibold">{zone.city || 'Unknown City'}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-slate-600 text-xs">Last Storm</p>
                                  <p className="font-bold">{new Date(zone.last_hail_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-600 text-xs">Hail Size</p>
                                  <p className="font-bold">{zone.hail_size_inches}" diameter</p>
                                </div>
                                <div>
                                  <p className="text-slate-600 text-xs">Events (30d)</p>
                                  <p className="font-bold">{zone.events_last_30_days}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-600">Risk Score</p>
                              <p className="text-3xl font-bold">{zone.risk_score}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {searchResults.length > 0 && (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchResults.map((zone) => {
                      const badge = getRiskBadge(zone.risk_score);
                      return (
                        <div key={zone.id} className={`p-4 rounded-lg border-2 ${getRiskColor(zone.risk_score)}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-xl font-bold">{zone.zip_code}</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${badge.color}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">
                                Last storm: {new Date(zone.last_hail_date).toLocaleDateString()} | 
                                Hail: {zone.hail_size_inches}" | 
                                Events: {zone.events_last_year} (year)
                              </p>
                            </div>
                            <div className="text-2xl font-bold">{zone.risk_score}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">📍 Search Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Enter ZIP code"
                    value={searchZip}
                    onChange={(e) => setSearchZip(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-12"
                  />
                  <Button onClick={handleSearch} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showAddForm && (
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-green-300">
                <CardHeader>
                  <CardTitle className="text-lg">➕ Add Storm Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddStorm} className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">ZIP Code *</label>
                      <Input
                        type="text"
                        required
                        value={formData.zip_code}
                        onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                        placeholder="75001"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-slate-700">City</label>
                      <Input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Dallas"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Event Date *</label>
                      <Input
                        type="date"
                        required
                        value={formData.event_date}
                        onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Hail Size (inches) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        required
                        value={formData.hail_size}
                        onChange={(e) => setFormData({...formData, hail_size: e.target.value})}
                        placeholder="1.25"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Event'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">📊 Risk Score Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-red-600 rounded"></div>
                  <div>
                    <p className="font-bold">80-100: URGENT</p>
                    <p className="text-xs text-slate-600">Large hail, recent event</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-orange-600 rounded"></div>
                  <div>
                    <p className="font-bold">60-79: HIGH</p>
                    <p className="text-xs text-slate-600">Significant damage likely</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-yellow-600 rounded"></div>
                  <div>
                    <p className="font-bold">40-59: MEDIUM</p>
                    <p className="text-xs text-slate-600">Moderate opportunity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-green-600 rounded"></div>
                  <div>
                    <p className="font-bold">0-39: LOW</p>
                    <p className="text-xs text-slate-600">Minor event</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}