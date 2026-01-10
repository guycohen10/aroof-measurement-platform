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
import RoofDiagram from "../components/results/RoofDiagram";


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

  const SECTION_COLORS = [
    { stroke: '#4A90E2', fill: '#4A90E2', name: 'Blue' },
    { stroke: '#10b981', fill: '#10b981', name: 'Green' },
    { stroke: '#f97316', fill: '#f97316', name: 'Orange' },
    { stroke: '#a855f7', fill: '#a855f7', name: 'Purple' },
    { stroke: '#ef4444', fill: '#ef4444', name: 'Red' },
    { stroke: '#06b6d4', fill: '#06b6d4', name: 'Cyan' },
    { stroke: '#f59e0b', fill: '#f59e0b', name: 'Amber' },
    { stroke: '#ec4899', fill: '#ec4899', name: 'Pink' },
    { stroke: '#8b5cf6', fill: '#8b5cf6', name: 'Violet' },
    { stroke: '#14b8a6', fill: '#14b8a6', name: 'Teal' },
  ];

  const generateBlueprint = async (saveToMeasurement = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('ROOF MEASUREMENT BLUEPRINT', 50, 50);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText(measurement.property_address, 50, 80);
    ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 50, 105);
    
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    const allSections = sections.map((s, idx) => ({
      ...s,
      displayColor: s.color || SECTION_COLORS[idx % SECTION_COLORS.length].stroke
    }));
    
    if (allSections.length === 0) {
      alert('No sections to display in blueprint');
      return;
    }
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    allSections.forEach(section => {
      if (section.coordinates && section.coordinates.length > 0) {
        section.coordinates.forEach(point => {
          minLat = Math.min(minLat, point.lat);
          maxLat = Math.max(maxLat, point.lat);
          minLng = Math.min(minLng, point.lng);
          maxLng = Math.max(maxLng, point.lng);
        });
      }
    });
    
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    const padding = Math.max(latRange, lngRange) * 0.1;
    
    minLat -= padding;
    maxLat += padding;
    minLng -= padding;
    maxLng += padding;
    
    const drawPadding = 80;
    const drawWidth = canvas.width - drawPadding * 2;
    const drawHeight = canvas.height - 300;
    const drawTop = 140;
    
    function scalePoint(lat, lng) {
      const x = drawPadding + ((lng - minLng) / (maxLng - minLng)) * drawWidth;
      const y = drawTop + ((maxLat - lat) / (maxLat - minLat)) * drawHeight;
      return { x, y };
    }
    
    allSections.forEach((section, index) => {
      if (!section.coordinates || section.coordinates.length === 0) return;
      
      const color = section.displayColor;
      
      ctx.fillStyle = color + '33';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      section.coordinates.forEach((point, i) => {
        const scaled = scalePoint(point.lat, point.lng);
        if (i === 0) ctx.moveTo(scaled.x, scaled.y);
        else ctx.lineTo(scaled.x, scaled.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      let centerLat = 0, centerLng = 0;
      section.coordinates.forEach(p => {
        centerLat += p.lat;
        centerLng += p.lng;
      });
      centerLat /= section.coordinates.length;
      centerLng /= section.coordinates.length;
      
      const centerScaled = scalePoint(centerLat, centerLng);
      
      const labelLines = [
        section.name || `Section ${index + 1}`,
        `${Math.round(section.adjusted_area_sqft || section.flat_area_sqft).toLocaleString()} sq ft`,
        `Pitch: ${section.pitch || 'flat'}`
      ];
      
      const lineHeight = 18;
      const labelHeight = labelLines.length * lineHeight + 10;
      const labelWidth = 140;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillRect(centerScaled.x - labelWidth/2, centerScaled.y - labelHeight/2, labelWidth, labelHeight);
      ctx.strokeRect(centerScaled.x - labelWidth/2, centerScaled.y - labelHeight/2, labelWidth, labelHeight);
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      labelLines.forEach((line, i) => {
        const y = centerScaled.y - labelHeight/2 + 15 + (i * lineHeight);
        if (i === 0) {
          ctx.font = 'bold 14px Arial';
        } else {
          ctx.font = '12px Arial';
        }
        ctx.fillText(line, centerScaled.x, y);
      });
    });
    
    const legendTop = drawTop + drawHeight + 40;
    const totalSquares = (area / 100).toFixed(2);
    
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(50, legendTop, canvas.width - 100, 150);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, legendTop, canvas.width - 100, 150);
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('MEASUREMENT SUMMARY', 70, legendTop + 35);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Total Sections: ${allSections.length}`, 70, legendTop + 70);
    ctx.fillText(`Total Area: ${area.toLocaleString()} sq ft`, 70, legendTop + 100);
    ctx.fillText(`Total Squares: ${totalSquares}`, 70, legendTop + 130);
    
    const dataUrl = canvas.toDataURL('image/png');
    
    if (saveToMeasurement) {
      try {
        await base44.entities.Measurement.update(measurement.id, {
          measurement_diagram: dataUrl
        });
        setMeasurement({ ...measurement, measurement_diagram: dataUrl });
        alert('Blueprint saved to results page!');
      } catch (err) {
        alert('Failed to save blueprint: ' + err.message);
      }
    } else {
      const link = document.createElement('a');
      link.download = `roof-blueprint-${measurement.property_address.replace(/[^a-z0-9]/gi, '-')}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

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
    : `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(measurement.property_address)}&zoom=21&size=800x400&maptype=satellite&key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc`;
  
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

            {sections.length > 0 && (
              <Card className="shadow-xl border-2 border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Box className="w-6 h-6 text-purple-600" />
                    📐 Roof Blueprint Diagram
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {measurement.measurement_diagram ? (
                    <>
                      <p className="text-slate-600 mb-4">
                        Blueprint saved to results page
                      </p>
                      <img 
                        src={measurement.measurement_diagram} 
                        alt="Roof Blueprint"
                        className="w-full h-auto border-2 border-slate-200 rounded-lg mb-4"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => generateBlueprint(false)}
                          variant="outline"
                          className="flex-1 h-12 border-2 border-purple-600 text-purple-600"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download
                        </Button>
                        <Button
                          onClick={() => generateBlueprint(true)}
                          className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-600 mb-4">
                        Scaled blueprint showing all measured sections with labels
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => generateBlueprint(false)}
                          variant="outline"
                          className="flex-1 h-16 border-2 border-purple-600 text-purple-600 text-lg"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download
                        </Button>
                        <Button
                          onClick={() => generateBlueprint(true)}
                          className="flex-1 h-16 bg-purple-600 hover:bg-purple-700 text-white text-lg"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Add to Results
                        </Button>
                      </div>
                    </>
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
                <p className="text-sm text-slate-600 mt-1">Interactive map - zoom and pan</p>
              </CardHeader>
              <CardContent>
                <InteractiveMapView measurement={measurement} sections={sections} />
              </CardContent>
            </Card>

            <RoofDiagram measurement={measurement} />

            <DetailedMeasurements measurement={measurement} />

            <PhotoUpload measurement={measurement} onPhotosUpdate={handlePhotosUpdate} />

            <Card className="shadow-lg border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <FileText className="w-6 h-6 text-slate-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      📋 Measurement Accuracy Notice
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      This satellite-based measurement provides an accurate preliminary estimate (±2-5%). 
                      However, factors such as tree coverage, image resolution, and roof complexity may 
                      affect precision. Our licensed roofing professionals will verify all measurements 
                      during your <strong className="text-blue-600">FREE on-site inspection</strong> before 
                      providing a final quote.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleScheduleClick}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-14"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Free Inspection
                </Button>
              </CardContent>
            </Card>

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
                
                {measurement.measurement_type === 'quick_estimate' && (
                  <Alert className="mt-6 bg-orange-50 border-orange-200 text-left">
                    <AlertDescription className="text-sm">
                      <div className="font-bold text-orange-900 mb-2">⚡ Quick Estimate</div>
                      <p className="text-orange-800 mb-3">
                        This is an approximate calculation based on building size. 
                        For precise measurements, use our Detailed Measurement tool.
                      </p>
                      <Link to={createPageUrl(`MeasurementPage?address=${encodeURIComponent(measurement.property_address)}`)}>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          Get Detailed Measurement
                        </Button>
                      </Link>
                    </AlertDescription>
                  </Alert>
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