import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle } from "lucide-react";
import MeasurementSummaryCard from "./MeasurementSummaryCard";
import ResultsMapView from "./ResultsMapView";
import PricingEstimateCard from "./PricingEstimateCard";
import CTASection from "./CTASection";

export default function HomeownerResults({ measurement, user, setMeasurement }) {
  const [pricingConfigs, setPricingConfigs] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("asphalt_shingles");
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricingConfigs();
  }, []);

  useEffect(() => {
    if (pricingConfigs.length > 0 && measurement?.total_sqft) {
      calculateEstimate(selectedMaterial);
    }
  }, [selectedMaterial, pricingConfigs, measurement?.total_sqft]);

  const loadPricingConfigs = async () => {
    try {
      const configs = await base44.entities.PricingConfig.filter({ is_active: true });
      setPricingConfigs(configs);
      
      // Use existing estimate material or default
      const existingMaterial = measurement?.aroof_estimate?.material_type || "asphalt_shingles";
      setSelectedMaterial(existingMaterial);
    } catch (err) {
      console.error("Failed to load pricing configs:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimate = async (materialType) => {
    const config = pricingConfigs.find(c => c.material_type === materialType);
    if (!config || !measurement?.total_sqft) return;

    const totalSqft = measurement.total_sqft;
    const materialCost = totalSqft * config.price_per_sqft;
    const laborCost = totalSqft * config.labor_rate;
    const wasteFactor = (materialCost + laborCost) * 0.10;
    const subtotal = materialCost + laborCost + wasteFactor + config.additional_fees;
    const lowEstimate = Math.round(subtotal * 0.95);
    const highEstimate = Math.round(subtotal * 1.15);

    const newEstimate = {
      material_cost: Math.round(materialCost),
      labor_cost: Math.round(laborCost),
      waste_factor: Math.round(wasteFactor),
      subtotal: Math.round(subtotal),
      low_estimate: lowEstimate,
      high_estimate: highEstimate,
      material_type: materialType,
      additional_fees: config.additional_fees
    };

    setEstimate(newEstimate);

    // Update measurement in database
    try {
      await base44.entities.Measurement.update(measurement.id, {
        aroof_estimate: newEstimate
      });
      setMeasurement(prev => ({ ...prev, aroof_estimate: newEstimate }));
    } catch (err) {
      console.error("Failed to update estimate:", err);
    }
  };

  const sections = measurement?.measurement_data?.sections || [];
  const totalArea = measurement?.total_sqft || 0;

  return (
    <>
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <CheckCircle className="w-12 h-12 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-bold mb-1">Measurement Complete!</h2>
              <p className="text-green-100 text-lg">
                Your personalized roof estimate is ready
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section: Measurement Summary & Map */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Measurement Summary */}
          <div className="lg:col-span-1">
            <MeasurementSummaryCard
              measurement={measurement}
              sections={sections}
              totalArea={totalArea}
              user={user}
              estimate={estimate}
            />
          </div>

          {/* Map View */}
          <div className="lg:col-span-2">
            <ResultsMapView
              propertyAddress={measurement?.property_address}
              sections={sections}
              measurementId={measurement?.id}
            />
          </div>
        </div>

        {/* Pricing Estimate */}
        <div className="mb-8">
          <PricingEstimateCard
            estimate={estimate}
            totalArea={totalArea}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            loading={loading}
          />
        </div>

        {/* Call to Action Section */}
        <CTASection measurement={measurement} user={user} />
      </div>
    </>
  );
}