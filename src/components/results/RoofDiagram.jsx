import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Pencil, Save, X } from "lucide-react";

export default function RoofDiagram({ measurement }) {
  const canvasRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [values, setValues] = useState({
    eaves: measurement?.eaves_ft || 0,
    rakes: measurement?.rakes_ft || 0,
    ridges: measurement?.ridges_ft || 0,
    hips: measurement?.hips_ft || 0,
    valleys: measurement?.valleys_ft || 0,
    steps: measurement?.steps_ft || 0,
    walls: measurement?.walls_ft || 0,
  });

  const eavesFt = values.eaves;
  const rakesFt = values.rakes;
  const ridgesFt = values.ridges;
  const hipsFt = values.hips;
  const valleysFt = values.valleys;
  const stepsFt = values.steps;
  const wallsFt = values.walls;

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Measurement.update(measurement.id, {
        eaves_ft: values.eaves,
        rakes_ft: values.rakes,
        ridges_ft: values.ridges,
        hips_ft: values.hips,
        valleys_ft: values.valleys,
        steps_ft: values.steps,
        walls_ft: values.walls,
      });
      setEditMode(false);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValues({
      eaves: measurement?.eaves_ft || 0,
      rakes: measurement?.rakes_ft || 0,
      ridges: measurement?.ridges_ft || 0,
      hips: measurement?.hips_ft || 0,
      valleys: measurement?.valleys_ft || 0,
      steps: measurement?.steps_ft || 0,
      walls: measurement?.walls_ft || 0,
    });
    setEditMode(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = 1200;
    const h = 600;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Define roof geometry (isometric 3D perspective)
    const roofPoints = {
      topLeft: [320, 150],
      topRight: [880, 150],
      centerTop: [600, 150],
      bottomLeft: [220, 410],
      bottomRight: [980, 410],
      centerBottom: [600, 410],
      valleyTop: [600, 150],
      valleyBottom: [600, 410]
    };

    // LEFT ROOF FACE (darker shade)
    ctx.fillStyle = '#6b7280';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = -5;
    ctx.shadowOffsetY = 5;

    ctx.beginPath();
    ctx.moveTo(...roofPoints.topLeft);
    ctx.lineTo(...roofPoints.bottomLeft);
    ctx.lineTo(...roofPoints.centerBottom);
    ctx.lineTo(...roofPoints.centerTop);
    ctx.closePath();
    ctx.fill();

    // RIGHT ROOF FACE (lighter shade)
    ctx.fillStyle = '#9ca3af';
    ctx.shadowOffsetX = 5;

    ctx.beginPath();
    ctx.moveTo(...roofPoints.centerTop);
    ctx.lineTo(...roofPoints.centerBottom);
    ctx.lineTo(...roofPoints.bottomRight);
    ctx.lineTo(...roofPoints.topRight);
    ctx.closePath();
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // DRAW COMPONENTS WITH BOLD LINES

    // Ridge (top horizontal)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(...roofPoints.topLeft);
    ctx.lineTo(...roofPoints.topRight);
    ctx.stroke();

    // Hips (external diagonals)
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.moveTo(...roofPoints.topLeft);
    ctx.lineTo(...roofPoints.bottomLeft);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(...roofPoints.topRight);
    ctx.lineTo(...roofPoints.bottomRight);
    ctx.stroke();

    // Valley (internal diagonal)
    if (valleysFt > 0) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 8;
      ctx.setLineDash([20, 10]);
      ctx.beginPath();
      ctx.moveTo(...roofPoints.valleyTop);
      ctx.lineTo(...roofPoints.valleyBottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Eave (bottom horizontal)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(...roofPoints.bottomLeft);
    ctx.lineTo(...roofPoints.bottomRight);
    ctx.stroke();

    // Rakes (gable edges)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 7;

    ctx.beginPath();
    ctx.moveTo(...roofPoints.bottomLeft);
    ctx.lineTo(...roofPoints.topLeft);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(...roofPoints.bottomRight);
    ctx.lineTo(...roofPoints.topRight);
    ctx.stroke();

    // LABELS with pointer lines
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 3;

    // Function to draw label with pointer
    function drawLabel(text, x, y, pointerX, pointerY) {
      // Text with outline
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);

      // Pointer line
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + 8);
      ctx.lineTo(pointerX, pointerY);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(pointerY - (y + 8), pointerX - x);
      ctx.beginPath();
      ctx.moveTo(pointerX, pointerY);
      ctx.lineTo(
        pointerX - 12 * Math.cos(angle - Math.PI/6),
        pointerY - 12 * Math.sin(angle - Math.PI/6)
      );
      ctx.lineTo(
        pointerX - 12 * Math.cos(angle + Math.PI/6),
        pointerY - 12 * Math.sin(angle + Math.PI/6)
      );
      ctx.closePath();
      ctx.fillStyle = 'white';
      ctx.fill();
    }

    // Draw all labels
    drawLabel('Ridge', 600, 100, 600, 145);
    drawLabel('Hip', 240, 240, 270, 280);
    drawLabel('Hip', 960, 240, 930, 280);
    if (valleysFt > 0) {
      drawLabel('Valley', 670, 260, 620, 280);
    }
    drawLabel('Eave', 600, 470, 600, 415);
    drawLabel('Rake', 150, 320, 210, 360);
    drawLabel('Rake', 1050, 320, 990, 360);

    // Flashing indication
    if (wallsFt > 0) {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(320, 150);
      ctx.lineTo(320, 200);
      ctx.stroke();

      drawLabel('Flashing', 380, 180, 325, 175);
    }
  }, [eavesFt, rakesFt, ridgesFt, hipsFt, valleysFt, stepsFt, wallsFt]);

  const components = [
    { label: 'Ridge', value: ridgesFt, icon: '⛰️', color: '#f59e0b', description: 'Top horizontal peak' },
    { label: 'Hip', value: hipsFt, icon: '📐', color: '#ec4899', description: 'Diagonal external angle' },
    { label: 'Valley', value: valleysFt, icon: '🏔️', color: '#8b5cf6', description: 'Diagonal internal angle' },
    { label: 'Eave', value: eavesFt, icon: '📏', color: '#10b981', description: 'Lower horizontal edge' },
    { label: 'Rake', value: rakesFt, icon: '📊', color: '#06b6d4', description: 'Gable end edges' },
    { label: 'Flashing', value: wallsFt, icon: '⚡', color: '#eab308', description: 'Wall intersections' },
  ];

  return (
    <Card className="shadow-xl border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              🏗️ Roof Components Diagram
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Illustrated breakdown of your roof's components</p>
          </div>
          {!editMode ? (
            <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Measurements
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm" className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* 3D Diagram */}
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
          borderRadius: '16px',
          padding: '40px 20px',
          marginBottom: '24px'
        }}>
          <canvas
            ref={canvasRef}
            width="1200"
            height="600"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>

        {/* Component Legend */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {components.map(item => {
            const fieldName = item.label.toLowerCase();
            return (
              <div
                key={item.label}
                style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `3px solid ${item.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <span style={{ fontSize: '36px' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>
                    {item.label}
                  </div>
                  {editMode ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={values[fieldName]}
                      onChange={(e) => setValues({ ...values, [fieldName]: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-lg font-bold my-1"
                    />
                  ) : (
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>
                      {item.value.toFixed(2)} ft
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {item.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Linear Feet */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white text-center">
          <p className="text-sm font-semibold mb-1">Total Linear Measurements</p>
          <p className="text-3xl font-bold">
            {(eavesFt + rakesFt + ridgesFt + hipsFt + valleysFt + stepsFt + wallsFt).toFixed(2)} ft
          </p>
        </div>
      </CardContent>
    </Card>
  );
}