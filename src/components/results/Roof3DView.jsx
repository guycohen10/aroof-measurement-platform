import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move } from 'lucide-react';

export default function Roof3DView({ measurement, sections }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: -0.5, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const animationRef = useRef(null);

  useEffect(() => {
    if (!sections || sections.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 800;
    const height = canvas.height = 600;
    
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      
      // Get all coordinates from sections
      const allCoords = [];
      sections.forEach(section => {
        if (section.coordinates && section.coordinates.length > 0) {
          section.coordinates.forEach(coord => {
            allCoords.push({ lat: coord.lat, lng: coord.lng });
          });
        }
      });
      
      if (allCoords.length === 0) return;
      
      // Find bounds
      const minLat = Math.min(...allCoords.map(c => c.lat));
      const maxLat = Math.max(...allCoords.map(c => c.lat));
      const minLng = Math.min(...allCoords.map(c => c.lng));
      const maxLng = Math.max(...allCoords.map(c => c.lng));
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const scale = Math.min(width, height) * 0.0008;
      
      // Project 3D to 2D
      const project = (lat, lng, height = 0) => {
        const x = (lng - centerLng) * scale * 100000;
        const y = (lat - centerLat) * scale * 100000;
        const z = height;
        
        // Rotate around X axis
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;
        
        // Rotate around Y axis
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;
        
        // Perspective projection
        const perspective = 600;
        const scale2d = perspective / (perspective + z2);
        
        return {
          x: width / 2 + x2 * scale2d,
          y: height / 2 - y1 * scale2d
        };
      };
      
      // Draw each section
      sections.forEach((section, idx) => {
        if (!section.coordinates || section.coordinates.length === 0) return;
        
        const color = section.color || '#3b82f6';
        
        // Calculate height based on pitch
        const pitchMultiplier = section.pitch_multiplier || 1;
        const baseHeight = (pitchMultiplier - 1) * 100;
        
        // Draw base (ground level)
        ctx.beginPath();
        section.coordinates.forEach((coord, i) => {
          const p = project(coord.lat, coord.lng, 0);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fillStyle = color + '40';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw roof surface (with height)
        ctx.beginPath();
        section.coordinates.forEach((coord, i) => {
          const p = project(coord.lat, coord.lng, baseHeight);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fillStyle = color + 'aa';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw vertical edges
        ctx.strokeStyle = color + '80';
        ctx.lineWidth = 1.5;
        section.coordinates.forEach(coord => {
          const p1 = project(coord.lat, coord.lng, 0);
          const p2 = project(coord.lat, coord.lng, baseHeight);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });
        
        // Draw section label
        const centerLat = section.coordinates.reduce((sum, c) => sum + c.lat, 0) / section.coordinates.length;
        const centerLng = section.coordinates.reduce((sum, c) => sum + c.lng, 0) / section.coordinates.length;
        const labelPos = project(centerLat, centerLng, baseHeight + 20);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const area = Math.round(section.adjusted_area_sqft || section.flat_area_sqft || 0);
        ctx.fillText(`${section.name || 'Section ' + (idx + 1)}: ${area} sq ft`, labelPos.x, labelPos.y);
      });
      
      // Draw title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('3D Roof Visualization', 20, 30);
      
      // Draw instructions
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Drag to rotate', 20, 55);
    };
    
    render();
    animationRef.current = requestAnimationFrame(render);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sections, rotation]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setRotation(prev => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setRotation({ x: -0.5, y: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ touchAction: 'none' }}
        />
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetView} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset View
        </Button>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-900 rounded-lg text-sm">
          <Move className="w-4 h-4" />
          Drag to rotate in 3D
        </div>
      </div>
    </div>
  );
}