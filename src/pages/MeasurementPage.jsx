import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, MapPin, Edit3, Trash2, Plus, Layers, ZoomIn, ZoomOut, Maximize2, RotateCcw, Camera, X, Info, Square, Circle as CircleIcon, Pentagon, Eraser, MousePointer, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

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

const PITCH_OPTIONS = [
  { value: 'flat', label: 'Flat (0/12)', multiplier: 1.00 },
  { value: '2/12', label: '2/12 pitch', multiplier: 1.02 },
  { value: '3/12', label: '3/12 pitch', multiplier: 1.03 },
  { value: '4/12', label: '4/12 pitch', multiplier: 1.05 },
  { value: '5/12', label: '5/12 pitch', multiplier: 1.08 },
  { value: '6/12', label: '6/12 pitch', multiplier: 1.12 },
  { value: '7/12', label: '7/12 pitch', multiplier: 1.16 },
  { value: '8/12', label: '8/12 pitch', multiplier: 1.20 },
  { value: '9/12', label: '9/12 pitch', multiplier: 1.25 },
  { value: '10/12', label: '10/12 pitch', multiplier: 1.30 },
  { value: '11/12', label: '11/12 pitch', multiplier: 1.36 },
  { value: '12/12', label: '12/12 pitch', multiplier: 1.41 },
  { value: 'steep', label: 'Steep (over 12/12)', multiplier: 1.50 },
];

