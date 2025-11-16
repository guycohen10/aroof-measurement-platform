
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, ArrowLeft, CheckCircle, MapPin, Calendar, Ruler, Download, Phone, FileText, Star, Shield, DollarSign, Zap, Award, Users, Loader2, Crown, ArrowRight, Box, Camera } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import InteractiveMapView from "../components/results/InteractiveMapView";
import DetailedMeasurements from "../components/results/DetailedMeasurements";
import PhotoUpload from "../components/results/PhotoUpload";
import PDFReportGenerator from "../components/results/PDFReportGenerator";
import Roof3DView from "../components/results/Roof3DView";

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState(null);
  const [materialType, setMaterialType] = useState("asphalt_shingles");
  const [downloadCount, setDownloadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const measurementId = urlParams.get('measurementid');

      if (!measurementId) {
        navigate(createPageUrl("Homepage"));
        return;
      }

      try {
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        
        if (measurements.length > 0) {
          setMeasurement(measurements[0]);
        } else {
          setError("Measurement not found");
        }
      } catch (err) {
        setError("Failed to load measurement");
      } finally {
        setLoading(false);
      }
    };

    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (err) {
        setCurrentUser(null);
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
            <Link to={createPageUrl("FormPage")}>
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
  const isHomeowner = measurement.user_type === "homeowner";
  const hasPitchAdjustment = flatArea !== adjustedArea;
  const capturedImages = measurement?.captured_images || [];

  const materialMultipliers = {
    asphalt_shingles: 1.0,
    architectural_shingles: 1.25,
    metal_roofing: 1.60,
    tile_roofing: 2.0
  };

  const multiplier = materialMultipliers[materialType] || 1.0;
  const baseMaterialCost = area * 4.00;
  const materialCost = Math.round(baseMaterialCost * multiplier);
  const laborCost = Math.round(area * 3.00);
  const wasteCost = Math.round((materialCost + laborCost) * 0.10);
  const subtotal = materialCost + laborCost + wasteCost;
  const lowEstimate = Math.round(subtotal * 0.90);
  const highEstimate = Math.round(subtotal * 1.10);

  const calculateRoofCenter = () => {
    if (!sections || sections.length === 0) return null;

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    sections.forEach(section => {
      if (section.coordinates && section.coordinates.length > 0) {
        section.coordinates.forEach(point => {
          minLat = Math.min(minLat, point.lat);
          maxLat = Math.max(maxLat, point.lat);
          minLng = Math.min(minLng, point.lng);
          maxLng = Math.max(maxLng, point.lng);
        });
      }
    });

    if (minLat === Infinity) return null;
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  };

  const roofCenter = calculateRoofCenter();

  const editMeasurementUrl = roofCenter 
    ? createPageUrl(`MeasurementPage?address=${encodeURIComponent(measurement.property_address)}&lat=${roofCenter.lat}&lng=${roofCenter.lng}&measurementId=${measurement.id}`)
    : createPageUrl(`MeasurementPage?address=${encodeURIComponent(measurement.property_address)}&measurementId=${measurement.id}`);

  const satelliteUrl = roofCenter 
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${roofCenter.lat},${roofCenter.lng}&zoom=21&size=800x400&maptype=satellite&key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc`
    : `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(measurement.property_address)}&zoom=21&size=800x400&maptype=satellite&key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc`);
  
  const diagramUrl = (() => {
    if (sections.length === 0 || !roofCenter) return null;
    const colors = ['0xff0000', '0x00ff00', '0x0000ff', '0xffff00', '0xff00ff', '0x00ffff'];
    let pathsString = '';
    sections.forEach((section, index) => {
      if (section.coordinates && section.coordinates.length > 0) {
        const color = colors[index % colors.length];
        const points = section.coordinates.map(p => `${p.lat},${p.lng}`).join('|');
        const firstPoint = `${section.coordinates[0].lat},${section.coordinates[0].lng}`;
        pathsString += `&path=color:${color}|weight:3|fillcolor:${color}44|${points}|${firstPoint}`;
      }
    });
    return `https://maps.googleapis.com/maps/api/staticmap?center=${roofCenter.lat},${roofCenter.lng}&zoom=21&size=800x400&maptype=satellite${pathsString}&key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc`;
  })();

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
            <Link to={editMeasurementUrl}>
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
            {/* User-Captured Images Gallery - ABOVE SATELLITE VIEW */}
            {capturedImages.length > 0 && (
              <Card className="shadow-xl border-2 border-green-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Camera className="w-6 h-6 text-green-600" />
                    📸 Your Captured Views ({capturedImages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-600 mb-4">
                    Static views you captured at different zoom levels
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {capturedImages.map((img, idx) => (
                      <div key={img.id} className="border-2 border-green-300 rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src={img.url}
                          alt={`Captured view ${idx + 1}`}
                          className="w-full h-auto"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="p-8 text-center text-slate-500">Failed to load</div>';
                          }}
                        />
                        <div className="bg-green-50 p-3">
                          <p className="text-sm font-bold text-green-900">Capture #{idx + 1}</p>
                          <p className="text-xs text-green-700">Zoom level: {img.zoom}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Satellite View */}
            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  📍 Satellite View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-600 mb-4">
                  High-resolution satellite view focused on your roof
                </p>
                <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={satelliteUrl}
                    alt="Satellite view"
                    className="w-full h-auto"
                    style={{ maxWidth: '800px', width: '100%' }}
                    onError={(e) => {
                      console.error("Satellite image failed to load");
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="p-12 text-center text-slate-500">Unable to load satellite image</div>';
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Measurement Diagram */}
            {diagramUrl && (
              <Card className="shadow-xl border-2 border-green-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Ruler className="w-6 h-6 text-green-600" />
                    📐 Measurement Diagram
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-600 mb-4">
                    Color-coded sections showing measured roof areas
                  </p>
                  <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src={diagramUrl}
                      alt="Measurement diagram"
                      className="w-full h-auto"
                      style={{ maxWidth: '800px', width: '100%' }}
                      onError={(e) => {
                        console.error("Diagram image failed to load");
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div className="mt-6 bg-slate-50 rounded-lg p-4">
                    <h4 className="font-bold text-slate-900 mb-3">Section Legend:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {sections.map((section, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: section.color || '#3b82f6' }}
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            {section.name || `Section ${idx + 1}`}: {Math.round(section.adjusted_area_sqft || section.flat_area_sqft).toLocaleString()} sq ft
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3D Visualization */}
            {sections.length > 0 && (
              <Card className="shadow-xl border-2 border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Box className="w-6 h-6 text-purple-600" />
                    🎨 3D Roof Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-600 mb-4">
                    Interactive 3D model - drag to rotate
                  </p>
                  <Roof3DView measurement={measurement} sections={sections} />
                </CardContent>
              </Card>
            )}

            {/* Interactive Map */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-green-600" />
                  Interactive Measurement View
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Interactive map - zoom and pan</p>
              </CardHeader>
              <CardContent>
                <InteractiveMapView measurement={measurement} sections={sections} />
              </CardContent>
            </Card>

            <DetailedMeasurements measurement={measurement} />

            <PhotoUpload measurement={measurement} onPhotosUpdate={handlePhotosUpdate} />

            {/* PDF Section */}
            <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-xl">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-4">
                    <FileText className="w-4 h-4" />
                    <span className="font-semibold">Professional Report Available</span>
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-4">
                    Download Detailed PDF Report
                  </h2>
                  <p className="text-xl text-slate-600">
                    Get a comprehensive professional report with all measurements
                  </p>
                </div>

                <Card className="shadow-2xl border-2 border-purple-200">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <FileText className="w-6 h-6 text-purple-600" />
                          What's Included
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {[
                            'Satellite imagery',
                            'Measurement diagram',
                            '3D visualization',
                            'Section breakdown',
                            'Line measurements',
                            'Material estimates',
                            'Cost estimates',
                            measurement.photos?.length > 0 ? `${measurement.photos.length} photos` : 'Site photos',
                            capturedImages.length > 0 ? `${capturedImages.length} captured views` : null,
                            'Professional formatting'
                          ].filter(Boolean).map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <PDFReportGenerator
                        measurement={measurement}
                        userBranding={getUserBranding()}
                        onGenerate={handlePDFDownload}
                      />

                      {downloadCount > 0 && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <strong>Report generated {downloadCount} time{downloadCount > 1 ? 's' : ''}!</strong>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">
                  Total Roof Area {hasPitchAdjustment && <span className="text-sm">(Pitch-Adjusted)</span>}
                </h2>
                <div className="text-6xl md:text-7xl font-bold text-blue-600 mb-2">
                  {area.toLocaleString()}
                </div>
                <p className="text-2xl font-semibold text-slate-600">square feet</p>
                {hasPitchAdjustment && (
                  <p className="text-sm text-blue-600 mt-4">
                    Flat: {flatArea.toLocaleString()} sq ft
                  </p>
                )}
              </CardContent>
            </Card>

            {sections.length > 1 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Section Breakdown</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{sections.length} sections</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sections.map((section, index) => (
                      <div
                        key={section.id || index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border-l-4"
                        style={{ borderColor: section.color || '#4A90E2' }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: section.color || '#4A90E2' }}
                          />
                          <span className="font-semibold text-slate-900 text-sm">
                            {section.name || `Section ${index + 1}`}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {(section.adjusted_area_sqft || section.flat_area_sqft || 0).toLocaleString()} sq ft
                        </span>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold">
                      <span>Total</span>
                      <span className="text-xl">{area.toLocaleString()} sq ft</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isHomeowner && (
              <Card className="shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    Estimated Cost
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Select Material:
                    </label>
                    <Select value={materialType} onValueChange={setMaterialType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asphalt_shingles">Asphalt Shingles</SelectItem>
                        <SelectItem value="architectural_shingles">Architectural (+25%)</SelectItem>
                        <SelectItem value="metal_roofing">Metal (+60%)</SelectItem>
                        <SelectItem value="tile_roofing">Tile (+100%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-white rounded-lg">
                      <span className="text-slate-600">Materials</span>
                      <span className="font-bold">${materialCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-lg">
                      <span className="text-slate-600">Labor</span>
                      <span className="font-bold">${laborCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-lg">
                      <span className="text-slate-600">Waste (10%)</span>
                      <span className="font-bold">${wasteCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-green-600 text-white rounded-lg font-bold">
                      <span className="text-lg">Cost Range</span>
                      <span className="text-2xl">
                        ${lowEstimate.toLocaleString()} - ${highEstimate.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-2xl border-none overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Ready for Your New Roof?</h2>
                  
                  <Button
                    size="lg"
                    className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 mb-4"
                    onClick={handleScheduleClick}
                  >
                    <Calendar className="w-6 h-6 mr-2" />
                    Schedule Free Inspection
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-14 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
                    asChild
                  >
                    <a href="tel:+18502389727" className="flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5" />
                      Call: (850) 238-9727
                    </a>
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="shadow-lg border-l-4 border-l-yellow-400">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-slate-700 italic mb-4">
                  "Aroof made getting my roof done so easy! The measurement was accurate."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Sarah J.</p>
                    <p className="text-sm text-slate-500">Plano, TX</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Questions?</h3>
                <p className="text-slate-600 mb-4">Our experts are here to help</p>
                <div className="space-y-2 text-sm">
                  <a href="tel:+18502389727" className="flex items-center justify-center gap-2 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    <strong>(850) 238-9727</strong>
                  </a>
                  <a href="mailto:contact@aroof.build" className="flex items-center justify-center gap-2 hover:text-blue-600">
                    <strong>contact@aroof.build</strong>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
