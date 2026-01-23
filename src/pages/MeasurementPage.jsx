import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, AlertTriangle, Loader2, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MeasurementPage() {
  const { leadId: paramLeadId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Robust leadId retrieval
  const leadId = paramLeadId || searchParams.get('leadId') || searchParams.get('id');

  // 1. STATE DEFINITIONS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lead, setLead] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  // Drawing State
  const [drawingManager, setDrawingManager] = useState(null);
  const [area, setArea] = useState(0);
  const [polygons, setPolygons] = useState([]);
  const [currentMode, setCurrentMode] = useState(null);

  // 2. REFS
  const mapInstance = useRef(null);
  const [mapNode, setMapNode] = useState(null); // Callback ref state

  // 3. DATA FETCHING
  useEffect(() => {
    const loadLeadData = async () => {
      if (!leadId) {
        // Only error if we actually expect a leadId. 
        // If it's a new empty measurement, we might handle differently, but here we assume lead context.
        // We'll try to load from session as fallback if provided in previous logic, but user wanted EXACT code.
        // We'll stick to the requested flow.
        const sessionLeadId = sessionStorage.getItem('active_lead_id');
        if (!sessionLeadId) {
            setError("No lead ID provided.");
            setLoading(false);
            return;
        }
      }
      
      const activeId = leadId || sessionStorage.getItem('active_lead_id');

      try {
        // Fetch Lead (Support both Lead and Measurement entities for robustness)
        let leadData;
        try {
            leadData = await base44.entities.Lead.get(activeId);
        } catch (e) {
            // Fallback to Measurement
            try {
                leadData = await base44.entities.Measurement.get(activeId);
            } catch (e2) {
                throw new Error("Lead/Measurement not found");
            }
        }
        
        setLead(leadData);

        // Build Address - Supporting multiple formats
        const fullAddress = 
            (leadData.address_street && `${leadData.address_street} ${leadData.address_city || ''} ${leadData.address_state || ''} ${leadData.address_zip || ''}`) || 
            leadData.address || 
            leadData.property_address || 
            "";
            
        console.log("Geocoding:", fullAddress);
        
        if (!fullAddress || fullAddress.trim() === "") {
            throw new Error("Address is missing from lead data");
        }

        // Geocode (Using Google Geocoder directly to avoid helper crashes)
        if (!window.google) {
            // Wait for Google API if not loaded
            const checkGoogle = setInterval(() => {
                if (window.google) {
                    clearInterval(checkGoogle);
                    performGeocode(fullAddress);
                }
            }, 100);
            return; 
        }
        
        performGeocode(fullAddress);

      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load lead data.");
        setLoading(false);
      }
    };

    const performGeocode = (address) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            setCoordinates({ lat: location.lat(), lng: location.lng() });
            setLoading(false); // Data ready
          } else {
            console.error("Geocode failed:", status);
            setError("Address not found. Please check the lead details.");
            setLoading(false);
          }
        });
    };

    loadLeadData();
  }, [leadId]);

  // 4. MAP INITIALIZATION (Only runs when Node + Coords exist)
  useEffect(() => {
    if (!mapNode || !coordinates || mapInstance.current) return;

    console.log("Initializing Map on Node:", mapNode);
    try {
      mapInstance.current = new window.google.maps.Map(mapNode, {
        center: coordinates,
        zoom: 20,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        tilt: 0
      });

      // Initialize Drawing Tools
      const manager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null, // Start with no tool selected
        drawingControl: false, // We will build custom buttons
        polygonOptions: {
          fillColor: '#3b82f6',
          fillOpacity: 0.4,
          strokeWeight: 2,
          strokeColor: '#2563eb',
          editable: true,
          draggable: false,
        },
      });
      manager.setMap(mapInstance.current);
      setDrawingManager(manager);

      // Add Listener for 'Polygon Complete'
      window.google.maps.event.addListener(manager, 'polygoncomplete', (poly) => {
        // Calculate Area
        const sqMeters = window.google.maps.geometry.spherical.computeArea(poly.getPath());
        const sqFeet = Math.round(sqMeters * 10.7639);
        
        setArea(prev => prev + sqFeet);
        setPolygons(prev => [...prev, poly]);

        // Reset tool to avoid accidental drawing
        manager.setDrawingMode(null);
        setCurrentMode(null);
      });

    } catch (err) {
      console.error("Map Draw Error:", err);
    }
  }, [mapNode, coordinates]);

  // 5. CALLBACK REF (Detects DOM node safely)
  const onMapRefChange = useCallback((node) => {
    if (node !== null) {
      setMapNode(node);
    }
  }, []);

  // 6. RENDER
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading Satellite Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => navigate(-1)} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
            </Button>
            <div>
                <h1 className="font-bold text-lg text-slate-900">Roof Measurement</h1>
                <div className="flex items-center text-sm text-slate-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {lead?.address || lead?.property_address || 'Property Address'}
                </div>
            </div>
        </div>
      </header>

      {/* Map Container - Explicit Height */}
      <div className="flex-1 relative bg-slate-200 w-full min-h-[500px]">
        
        {/* Floating Toolbelt */}
        <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-xl flex flex-col gap-2">
          <div className="mb-2 px-2">
            <p className="text-xs text-slate-500 font-bold uppercase">Tools</p>
          </div>
          
          <Button 
            size="sm" 
            variant={currentMode === 'polygon' ? 'default' : 'outline'}
            onClick={() => {
              if (drawingManager) {
                drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
                setCurrentMode('polygon');
              }
            }}
            className="justify-start"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Draw Roof
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => {
              polygons.forEach(p => p.setMap(null));
              setPolygons([]);
              setArea(0);
            }}
            className="justify-start"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          
          <div className="mt-2 pt-2 border-t border-slate-100 px-2">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Area</p>
            <p className="text-xl font-bold text-slate-900">{area.toLocaleString()} <span className="text-sm font-normal text-slate-500">sq ft</span></p>
          </div>
        </div>

        <div 
          ref={onMapRefChange} 
          className="w-full h-full absolute inset-0"
        />
      </div>
    </div>
  );
}