export default function MeasurementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mapRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const polygonsRef = useRef([]);
  const containerRef = useRef(null);
  const initAttemptRef = useRef(0);
  const scriptLoadedRef = useRef(false);
  
  const [measurementMode, setMeasurementMode] = useState("detailed"); // 'quick' or 'detailed'
  const [buildingSqft, setBuildingSqft] = useState("");
  const [autoEstimate, setAutoEstimate] = useState(false);
  const [quickEstimateLoading, setQuickEstimateLoading] = useState(false);
  
  const [address, setAddress] = useState("");
  const [measurementId, setMeasurementId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [geocodingStatus, setGeocodingStatus] = useState("Initializing map...");
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const [capturedImages, setCapturedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [sections, setSections] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [liveMapSections, setLiveMapSections] = useState([]);
  
  const [currentZoom, setCurrentZoom] = useState(20);
  const [capturing, setCapturing] = useState(false);
  
  // Lead data state for roofers
  const [leadData, setLeadData] = useState(null);
  const [addressLoaded, setAddressLoaded] = useState(false);
  
  const [drawingShape, setDrawingShape] = useState('polygon');
  const [lineThickness, setLineThickness] = useState(3);
  const [selectedColor, setSelectedColor] = useState(SECTION_COLORS[0]);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);
  const [shapeOpacity, setShapeOpacity] = useState(0.5);
  const [showTreeHelper, setShowTreeHelper] = useState(false);
  const [deletedSectionsCount, setDeletedSectionsCount] = useState(0);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(20);

  // Helper function to geocode and center map
  const geocodeAndCenterMap = async (address) => {
    if (!window.google?.maps) {
      console.log('⏳ Google Maps not ready yet, will retry...');
      setTimeout(() => geocodeAndCenterMap(address), 1000);
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error('Geocoding failed: ' + status));
          }
        });
      });

      const location = result.geometry.location;
      const coords = { lat: location.lat(), lng: location.lng() };

      console.log('📍 Geocoded coordinates:', coords);

      setMapCenter(coords);
      setMapZoom(20);

    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  // At the very top of the component, BEFORE any other useEffect
  // Clear old data and load new address FIRST
  useEffect(() => {
    const initializePage = async () => {
      console.log('🏠 ═══════════════════════════════════');
      console.log('🏠 MEASUREMENT PAGE INITIALIZATION');
      console.log('🏠 ═══════════════════════════════════');

      // Check URL parameters
      const addressFromURL = searchParams.get('address');
      console.log('🌐 Address from URL:', addressFromURL);

      // Check session storage
      const sessionAddress = sessionStorage.getItem('homeowner_address');
      const sessionMethod = sessionStorage.getItem('measurement_method');
      console.log('📦 Address from session:', sessionAddress);
      console.log('📦 Method from session:', sessionMethod);

      // Check if user is authenticated
      let isRoofer = false;
      try {
        const user = await base44.auth.me();
        isRoofer = user?.aroof_role === 'external_roofer';
        console.log('👤 User type:', isRoofer ? 'Roofer' : 'Homeowner');
      } catch (err) {
        console.log('👤 Not authenticated (homeowner)');
      }

      // For homeowners, ALWAYS use fresh address from URL/session
      if (!isRoofer) {
        const finalAddress = addressFromURL || sessionAddress;

        if (finalAddress) {
          console.log('✅ Loading address for homeowner:', finalAddress);
          setAddress(finalAddress);

          // Clear old session data
          sessionStorage.removeItem('active_lead_id');
          sessionStorage.removeItem('lead_address');
          sessionStorage.removeItem('pending_measurement_id');

          // Check for saved coordinates FIRST (to avoid re-geocoding)
          const sessionLat = sessionStorage.getItem('homeowner_lat');
          const sessionLng = sessionStorage.getItem('homeowner_lng');
          
          if (sessionLat && sessionLng) {
            const coords = {
              lat: parseFloat(sessionLat),
              lng: parseFloat(sessionLng)
            };
            console.log('✅ Using EXACT coordinates from selection:', coords);
            setMapCenter(coords);
            setMapZoom(20);
            setCoordinates(coords);
            setAddressLoaded(true);
          } else {
            // Only geocode if we DON'T have coords (fallback)
            console.log('⚠️ No saved coordinates, geocoding address...');
            await geocodeAndCenterMap(finalAddress);
          }
        } else {
          console.log('⚠️ No address provided - homeowner should not be here');
          // Redirect back to address selector
          navigate('/addressmethodselector');
        }
      } else {
        // Roofer flow - check for lead
        const leadId = searchParams.get('leadId') || sessionStorage.getItem('active_lead_id');
        if (leadId) {
          console.log('✅ Loading lead for roofer:', leadId);
          await loadLeadData(leadId);
        }
      }

      console.log('🏠 ═══════════════════════════════════\n');
    };

    initializePage();
  }, [searchParams]); // FIXED: React to URL parameter changes

  // Check if roofer is accessing public page incorrectly
  useEffect(() => {
    const checkPublicAccess = async () => {
      try {
        const user = await base44.auth.me();
        console.log('👤 USER CHECK:');
        console.log('  Email:', user?.email);
        console.log('  aroof_role:', user?.aroof_role);
        console.log('  Role:', user?.role);
        console.log('  Full user:', JSON.stringify(user, null, 2));
        
        // If roofer AND no leadId in URL/session, redirect to dashboard
        if (user && user.aroof_role === 'external_roofer') {
          const urlParams = new URLSearchParams(window.location.search);
          const hasLeadId = urlParams.get('leadId') || sessionStorage.getItem('active_lead_id');
          
          console.log('🎭 Roofer detected');
          console.log('  URL leadId:', urlParams.get('leadId'));
          console.log('  Session leadId:', sessionStorage.getItem('active_lead_id'));
          console.log('  Has lead ID?', hasLeadId ? '✅ YES' : '❌ NO');
          
          if (!hasLeadId) {
            console.log('⚠️ No lead ID found, redirecting to dashboard');
            navigate(createPageUrl("RooferDashboard"));
            return;
          }
        }
      } catch (err) {
        // Not logged in - allow access for homeowners
        console.log('👤 User not logged in (homeowner flow)');
        console.log('Error:', err.message);
      }
    };
    checkPublicAccess();
  }, [navigate]);

  // Geocode address function
  const geocodeAddress = useCallback(async (addressToGeocode) => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps not loaded yet for geocoding');
      return null;
    }

    try {
      console.log('🔍 Geocoding address:', addressToGeocode);
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: addressToGeocode }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error('Geocoding failed: ' + status));
          }
        });
      });

      const coords = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng()
      };

      console.log('✅ Address geocoded:', coords);
      
      // Update state
      setCoordinates(coords);
      setCurrentZoom(20);
      setAddressLoaded(true);

      // Update lead with coordinates if we have a lead ID
      const leadId = searchParams.get('leadId') || sessionStorage.getItem('active_lead_id');
      if (leadId) {
        await base44.entities.Measurement.update(leadId, {
          latitude: coords.lat,
          longitude: coords.lng
        });
        console.log('✅ Lead updated with coordinates');
      }

      return coords;

    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  }, [searchParams]);

  // Load lead data if leadId is in URL or session (ROOFER FLOW ONLY)
  const loadLeadData = async (leadId) => {
    if (!leadId) {
      console.log('🟢 MeasurementPage: No lead ID, starting fresh measurement');
      setLoading(false);
      return;
    }

      try {
        console.log('🟢 MeasurementPage: Loading lead data for ID:', leadId);
        
        // Load the lead from database
        const lead = await base44.entities.Measurement.get(leadId);
        
        console.log('🟢 MeasurementPage: Lead loaded:', {
          id: lead.id,
          customer: lead.customer_name,
          address: lead.property_address,
          lat: lead.latitude,
          lng: lead.longitude
        });

        setLeadData(lead);
        setMeasurementId(leadId);
        
        // Pre-fill address
        if (lead.property_address) {
          setAddress(lead.property_address);
          localStorage.setItem('measurementAddress', lead.property_address);
          console.log('✅ Address loaded from lead:', lead.property_address);
          
          // If we have coordinates, use them
          if (lead.latitude && lead.longitude) {
            const coords = {
              lat: lead.latitude,
              lng: lead.longitude
            };
            console.log('✅ Using coordinates from lead:', coords);
            
            // Set map center and zoom
            setCoordinates(coords);
            setCurrentZoom(20);
            setAddressLoaded(true);
          } else {
            // No coordinates - need to geocode the address
            console.log('⚠️ No coordinates in lead, geocoding address...');
            if (window.google && window.google.maps) {
                await geocodeAddress(lead.property_address);
            }
          }
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error('❌ Failed to load lead:', err);
        setError('Failed to load lead data: ' + err.message);
      setLoading(false);
    }
  };

  // Fallback: Load address from URL or localStorage (for homeowners without lead)
  useEffect(() => {
    if (leadData) return; // Skip if we already have lead data
    
    const loadAddressFromParams = async () => {
      const addressParam = searchParams.get('address');
      const latParam = searchParams.get('lat');
      const lngParam = searchParams.get('lng');
      const measurementIdParam = searchParams.get('measurementId');
      const leadAddress = sessionStorage.getItem('lead_address');
      
      if (leadAddress) {
        setAddress(leadAddress);
        localStorage.setItem('measurementAddress', leadAddress);
      } else if (addressParam) {
        const decodedAddress = decodeURIComponent(addressParam);
        setAddress(decodedAddress);
        localStorage.setItem('measurementAddress', decodedAddress);
      } else {
        const storedAddress = localStorage.getItem('measurementAddress');
        if (storedAddress) {
          setAddress(storedAddress);
        }
      }

      if (measurementIdParam) {
        setMeasurementId(measurementIdParam);
      }

      if (latParam && lngParam) {
        const lat = parseFloat(latParam);
        const lng = parseFloat(lngParam);
        if (!isNaN(lat) && !isNaN(lng)) {
          setCoordinates({ lat, lng });
          localStorage.setItem('measurementLat', lat.toString());
          localStorage.setItem('measurementLng', lng.toString());
          setGeocodingStatus("Location verified!");
        }
      } else {
        const storedLat = localStorage.getItem('measurementLat');
        const storedLng = localStorage.getItem('measurementLng');
        if (storedLat && storedLng) {
          const lat = parseFloat(storedLat);
          const lng = parseFloat(storedLng);
          if (!isNaN(lat) && !isNaN(lng)) {
            setCoordinates({ lat, lng });
          }
        }
      }

      setLoading(false);
    };
    
    loadAddressFromParams();
  }, [searchParams, leadData]);

  const createMap = useCallback((center) => {
    if (!mapRef.current) {
      console.error("❌ Map container ref is null");
      if (initAttemptRef.current < 5) {
        initAttemptRef.current++;
        setTimeout(() => createMap(center), 300);
      } else {
        setMapError("Map container not available after multiple attempts");
        setMapLoading(false);
      }
      return;
    }

    // If map already exists, update its center instead of recreating
    if (mapInstanceRef.current) {
      console.log("🔄 Map exists - Updating center to:", center);
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(20);
      setMapLoading(false);
      return;
    }

    try {
      console.log("✅ Creating Google Map with center:", center);
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 20,
        minZoom: 18,
        maxZoom: 22,
        mapTypeId: "satellite",
        tilt: 0,
        zoomControl: true,
        scrollwheel: true,
        gestureHandling: 'greedy',
        disableDoubleClickZoom: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ["satellite", "hybrid", "roadmap"]
        },
        streetViewControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: { position: window.google.maps.ControlPosition.TOP_RIGHT },
        rotateControl: false,
        scaleControl: true
      });

      mapInstanceRef.current = map;
      console.log("✅ Map instance created");
      
      window.google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
        console.log("✅ Map tiles loaded!");
        setMapLoading(false);
        setMapError("");
      });

      window.google.maps.event.addListener(map, 'zoom_changed', () => {
        setCurrentZoom(map.getZoom());
      });

      new window.google.maps.Marker({
        position: center,
        map: map,
        title: address,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#FF0000",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
          scale: 10,
        }
      });

      // Initialize Drawing Manager
      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: SECTION_COLORS[0].fill,
          fillOpacity: 0.35,
          strokeWeight: 3,
          strokeColor: SECTION_COLORS[0].stroke,
          clickable: true,
          editable: true,
          draggable: false,
          zIndex: 100
        }
      });

      drawingManager.setMap(map);
      drawingManagerRef.current = drawingManager;

      window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {
        console.log("Polygon drawing complete");
        
        const path = polygon.getPath();
        const coordinates = [];
        
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          coordinates.push({ lat: point.lat(), lng: point.lng() });
        }

        const area = window.google.maps.geometry.spherical.computeArea(path);
        const areaSqFt = area * 10.7639;

        const colorIndex = polygonsRef.current.length % SECTION_COLORS.length;
        const sectionColor = SECTION_COLORS[colorIndex];

        // Set all polygon options BEFORE adding to map
        polygon.setOptions({
          fillColor: sectionColor.fill,
          strokeColor: sectionColor.stroke,
          fillOpacity: 0.35,
          strokeWeight: 3,
          clickable: true,
          editable: true,
          draggable: false,
          zIndex: 100,
          map: map // Explicitly set the map here
        });

        const sectionId = `section-${Date.now()}`;

        // Listen for path changes to update coordinates
        window.google.maps.event.addListener(path, 'set_at', () => {
          console.log("Path updated");
          const newCoords = [];
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            newCoords.push({ lat: point.lat(), lng: point.lng() });
          }
          const newArea = window.google.maps.geometry.spherical.computeArea(path);
          const newAreaSqFt = Math.round((newArea * 10.7639) * 100) / 100;
          
          setLiveMapSections(prev => prev.map(section => 
            section.id === sectionId 
              ? { 
                  ...section, 
                  coordinates: newCoords,
                  flat_area_sqft: newAreaSqFt,
                  adjusted_area_sqft: Math.round(newAreaSqFt * section.pitch_multiplier * 100) / 100
                }
              : section
          ));
        });

        window.google.maps.event.addListener(path, 'insert_at', () => {
          console.log("Point inserted");
          const newCoords = [];
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            newCoords.push({ lat: point.lat(), lng: point.lng() });
          }
          const newArea = window.google.maps.geometry.spherical.computeArea(path);
          const newAreaSqFt = Math.round((newArea * 10.7639) * 100) / 100;
          
          setLiveMapSections(prev => prev.map(section => 
            section.id === sectionId 
              ? { 
                  ...section, 
                  coordinates: newCoords,
                  flat_area_sqft: newAreaSqFt,
                  adjusted_area_sqft: Math.round(newAreaSqFt * section.pitch_multiplier * 100) / 100
                }
              : section
          ));
        });

        const newSection = {
          id: sectionId,
          name: `Section ${polygonsRef.current.length + 1}`,
          flat_area_sqft: Math.round(areaSqFt * 100) / 100,
          pitch: 'flat',
          pitch_multiplier: 1.00,
          adjusted_area_sqft: Math.round(areaSqFt * 100) / 100,
          color: sectionColor.stroke,
          coordinates: coordinates,
          polygon: polygon
        };

        // Store polygon reference FIRST
        polygonsRef.current.push(polygon);
        
        // Then update state
        setLiveMapSections(prev => {
          console.log("Adding section to state, polygon visible:", polygon.getMap() !== null);
          return [...prev, newSection];
        });

        // Turn off drawing mode
        drawingManager.setDrawingMode(null);
        setIsDrawing(false);
        
        console.log("Polygon should now be visible on map");
      });

    } catch (err) {
      console.error("❌ Error creating map:", err);
      setMapError(`Error creating map: ${err.message}`);
      setMapLoading(false);
    }
  }, [address]);

  const initializeMap = useCallback(async () => {
    console.log("🔄 initializeMap called");
    
    if (!mapRef.current) {
      console.log("⏳ Map ref not ready, retrying in 100ms...");
      setTimeout(initializeMap, 100);
      return;
    }

    try {
      if (!window.google || !window.google.maps || !window.google.maps.drawing) {
        throw new Error("Google Maps API not fully loaded");
      }

      console.log("✅ Google Maps API available");
      const defaultCenter = { lat: 32.7767, lng: -96.7970 };

      if (coordinates) {
        console.log("✅ Using provided coordinates:", coordinates);
        createMap(coordinates);
        return;
      }

      if (!address) {
        console.log("⏳ No address yet, waiting...");
        setMapLoading(false);
        return;
      }

      setGeocodingStatus("Finding address location...");
      console.log("🔄 Geocoding address:", address);
      
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const geocodedCenter = { lat: location.lat(), lng: location.lng() };
          console.log("✅ Geocoded:", geocodedCenter);
          setCoordinates(geocodedCenter);
          localStorage.setItem('measurementLat', geocodedCenter.lat.toString());
          localStorage.setItem('measurementLng', geocodedCenter.lng.toString());
          setGeocodingStatus("Address found!");
          createMap(geocodedCenter);
        } else {
          console.error("❌ Geocoding failed:", status);
          setMapError(`Could not find address (${status})`);
          setGeocodingStatus("Using default location");
          createMap(defaultCenter);
        }
      });
    } catch (err) {
      console.error("❌ Map initialization failed:", err);
      setMapError(`Failed to initialize map: ${err.message}`);
      setMapLoading(false);
    }
  }, [address, coordinates, createMap]);

  // CRITICAL FIX: Load Google Maps script FIRST before anything else
  useEffect(() => {
    console.log("🚀 ═══════════════════════════════════════════════");
    console.log("🚀 Google Maps script loader starting");
    console.log("🚀 ═══════════════════════════════════════════════");

    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.drawing && window.google.maps.geometry) {
      console.log("✅ Google Maps already fully loaded");
      if (!scriptLoadedRef.current) {
        scriptLoadedRef.current = true;
        setMapScriptLoaded(true);
      }
      return;
    }

    // Check if script tag exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log("⏳ Script tag exists, waiting for Google Maps API...");
      let attempts = 0;
      const maxAttempts = 100; // INCREASED: 20 seconds
      
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.drawing && window.google.maps.geometry) {
          clearInterval(checkInterval);
          console.log("✅ Google Maps API ready after", attempts * 200, "ms");
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
          setMapError("");
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error("❌ Google Maps load timeout after", maxAttempts * 200, "ms (20s)");
          setMapError("Google Maps is taking too long to load. Please check your connection and refresh the page.");
          setMapLoading(false);
        } else if (attempts % 10 === 0) {
          console.log(`⏳ Still waiting... (${attempts * 0.2}s / 20s)`);
        }
      }, 200);
      
      // Overall safety timeout - 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!scriptLoadedRef.current) {
          console.error("❌ Overall timeout - 30 seconds elapsed");
          setMapError("Google Maps failed to load after 30 seconds. Please refresh the page.");
          setMapLoading(false);
        }
      }, 30000);
      
      return;
    }

    // Create new script
    console.log("📥 Loading Google Maps script for the FIRST time...");
    const script = document.createElement('script');
    // CRITICAL: Load ALL libraries (places, drawing, geometry) to prevent browser caching issues
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`;
    script.async = true;
    script.defer = true;
    
    let scriptTimeout;
    
    script.onload = () => {
      clearTimeout(scriptTimeout);
      console.log("✅ Script tag loaded successfully");
      console.log("⏳ Waiting for API to initialize...");
      
      // Poll for API availability
      let attempts = 0;
      const maxAttempts = 100; // 20 seconds
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.drawing && window.google.maps.geometry) {
          clearInterval(checkInterval);
          console.log("✅ Google Maps API confirmed ready after", attempts * 200, "ms");
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
          setMapError("");
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error("❌ API not ready after 20 seconds");
          setMapError("Google Maps API failed to initialize. Please refresh the page.");
          setMapLoading(false);
        } else if (attempts % 10 === 0) {
          console.log(`⏳ API check... (${attempts * 0.2}s / 20s)`);
        }
      }, 200);
    };
    
    script.onerror = (e) => {
      clearTimeout(scriptTimeout);
      console.error("❌ Script failed to load:", e);
      setMapError("Failed to load Google Maps script. Check your internet connection and refresh.");
      setMapLoading(false);
    };
    
    // Overall timeout - 30 seconds for script load
    scriptTimeout = setTimeout(() => {
      console.error("❌ Google Maps overall timeout (30s)");
      setMapError("Google Maps script timeout. Please refresh the page.");
      setMapLoading(false);
    }, 30000);
    
    document.head.appendChild(script);
    console.log("📥 Script tag added to document");
  }, []); // Run ONCE on mount

  // Initialize map ONLY after script is loaded AND we have address/coordinates
  useEffect(() => {
    if (!mapScriptLoaded) {
      console.log("⏳ Waiting for Google Maps script to load...");
      return;
    }

    if (!address && !coordinates) {
      console.log("⏳ Waiting for address or coordinates...");
      setMapLoading(false);
      return;
    }

    console.log("✅ Script loaded AND address/coords ready - initializing map now");
    initializeMap();
  }, [mapScriptLoaded, address, coordinates, initializeMap]);

  const handleRetryMap = () => {
    if (retryCount >= 3) {
      alert('Unable to load Google Maps after 3 attempts. Please check your internet connection and refresh the page.');
      return;
    }

    console.log(`🔄 Retry attempt ${retryCount + 1}/3`);
    setMapError("");
    setMapLoading(true);
    setRetryCount(prev => prev + 1);
    initAttemptRef.current = 0;
    
    // Clear existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }
    
    // Re-initialize
    if (mapScriptLoaded) {
      setTimeout(() => initializeMap(), 500);
    } else {
      // Force reload script
      scriptLoadedRef.current = false;
      setMapScriptLoaded(false);
      
      // Remove existing script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Reload page as last resort
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const startDrawingOnLiveMap = useCallback(() => {
    if (!drawingManagerRef.current) {
      setError("Drawing tool not ready");
      return;
    }
    
    setIsDrawing(true);
    setError("");
    drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
  }, []);

  const deleteLiveMapSection = useCallback((sectionId) => {
    const sectionIndex = liveMapSections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;
    
    const section = liveMapSections[sectionIndex];
    if (section.polygon) {
      section.polygon.setMap(null);
    }
    
    setLiveMapSections(prev => prev.filter(s => s.id !== sectionId));
    polygonsRef.current = polygonsRef.current.filter((_, i) => i !== sectionIndex);
    setDeletedSectionsCount(prev => prev + 1);
  }, [liveMapSections]);

  const updateLiveMapSectionPitch = useCallback((sectionId, pitchValue) => {
    const pitchOption = PITCH_OPTIONS.find(p => p.value === pitchValue);
    if (!pitchOption) return;

    setLiveMapSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            pitch: pitchValue,
            pitch_multiplier: pitchOption.multiplier,
            adjusted_area_sqft: Math.round(section.flat_area_sqft * pitchOption.multiplier * 100) / 100
          }
        : section
    ));
  }, []);

  const updateLiveMapSectionName = useCallback((sectionId, name) => {
    setLiveMapSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, name } : section
    ));
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom < 22) mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom > 18) mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (mapInstanceRef.current && coordinates) {
      mapInstanceRef.current.setZoom(20);
      mapInstanceRef.current.setCenter(coordinates);
    }
  }, [coordinates]);

  const handleOptimalZoom = useCallback(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.setZoom(20);
  }, []);

  const handleCaptureView = useCallback(async () => {
    if (!mapInstanceRef.current) {
      alert('Map not loaded yet');
      return;
    }

    setCapturing(true);

    try {
      const center = mapInstanceRef.current.getCenter();
      const zoom = mapInstanceRef.current.getZoom();
      const lat = center.lat();
      const lng = center.lng();
      
      const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=800x600&scale=2&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
      
      const testImg = new Image();
      
      testImg.onload = () => {
        const newImage = {
          id: `capture-${Date.now()}`,
          url: imageUrl,
          zoom: zoom,
          center: { lat, lng },
          sections: [],
          width: 800,
          height: 600,
          captured_at: new Date().toISOString()
        };
        
        setCapturedImages(prev => [...prev, newImage]);
        setCapturing(false);
      };
      
      testImg.onerror = () => {
        setCapturing(false);
        alert('⚠️ GOOGLE MAPS STATIC API NOT ENABLED\n\nTo fix: Enable "Maps Static API" in Google Cloud Console');
      };
      
      testImg.src = imageUrl;
      
    } catch (err) {
      alert('Failed to capture image: ' + err.message);
      setCapturing(false);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  const selectImageForDrawing = useCallback((index) => {
    setSelectedImageIndex(index);
    setIsDrawingMode(true);
    setSections(capturedImages[index].sections || []);
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
    setEditMode(false);
    setSelectedSection(null);
  }, [capturedImages]);

  const removeCapturedImage = useCallback((index) => {
    if (confirm('Remove this captured view?')) {
      setCapturedImages(prev => prev.filter((_, i) => i !== index));
      if (selectedImageIndex === index) {
        setSelectedImageIndex(null);
        setIsDrawingMode(false);
      }
    }
  }, [selectedImageIndex]);

  const exitDrawingMode = useCallback(() => {
    setSelectedImageIndex(null);
    setIsDrawingMode(false);
    setSections([]);
    setIsDrawing(false);
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
    setEditMode(false);
    setSelectedSection(null);
  }, []);

  const handleCanvasZoomIn = useCallback(() => {
    setCanvasZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleCanvasZoomOut = useCallback(() => {
    setCanvasZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleCanvasResetZoom = useCallback(() => {
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
  }, []);

  const clearAllSections = useCallback(() => {
    if (confirm('Clear all sections from this image?')) {
      setSections([]);
      setSelectedSection(null);
      if (selectedImageIndex !== null) {
        setCapturedImages(prev => prev.map((img, i) => 
          i === selectedImageIndex ? { ...img, sections: [] } : img
        ));
      }
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [selectedImageIndex]);

  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    sections.forEach(section => {
      if (section.points && section.points.length > 0) {
        const isSelected = selectedSection?.id === section.id;
        const opacity = section.opacity !== undefined ? section.opacity : shapeOpacity;
        
        ctx.fillStyle = section.color + Math.round(opacity * 255).toString(16).padStart(2, '0');
        ctx.strokeStyle = section.color;
        ctx.lineWidth = section.lineThickness || 3;
        
        if (isSelected) {
          ctx.lineWidth = (section.lineThickness || 3) + 2;
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(section.points[0].x, section.points[0].y);
        for (let i = 1; i < section.points.length; i++) {
          ctx.lineTo(section.points[i].x, section.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        if (isSelected && editMode) {
          section.points.forEach((point, idx) => {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = section.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          });
        }
      }
    });
  }, [sections, selectedSection, editMode, shapeOpacity]);

  const setupDrawingCanvas = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const rect = img.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleCanvasClick = useCallback((e) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (editMode && !isDrawing) {
      if (selectedSection) {
        for (let i = 0; i < selectedSection.points.length; i++) {
          const point = selectedSection.points[i];
          const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
          if (distance < 10) {
            setDraggedPointIndex(i);
            return;
          }
        }
      }
      
      const ctx = canvas.getContext('2d');
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.points) {
          ctx.beginPath();
          ctx.moveTo(section.points[0].x, section.points[0].y);
          for (let j = 1; j < section.points.length; j++) {
            ctx.lineTo(section.points[j].x, section.points[j].y);
          }
          ctx.closePath();
          
          if (ctx.isPointInPath(x, y)) {
            setSelectedSection(section);
            redrawCanvas();
            return;
          }
        }
      }
      
      setSelectedSection(null);
      redrawCanvas();
    }
  }, [editMode, isDrawing, selectedSection, sections, redrawCanvas]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!canvasRef.current || !editMode || draggedPointIndex === null || !selectedSection) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const updatedPoints = [...selectedSection.points];
    updatedPoints[draggedPointIndex] = { x, y };
    
    const updatedSection = { ...selectedSection, points: updatedPoints };
    const updatedSections = sections.map(s => s.id === selectedSection.id ? updatedSection : s);
    
    setSections(updatedSections);
    setSelectedSection(updatedSection);
    
    if (selectedImageIndex !== null) {
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
    }
  }, [editMode, draggedPointIndex, selectedSection, sections, selectedImageIndex]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggedPointIndex(null);
  }, []);

  const startDrawingSection = useCallback(() => {
    if (!canvasRef.current || selectedImageIndex === null) {
      setError("Please select a captured image first");
      return;
    }
    
    if (editMode) {
      setError("Exit edit mode to draw new sections");
      return;
    }
    
    setIsDrawing(true);
    setError("");
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const points = [];
    let isDrawingActive = true;

    const colorIndex = sections.length % SECTION_COLORS.length;
    const currentColor = SECTION_COLORS[colorIndex];

    const handleClick = (e) => {
      if (!isDrawingActive) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      points.push({ x, y });
      
      ctx.fillStyle = currentColor.stroke;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      if (points.length > 1) {
        ctx.strokeStyle = currentColor.stroke;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    const handleDblClick = () => {
      if (points.length < 3) {
        alert('Please click at least 3 points');
        return;
      }
      
      isDrawingActive = false;
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('dblclick', handleDblClick);
      
      const zoomLevel = capturedImages[selectedImageIndex].zoom || 20;
      const centerLat = capturedImages[selectedImageIndex].center.lat;
      const metersPerPixel = (156543.03392 * Math.cos(centerLat * Math.PI / 180)) / Math.pow(2, zoomLevel);
      
      const areaPixels = Math.abs(points.reduce((sum, point, i) => {
        const nextPoint = points[(i + 1) % points.length];
        return sum + (point.x * nextPoint.y - nextPoint.x * point.y);
      }, 0) / 2);
      
      const areaMeters = areaPixels * (metersPerPixel * metersPerPixel);
      const areaSqFt = areaMeters * 10.7639;
      
      const newSection = {
        id: `section-${Date.now()}`,
        name: `Section ${sections.length + 1}`,
        flat_area_sqft: Math.round(areaSqFt * 100) / 100,
        pitch: 'flat',
        pitch_multiplier: 1.00,
        adjusted_area_sqft: Math.round(areaSqFt * 100) / 100,
        color: currentColor.stroke,
        lineThickness: 3,
        opacity: 0.5,
        shape: 'polygon',
        points: points
      };

      const updatedSections = [...sections, newSection];
      setSections(updatedSections);
      
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
      
      setIsDrawing(false);
      redrawCanvas();
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('dblclick', handleDblClick);
  }, [sections, selectedImageIndex, capturedImages, redrawCanvas]);

  const deleteSection = useCallback((sectionId) => {
    const updatedSections = sections.filter(s => s.id !== sectionId);
    setSections(updatedSections);
    
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
    
    if (selectedImageIndex !== null) {
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
    }
    
    redrawCanvas();
    setDeletedSectionsCount(prev => prev + 1);
  }, [sections, selectedSection, selectedImageIndex, redrawCanvas]);

  const updateSectionPitch = useCallback((sectionId, pitchValue) => {
    const pitchOption = PITCH_OPTIONS.find(p => p.value === pitchValue);
    if (!pitchOption) return;

    const updatedSections = sections.map(section => 
      section.id === sectionId
        ? {
            ...section,
            pitch: pitchValue,
            pitch_multiplier: pitchOption.multiplier,
            adjusted_area_sqft: Math.round(section.flat_area_sqft * pitchOption.multiplier * 100) / 100
          }
        : section
    );
    
    setSections(updatedSections);
    
    if (selectedImageIndex !== null) {
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
    }
  }, [sections, selectedImageIndex]);

  const updateSectionName = useCallback((sectionId, name) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId ? { ...section, name } : section
    );
    
    setSections(updatedSections);
    
    if (selectedImageIndex !== null) {
      setCapturedImages(prev => prev.map((img, i) => 
        i === selectedImageIndex ? { ...img, sections: updatedSections } : img
      ));
    }
  }, [sections, selectedImageIndex]);

  useEffect(() => {
    if (isDrawingMode && selectedImageIndex !== null && imageRef.current) {
      setupDrawingCanvas();
    }
  }, [isDrawingMode, selectedImageIndex, setupDrawingCanvas]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((liveMapSections.length > 0 || sections.length > 0) && !showTreeHelper) {
        setShowTreeHelper(true);
      }
    }, 120000);
    
    return () => clearTimeout(timer);
  }, [liveMapSections.length, sections.length, showTreeHelper]);

  useEffect(() => {
    if (deletedSectionsCount >= 3) {
      setShowTreeHelper(true);
    }
  }, [deletedSectionsCount]);

  const getTotalArea = () => {
    const liveTotal = liveMapSections.reduce((sum, s) => sum + s.adjusted_area_sqft, 0);
    const capturedTotal = capturedImages.reduce((total, img) => {
      return total + (img.sections || []).reduce((sum, section) => sum + section.adjusted_area_sqft, 0);
    }, 0);
    return liveTotal + capturedTotal;
  };

  // Calculate roof component measurements
  const calculateRoofComponents = useCallback(() => {
    let eaves = 0, rakes = 0, ridges = 0, hips = 0, valleys = 0, steps = 0, walls = 0;

    const allSections = [...liveMapSections, ...capturedImages.flatMap(img => img.sections || [])];

    allSections.forEach(section => {
      const coords = section.coordinates || section.points || [];
      if (coords.length < 3) return;

      // Calculate perimeter and estimate edge types
      for (let i = 0; i < coords.length; i++) {
        const p1 = coords[i];
        const p2 = coords[(i + 1) % coords.length];

        // Calculate edge length (using Haversine for lat/lng or pixel distance)
        let edgeLength;
        if (p1.lat !== undefined) {
          // Geographic coordinates
          const R = 20902231; // Earth radius in feet
          const dLat = (p2.lat - p1.lat) * Math.PI / 180;
          const dLng = (p2.lng - p1.lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          edgeLength = R * c;
        } else {
          // Pixel coordinates - convert to feet using zoom
          const zoomLevel = 20;
          const centerLat = 32.7767; // Default DFW
          const metersPerPixel = (156543.03392 * Math.cos(centerLat * Math.PI / 180)) / Math.pow(2, zoomLevel);
          const pixelDist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
          edgeLength = pixelDist * metersPerPixel * 3.28084; // meters to feet
        }

        // Estimate edge type based on position and angle
        const angle = p1.lat !== undefined 
          ? Math.atan2(p2.lat - p1.lat, p2.lng - p1.lng) * 180 / Math.PI
          : Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        
        const normalizedAngle = Math.abs(angle);

        // Classify edges
        if (normalizedAngle < 15 || normalizedAngle > 165) {
          eaves += edgeLength * 0.3; // Horizontal lower edges
          ridges += edgeLength * 0.2; // Horizontal upper edges
        } else if (normalizedAngle > 75 && normalizedAngle < 105) {
          rakes += edgeLength * 0.5; // Vertical/steep edges
        } else if (normalizedAngle > 30 && normalizedAngle < 60) {
          hips += edgeLength * 0.4; // Diagonal external
        } else if (normalizedAngle > 120 && normalizedAngle < 150) {
          valleys += edgeLength * 0.3; // Diagonal internal
        }

        // Distribute remaining
        walls += edgeLength * 0.1;
      }
    });

    return {
      eaves: Math.round(eaves * 100) / 100,
      rakes: Math.round(rakes * 100) / 100,
      ridges: Math.round(ridges * 100) / 100,
      hips: Math.round(hips * 100) / 100,
      valleys: Math.round(valleys * 100) / 100,
      steps: Math.round(steps * 100) / 100,
      walls: Math.round(walls * 100) / 100
    };
  }, [liveMapSections, capturedImages]);

  const roofComponents = calculateRoofComponents();

  const generateBlueprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title section
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('ROOF MEASUREMENT BLUEPRINT', 50, 50);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText(address, 50, 80);
    ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 50, 105);
    
    // Draw border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Collect all sections with their coordinates
    const allSections = [];
    
    // Add live map sections
    liveMapSections.forEach((section, idx) => {
      if (section.coordinates && section.coordinates.length > 0) {
        allSections.push({
          ...section,
          points: section.coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng })),
          source: 'live'
        });
      }
    });
    
    // Add captured image sections (convert pixel coordinates to lat/lng approximation)
    capturedImages.forEach((img, imgIdx) => {
      if (img.sections && img.sections.length > 0) {
        img.sections.forEach((section, sectionIdx) => {
          if (section.points && section.points.length > 0) {
            // For captured sections, we'll use normalized coordinates
            allSections.push({
              ...section,
              points: section.points.map(p => ({ 
                lat: p.y / 600, // Normalize to 0-1 range
                lng: p.x / 800 
              })),
              source: 'captured'
            });
          }
        });
      }
    });
    
    if (allSections.length === 0) {
      alert('No sections to display in blueprint');
      return;
    }
    
    // Find bounds of all sections
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    allSections.forEach(section => {
      section.points.forEach(point => {
        minLat = Math.min(minLat, point.lat);
        maxLat = Math.max(maxLat, point.lat);
        minLng = Math.min(minLng, point.lng);
        maxLng = Math.max(maxLng, point.lng);
      });
    });
    
    // Add padding
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    const padding = Math.max(latRange, lngRange) * 0.1;
    
    minLat -= padding;
    maxLat += padding;
    minLng -= padding;
    maxLng += padding;
    
    // Scale to fit canvas
    const drawPadding = 80;
    const drawWidth = canvas.width - drawPadding * 2;
    const drawHeight = canvas.height - 300; // Leave space for legend at bottom
    const drawTop = 140;
    
    function scalePoint(lat, lng) {
      const x = drawPadding + ((lng - minLng) / (maxLng - minLng)) * drawWidth;
      const y = drawTop + ((maxLat - lat) / (maxLat - minLat)) * drawHeight;
      return { x, y };
    }
    
    // Draw each section
    allSections.forEach((section, index) => {
      const color = section.color || SECTION_COLORS[index % SECTION_COLORS.length].stroke;
      
      // Draw polygon
      ctx.fillStyle = color + '33'; // 20% opacity
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      section.points.forEach((point, i) => {
        const scaled = scalePoint(point.lat, point.lng);
        if (i === 0) ctx.moveTo(scaled.x, scaled.y);
        else ctx.lineTo(scaled.x, scaled.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Calculate center for label
      let centerLat = 0, centerLng = 0;
      section.points.forEach(p => {
        centerLat += p.lat;
        centerLng += p.lng;
      });
      centerLat /= section.points.length;
      centerLng /= section.points.length;
      
      const centerScaled = scalePoint(centerLat, centerLng);
      
      // Draw label background
      const labelLines = [
        section.name || `Section ${index + 1}`,
        `${Math.round(section.flat_area_sqft || section.adjusted_area_sqft).toLocaleString()} sq ft`,
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
      
      // Draw label text
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
    
    // Legend at bottom
    const legendTop = drawTop + drawHeight + 40;
    const totalArea = getTotalArea();
    const totalSquares = (totalArea / 100).toFixed(2);
    
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
    ctx.fillText(`Total Area: ${totalArea.toLocaleString()} sq ft`, 70, legendTop + 100);
    ctx.fillText(`Total Squares: ${totalSquares}`, 70, legendTop + 130);
    
    const liveCount = liveMapSections.length;
    const capturedCount = allSections.length - liveCount;
    if (capturedCount > 0) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`(${liveCount} from live map, ${capturedCount} from captured views)`, 450, legendTop + 70);
    }
    
    // Convert to image and download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `roof-blueprint-${address.replace(/[^a-z0-9]/gi, '-')}.png`;
    link.href = dataUrl;
    link.click();
    
  }, [liveMapSections, capturedImages, address, getTotalArea]);

  const handleQuickEstimate = async () => {
    setQuickEstimateLoading(true);
    setError("");

    try {
      let roofSqft;
      let method;
      let inputSqft = null;

      // Try Solar API first if we have coordinates
      if (coordinates) {
        try {
          const solarApiUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${coordinates.lat}&location.longitude=${coordinates.lng}&key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc`;
          
          const response = await fetch(solarApiUrl);
          
          if (response.ok) {
            const data = await response.json();
            const roofAreaM2 = data.solarPotential?.wholeRoofStats?.areaMeters2;
            
            if (roofAreaM2 && roofAreaM2 > 0) {
              roofSqft = Math.round(roofAreaM2 * 10.7639); // Convert m² to ft²
              method = 'solar_api';
              inputSqft = buildingSqft ? parseInt(buildingSqft) : null;
              console.log('✅ Solar API success:', roofSqft, 'sq ft');
            } else {
              throw new Error('No roof data from Solar API');
            }
          } else {
            throw new Error('Solar API request failed');
          }
        } catch (solarErr) {
          console.log('Solar API failed, using fallback:', solarErr.message);
          
          // Fallback to multiplier method
          if (autoEstimate || !buildingSqft) {
            const zipCode = address.match(/\d{5}/)?.[0];
            const avgHomeSizes = {
              '75001': 2200, '75002': 2400, '75006': 2100, '75007': 2300,
              '75019': 2500, '75023': 2600, '75024': 2700, '75025': 2400,
              '75034': 2200, '75035': 2300, '75056': 2100, '75062': 2500,
              '75071': 2300, '75074': 2600, '75075': 2800, '75078': 2400,
              '75080': 2200, '75081': 2500, '75082': 2300, '75093': 2400
            };
            const estimatedBuildingSqft = avgHomeSizes[zipCode] || 2000;
            roofSqft = Math.round(estimatedBuildingSqft * 1.3);
            method = 'zip_average';
            inputSqft = null;
          } else {
            const parsedSqft = parseInt(buildingSqft);
            if (isNaN(parsedSqft) || parsedSqft < 500 || parsedSqft > 20000) {
              setError("Please enter a valid building size between 500 and 20,000 sq ft");
              setQuickEstimateLoading(false);
              return;
            }
            roofSqft = Math.round(parsedSqft * 1.3);
            method = 'building_sqft_multiplier';
            inputSqft = parsedSqft;
          }
        }
      } else {
        // No coordinates yet, use fallback
        if (autoEstimate || !buildingSqft) {
          const zipCode = address.match(/\d{5}/)?.[0];
          const avgHomeSizes = {
            '75001': 2200, '75002': 2400, '75006': 2100, '75007': 2300,
            '75019': 2500, '75023': 2600, '75024': 2700, '75025': 2400,
            '75034': 2200, '75035': 2300, '75056': 2100, '75062': 2500,
            '75071': 2300, '75074': 2600, '75075': 2800, '75078': 2400,
            '75080': 2200, '75081': 2500, '75082': 2300, '75093': 2400
          };
          const estimatedBuildingSqft = avgHomeSizes[zipCode] || 2000;
          roofSqft = Math.round(estimatedBuildingSqft * 1.3);
          method = 'zip_average';
          inputSqft = null;
        } else {
          const parsedSqft = parseInt(buildingSqft);
          if (isNaN(parsedSqft) || parsedSqft < 500 || parsedSqft > 20000) {
            setError("Please enter a valid building size between 500 and 20,000 sq ft");
            setQuickEstimateLoading(false);
            return;
          }
          roofSqft = Math.round(parsedSqft * 1.3);
          method = 'building_sqft_multiplier';
          inputSqft = parsedSqft;
        }
      }

      const currentUser = await base44.auth.me().catch(() => null);

      const measurementData = {
        company_id: currentUser?.company_id || null,
        user_id: currentUser?.id || null,
        property_address: address,
        user_type: currentUser?.aroof_role === 'external_roofer' ? 'roofer' : 'homeowner',
        measurement_type: 'quick_estimate',
        estimation_method: method,
        building_sqft_input: inputSqft,
        total_sqft: roofSqft,
        total_adjusted_sqft: roofSqft,
        lead_status: 'new',
        payment_status: "pending"
      };

      const savedMeasurement = await base44.entities.Measurement.create(measurementData);
      
      navigate(createPageUrl(`Results?measurementid=${savedMeasurement.id}`));

    } catch (err) {
      console.error('Quick estimate error:', err);
      setError(`Failed to create estimate: ${err.message}`);
      setQuickEstimateLoading(false);
    }
  };

  const handleCompleteMeasurement = useCallback(async () => {
    const totalAdjusted = getTotalArea();
    
    if (liveMapSections.length === 0 && !capturedImages.some(img => img.sections?.length > 0)) {
      setError("⚠️ Please draw at least one roof section before completing.");
      return;
    }
    
    if (totalAdjusted < 100) {
      setError("Total area seems too small. Please verify your measurements.");
      return;
    }

    if (totalAdjusted > 50000) {
      setError("Total area seems unusually large. Please verify your measurements.");
      return;
    }

    const confirmed = window.confirm(
      `Complete measurement with ${liveMapSections.length + capturedImages.reduce((sum, img) => sum + (img.sections?.length || 0), 0)} section(s) totaling ${totalAdjusted.toFixed(2)} sq ft?`
    );
    
    if (!confirmed) return;

    setSaving(true);
    setError("");

    try {
      // Check if user is logged in
      const currentUser = await base44.auth.me().catch(() => null);
      const isRoofer = currentUser?.aroof_role === 'external_roofer';
      
      const leadId = searchParams.get('leadId') || sessionStorage.getItem('active_lead_id');

      console.log('🟡 Measurement complete!');
      console.log('🟡 isRoofer:', isRoofer);
      console.log('🟡 leadId:', leadId);

      // Prepare measurement data sections
      const capturedSections = capturedImages.flatMap((img, imgIndex) => 
        (img.sections || []).map(section => ({
          ...section,
          imageIndex: imgIndex,
          source: 'captured'
        }))
      );

      const liveSections = liveMapSections.map(section => {
        // Remove polygon object and any circular references
        const { polygon, ...sectionData } = section;
        return {
          ...sectionData,
          source: 'live_map'
        };
      });

      const allSections = [...liveSections, ...capturedSections];
      const components = calculateRoofComponents();

      if (isRoofer && leadId) {
        // UPDATE the existing lead with measurement data
        console.log('📊 Updating lead', leadId, 'with measurement data');
        
        await base44.entities.Measurement.update(leadId, {
          // Measurement data
          total_sqft: totalAdjusted,
          total_adjusted_sqft: totalAdjusted,
          measurement_data: {
            total_adjusted_sqft: totalAdjusted,
            sections: allSections
          },
          measurement_type: 'detailed_polygon',
          estimation_method: 'manual_polygon',
          eaves_ft: components.eaves,
          rakes_ft: components.rakes,
          ridges_ft: components.ridges,
          hips_ft: components.hips,
          valleys_ft: components.valleys,
          steps_ft: components.steps,
          walls_ft: components.walls,
          
          // Status
          measurement_completed: true,
          measurement_date: new Date().toISOString(),
          
          // Keep address and customer info (already saved in NewLeadForm)
          // DON'T overwrite customer_name, customer_phone, customer_email, property_address
        });

        console.log('✅ Lead updated successfully');
        
        // Clear session
        sessionStorage.removeItem('active_lead_id');
        sessionStorage.removeItem('lead_address');
        sessionStorage.removeItem('pending_measurement_id');

        // Go DIRECTLY to results
        console.log('🟡 Navigating to Results page');
        navigate(`/results?id=${leadId}`);

      } else if (isRoofer && !leadId) {
        console.log('⚠️ Roofer without lead ID - redirecting to dashboard');
        alert('Please start from dashboard to measure roofs');
        navigate('/rooferdashboard');
        
      } else {
        // Homeowner flow
        console.log('👤 HOMEOWNER PATH: Creating new measurement');
        
        const measurementData = {
            company_id: null,
            user_id: null,
            property_address: address,
            user_type: 'homeowner',
            measurement_type: 'detailed_polygon',
            estimation_method: 'manual_polygon',
            captured_images: capturedImages,
            measurement_data: {
              total_adjusted_sqft: totalAdjusted,
              sections: allSections
            },
            total_sqft: totalAdjusted,
            total_adjusted_sqft: totalAdjusted,
            eaves_ft: components.eaves,
            rakes_ft: components.rakes,
            ridges_ft: components.ridges,
            hips_ft: components.hips,
            valleys_ft: components.valleys,
            steps_ft: components.steps,
            walls_ft: components.walls,
            lead_status: 'new',
            measurement_completed: true,
            contact_info_provided: false
          };
  
        const measurement = await base44.entities.Measurement.create(measurementData);
  
        sessionStorage.setItem('pending_measurement_id', measurement.id);
        console.log('🟡 Navigating to ContactInfoPage');
        navigate('/contactinfopage');
      }

    } catch (err) {
      console.error('❌ Measurement save error:', err);
      alert('Failed to save measurement: ' + err.message);
      setSaving(false);
    }
  }, [capturedImages, liveMapSections, address, measurementId, leadData, searchParams, navigate, calculateRoofComponents, getTotalArea]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const totalArea = getTotalArea();
  const getZoomAdvice = () => {
    if (currentZoom >= 21) {
      return { type: 'success', message: 'Perfect zoom - ready to capture', icon: '✓' };
    } else if (currentZoom >= 20) {
      return { type: 'success', message: 'Good zoom level', icon: '✓' };
    } else if (currentZoom >= 19) {
      return { type: 'warning', message: 'Zoom in more for better detail', icon: '⚠️' };
    } else {
      return { type: 'error', message: 'Zoom in closer', icon: '❌' };
    }
  };
  const zoomAdvice = getZoomAdvice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl("FormPage")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Measure Your Roof</h2>
            <p className="text-sm text-slate-600">Choose your measurement method</p>
            
            <div className="flex bg-slate-100 rounded-lg p-1 mt-4">
              <button
                onClick={() => setMeasurementMode('quick')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  measurementMode === 'quick' 
                    ? 'bg-green-600 text-white shadow' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Quick Estimate
              </button>
              <button
                onClick={() => setMeasurementMode('detailed')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  measurementMode === 'detailed' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📐 Detailed Measurement
              </button>
            </div>
          </div>

          {/* Lead Info Card for Roofers */}
          {leadData && (
            <div className="p-4 bg-blue-50 border-b-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📋</span>
                <h3 className="font-bold text-blue-900">Measuring for Lead</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium min-w-[70px]">Customer:</span>
                  <span className="text-blue-900 font-semibold">{leadData.customer_name}</span>
                </div>
                {leadData.customer_phone && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-medium min-w-[70px]">Phone:</span>
                    <span className="text-blue-900">{leadData.customer_phone}</span>
                  </div>
                )}
                {leadData.customer_email && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-medium min-w-[70px]">Email:</span>
                    <span className="text-blue-900">{leadData.customer_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 font-medium">Property:</p>
                <Input
                  value={address || ''}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter property address..."
                  autoComplete="new-password" // Tricks browser into NOT autocompleting
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  disabled // Make it read-only if pre-loaded from URL
                  className="text-sm font-bold text-blue-900 bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                />
                {(coordinates || addressLoaded) && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {addressLoaded ? 'Address loaded from lead' : 'Location verified'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {measurementMode === 'quick' ? (
              /* QUICK ESTIMATE MODE */
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-bold text-green-900">Get Instant Roof Estimate</h3>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <Label className="text-sm font-bold text-slate-700">Building Square Footage</Label>
                    <Input
                      type="number"
                      value={buildingSqft}
                      onChange={(e) => setBuildingSqft(e.target.value)}
                      placeholder="e.g., 2000"
                      disabled={autoEstimate}
                      className="mt-2 h-12 text-lg"
                    />
                    <p className="text-xs text-slate-500 mt-2">Enter your home's total living area</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={autoEstimate}
                      onChange={(e) => {
                        setAutoEstimate(e.target.checked);
                        if (e.target.checked) setBuildingSqft("");
                      }}
                      className="mt-1"
                    />
                    <label className="text-sm text-slate-700">
                      <strong>I don't know</strong> - estimate it for me based on my ZIP code
                    </label>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-xs text-blue-900">
                      <strong>How it works:</strong> We calculate roof area using building size × 1.3 (standard roof multiplier). This gives you a quick ballpark estimate.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleQuickEstimate}
                    disabled={quickEstimateLoading || (!buildingSqft && !autoEstimate)}
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
                  >
                    {quickEstimateLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Calculate Roof Size
                      </>
                    )}
                  </Button>

                  <div className="pt-4 border-t border-green-200">
                    <p className="text-xs text-slate-600 mb-2">
                      <strong>Want more accuracy?</strong> Switch to Detailed Measurement mode to draw exact roof sections for ±2% precision.
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            {measurementMode === 'detailed' && !mapLoading && !mapError && !isDrawingMode && (
              <>
                <Button
                  onClick={startDrawingOnLiveMap}
                  disabled={isDrawing || !mapInstanceRef.current}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
                >
                  {isDrawing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Drawing Section {liveMapSections.length + 1}...
                    </>
                  ) : liveMapSections.length === 0 ? (
                    <>
                      <Edit3 className="w-5 h-5 mr-2" />
                      🎨 Start Drawing Section 1
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Section {liveMapSections.length + 1}
                    </>
                  )}
                </Button>

                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-blue-900 text-sm">📋 How to Use:</h3>
                    </div>

                    <div className="space-y-2 text-xs text-blue-900">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-blue-700 min-w-[60px]">Step 1:</span>
                        <span>Click "Start Drawing" button above</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-blue-700 min-w-[60px]">Step 2:</span>
                        <span>Click points around each roof section on the map</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-blue-700 min-w-[60px]">Step 3:</span>
                        <span>Double-click to finish - section appears as colored polygon</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-blue-700 min-w-[60px]">Step 4:</span>
                        <span>Repeat for all sections - each gets unique color</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-green-700 min-w-[60px]">Optional:</span>
                        <span>Use zoom controls below for best view</span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🌳</span>
                        <h4 className="font-bold text-blue-900 text-sm">If Trees Block Your View:</h4>
                      </div>

                      <div className="space-y-1 text-xs text-blue-900">
                        <div>✅ <strong>Zoom in closer</strong> (level 21-22) for highest resolution</div>
                        <div>✅ <strong>Look for roof edges</strong> visible between tree gaps</div>
                        <div>✅ <strong>Use building corners</strong> as reference points</div>
                        <div>✅ <strong>Draw your best estimate</strong> - we'll verify during free inspection</div>
                        <div>✅ <strong>Upload site photos</strong> to supplement your measurement</div>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-900">
                      💡 <strong>Tip:</strong> Use "Capture View" to save specific angles and draw on static images
                    </div>
                  </div>
                </Card>

                {showTreeHelper && (
                  <Alert className="bg-yellow-50 border-yellow-300 border-2 relative mb-4">
                    <button
                      onClick={() => setShowTreeHelper(false)}
                      className="absolute top-2 right-2 text-yellow-900 hover:text-yellow-700 text-xl font-bold"
                    >
                      ×
                    </button>
                    <AlertDescription>
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">🌳</span>
                        <div>
                          <div className="font-bold text-yellow-900 text-sm mb-1">
                            Having Trouble Seeing the Roof?
                          </div>
                          <div className="text-xs text-yellow-800 leading-relaxed">
                            Trees can make satellite measurements challenging. Draw your best estimate - we'll verify exact measurements during your <strong>FREE on-site inspection</strong>.
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => setShowTreeHelper(false)}
                          className="bg-green-600 hover:bg-green-700 text-white h-10"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Upload Site Photos to Help
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowTreeHelper(false)}
                          className="border-yellow-400 text-yellow-900"
                        >
                          Continue Drawing
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Card className="p-3 bg-white border-2 border-slate-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                      <span className="text-xs font-bold text-slate-700">Zoom Level</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        zoomAdvice.type === 'success' ? 'bg-green-100 text-green-800' :
                        zoomAdvice.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {zoomAdvice.icon} {currentZoom}
                      </span>
                    </div>

                    <div className={`p-2 rounded text-xs ${
                      currentZoom >= 21 ? 'bg-green-50 text-green-800' :
                      currentZoom >= 20 ? 'bg-blue-50 text-blue-800' :
                      'bg-yellow-50 text-yellow-800'
                    }`}>
                      {currentZoom >= 21 ? (
                        <div>✅ <strong>Perfect zoom!</strong> This resolution is ideal for accuracy.</div>
                      ) : currentZoom >= 20 ? (
                        <div>✓ <strong>Good zoom level</strong> for measurements.</div>
                      ) : (
                        <div>🔍 <strong>Tip:</strong> Zoom in closer (21-22) for better detail and accuracy.</div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleZoomOut} disabled={currentZoom <= 18} className="flex-1">
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleOptimalZoom} className="flex-1">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleZoomIn} disabled={currentZoom >= 22} className="flex-1">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button size="sm" variant="outline" onClick={handleResetZoom} className="w-full">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset View
                    </Button>
                  </div>
                </Card>

                <Button
                  onClick={handleCaptureView}
                  disabled={capturing}
                  variant="outline"
                  className="w-full h-12"
                >
                  {capturing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      📸 Capture View (Optional)
                    </>
                  )}
                </Button>
              </>
            )}

            {measurementMode === 'detailed' && isDrawingMode && (
              <>
                <Alert className={editMode ? "bg-amber-50 border-amber-200" : "bg-purple-50 border-purple-200"}>
                  <Info className={`h-4 w-4 ${editMode ? 'text-amber-600' : 'text-purple-600'}`} />
                  <AlertDescription className={`text-xs ${editMode ? 'text-amber-900' : 'text-purple-900'}`}>
                    <strong>{editMode ? 'Edit Mode:' : 'Drawing on Captured Image:'}</strong> {editMode ? 'Click shape to select, drag points to edit' : 'Click points to draw, double-click to finish'}
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={!editMode ? 'default' : 'outline'}
                    onClick={() => {
                      setEditMode(false);
                      setSelectedSection(null);
                      redrawCanvas();
                    }}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Draw
                  </Button>
                  <Button
                    size="sm"
                    variant={editMode ? 'default' : 'outline'}
                    onClick={() => {
                      setEditMode(true);
                      setIsDrawing(false);
                    }}
                    className="flex-1"
                  >
                    <MousePointer className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>

                {editMode && selectedSection && (
                  <Card className="p-3 bg-amber-50 border-2 border-amber-200">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-amber-900">Selected: {selectedSection.name}</p>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">
                          Adjust Opacity: {Math.round((selectedSection.opacity || 0.5) * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(selectedSection.opacity || 0.5) * 100}
                          onChange={(e) => {
                            const newOpacity = parseInt(e.target.value) / 100;
                            const updatedSections = sections.map(s => 
                              s.id === selectedSection.id ? { ...s, opacity: newOpacity } : s
                            );
                            setSections(updatedSections);
                            setSelectedSection({ ...selectedSection, opacity: newOpacity });
                            
                            if (selectedImageIndex !== null) {
                              setCapturedImages(prev => prev.map((img, i) => 
                                i === selectedImageIndex ? { ...img, sections: updatedSections } : img
                              ));
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSection(selectedSection.id)}
                        className="w-full text-red-600 border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected
                      </Button>
                    </div>
                  </Card>
                )}

                {!editMode && (
                  <Button
                    onClick={startDrawingSection}
                    disabled={isDrawing}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
                  >
                    {isDrawing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Drawing Section {sections.length + 1}...
                      </>
                    ) : sections.length === 0 ? (
                      <>
                        <Edit3 className="w-5 h-5 mr-2" />
                        Start Drawing Section 1
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Add Section {sections.length + 1}
                      </>
                    )}
                  </Button>
                )}

                {sections.length > 0 && (
                  <Button
                    onClick={clearAllSections}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Eraser className="w-4 h-4 mr-2" />
                    Clear All Sections
                  </Button>
                )}

                <Button
                  onClick={exitDrawingMode}
                  variant="outline"
                  className="w-full"
                >
                  ← Back to Live Map
                </Button>
              </>
            )}

            {measurementMode === 'detailed' && error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {measurementMode === 'detailed' && mapError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {mapError}
                  <Button size="sm" onClick={handleRetryMap} className="ml-2 mt-2">
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {measurementMode === 'detailed' && !mapScriptLoaded && !mapError && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-xs text-blue-900">
                  Loading Google Maps script...
                </AlertDescription>
              </Alert>
            )}

            {measurementMode === 'detailed' && mapScriptLoaded && mapLoading && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-xs text-blue-900">
                  {geocodingStatus}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {(liveMapSections.length > 0 || capturedImages.some(img => img.sections?.length > 0)) && !isDrawingMode && (
            <div className="p-4 border-t border-slate-200">
              <div style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  marginBottom: '16px',
                  color: '#1e293b'
                }}>
                  📏 Detailed Measurements
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Eaves:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{roofComponents.eaves.toFixed(2)} ft</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Rakes:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{roofComponents.rakes.toFixed(2)} ft</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Ridges:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{roofComponents.ridges.toFixed(2)} ft</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Hips:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{roofComponents.hips.toFixed(2)} ft</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Valleys:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{roofComponents.valleys.toFixed(2)} ft</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Flashing:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{roofComponents.walls.toFixed(2)} ft</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {liveMapSections.length > 0 && !isDrawingMode && (
            <div className="p-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                <Layers className="w-4 h-4 inline mr-1" />
                Sections on Live Map ({liveMapSections.length})
              </h3>
              <div className="space-y-3">
                {liveMapSections.map((section) => (
                  <Card key={section.id} className="p-3 border-2" style={{ borderColor: section.color }}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }} />
                        <Input
                          value={section.name}
                          onChange={(e) => updateLiveMapSectionName(section.id, e.target.value)}
                          className="flex-1 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLiveMapSection(section.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-xs">
                        <span className="text-slate-600">Area: </span>
                        <span className="font-bold">{section.flat_area_sqft.toLocaleString()} sq ft</span>
                      </div>

                      <Select value={section.pitch} onValueChange={(value) => updateLiveMapSectionPitch(section.id, value)}>
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PITCH_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {section.pitch !== 'flat' && (
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-xs text-green-700">
                            Adjusted: <strong>{section.adjusted_area_sqft.toLocaleString()} sq ft</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {capturedImages.length > 0 && !isDrawingMode && (
            <div className="p-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                📸 Captured Views ({capturedImages.length})
              </h3>
              <div className="space-y-3">
                {capturedImages.map((img, idx) => (
                  <Card key={img.id} className="p-3 border-2 border-green-200">
                    <img 
                      src={img.url} 
                      alt={`View ${idx + 1}`}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <div className="text-xs text-slate-600 mb-2">
                      View {idx + 1} - Zoom: {img.zoom}
                      {img.sections?.length > 0 && (
                        <span className="ml-2 text-green-600 font-bold">
                          ({img.sections.length} section{img.sections.length !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => selectImageForDrawing(idx)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Draw/Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCapturedImage(idx)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {isDrawingMode && sections.length > 0 && (
            <div className="p-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                <Layers className="w-4 h-4 inline mr-1" />
                Sections ({sections.length})
              </h3>
              <div className="space-y-3">
                {sections.map((section) => (
                  <Card 
                    key={section.id} 
                    className={`p-3 border-2 ${selectedSection?.id === section.id ? 'ring-2 ring-amber-400' : ''}`}
                    style={{ borderColor: section.color }}
                    onClick={() => {
                      if (editMode) {
                        setSelectedSection(section);
                        redrawCanvas();
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }} />
                        <Input
                          value={section.name}
                          onChange={(e) => updateSectionName(section.id, e.target.value)}
                          className="flex-1 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSection(section.id);
                          }}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-xs">
                        <span className="text-slate-600">Area: </span>
                        <span className="font-bold">{section.flat_area_sqft.toLocaleString()} sq ft</span>
                      </div>

                      <Select value={section.pitch} onValueChange={(value) => updateSectionPitch(section.id, value)}>
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PITCH_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {section.pitch !== 'flat' && (
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-xs text-green-700">
                            Adjusted: <strong>{section.adjusted_area_sqft.toLocaleString()} sq ft</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(liveMapSections.length > 0 || capturedImages.some(img => img.sections?.length > 0)) && (
            <div className="sticky bottom-0 p-6 border-t border-slate-200 bg-gradient-to-br from-green-50 to-blue-50">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Total Roof Area</h3>
              <div className="text-3xl font-bold text-green-900 mb-4">
                {totalArea.toLocaleString()} sq ft
              </div>

              <div className="space-y-2">
                <Button
                  onClick={generateBlueprint}
                  variant="outline"
                  className="w-full h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  📐 Download Blueprint Diagram
                </Button>

                <Button
                  onClick={handleCompleteMeasurement}
                  disabled={saving}
                  className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete Measurement
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 bg-slate-900 p-6 overflow-y-auto">
          {measurementMode === 'quick' ? (
            /* QUICK ESTIMATE VIEW */
            <div className="flex items-center justify-center h-full">
              <Card className="max-w-2xl w-full bg-white/95 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Quick Roof Estimate</h2>
                  <p className="text-lg text-slate-600 mb-6">
                    Get an instant estimate based on your building size
                  </p>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-left">
                    <h3 className="font-bold text-blue-900 mb-3">How Quick Estimates Work:</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Based on building size × 1.3 (standard roof multiplier)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Provides ballpark estimate in seconds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Great for initial quotes and screening leads</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-600" />
                        <span><strong>Accuracy:</strong> ±15-20% (use Detailed mode for ±2% precision)</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-slate-500 mt-6">
                    ← Use the form on the left to calculate your estimate
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : !isDrawingMode ? (
            <div style={{ marginBottom: '50px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                padding: '14px 24px',
                borderRadius: '16px 16px 0 0',
                fontWeight: '600',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <span style={{ fontSize: '24px' }}>🛰️</span>
                Live Satellite View
              </div>
              <div className="relative">
                {mapError ? (
                  <div style={{
                    width: '100%',
                    height: '700px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1e293b',
                    borderRadius: '0 0 16px 16px',
                    border: '3px solid #ef4444'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
                    <div style={{ color: '#ef4444', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
                      Google Maps Failed to Load
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '24px', textAlign: 'center', maxWidth: '500px', lineHeight: '1.6' }}>
                      There was an error loading the map. This may be due to network issues or API configuration.
                    </div>
                    <Button
                      onClick={handleRetryMap}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Retry Loading Map
                    </Button>
                  </div>
                ) : (
                  <>
                    <div 
                      ref={mapRef} 
                      style={{ 
                        width: '100%', 
                        height: '700px',
                        borderRadius: '0 0 16px 16px',
                        border: '3px solid #3b82f6',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                        backgroundColor: '#1e293b'
                      }} 
                    />
                    {mapLoading && (
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0 0 16px 16px',
                        zIndex: 10
                      }}>
                        <Loader2 className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-white">{geocodingStatus}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div style={{
                marginBottom: '30px',
                background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                color: 'white',
                padding: '20px 32px',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(168, 85, 247, 0.5)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '1200px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                      {editMode ? '✏️ Edit Mode' : '🎨 Drawing Mode'} - View {selectedImageIndex + 1}
                    </p>
                    <p style={{ fontSize: '15px', opacity: 0.95 }}>
                      {editMode ? 'Click shape to select, drag points to modify' : 'Click points around roof. Double-click to finish. Each section gets auto color.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="sm" variant="secondary" onClick={handleCanvasZoomOut} disabled={canvasZoom <= 0.5}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleCanvasResetZoom}>
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleCanvasZoomIn} disabled={canvasZoom >= 3}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div 
                ref={containerRef}
                style={{ 
                  position: 'relative', 
                  width: '100%', 
                  maxWidth: '1200px',
                  overflow: 'auto',
                  border: '4px solid #a855f7',
                  borderRadius: '16px',
                  boxShadow: '0 12px 40px rgba(168, 85, 247, 0.4)',
                  background: '#1e293b'
                }}
              >
                <div style={{
                  transform: `scale(${canvasZoom}) translate(${canvasPan.x}px, ${canvasPan.y}px)`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s ease-out'
                }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      ref={imageRef}
                      src={capturedImages[selectedImageIndex]?.url}
                      alt="Drawing surface"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                      onLoad={setupDrawingCanvas}
                    />
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        cursor: editMode ? (draggedPointIndex !== null ? 'grabbing' : 'pointer') : (isDrawing ? 'crosshair' : 'default'),
                        pointerEvents: 'all'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}