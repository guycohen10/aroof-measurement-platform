import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Home, ArrowLeft, Loader2, CheckCircle, AlertCircle, MapPin, Edit3, Trash2, Plus, Layers, ZoomIn, ZoomOut, Maximize2, RotateCcw, Camera, X, Info, Square, Circle as CircleIcon, Pentagon, Eraser, MousePointer, Zap, Palette } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import RoofVisualizer from "../components/RoofVisualizer";

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
  const [mapInstance, setMapInstance] = useState(null);
  const markerRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const polygonsRef = useRef([]);
  const containerRef = useRef(null);
  const initAttemptRef = useRef(0);
  const scriptLoadedRef = useRef(false);
  const solarPolygonRef = useRef(null);
  
  const [measurementMode, setMeasurementMode] = useState(null); // null, 'quick', or 'detailed'
  const [buildingSqft, setBuildingSqft] = useState("");
  const [autoEstimate, setAutoEstimate] = useState(false);
  const [quickEstimateLoading, setQuickEstimateLoading] = useState(false);
  const [totalSqft, setTotalSqft] = useState(null);
  const [isCalculationDone, setIsCalculationDone] = useState(false);
  const [isMeasurementComplete, setIsMeasurementComplete] = useState(false);
  const [savedDesign, setSavedDesign] = useState(null);
  const [hasChosenMethod, setHasChosenMethod] = useState(false);
  
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
  
  // Solar center coordinates for re-mounting map
  const [solarCenter, setSolarCenter] = useState(null);
  
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
  const [isInspectionMode, setIsInspectionMode] = useState(false);
  const [isDesignMode, setIsDesignMode] = useState(false);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(21);
  const [mapHeading, setMapHeading] = useState(0);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);

  // Fetch Solar API Data
  const fetchSolarData = async (lat, lng) => {
    console.log('🚀 STARTING SOLAR FETCH for:', lat, lng);
    
    try {
      const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${GOOGLE_MAPS_API_KEY}`;
      console.log('🌐 API URL:', url);
      
      const response = await fetch(url);
      console.log('📡 Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API ERROR:', errorText);
        alert(`Solar API Failed: ${response.status} - ${errorText}`);
        return;
      }
      
      const data = await response.json();
      console.log('📦 API Data received:', data);
      
      if (data.solarPotential) {
        const areaSqM = data.solarPotential.wholeRoofStats.areaMeters2;
        const baseSqFt = Math.round(areaSqM * 10.764);
        
        // Add 10% waste buffer
        const bufferedSqFt = Math.round(baseSqFt * 1.10);
        const bufferedSqM = Math.round(bufferedSqFt * 0.092903);
        
        console.log('✅ AI SUCCESS! Base Area:', baseSqFt, 'sq ft');
        console.log('✅ Buffered Area (10% waste):', bufferedSqFt, 'sq ft (', bufferedSqM, 'm²)');
        
        // FORCE UPDATE STATE with buffered value
        setTotalSqft(bufferedSqFt);
        setIsCalculationDone(true);
        setIsMeasurementComplete(true);
        
        // FORCE MAP TO WAKE UP
        if (mapInstanceRef.current) {
          window.google.maps.event.trigger(mapInstanceRef.current, "resize");
          console.log('🔄 Map resize triggered');
        }
        
        // Draw the box
        if (data.boundingBox) {
          const box = data.boundingBox;
          
          // 1. Calculate the EXACT center of the Solar Box
          const centerLat = (box.sw.latitude + box.ne.latitude) / 2;
          const centerLng = (box.sw.longitude + box.ne.longitude) / 2;
          const calculatedCenter = { lat: centerLat, lng: centerLng };
          console.log('🎯 Solar Center Calculated:', calculatedCenter);
          
          // 2. Draw the Green Polygon coordinates (store for later)
          const boxCoords = [
            { lat: box.sw.latitude, lng: box.sw.longitude },
            { lat: box.ne.latitude, lng: box.sw.longitude },
            { lat: box.ne.latitude, lng: box.ne.longitude },
            { lat: box.sw.latitude, lng: box.ne.longitude }
          ];
          
          // CRITICAL FIX: Save coordinates to state for RoofVisualizer
          setPolygonCoordinates(boxCoords);
          
          // CRITICAL FIX: Snap camera to the roof center
          setMapCenter(calculatedCenter);
          
          // SAVE THE COORDINATES & TRIGGER RE-MOUNT
          setSolarCenter({ ...calculatedCenter, boxCoords });
          
          console.log('✅ Solar coordinates saved - Map will re-mount');
          console.log('✅ Polygon coordinates set:', boxCoords.length, 'points');
          console.log('✅ Map center snapped to:', calculatedCenter);
        }
      } else {
        console.warn('⚠️ No solar potential found for this building.');
        alert('AI could not measure this specific roof. Please enter square footage manually.');
      }
    } catch (error) {
      console.error('💥 CRITICAL FETCH ERROR:', error);
      alert('System Error: ' + error.message);
    }
  };

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
      setMapZoom(21);

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

      // Check if user is authenticated (only if needed for roofer flow)
      let isRoofer = false;
      let currentUser = null;
      try {
        currentUser = await base44.auth.me();
        isRoofer = currentUser?.aroof_role === 'external_roofer';
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
            setMapZoom(21);
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
      // CRITICAL: Check for auth token FIRST to prevent 401 errors
      const token = localStorage.getItem('sb-access-token') || localStorage.getItem('token');
      
      if (!token) {
        console.log('👤 Guest mode: Skipping user fetch to prevent 401 errors');
        return;
      }
      
      // Only proceed if we have a token
      try {
        const user = await base44.auth.me();
        console.log('👤 USER CHECK:');
        console.log('  Email:', user?.email);
        console.log('  aroof_role:', user?.aroof_role);
        
        // If roofer AND no leadId in URL/session, redirect to dashboard
        if (user && user.aroof_role === 'external_roofer') {
          const urlParams = new URLSearchParams(window.location.search);
          const hasLeadId = urlParams.get('leadId') || sessionStorage.getItem('active_lead_id');
          
          if (!hasLeadId) {
            console.log('⚠️ No lead ID found, redirecting to dashboard');
            navigate(createPageUrl("RooferDashboard"));
            return;
          }
        }
      } catch (err) {
        console.log('👤 Auth check failed (homeowner flow)');
      }
    };
    checkPublicAccess();
  }, [navigate, searchParams]);

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
            setCurrentZoom(21);
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

    // Decide which center to use - prioritize solarCenter
    let finalCenter = center;
    let useZoom = 21;
    
    if (solarCenter) {
      console.log('🌟 Initializing NEW MAP with Solar Center:', solarCenter);
      finalCenter = { lat: solarCenter.lat, lng: solarCenter.lng };
      useZoom = 19; // Use safe zoom 19 for Solar
    }

    // If map already exists, update its center instead of recreating
    if (mapInstanceRef.current && !solarCenter) {
      console.log("🔄 Map exists - Updating center AND marker to:", finalCenter);
      
      // 1. Move the Camera
      mapInstanceRef.current.setCenter(finalCenter);
      mapInstanceRef.current.setZoom(useZoom);
      
      // 2. Move the Red Dot (Marker)
      if (markerRef.current) {
        markerRef.current.setPosition(finalCenter);
      } else {
        // If marker doesn't exist for some reason, create it
        markerRef.current = new window.google.maps.Marker({
          position: finalCenter,
          map: mapInstanceRef.current,
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
      }
      
      setMapLoading(false);
      return;
    }

    try {
      console.log("✅ Creating Google Map with center:", finalCenter);

      // Memoized map options to prevent reset on re-render
      const mapOptions = {
        center: finalCenter,
        zoom: useZoom,         // Use calculated zoom (19 for Solar, 21 otherwise)
        minZoom: 18,
        maxZoom: 25,           // Allow maximum possible detail
        mapTypeId: "hybrid",   // Satellite + Labels
        tilt: 0,               // ALWAYS start top-down
        heading: 0,            // ALWAYS start facing North
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
        rotateControl: true,   // Allow user to rotate map
        scaleControl: true
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);

      mapInstanceRef.current = map;
      setMapInstance(map);
      console.log("✅ Map instance created and stored in state");
      
      // Safe "Unlock" Listener - waits for map to finish loading address BEFORE applying zoom rules
      map.addListener('idle', () => {
        const currentMax = map.get('maxZoom');
        if (currentMax !== 25) {
          console.log('✅ Map is idle/ready. Safely unlocking maxZoom to 25.');
          map.setOptions({ maxZoom: 25 });
        }
      });
      
      window.google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
        console.log("✅ Map tiles loaded!");
        setMapLoading(false);
        setMapError("");
      });

      window.google.maps.event.addListener(map, 'zoom_changed', () => {
        setCurrentZoom(map.getZoom());
      });

      window.google.maps.event.addListener(map, 'heading_changed', () => {
        setMapHeading(map.getHeading() || 0);
      });

      markerRef.current = new window.google.maps.Marker({
        position: finalCenter,
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

      // ALWAYS RENDER POLYGON IF COORDINATES EXIST (Fix #4)
      const coordsToRender = solarCenter?.boxCoords || polygonCoordinates;
      
      if (coordsToRender && coordsToRender.length > 2) {
        console.log('🎨 FORCE RENDERING GREEN POLYGON:', coordsToRender.length, 'points');
        solarPolygonRef.current = new window.google.maps.Polygon({
          paths: coordsToRender,
          strokeColor: '#00FF00',  // BRIGHT GREEN - maximum visibility
          strokeOpacity: 1.0,       // Full opacity
          strokeWeight: 3,
          fillColor: '#00FF00',
          fillOpacity: 0.35,
          map: map,
          zIndex: 1000,            // VERY HIGH z-index
          clickable: false         // Don't interfere with drawing
        });
        console.log('✅ GREEN POLYGON FORCED TO RENDER - Should be visible now!');
      } else {
        console.warn('⚠️ No coordinates available for polygon rendering');
      }

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
      }, [address, solarCenter]);

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

  // Manual Script Injection (Robust Fallback) - SIMPLIFIED
  useEffect(() => {
    console.log("🚀 Manual Google Maps script loader starting");

    // Check if already loaded
    if (window.google?.maps?.drawing && window.google?.maps?.geometry) {
      console.log("✅ Google Maps already exists - using it");
      if (!scriptLoadedRef.current) {
        scriptLoadedRef.current = true;
        setMapScriptLoaded(true);
      }
      return;
    }
    
    // Check if script already exists
    const existingScript = document.getElementById('google-map-script');
    if (existingScript) {
      console.log("⏳ Script tag exists, waiting for Google Maps API...");
      
      // Simple polling with extended timeout
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        if (window.google?.maps?.drawing && window.google?.maps?.geometry) {
          clearInterval(checkInterval);
          console.log("✅ Google Maps API ready after", elapsed, "ms");
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
          setMapError("");
        } else if (elapsed > 60000) {
          clearInterval(checkInterval);
          console.error("❌ Timeout after 60 seconds");
          setMapError("Google Maps failed to load. Click Retry below.");
          setMapLoading(false);
        }
      }, 500);
      
      return () => clearInterval(checkInterval);
    }

    // Create new script
    console.log("📥 Injecting Google Maps script...");
    const script = document.createElement('script');
    script.id = 'google-map-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("✅ Script loaded, waiting for API initialization...");
      
      // Wait for API to become available
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        if (window.google?.maps?.drawing && window.google?.maps?.geometry) {
          clearInterval(checkInterval);
          console.log("✅ Google Maps API ready after", elapsed, "ms");
          scriptLoadedRef.current = true;
          setMapScriptLoaded(true);
          setMapError("");
        } else if (elapsed > 60000) {
          clearInterval(checkInterval);
          console.error("❌ API initialization timeout");
          setMapError("Google Maps API failed to initialize. Click Retry.");
          setMapLoading(false);
        }
      }, 500);
    };
    
    script.onerror = () => {
      console.error("❌ Script failed to load");
      setMapError("Failed to load Google Maps. Check your connection and click Retry.");
      setMapLoading(false);
    };
    
    document.head.appendChild(script);
    console.log("📥 Script injected into DOM");
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
    
    // Add delay to ensure new div is ready after tab switch
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [mapScriptLoaded, address, coordinates, measurementMode]); // Removed initializeMap from dependencies to prevent re-init

  // Removed auto-fetch - now handled directly in handleChooseQuickEstimate

  const handleRetryMap = () => {
    console.log('🔄 Retrying map load - forcing re-render...');
    
    // Reset all error states
    setMapError("");
    setMapLoading(true);
    initAttemptRef.current = 0;
    
    // Clear existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
      setMapInstance(null);
    }
    
    // Force re-mount by toggling key state
    setRetryCount(prev => prev + 1);
    
    // Re-initialize map after clearing
    if (mapScriptLoaded && coordinates) {
      setTimeout(() => initializeMap(), 500);
    }
  };

  const startDrawingOnLiveMap = useCallback(() => {
    if (!drawingManagerRef.current) {
      setError("Drawing tool not ready");
      return;
    }
    
    // Clear Solar API polygon when switching to manual mode
    if (solarPolygonRef.current) {
      solarPolygonRef.current.setMap(null);
      solarPolygonRef.current = null;
    }
    
    // FORCE TOP-DOWN VIEW FOR ACCURACY (Fix parallax issue)
    if (mapInstanceRef.current) {
      console.log('📏 Drawing started - Forcing 2D View for accuracy');
      mapInstanceRef.current.setTilt(0);    // Reset Tilt to 0 (Top down)
      mapInstanceRef.current.setHeading(0); // Reset Rotation to North
      
      // Wait for the snap animation, then enable drawing and restore polygons
      setTimeout(() => {
        setIsDrawing(true);
        setError("");
        drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
        
        // Ensure all polygons are visible again
        if (polygonsRef.current) {
          polygonsRef.current.forEach(poly => {
            poly.setOptions({ 
              strokeOpacity: 1.0, 
              fillOpacity: 0.35,
              clickable: true
            });
          });
        }
      }, 300);
    } else {
      setIsDrawing(true);
      setError("");
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    }
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
    if (mapZoom < 25) {
      const newZoom = mapZoom + 1;
      setMapZoom(newZoom);
      
      if (mapInstanceRef.current) {
        // "Just in Time" Unlock - Safe because user triggered it
        mapInstanceRef.current.setOptions({ maxZoom: 25 });
        mapInstanceRef.current.setZoom(newZoom);
        console.log('🔍 Zooming to:', newZoom);
      }
    }
  }, [mapZoom]);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom > 18) mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (mapInstanceRef.current && coordinates) {
      console.log('🔒 HARD LOCK: Forcing 2D View...');
      
      // Temporarily clear tilt listeners to prevent fighting
      window.google.maps.event.clearListeners(mapInstanceRef.current, 'tilt_changed');
      window.google.maps.event.clearListeners(mapInstanceRef.current, 'heading_changed');
      
      // Force 2D mode - set tilt and heading to 0
      mapInstanceRef.current.setTilt(0);
      mapInstanceRef.current.setHeading(0);
      mapInstanceRef.current.setZoom(21);
      mapInstanceRef.current.setCenter(coordinates);
      
      // Ensure polygons are visible after reset
      if (polygonsRef.current && polygonsRef.current.length > 0) {
        polygonsRef.current.forEach(poly => {
          if (poly && poly.setOptions) {
            poly.setOptions({ 
              strokeOpacity: 1.0, 
              fillOpacity: 0.35,
              clickable: true
            });
          }
        });
      }
      
      // Re-attach listeners after 500ms
      setTimeout(() => {
        if (!mapInstanceRef.current) return;
        
        const handleViewChange = () => {
          const tilt = mapInstanceRef.current.getTilt() || 0;
          const heading = mapInstanceRef.current.getHeading() || 0;
          const is3D = tilt > 0 || heading !== 0;
          
          setIsInspectionMode(is3D);
          
          if (polygonsRef.current && polygonsRef.current.length > 0) {
            polygonsRef.current.forEach(poly => {
              if (poly && poly.setOptions) {
                poly.setOptions({ 
                  strokeOpacity: is3D ? 0.0 : 1.0, 
                  fillOpacity: is3D ? 0.0 : 0.35,
                  clickable: !is3D
                });
              }
            });
          }
        };
        
        mapInstanceRef.current.addListener('tilt_changed', handleViewChange);
        mapInstanceRef.current.addListener('heading_changed', handleViewChange);
        
        console.log('✅ View listeners re-attached');
      }, 500);
    }
  }, [coordinates]);

  const handleOptimalZoom = useCallback(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.setZoom(21);
  }, []);

  const handleRotateLeft = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentHeading = mapInstanceRef.current.getHeading() || 0;
      mapInstanceRef.current.setHeading(currentHeading - 90);
    }
  }, []);

  const handleRotateRight = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentHeading = mapInstanceRef.current.getHeading() || 0;
      mapInstanceRef.current.setHeading(currentHeading + 90);
    }
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

  // Smart View Manager: Hides drawings during 3D rotation to prevent visual errors
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleViewChange = () => {
      const tilt = mapInstanceRef.current.getTilt() || 0;
      const heading = mapInstanceRef.current.getHeading() || 0;
      const is3D = tilt > 0 || heading !== 0;

      // Update inspection mode state
      setIsInspectionMode(is3D);

      // Get all polygons and adjust visibility
      if (polygonsRef.current && polygonsRef.current.length > 0) {
        polygonsRef.current.forEach(poly => {
          if (poly && poly.setOptions) {
            // Fade out in 3D, Show fully in 2D
            poly.setOptions({ 
              strokeOpacity: is3D ? 0.0 : 1.0, 
              fillOpacity: is3D ? 0.0 : 0.35,
              clickable: !is3D // Disable clicking in 3D to prevent errors
            });
          }
        });
      }
    };

    const listeners = [
      mapInstanceRef.current.addListener('tilt_changed', handleViewChange),
      mapInstanceRef.current.addListener('heading_changed', handleViewChange)
    ];

    return () => listeners.forEach(l => window.google.maps.event.removeListener(l));
  }, []); // Empty dependency array - only set up listeners once

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

  const handleChooseQuickEstimate = async () => {
    setMeasurementMode('quick');
    setHasChosenMethod(true);
    setQuickEstimateLoading(true);

    // Auto-start calculation immediately
    if (coordinates) {
      await handleQuickEstimate();
    } else {
      setError("Waiting for address location...");
    }
  };

  const handleChooseDetailed = () => {
    setMeasurementMode('detailed');
    setHasChosenMethod(true);
  };

  const handleQuickEstimate = async () => {
    setQuickEstimateLoading(true);
    setError("");

    try {
      console.log('🔍 Calling Google Solar API...');
      
      if (!coordinates) {
        setError("Waiting for address location...");
        setQuickEstimateLoading(false);
        return;
      }
      
      const solarApiUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${coordinates.lat}&location.longitude=${coordinates.lng}&requiredQuality=HIGH&key=AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc`;
      
      const response = await fetch(solarApiUrl);
      
      if (!response.ok) {
        setError("Solar API failed. Using estimated calculation.");
        const estimatedArea = 2000;
        setTotalSqft(estimatedArea);
        setIsCalculationDone(true);
        setIsMeasurementComplete(false);
        setQuickEstimateLoading(false);
        return;
      }
      
      const data = await response.json();
      const roofAreaM2 = data.solarPotential?.wholeRoofStats?.areaMeters2;
      
      if (!roofAreaM2 || roofAreaM2 <= 0) {
        setError("Could not calculate roof area. Try Detailed Measurement.");
        setQuickEstimateLoading(false);
        return;
      }
      
      const baseSqft = Math.round(roofAreaM2 * 10.7639);
      
      // Add 10% waste buffer
      const bufferedSqFt = Math.round(baseSqft * 1.10);
      const bufferedSqM = Math.round(bufferedSqFt * 0.092903);
      
      console.log('✅ Solar API success - Base:', baseSqft, 'sq ft');
      console.log('✅ Buffered (10% waste):', bufferedSqFt, 'sq ft (', bufferedSqM, 'm²)');
      
      // Extract bounding box for polygon
      if (data.boundingBox) {
        const box = data.boundingBox;
        const centerLat = (box.sw.latitude + box.ne.latitude) / 2;
        const centerLng = (box.sw.longitude + box.ne.longitude) / 2;
        const calculatedCenter = { lat: centerLat, lng: centerLng };
        
        const boxCoords = [
          { lat: box.sw.latitude, lng: box.sw.longitude },
          { lat: box.ne.latitude, lng: box.sw.longitude },
          { lat: box.ne.latitude, lng: box.ne.longitude },
          { lat: box.sw.latitude, lng: box.ne.longitude }
        ];
        
        // CRITICAL FIX: Save coordinates to state for RoofVisualizer
        setPolygonCoordinates(boxCoords);
        
        // CRITICAL FIX: Snap camera to the roof center
        setMapCenter(calculatedCenter);
        
        // Save coordinates for map to render polygon
        setSolarCenter({ ...calculatedCenter, boxCoords });
        
        console.log('✅ Quick Estimate polygon coordinates set:', boxCoords.length, 'points');
        console.log('✅ Map center snapped to:', calculatedCenter);
      }
      
      // Set the buffered area and mark as done
      setTotalSqft(bufferedSqFt);
      setIsCalculationDone(true);
      setIsMeasurementComplete(false); // NOT complete yet - user needs to click "Complete"
      setQuickEstimateLoading(false);
      
      // Create temporary measurement record (without contact info)
      const measurementData = {
        property_address: address,
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null,
        user_type: 'homeowner',
        measurement_type: 'quick_estimate',
        estimation_method: 'solar_api',
        total_sqft: bufferedSqFt,
        total_adjusted_sqft: bufferedSqFt,
        lead_status: 'potential',
        contact_info_provided: false
      };
      
      const savedMeasurement = await base44.entities.Measurement.create(measurementData);
      setMeasurementId(savedMeasurement.id);
      console.log('✅ Measurement record created:', savedMeasurement.id);
      
    } catch (err) {
      console.error('❌ Quick estimate error:', err);
      setError('Failed to calculate roof area. Please try Detailed Measurement.');
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

        // Roofer flow - go directly to results (skip contact info)
        console.log('🟡 Navigating to Results page');
        navigate(`/results?id=${leadId}`);

      } else if (isRoofer && !leadId) {
        console.log('⚠️ Roofer without lead ID - redirecting to dashboard');
        alert('Please start from dashboard to measure roofs');
        navigate('/rooferdashboard');
        
      } else {
        // Homeowner flow - save measurement and stay on page
        console.log('👤 HOMEOWNER PATH: Creating new measurement');

        const measurementData = {
            company_id: null,
            user_id: null,
            property_address: address,
            latitude: coordinates?.lat || null,
            longitude: coordinates?.lng || null,
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

        const savedMeasurement = await base44.entities.Measurement.create(measurementData);

        // Redirect to contact info for homeowners
        navigate(createPageUrl(`ContactInfoPage?id=${savedMeasurement.id}`));
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
    if (currentZoom >= 23) {
      return { type: 'success', message: 'Maximum detail - excellent!', icon: '✓✓' };
    } else if (currentZoom >= 21) {
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
    <>
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
            <Link to={createPageUrl("Homepage")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* METHOD CHOICE SCREEN - Show FIRST, before map */}
      {!hasChosenMethod && !leadData && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Measure Your Roof</h1>
              <div className="flex items-center justify-center gap-2 text-lg text-slate-600 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{address}</span>
              </div>
            </div>

            {/* STUDIO BUTTON - AI Preview */}
            <div className="mb-8 text-center">
              <Button
                onClick={() => setIsDesignMode(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white h-16 px-8 text-lg font-bold shadow-xl"
              >
                <Palette className="w-6 h-6 mr-2" />
                ✨ See Your Home with New Roof (AI Preview)
              </Button>
              <p className="text-sm text-slate-500 mt-2">
                Optional - Preview different roof styles before measuring
              </p>
            </div>

            <div className="text-center mb-4">
              <p className="text-slate-600 font-semibold">Choose your measurement method:</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* QUICK ESTIMATE CARD */}
              <Card className="border-4 border-green-300 hover:border-green-500 transition-all hover:shadow-2xl cursor-pointer group"
                    onClick={handleChooseQuickEstimate}>
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Zap className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Quick Estimate</h2>
                    <p className="text-lg font-semibold text-green-600 mb-6">60 Seconds</p>
                    
                    <div className="space-y-3 text-left mb-8">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Instant AI-powered results</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Building footprint analysis</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">±10% accuracy</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Perfect for initial estimates</span>
                      </div>
                    </div>

                    <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-bold">
                      <Zap className="w-5 h-5 mr-2" />
                      Get Quick Estimate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* DETAILED MEASUREMENT CARD */}
              <Card className="border-4 border-blue-300 hover:border-blue-500 transition-all hover:shadow-2xl cursor-pointer group"
                    onClick={handleChooseDetailed}>
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Edit3 className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Detailed Measurement</h2>
                    <p className="text-lg font-semibold text-blue-600 mb-6">3 Minutes</p>
                    
                    <div className="space-y-3 text-left mb-8">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Draw exact roof perimeter</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Satellite precision mapping</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">±2% accuracy</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Best for final quotes</span>
                      </div>
                    </div>

                    <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold">
                      <Edit3 className="w-5 h-5 mr-2" />
                      Start Drawing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-slate-500 text-sm">
              Not sure? Start with Quick Estimate - you can always get a detailed measurement later.
            </p>
          </div>
        </div>
      )}

      {/* MEASUREMENT INTERFACE - Show AFTER method choice */}
      {hasChosenMethod && (
      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {measurementMode === 'quick' ? '⚡ Quick Estimate' : '📐 Detailed Measurement'}
                </h2>
                <p className="text-sm text-slate-600">
                  {measurementMode === 'quick' ? 'AI-powered instant results' : 'Draw precise roof sections'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHasChosenMethod(false);
                  setMeasurementMode(null);
                }}
                className="text-slate-600"
              >
                Change
              </Button>
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
              {isDesignMode ? (
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Palette className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-900">AI Design Studio Active</h3>
                  <p className="text-sm text-purple-700">
                    Visualize different materials and colors on your roof. Changes are temporary and won't affect measurements.
                  </p>
                  <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 text-left">
                    <p className="text-xs text-purple-900 mb-2">
                      <strong>How to use:</strong>
                    </p>
                    <ul className="text-xs text-purple-800 space-y-1">
                      <li>• Select material type from the panel</li>
                      <li>• Choose your preferred color</li>
                      <li>• Adjust opacity to see through</li>
                      <li>• Click "Save Design" when done</li>
                    </ul>
                  </div>
                </div>
              </Card>
            ) : measurementMode === 'quick' ? (
              /* QUICK ESTIMATE MODE - AUTO CALCULATING */
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    {quickEstimateLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    ) : isCalculationDone ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <Zap className="w-8 h-8 text-green-600" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-green-900">
                    {quickEstimateLoading ? 'Analyzing Your Roof...' : 
                     isCalculationDone ? 'Quick Estimate Complete!' : 
                     'Quick Estimate'}
                  </h3>

                  {quickEstimateLoading ? (
                    <>
                      <p className="text-sm text-green-700">
                        Using AI satellite analysis to calculate roof area...
                      </p>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left">
                        <p className="text-xs text-blue-900">
                          <strong>What's happening:</strong>
                        </p>
                        <ul className="text-xs text-blue-800 space-y-1 mt-2">
                          <li>• Accessing Google Solar API</li>
                          <li>• Analyzing building footprint</li>
                          <li>• Calculating roof area</li>
                          <li>• Drawing polygon on map</li>
                        </ul>
                      </div>
                    </>
                  ) : isCalculationDone ? (
                    <>
                      <div className="bg-white border-2 border-green-300 rounded-xl p-6">
                        <p className="text-sm text-green-700 mb-2">Estimated Roof Area (with 10% waste)</p>
                        <p className="text-5xl font-bold text-green-900 mb-1">
                          {totalSqft?.toLocaleString()}
                        </p>
                        <p className="text-xl text-green-700">square feet</p>
                        <p className="text-sm text-green-600 mt-2">
                          ({Math.round(totalSqft * 0.092903).toLocaleString()} m²)
                        </p>
                      </div>
                      
                      <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-left">
                        <p className="text-sm text-green-900">
                          <strong>✅ Green polygon visible on map</strong>
                        </p>
                        <p className="text-xs text-green-800 mt-2">
                          The highlighted area shows your roof boundary calculated by AI
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Button
                          onClick={() => setIsDesignMode(true)}
                          className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                        >
                          <Palette className="w-5 h-5 mr-2" />
                          ✨ See Your Home with New Roof
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setMeasurementMode('detailed');
                            setIsCalculationDone(false);
                          }}
                          variant="outline"
                          className="w-full h-12 border-2 border-blue-600 text-blue-600"
                        >
                          📐 Switch to Detailed Measurement
                        </Button>
                        
                        <Button
                          onClick={async () => {
                            navigate(createPageUrl(`ContactInfoPage?id=${measurementId}`));
                          }}
                          className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-lg font-bold"
                        >
                          <CheckCircle className="w-6 h-6 mr-2" />
                          Complete & Get Full Results
                        </Button>
                      </div>
                    </>
                  ) : null}
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
                        <div>✅ <strong>Zoom in closer</strong> (level 21-25) for highest resolution</div>
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
                      currentZoom >= 23 ? 'bg-green-50 text-green-800' :
                      currentZoom >= 21 ? 'bg-green-50 text-green-800' :
                      currentZoom >= 20 ? 'bg-blue-50 text-blue-800' :
                      'bg-yellow-50 text-yellow-800'
                    }`}>
                      {currentZoom >= 23 ? (
                        <div>✅✅ <strong>Maximum detail!</strong> This is the highest resolution available.</div>
                      ) : currentZoom >= 21 ? (
                        <div>✅ <strong>Perfect zoom!</strong> Can zoom to 25 for even more detail.</div>
                      ) : currentZoom >= 20 ? (
                        <div>✓ <strong>Good zoom level</strong> for measurements.</div>
                      ) : (
                        <div>🔍 <strong>Tip:</strong> Zoom in closer (21-25) for better detail and accuracy.</div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleZoomOut} disabled={currentZoom <= 18} className="flex-1">
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleOptimalZoom} className="flex-1">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleZoomIn} disabled={currentZoom >= 25} className="flex-1">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button size="sm" variant="outline" onClick={handleResetZoom} className="w-full">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset View
                    </Button>
                  </div>
                </Card>

                <Card className="p-3 bg-white border-2 border-slate-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                      <span className="text-xs font-bold text-slate-700">🧭 Rotate Map</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {Math.round(mapHeading)}°
                      </span>
                    </div>

                    <div className="p-2 rounded text-xs bg-blue-50 text-blue-800">
                      <div>💡 <strong>Tip:</strong> Rotate the map to see under trees from different angles</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleRotateLeft} className="flex-1">
                        ↺ Rotate Left
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleRotateRight} className="flex-1">
                        ↻ Rotate Right
                      </Button>
                    </div>
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

        <div className="flex-1 relative overflow-hidden">
          {/* Inspection Mode Badge */}
          {isInspectionMode && measurementMode === 'detailed' && !isDrawingMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-full text-sm shadow-lg font-semibold animate-pulse">
              👀 Inspection Mode - Drawings Hidden
            </div>
          )}

          {/* MAP - ALWAYS RENDERED AS BACKGROUND (z-0) */}
          <div className="absolute inset-0 z-0">
                {mapError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                    <div className="text-6xl mb-4">⚠️</div>
                    <div className="text-red-400 text-2xl font-bold mb-3">
                      Google Maps Failed to Load
                    </div>
                    <div className="text-slate-400 text-sm mb-6 text-center max-w-md">
                      There was an error loading the map. This may be due to network issues or API configuration.
                    </div>
                    <Button
                      onClick={handleRetryMap}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Retry Loading Map
                    </Button>
                  </div>
                ) : (
                  <>
                    <div 
                      ref={mapRef} 
                      className="w-full h-full"
                    />
                    {mapLoading && (
                      <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-10">
                        <Loader2 className="w-16 h-16 animate-spin text-blue-400 mb-4" />
                        <p className="text-xl font-semibold text-white">{geocodingStatus}</p>
                      </div>
                    )}
                  </>
                )}
          </div>

          {/* UI OVERLAYS - CONDITIONAL BASED ON MODE */}
          {measurementMode === 'quick' ? (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-6">
                {!totalSqft && (
                  <Card className="max-w-2xl w-full bg-white/95 backdrop-blur-sm shadow-2xl pointer-events-auto">
                    <CardContent className="p-12 text-center">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-12 h-12 text-green-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-4">Quick Roof Estimate</h2>
                      <p className="text-lg text-slate-600 mb-6">
                        AI is analyzing your roof from satellite data...
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
                      <div className="mt-6 flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <p className="text-sm text-slate-600">
                          Waiting for AI measurement...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : !isDrawingMode ? (
            <div className="absolute top-6 left-6 right-6 z-20 pointer-events-none">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm pointer-events-auto">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛰️</span>
                  <span className="font-bold text-lg">Live Satellite View</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 pointer-events-none">
              <div className="pointer-events-auto" style={{
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
                className="pointer-events-auto"
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

          {/* Roof Visualizer Overlay */}
          {isDesignMode && mapInstance && (
            <RoofVisualizer
              mapInstance={mapInstance}
              roofPolygon={solarPolygonRef.current}
              polygonsArray={polygonsRef.current}
              polygonCoordinates={polygonCoordinates}
              isMeasurementComplete={isMeasurementComplete}
              totalSqft={totalSqft}
              onClose={() => setIsDesignMode(false)}
              onSaveDesign={(designData) => setSavedDesign(designData)}
            />
          )}
          
          {/* Design Summary Card */}
          {savedDesign && !isDesignMode && (
            <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
              <Card className="bg-white/95 backdrop-blur-xl border-2 border-purple-300 shadow-2xl pointer-events-auto">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Palette className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Saved Design</h3>
                        <p className="text-xs text-slate-600">Your roof visualization preferences</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSavedDesign(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-600 mb-1">Material</p>
                      <p className="text-base font-bold text-slate-900">{savedDesign.material}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-600 mb-1">Color</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: savedDesign.colorHex }}
                        />
                        <p className="text-base font-bold text-slate-900">{savedDesign.color}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsDesignMode(true)}
                      className="flex-1"
                    >
                      Edit Design
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

    </div>
    </>
  );
}