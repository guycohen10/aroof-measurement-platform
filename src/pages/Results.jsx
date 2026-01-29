import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Ruler, Download, Phone, FileText, Star, Users, Loader2, Home, ArrowLeft, Box, Camera, Palette, MapPin, Zap, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import InteractiveMapView from "../components/results/InteractiveMapView";
import DetailedMeasurements from "../components/results/DetailedMeasurements";
import PhotoUpload from "../components/results/PhotoUpload";
import PDFReportGenerator from "../components/results/PDFReportGenerator";
import DesignPreview from "../components/results/DesignPreview";
import RoofDiagram from "../components/results/RoofDiagram";
import Roof3DView from "../components/results/Roof3DView";

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRoofer, setIsRoofer] = useState(false);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  const scriptLoadedRef = useRef(false);
  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
  const [sendingToTop5, setSendingToTop5] = useState(false);
  const [top5Success, setTop5Success] = useState(false);
  
  const [selectedMaterial, setSelectedMaterial] = useState({
    name: 'Asphalt Shingles (Architectural)',
    pricePerSqFt: 4.50,
    laborMultiplier: 1.0,
    category: 'standard'
  });

  const roofingMaterials = [
    { name: 'Asphalt Shingles (3-Tab)', pricePerSqFt: 3.50, laborMultiplier: 1.0, category: 'economy', description: 'Most affordable option, 15-20 year lifespan', warranty: '15-20 years' },
    { name: 'Asphalt Shingles (Architectural)', pricePerSqFt: 4.50, laborMultiplier: 1.0, category: 'standard', description: 'Popular choice, 25-30 year lifespan, dimensional look', warranty: '25-30 years' },
    { name: 'Metal Roofing (Standing Seam)', pricePerSqFt: 9.00, laborMultiplier: 1.3, category: 'premium', description: 'Energy efficient, 40-70 year lifespan, modern look', warranty: '40-50 years' },
    { name: 'Metal Roofing (Metal Shingles)', pricePerSqFt: 8.00, laborMultiplier: 1.2, category: 'premium', description: 'Lightweight, durable, 40-60 year lifespan', warranty: '40-50 years' },
    { name: 'Clay Tile', pricePerSqFt: 12.00, laborMultiplier: 1.5, category: 'luxury', description: 'Classic Mediterranean look, 50-100 year lifespan', warranty: '50+ years' },
    { name: 'Concrete Tile', pricePerSqFt: 10.00, laborMultiplier: 1.4, category: 'premium', description: 'Versatile styles, 40-50 year lifespan, fire resistant', warranty: '40-50 years' },
    { name: 'Natural Slate', pricePerSqFt: 18.00, laborMultiplier: 1.8, category: 'luxury', description: 'Premium natural stone, 75-200 year lifespan', warranty: '75-100+ years' },
    { name: 'Cedar Shingles/Shakes', pricePerSqFt: 7.00, laborMultiplier: 1.2, category: 'premium', description: 'Natural wood beauty, 20-40 year lifespan', warranty: '20-30 years' },
    { name: 'TPO (Flat Roof)', pricePerSqFt: 5.50, laborMultiplier: 1.1, category: 'standard', description: 'Energy efficient for flat/low-slope, 15-20 year lifespan', warranty: '15-20 years' },
    { name: 'EPDM Rubber (Flat Roof)', pricePerSqFt: 5.00, laborMultiplier: 1.0, category: 'economy', description: 'Durable flat roof option, 20-25 year lifespan', warranty: '20-25 years' },
    { name: 'Composite/Synthetic', pricePerSqFt: 8.50, laborMultiplier: 1.1, category: 'premium', description: 'Mimics natural materials, 30-50 year lifespan', warranty: '30-50 years' },
    { name: 'Solar Tiles', pricePerSqFt: 25.00, laborMultiplier: 2.0, category: 'luxury', description: 'Generate electricity, 25-30 year lifespan', warranty: '25 years' },
    { name: 'Green/Living Roof', pricePerSqFt: 15.00, laborMultiplier: 2.5, category: 'luxury', description: 'Eco-friendly vegetation layer, 30-50 year lifespan', warranty: '30-40 years' }
  ];

  useEffect(() => {
    const vizJson = sessionStorage.getItem('funnel_selected_visualization');
    if (vizJson) {
      try { setSelectedVisualization(JSON.parse(vizJson)); } catch (err) { console.error('Failed to parse visualization:', err); }
    }
  }, []);

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.geometry) {
      if (!scriptLoadedRef.current) {
        scriptLoadedRef.current = true;
        setMapScriptLoaded(true);
      }
      return;
    }
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.geometry) {
          clearInterval(checkInterval);
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
        } else if (attempts >= 60) { clearInterval(checkInterval); }
      }, 200);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.geometry) {
          clearInterval(checkInterval);
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
        } else if (attempts >= 40) { clearInterval(checkInterval); }
      }, 100);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const measurementId = urlParams.get('measurementid');
      const latParam = urlParams.get('lat');
      const lngParam = urlParams.get('lng');
      const areaParam = urlParams.get('area');

      console.log('🚀 Results Page URL Params:', { lat: latParam, lng: lngParam, area: areaParam, measurementId });

      if (!measurementId) {
        navigate(createPageUrl("Homepage"));
        return;
      }

      try {
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        
        if (measurements.length > 0) {
          let meas = measurements[0];
          if (latParam && lngParam) {
            meas = { ...meas, latitude: parseFloat(latParam), longitude: parseFloat(lngParam) };
          }
          if (areaParam) {
            meas = { ...meas, total_sqft: parseFloat(areaParam), total_adjusted_sqft: parseFloat(areaParam) };
          }
          setMeasurement(meas);
        } else {
          setError("Measurement not found");
        }
      } catch (err) {
        console.error("Error loading measurement:", err);
        setError("Failed to load measurement");
      } finally {
        setLoading(false);
      }
    };

    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        setIsRoofer(user && user.aroof_role === 'external_roofer');
      } catch (err) {
        setCurrentUser(null);
        setIsRoofer(false);
      }
    };

    loadData();
    loadUser();
  }, [navigate]);

  const handleScheduleClick = () => {
    navigate(createPageUrl(`Booking?measurementid=${measurement.id}`));
  };

  const handlePhotosUpdate = (updatedPhotos) => {
    setMeasurement({ ...measurement, photos: updatedPhotos });
  };

  const handleSendToTop5 = async () => {
    setSendingToTop5(true);
    try {
      const companies = await base44.entities.Company.list('-created_date', 5);
      const activeCompanies = companies.filter(c => c.is_active);
      const top5 = activeCompanies.slice(0, 5);

      if (top5.length === 0) {
        alert('No active roofers available at this time. Please try again later.');
        setSendingToTop5(false);
        return;
      }

      const sharedWith = top5.map(r => r.id);
      await base44.entities.Measurement.update(measurement.id, {
        lead_status: 'contacted',
        shared_with_roofers: sharedWith
      });

      setMeasurement({
        ...measurement,
        lead_status: 'contacted',
        shared_with_roofers: sharedWith
      });

      setTop5Success(true);
    } catch (err) {
      console.error('Error sending to top 5:', err);
      alert('Failed to send to roofers. Please try again.');
    } finally {
      setSendingToTop5(false);
    }
  };

  const handlePDFDownload = () => {
    setDownloadCount(prev => prev + 1);
  };

  const getUserBranding = () => {
    if (!currentUser) return null;
    if (currentUser.subscription_plan === 'pro' || currentUser.subscription_plan === 'unlimited') {
      return currentUser.custom_branding || null;
    }
    return null;
  };
  
  const calculatePriceWithMaterial = () => {
    const totalArea = measurement?.total_sqft || measurement?.measurement_data?.total_adjusted_sqft || 0;
    const materialCost = totalArea * selectedMaterial.pricePerSqFt;
    const laborCost = totalArea * (3.00 * selectedMaterial.laborMultiplier);
    const totalCost = materialCost + laborCost;
    
    return {
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      totalCost: Math.round(totalCost),
      lowEstimate: Math.round(totalCost * 0.85),
      highEstimate: Math.round(totalCost * 1.15)
    };
  };

  const handleMaterialChange = (material) => {
    setSelectedMaterial(material);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-2xl font-semibold text-slate-700">Loading Your Results...</p>
        </div>
      </div>
    );
  }

  if (error || !measurement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Measurement Not Found</h2>
            <p className="text-slate-600 mb-6">{error || "We couldn't find your measurement data."}</p>
            <Link to={createPageUrl("AddressEntry")}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Start New Measurement</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = measurement?.measurement_data?.sections || [];
  const flatArea = measurement?.measurement_data?.total_flat_sqft || measurement.total_sqft || 0;
  const adjustedArea = measurement?.measurement_data?.total_adjusted_sqft || measurement.total_sqft || flatArea;
  const area = adjustedArea;
  const isHomeowner = true; 
  const hasPitchAdjustment = flatArea !== adjustedArea;
  const capturedImages = measurement?.captured_images || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">Aroof</span>
                <p className="text-xs text-blue-600 font-semibold">Your Measurement Results</p>
              </div>
            </Link>
            <Link to={createPageUrl(`MeasurementPage?address=${encodeURIComponent(measurement.property_address)}&measurementId=${measurement.id}`)}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Measurement
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <CheckCircle className="w-16 h-16" />
            <h1 className="text-4xl md:text-5xl font-bold">Measurement Complete!</h1>
          </div>
          <p className="text-2xl text-green-100">{measurement.property_address}</p>
          {measurement.created_date && (
            <p className="text-green-200 mt-2">
              Measured on {format(new Date(measurement.created_date), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-2xl border-4 border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                    <span className="text-5xl">✨</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">See Your Home with a New Roof</h2>
                    <p className="text-slate-600 mb-4">Use AI to visualize different materials and colors before you decide</p>
                    <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold" onClick={() => {
                        const url = createPageUrl(`MeasurementPage?address=${encodeURIComponent(measurement.property_address)}&lat=${measurement.latitude}&lng=${measurement.longitude}&measurementId=${measurement.id}`);
                        navigate(url);
                      }}>
                      <Palette className="w-5 h-5 mr-2" />
                      Open AI Design Studio
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {sections.length > 0 && (
              <Card className="shadow-xl border-2 border-red-200">
                <CardHeader className="bg-gradient-to-r from-red-50 to-white">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Box className="w-6 h-6 text-red-600" />
                    🏠 3D Roof View
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[500px] overflow-hidden rounded-b-xl">
                  {!mapScriptLoaded ? (
                    <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
                  ) : (
                    <Roof3DView measurement={measurement} sections={sections} mapScriptLoaded={mapScriptLoaded} />
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-green-600" />
                  Interactive Measurement View
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[500px] p-0 overflow-hidden rounded-b-xl">
                 {!mapScriptLoaded ? (
                    <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
                  ) : (
                    <InteractiveMapView measurement={measurement} sections={sections} mapScriptLoaded={mapScriptLoaded} />
                  )}
              </CardContent>
            </Card>

            <RoofDiagram measurement={measurement} />
            <DetailedMeasurements measurement={measurement} />
            <PhotoUpload measurement={measurement} onPhotosUpdate={handlePhotosUpdate} />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <DesignPreview />
            
            <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Total Roof Area {hasPitchAdjustment && <span className="text-sm">(Pitch-Adjusted)</span>}</h2>
                <div className="text-6xl md:text-7xl font-bold text-blue-600 mb-2">{area.toLocaleString()}</div>
                <p className="text-2xl font-semibold text-slate-600">square feet</p>
                {hasPitchAdjustment && <p className="text-sm text-blue-600 mt-4">Flat: {flatArea.toLocaleString()} sq ft</p>}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader><CardTitle className="text-xl">Section Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div key={section.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border-l-4" style={{ borderColor: section.color || '#4A90E2' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: section.color || '#4A90E2' }} />
                        <span className="font-semibold text-slate-900 text-sm">{section.name || `Section ${index + 1}`}</span>
                      </div>
                      <span className="font-bold text-slate-900">{(section.adjusted_area_sqft || section.flat_area_sqft || 0).toLocaleString()} sq ft</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold">
                    <span>Total</span>
                    <span className="text-xl">{area.toLocaleString()} sq ft</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-2 border-blue-200">
               <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                 <CardTitle className="text-xl flex items-center gap-2"><Box className="w-6 h-6 text-blue-600" /> Select Roofing Material</CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                 <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                   {['economy', 'standard', 'premium', 'luxury'].map((category) => (
                     <button key={category} onClick={() => {
                       const filtered = roofingMaterials.filter(m => m.category === category);
                       if (filtered.length > 0) handleMaterialChange(filtered[0]);
                     }} className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap text-sm ${selectedMaterial.category === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                       {category.charAt(0).toUpperCase() + category.slice(1)}
                     </button>
                   ))}
                 </div>
                 <div className="space-y-2 max-h-96 overflow-y-auto">
                   {roofingMaterials.map((material) => (
                     <div key={material.name} onClick={() => handleMaterialChange(material)} className={`p-3 rounded-lg border-2 cursor-pointer ${selectedMaterial.name === material.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                       <div className="flex items-start justify-between mb-1">
                         <h3 className="font-bold text-gray-900 text-sm">{material.name}</h3>
                         {selectedMaterial.name === material.name && <CheckCircle className="w-5 h-5 text-blue-600" />}
                       </div>
                       <p className="text-xs text-gray-600 mb-2">{material.description}</p>
                       <div className="flex items-baseline gap-2">
                         <span className="text-lg font-bold text-blue-600">${material.pricePerSqFt.toFixed(2)}</span>
                         <span className="text-xs text-gray-500">per sq ft</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
            </Card>
            
            <Card className="shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
               <CardHeader><CardTitle className="text-xl flex items-center gap-2"><DollarSign className="w-6 h-6 text-green-600" /> Estimated Project Cost</CardTitle></CardHeader>
               <CardContent className="space-y-4">
                 {(() => {
                   const pricing = calculatePriceWithMaterial();
                   return (
                     <>
                       <div className="bg-white rounded-lg p-4 space-y-3">
                         <div className="flex justify-between items-center pb-3 border-b"><span className="text-slate-700 font-medium text-sm">Selected:</span><span className="font-bold text-slate-900 text-sm">{selectedMaterial.name}</span></div>
                         <div className="flex justify-between items-center"><span className="text-slate-600 text-sm">Materials</span><span className="font-bold text-slate-900">${pricing.materialCost.toLocaleString()}</span></div>
                         <div className="flex justify-between items-center"><span className="text-slate-600 text-sm">Labor</span><span className="font-bold text-slate-900">${pricing.laborCost.toLocaleString()}</span></div>
                       </div>
                       <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-4 text-center">
                         <p className="text-sm font-medium mb-1 opacity-90">Estimated Cost Range</p>
                         <p className="text-3xl font-bold mb-1">${pricing.lowEstimate.toLocaleString()} - ${pricing.highEstimate.toLocaleString()}</p>
                       </div>
                     </>
                   );
                 })()}
               </CardContent>
            </Card>

            <Card className="shadow-2xl border-none overflow-hidden">
               <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 text-center">
                 <h2 className="text-2xl font-bold mb-4">Ready for Your New Roof?</h2>
                 <Button size="lg" className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 mb-4" onClick={handleScheduleClick}>
                   <Calendar className="w-6 h-6 mr-2" /> Schedule Free Inspection
                 </Button>
                 <Button size="lg" variant="outline" className="w-full h-14 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-white" asChild>
                   <a href="tel:+18502389727" className="flex items-center justify-center gap-2"><Phone className="w-5 h-5" /> Call: (850) 238-9727</a>
                 </Button>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}