import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move } from 'lucide-react';

export default function Roof3DView({ measurement, sections }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: -0.5, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!sections || sections.length === 0) {
      console.log("⚠️ No sections for 3D");
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    console.log(`🎨 Rendering ${sections.length} sections in 3D`);
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Sky blue background instead of black
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(0, 0, width, height);
    
    // Add gradient for depth
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0ea5e9');
    gradient.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Get coordinates
    const allCoords = [];
    sections.forEach(section => {
      if (section.coordinates && section.coordinates.length > 0) {
        section.coordinates.forEach(coord => {
          allCoords.push({ lat: coord.lat, lng: coord.lng });
        });
      }
    });
    
    if (allCoords.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No measurement data', width / 2, height / 2);
      return;
    }
    
    const minLat = Math.min(...allCoords.map(c => c.lat));
    const maxLat = Math.max(...allCoords.map(c => c.lat));
    const minLng = Math.min(...allCoords.map(c => c.lng));
    const maxLng = Math.max(...allCoords.map(c => c.lng));
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const scale = Math.min(width, height) * 0.0008;
    
    const project = (lat, lng, height = 0) => {
      const x = (lng - centerLng) * scale * 100000;
      const y = (lat - centerLat) * scale * 100000;
      const z = height;
      
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;
      
      const perspective = 600;
      const scale2d = perspective / (perspective + z2);
      
      return {
        x: width / 2 + x2 * scale2d,
        y: height / 2 - y1 * scale2d,
        z: z2
      };
    };
    
    // Sort sections by z-depth for proper rendering
    const sectionsWithDepth = sections.map(section => {
      const centerLat = section.coordinates.reduce((sum, c) => sum + c.lat, 0) / section.coordinates.length;
      const centerLng = section.coordinates.reduce((sum, c) => sum + c.lng, 0) / section.coordinates.length;
      const pitchMultiplier = section.pitch_multiplier || 1;
      const baseHeight = (pitchMultiplier - 1) * 100;
      const centerProj = project(centerLat, centerLng, baseHeight);
      return { section, depth: centerProj.z };
    });
    
    sectionsWithDepth.sort((a, b) => a.depth - b.depth);
    
    // Draw ground shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    sectionsWithDepth.forEach(({ section, depth }, idx) => {
      if (!section.coordinates || section.coordinates.length === 0) return;
      
      const color = section.color || '#3b82f6';
      const pitchMultiplier = section.pitch_multiplier || 1;
      const baseHeight = (pitchMultiplier - 1) * 100;
      
      // Draw base
      ctx.beginPath();
      section.coordinates.forEach((coord, i) => {
        const p = project(coord.lat, coord.lng, 0);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = color + '30';
      ctx.fill();
      
      // Draw roof surface
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      section.coordinates.forEach((coord, i) => {
        const p = project(coord.lat, coord.lng, baseHeight);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = adjustBrightness(color, -30);
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw vertical edges
      ctx.shadowBlur = 0;
      ctx.strokeStyle = adjustBrightness(color, -20);
      ctx.lineWidth = 2;
      section.coordinates.forEach(coord => {
        const p1 = project(coord.lat, coord.lng, 0);
        const p2 = project(coord.lat, coord.lng, baseHeight);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
      
      // Draw label
      const centerLat = section.coordinates.reduce((sum, c) => sum + c.lat, 0) / section.coordinates.length;
      const centerLng = section.coordinates.reduce((sum, c) => sum + c.lng, 0) / section.coordinates.length;
      const labelPos = project(centerLat, centerLng, baseHeight + 20);
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const area = Math.round(section.adjusted_area_sqft || section.flat_area_sqft || 0);
      ctx.fillText(`${section.name || 'Section ' + (idx + 1)}: ${area} sq ft`, labelPos.x, labelPos.y);
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText('3D Roof Visualization', 20, 35);
    
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#e0e7ff';
    ctx.fillText('Drag to rotate', 20, 60);
    
    console.log("✅ 3D rendering complete");
  }, [sections, rotation]);

  const adjustBrightness = (color, percent) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
  };

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

  if (!sections || sections.length === 0) {
    return (
      <div className="bg-slate-100 rounded-xl p-12 text-center">
        <p className="text-slate-600">Complete measurement to view 3D model</p>
      </div>
    );
  }

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
          style={{ touchAction: 'none', display: 'block' }}
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