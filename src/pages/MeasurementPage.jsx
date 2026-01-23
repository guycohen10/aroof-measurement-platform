import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, PenTool, Trash2, Calculator, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function MeasurementPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [mapNode, setMapNode] = useState(null);
  const mapInstance = useRef(null);

  // Measurement State
  const [mode, setMode] = useState('quick'); // 'quick' | 'full'
  const [drawingManager, setDrawingManager] = useState(null);
  const [totalArea, setTotalArea] = useState(0); // Sq Ft
  const [polygons, setPolygons] = useState([]);

  // Quick Estimate Params
  const [pitch, setPitch] = useState('walkable');
  const [complexity, setComplexity] = useState('simple');
  const [stories, setStories] = useState('1');

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const activeLeadId = leadId || sessionStorage.getItem('active_lead_id');
        
        if (!activeLeadId) {
             // If no lead, try to recover from session address or just stop loading
             const sessionAddress = sessionStorage.getItem('lead_address');
             if (sessionAddress) {
                 setLead({ property_address: sessionAddress });
                 geocodeAddress(sessionAddress);
                 return;
             }
             setLoading(false);
             return;
        }
        
        // Fetch Lead
        let leadData;
        try {
             leadData = await base44.entities.Lead.get(activeLeadId);
        } catch (e) {
             try {
                leadData = await base44.entities.Measurement.get(activeLeadId);
             } catch (e2) {
                console.error("Lead not found");
             }
        }
        
        if (leadData) {
            setLead(leadData);
            
            // Construct address
            const address = leadData.property_address || 
                            (leadData.address_street ? `${leadData.address_street}, ${leadData.address_city || ''}, ${leadData.address_state || ''}` : leadData.address);
            
            if (address) {
                geocodeAddress(address);
            } else {
                toast.error("No address found for lead");
                setLoading(false);
            }
        } else {
            setLoading(false);
        }

      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    const geocodeAddress = (address) => {
        if (!window.google) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const loc = results[0].geometry.location;
            setCoordinates({ lat: loc.lat(), lng: loc.lng() });
          } else {
            toast.error("Could not locate address");
          }
          setLoading(false);
        });
    };
    
    // Wait for Google Maps API
    if (!window.google) {
        const interval = setInterval(() => {
            if (window.google) {
                clearInterval(interval);
                loadData();
            }
        }, 100);
    } else {
        loadData();
    }
  }, [leadId]);

  // --- 2. MAP & TOOLS INIT ---
  useEffect(() => {
    if (!mapNode || !coordinates || mapInstance.current) return;

    // A. Map
    const map = new window.google.maps.Map(mapNode, {
      center: coordinates,
      zoom: 20,
      mapTypeId: 'satellite',
      disableDefaultUI: true,
      tilt: 0,
    });
    mapInstance.current = map;

    // B. Drawing Manager (Hidden by default)
    const manager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: '#3b82f6',
        fillOpacity: 0.4,
        strokeWeight: 2,
        strokeColor: '#2563eb',
        editable: true,
        draggable: false,
      },
    });
    manager.setMap(map);
    setDrawingManager(manager);

    // C. Area Calc Listener
    window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
      const areaSqMeters = window.google.maps.geometry.spherical.computeArea(poly.getPath());
      const areaSqFeet = Math.round(areaSqMeters * 10.7639);
      setTotalArea(prev => prev + areaSqFeet);
      setPolygons(prev => [...prev, poly]);
      manager.setDrawingMode(null); // Stop drawing after shape close
    });
  }, [mapNode, coordinates]);

  // --- 3. MODE SWITCHING ---
  useEffect(() => {
    if (!drawingManager) return;
    if (mode === 'quick') {
      drawingManager.setDrawingMode(null); // Disable drawing in Quick Mode
    }
  }, [mode, drawingManager]);

  // --- 4. CALCULATIONS ---
  const calculateEstimatedPrice = () => {
    // Base price per sq (example logic)
    let baseRate = 4.50;
    if (pitch === 'steep') baseRate += 1.00;
    if (complexity === 'complex') baseRate += 0.75;
    if (stories === '2+') baseRate += 0.50;

    const minCost = Math.round(totalArea * baseRate);
    const maxCost = Math.round(minCost * 1.2);
    return totalArea > 0 ? `$${minCost.toLocaleString()} - $${maxCost.toLocaleString()}` : '$0.00';
  };

  const handleReset = () => {
    polygons.forEach(p => p.setMap(null));
    setPolygons([]);
    setTotalArea(0);
  };

  // --- 5. RENDER ---
  const onMapRefChange = useCallback((node) => {
      if (node) setMapNode(node);
  }, []);

  if (loading) return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
  );

  return (
    <div className="h-screen w-full flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4 z-20 shadow-sm relative">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="font-bold text-lg text-slate-900">
            {lead?.name || lead?.customer_name || 'Roof Measurement'}
        </h1>
      </header>

      <div className="flex-1 relative">
          {/* TOOLBELT PANEL */}
          <Card className="absolute top-4 left-4 z-10 w-80 shadow-2xl border-slate-200">
            <Tabs value={mode} onValueChange={setMode}>
              <div className="p-4 border-b bg-slate-50 rounded-t-lg">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="quick">Quick Est.</TabsTrigger>
                  <TabsTrigger value="full">Full Measure</TabsTrigger>
                </TabsList>
              </div>
              <CardContent className="p-4 space-y-4">
                
                {/* SHARED AREA DISPLAY */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                  <p className="text-xs text-blue-600 font-bold uppercase">Total Roof Area</p>
                  <p className="text-3xl font-bold text-slate-900">{totalArea.toLocaleString()} <span className="text-sm font-normal text-slate-500">sq ft</span></p>
                </div>

                {/* QUICK MODE CONTENT */}
                <TabsContent value="quick" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Pitch</Label>
                      <Select value={pitch} onValueChange={setPitch}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="walkable">Walkable</SelectItem>
                          <SelectItem value="steep">Steep</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Stories</Label>
                      <Select value={stories} onValueChange={setStories}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Story</SelectItem>
                          <SelectItem value="2+">2+ Stories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Label className="text-xs text-slate-500">Estimated Project Cost</Label>
                    <p className="text-xl font-bold text-green-600">{calculateEstimatedPrice()}</p>
                    <p className="text-xs text-slate-400 mt-1">Based on area & difficulty factors</p>
                  </div>
                  
                  {totalArea === 0 && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      ⚠️ Draw an outline in 'Full Measure' tab to get auto-price, or enter area manually.
                    </div>
                  )}
                </TabsContent>

                {/* FULL MODE CONTENT */}
                <TabsContent value="full" className="space-y-4 mt-0">
                  <p className="text-xs text-slate-500 mb-2">Use the tools below to trace the roof edges for exact square footage.</p>
                  <div className="flex gap-2">
                    <Button 
                      className={`flex-1 ${drawingManager?.getDrawingMode() === window.google?.maps?.drawing?.OverlayType?.POLYGON ? 'bg-blue-600' : 'bg-slate-800'}`}
                      onClick={() => drawingManager?.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)}
                    >
                      <PenTool className="w-4 h-4 mr-2" />
                      Draw Roof
                    </Button>
                    <Button 
                      variant="destructive"
                      size="icon"
                      onClick={handleReset}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* MAP */}
          <div className="absolute inset-0 w-full h-full bg-slate-100">
            <div ref={onMapRefChange} className="w-full h-full" />
          </div>
      </div>
    </div>
  );
}