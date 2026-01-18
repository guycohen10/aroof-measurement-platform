import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, MapPin, Layers } from "lucide-react";

export default function TerritoriesGodModeTab() {
  const [territories, setTerritories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [terrs, comps] = await Promise.all([
        base44.asServiceRole.entities.Territory.list(),
        base44.asServiceRole.entities.Company.list()
      ]);
      
      setTerritories(terrs);
      setCompanies(comps);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load territories');
      setLoading(false);
    }
  };

  const handleDeleteTerritory = async (territoryId) => {
    if (!confirm('Delete this territory? This action cannot be undone.')) return;
    
    try {
      await base44.asServiceRole.entities.Territory.delete(territoryId);
      toast.success('Territory deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete territory');
    }
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company?.company_name || 'Unknown Company';
  };

  if (loading) {
    return <div className="text-center py-12">Loading territories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Territory Manager</h2>
          <p className="text-slate-600">View and manage all company territories</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{territories.length}</div>
          <div className="text-sm text-slate-600">Total Territories</div>
        </div>
      </div>

      {/* Map View Placeholder */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
        <CardContent className="p-12 text-center">
          <Layers className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Interactive Map View</h3>
          <p className="text-slate-600 mb-4">
            Map integration coming soon - will display all territories on an interactive map
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Enable Map View
          </Button>
        </CardContent>
      </Card>

      {/* Territories List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {territories.map(territory => (
          <Card key={territory.id} className="border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {territory.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-slate-600">Company</div>
                <div className="font-semibold">{getCompanyName(territory.company_id)}</div>
              </div>

              <div>
                <div className="text-sm text-slate-600">ZIP Codes</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(territory.zip_codes || []).slice(0, 5).map((zip, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {zip}
                    </span>
                  ))}
                  {(territory.zip_codes || []).length > 5 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                      +{territory.zip_codes.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  territory.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {territory.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDeleteTerritory(territory.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Territory
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {territories.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            No territories created yet
          </CardContent>
        </Card>
      )}
    </div>
  );
}