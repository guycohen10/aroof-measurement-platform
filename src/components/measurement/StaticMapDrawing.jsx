import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';

export default function StaticMapDrawing({ coordinates, onSectionComplete, currentColor, isDrawing }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [staticImageUrl, setStaticImageUrl] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Zoom 21 map parameters
  const ZOOM = 21;
  const MAP_WIDTH = 1200;
  const MAP_HEIGHT = 800;
  const SCALE = 2;

  useEffect(() => {
    if (coordinates) {
      const url = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=${ZOOM}&size=${MAP_WIDTH}x${MAP_HEIGHT}&scale=${SCALE}&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
      setStaticImageUrl(url);
      console.log('Generated static image URL:', url);
    }
  }, [coordinates]);

  useEffect(() => {
    if (imageLoaded && canvasRef.current) {
      drawCanvas();
    }
  }, [currentPoints, imageLoaded]);

  const pixelToLatLng = (pixelX, pixelY) => {
    // Convert pixel coordinates to lat/lng
    // At zoom 21, the world is 2^21 * 256 = 536,870,912 pixels wide
    const worldSize = Math.pow(2, ZOOM) * 256;
    
    // Get the center point in world coordinates
    const centerX = lonToX(coordinates.lng, worldSize);
    const centerY = latToY(coordinates.lat, worldSize);
    
    // Calculate pixel offset from center
    const offsetX = pixelX - (MAP_WIDTH / 2);
    const offsetY = pixelY - (MAP_HEIGHT / 2);
    
    // Convert to world coordinates
    const worldX = centerX + offsetX;
    const worldY = centerY + offsetY;
    
    // Convert back to lat/lng
    const lng = xToLon(worldX, worldSize);
    const lat = yToLat(worldY, worldSize);
    
    return { lat, lng };
  };

  const lonToX = (lon, worldSize) => {
    return ((lon + 180) / 360) * worldSize;
  };

  const latToY = (lat, worldSize) => {
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const y = 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
    return y * worldSize;
  };

  const xToLon = (x, worldSize) => {
    return (x / worldSize) * 360 - 180;
  };

  const yToLat = (y, worldSize) => {
    const y2 = 0.5 - y / worldSize;
    return (90 - 360 * Math.atan(Math.exp(-y2 * 2 * Math.PI)) / Math.PI);
  };

  const handleCanvasClick = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const latLng = pixelToLatLng(x, y);
    const newPoints = [...currentPoints, { x, y, lat: latLng.lat, lng: latLng.lng }];
    setCurrentPoints(newPoints);
  };

  const handleDoubleClick = () => {
    if (currentPoints.length >= 3) {
      const coordinates = currentPoints.map(p => ({ lat: p.lat, lng: p.lng }));
      onSectionComplete(coordinates);
      setCurrentPoints([]);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentPoints.length === 0) return;

    // Draw lines
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    ctx.fillStyle = currentColor + '44';

    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
    
    for (let i = 1; i < currentPoints.length; i++) {
      ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
    }
    
    // Close path if more than 2 points
    if (currentPoints.length > 2) {
      ctx.lineTo(currentPoints[0].x, currentPoints[0].y);
      ctx.fill();
    }
    
    ctx.stroke();

    // Draw points
    currentPoints.forEach((point, idx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw point number
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(idx + 1, point.x, point.y - 10);
    });
  };

  const clearCurrentDrawing = () => {
    setCurrentPoints([]);
  };

  return (
    <div className="relative">
      <div className="relative inline-block">
        <img
          ref={imageRef}
          src={staticImageUrl}
          alt="Satellite view"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="block"
          onLoad={() => {
            console.log('Static image loaded');
            setImageLoaded(true);
          }}
          onError={(e) => {
            console.error('Failed to load static image');
          }}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        <canvas
          ref={canvasRef}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="absolute top-0 left-0"
          style={{ 
            cursor: isDrawing ? 'crosshair' : 'default',
            maxWidth: '100%',
            height: 'auto'
          }}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
        />
      </div>

      {isDrawing && currentPoints.length > 0 && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={clearCurrentDrawing}>
            Clear Current
          </Button>
          {currentPoints.length >= 3 && (
            <Button onClick={handleDoubleClick}>
              Complete Section ({currentPoints.length} points)
            </Button>
          )}
        </div>
      )}

      {isDrawing && (
        <div className="mt-2 text-sm text-slate-600">
          Click to add points. Double-click or click "Complete Section" when done (min 3 points).
        </div>
      )}
    </div>
  );
}