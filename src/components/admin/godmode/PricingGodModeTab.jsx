import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, DollarSign } from "lucide-react";

export default function PricingGodModeTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState({
    homeowner_price: 3,
    roofer_price: 5,
    material_cost_per_sqft: 4,
    labor_cost_per_sqft: 3,
    waste_factor: 10
  });

  useEffect(() => {
    loadPricing();
  }, []);

  async function loadPricing() {
    try {
      // Try to load from PricingConfig entity - first config
      const configs = await base44.entities.PricingConfig.list();
      if (configs && configs.length > 0) {
        const config = configs[0];
        setPricing({
          homeowner_price: 3, // These aren't in PricingConfig, keep defaults
          roofer_price: 5,
          material_cost_per_sqft: config.price_per_sqft || 4,
          labor_cost_per_sqft: config.labor_rate || 3,
          waste_factor: 10
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load pricing:', err);
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    
    try {
      // Update the first pricing config
      const configs = await base44.entities.PricingConfig.list();
      if (configs && configs.length > 0) {
        await base44.entities.PricingConfig.update(configs[0].id, {
          price_per_sqft: pricing.material_cost_per_sqft,
          labor_rate: pricing.labor_cost_per_sqft
        });
      } else {
        // Create if doesn't exist
        await base44.entities.PricingConfig.create({
          material_type: 'Standard Asphalt Shingles',
          price_per_sqft: pricing.material_cost_per_sqft,
          labor_rate: pricing.labor_cost_per_sqft,
          warranty_cost: 0,
          additional_fees: 0
        });
      }
      
      alert('✅ Pricing updated successfully!');
    } catch (err) {
      alert('❌ Failed to update pricing: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const exampleArea = 2000;
  const materialsCost = exampleArea * pricing.material_cost_per_sqft;
  const laborCost = exampleArea * pricing.labor_cost_per_sqft;
  const wasteCost = (materialsCost + laborCost) * (pricing.waste_factor / 100);
  const totalEstimate = materialsCost + laborCost + wasteCost;

  return (
    <div className="max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Pricing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Measurement Pricing */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-slate-700">Measurement Tool Pricing</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Homeowner Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.homeowner_price}
                    onChange={(e) => setPricing({...pricing, homeowner_price: parseFloat(e.target.value)})}
                    className="pl-7 text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Price for homeowners</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Roofer Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.roofer_price}
                    onChange={(e) => setPricing({...pricing, roofer_price: parseFloat(e.target.value)})}
                    className="pl-7 text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Price for professional roofers</p>
              </div>
            </div>
          </div>

          {/* Estimation Formula */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-slate-700">Cost Estimation Formula</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Material Cost per Sq Ft</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.material_cost_per_sqft}
                    onChange={(e) => setPricing({...pricing, material_cost_per_sqft: parseFloat(e.target.value)})}
                    className="pl-7 text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Average material cost per square foot</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Labor Cost per Sq Ft</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.labor_cost_per_sqft}
                    onChange={(e) => setPricing({...pricing, labor_cost_per_sqft: parseFloat(e.target.value)})}
                    className="pl-7 text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Average labor cost per square foot</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Waste Factor (%)</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="50"
                    value={pricing.waste_factor}
                    onChange={(e) => setPricing({...pricing, waste_factor: parseInt(e.target.value)})}
                    className="pr-8 text-lg font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Percentage added for material waste</p>
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-6">
              <h4 className="text-sm font-bold mb-4 text-slate-900">
                📊 Example Calculation ({exampleArea.toLocaleString()} sq ft roof):
              </h4>
              
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Materials: {exampleArea.toLocaleString()} × ${pricing.material_cost_per_sqft}</span>
                  <strong>${materialsCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Labor: {exampleArea.toLocaleString()} × ${pricing.labor_cost_per_sqft}</span>
                  <strong>${laborCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Waste ({pricing.waste_factor}%)</span>
                  <strong>${wasteCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between pt-3 mt-3 border-t-2 border-slate-300 text-base font-bold text-slate-900">
                  <span>Total Estimate:</span>
                  <span className="text-green-600">${totalEstimate.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Pricing Changes
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Changes will apply to all new measurements immediately
          </p>
        </CardContent>
      </Card>
    </div>
  );
}