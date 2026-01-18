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

      {/* Map View with Google Maps - War Room */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">🗺️ Territory War Room - Live Map</h3>
          <div className="bg-slate-900 rounded-lg overflow-hidden border-4 border-red-600 shadow-2xl" style={{ height: '700px' }}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d859267.3259092201!2d-96.7970!3d32.7767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1234567890123"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-600 rounded-lg">
            <p className="text-sm text-red-800 font-bold">
              ⚠️ <strong>WAR ROOM ACTIVE:</strong> Displaying all DFW territories. 
              Click territories below to view ownership and delete if needed.
            </p>
          </div>
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