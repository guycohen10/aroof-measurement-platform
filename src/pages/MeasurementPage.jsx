import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, PenTool, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function MeasurementPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [mapNode, setMapNode] = useState(null);
  const mapInstance = useRef(null);
  const drawingManagerRef = useRef(null);

  // Tools
  const [mode, setMode] = useState('quick');
  const [totalArea, setTotalArea] = useState(0);
  const [polygons, setPolygons] = useState([]);

  // Estimates
  const [pitch, setPitch] = useState('walkable');
  const [stories, setStories] = useState('1');

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const activeId = leadId || sessionStorage.getItem('active_lead_id');
        
        if (!activeId) {
            // Check if we have an address in session storage to use as fallback
            const sessionAddress = sessionStorage.getItem('lead_address');
            if (sessionAddress) {
                setLead({ address: sessionAddress });
                setLoading(false);
                return;
            }
             setLoading(false); 
             return; 
        }

        let leadData;
        try {
            leadData = await base44.entities.Lead.get(activeId);
        } catch (e) {
            try {
                leadData = await base44.entities.Measurement.get(activeId);
            } catch (e2) {
                console.error("Lead/Measurement not found");
            }
        }

        if (leadData) {
            setLead(leadData);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadData();
  }, [leadId]);

  // --- 2. INIT MAP (Dynamic Imports) ---
  useEffect(() => {
    if (!mapNode || !lead || mapInstance.current) return;

    const initMap = async () => {
      try {
        // A. Import Libraries Dynamically (Fixes the crash)
        const { Map } = await window.google.maps.importLibrary("maps");
        const { DrawingManager } = await window.google.maps.importLibrary("drawing");
        const { Spherical } = await window.google.maps.importLibrary("geometry");
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        
        // B. Geocode Address
        const geocoder = new Geocoder();
        const address = lead.address || 
                        lead.property_address || 
                        (lead.address_street ? `${lead.address_street}, ${lead.address_city || ''}, ${lead.address_state || ''}` : '');
        
        if (!address) {
            toast.error("No valid address found");
            return;
        }

        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            
            // C. Create Map
            const map = new Map(mapNode, {
              center: location,
              zoom: 20,
              mapTypeId: 'satellite',
              disableDefaultUI: true,
              tilt: 0,
            });
            mapInstance.current = map;
            
            // D. Create Drawing Manager
            const manager = new DrawingManager({
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
            drawingManagerRef.current = manager;
            
            // E. Add Listeners
            window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
              // Use the dynamically imported geometry library
              const areaSqMeters = window.google.maps.geometry.spherical.computeArea(poly.getPath());
              const areaSqFeet = Math.round(areaSqMeters * 10.7639);
              setTotalArea(prev => prev + areaSqFeet);
              setPolygons(prev => [...prev, poly]);
              manager.setDrawingMode(null);
              toast.success(`Area added: ${areaSqFeet} sq ft`);
            });
          } else {
            toast.error("Could not locate address on map");
          }
        });
      } catch (error) {
        console.error("Map Init Failed:", error);
        toast.error("Failed to load Maps. Check API Key configuration.");
      }
    };
    initMap();
  }, [mapNode, lead]);

  // --- 3. UI HANDLERS ---
  useEffect(() => {
    // Toggle Drawing Mode based on Tab
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null); // Default to off
    }
  }, [mode]);

  const enableDrawing = () => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const handleReset = () => {
    polygons.forEach(p => p.setMap(null));
    setPolygons([]);
    setTotalArea(0);
  };

  // Calculation Logic
  const getPriceRange = () => {
    const base = totalArea * 4.5;
    return totalArea ? `$${base.toLocaleString()} - $${(base * 1.2).toLocaleString()}` : '$0.00';
  };

  // --- 4. RENDER ---
  const onMapRefChange = useCallback((node) => node && setMapNode(node), []);

  if (loading) return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
  );

  return (
    <div className="h-screen w-full flex flex-col">
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
          {/* TOOLBELT */}
          <Card className="absolute top-4 left-4 z-10 w-80 shadow-2xl">
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="w-full grid grid-cols-2 rounded-t-lg rounded-b-none h-12">
                <TabsTrigger value="quick">Quick Est.</TabsTrigger>
                <TabsTrigger value="full">Full Measure</TabsTrigger>
              </TabsList>
              
              <CardContent className="p-4 space-y-4">
                {/* Area Display */}
                <div className="bg-slate-100 p-3 rounded text-center">
                  <p className="text-xs uppercase font-bold text-slate-500">Total Area</p>
                  <p className="text-3xl font-bold text-slate-900">{totalArea.toLocaleString()} <span className="text-sm">sq ft</span></p>
                </div>
                <TabsContent value="quick" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>Pitch</Label>
                        <Select value={pitch} onValueChange={setPitch}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="walkable">Walkable</SelectItem>
                                <SelectItem value="steep">Steep</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Stories</Label>
                        <Select value={stories} onValueChange={setStories}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 Story</SelectItem>
                                <SelectItem value="2">2+ Stories</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-slate-500">Est. Cost</p>
                    <p className="text-xl font-bold text-green-600">{getPriceRange()}</p>
                  </div>
                </TabsContent>
                <TabsContent value="full" className="space-y-2">
                  <Button onClick={enableDrawing} className="w-full bg-blue-600"><PenTool className="w-4 h-4 mr-2"/> Draw Roof</Button>
                  <Button onClick={handleReset} variant="outline" className="w-full text-red-600"><Trash2 className="w-4 h-4 mr-2"/> Clear</Button>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          {/* MAP */}
          <div className="absolute inset-0 w-full h-full bg-slate-200">
            <div ref={onMapRefChange} className="absolute inset-0 w-full h-full" />
          </div>
      </div>
    </div>
  );
}