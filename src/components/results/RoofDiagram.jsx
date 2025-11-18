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
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw 3D isometric roof
    ctx.save();

    // Ridge line (top horizontal)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(400, 180);
    ctx.lineTo(800, 180);
    ctx.stroke();

    // Ridge label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ridge', 600, 160);

    // Draw pointer line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(600, 165);
    ctx.lineTo(600, 180);
    ctx.stroke();

    // Left hip (diagonal)
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(400, 180);
    ctx.lineTo(250, 380);
    ctx.stroke();

    ctx.fillText('Hip', 280, 260);
    ctx.beginPath();
    ctx.moveTo(300, 270);
    ctx.lineTo(315, 270);
    ctx.stroke();

    // Right hip (diagonal)
    ctx.beginPath();
    ctx.moveTo(800, 180);
    ctx.lineTo(950, 380);
    ctx.stroke();

    ctx.fillText('Hip', 920, 260);
    ctx.beginPath();
    ctx.moveTo(900, 270);
    ctx.lineTo(885, 270);
    ctx.stroke();

    // Left roof face
    ctx.fillStyle = 'rgba(234, 88, 12, 0.5)';
    ctx.beginPath();
    ctx.moveTo(400, 180);
    ctx.lineTo(250, 380);
    ctx.lineTo(200, 440);
    ctx.lineTo(600, 440);
    ctx.closePath();
    ctx.fill();

    // Right roof face
    ctx.fillStyle = 'rgba(251, 146, 60, 0.4)';
    ctx.beginPath();
    ctx.moveTo(800, 180);
    ctx.lineTo(600, 440);
    ctx.lineTo(1000, 440);
    ctx.lineTo(950, 380);
    ctx.closePath();
    ctx.fill();

    // Valley (if exists)
    if (valleysFt > 0) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(600, 180);
      ctx.lineTo(600, 440);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillText('Valley', 640, 300);
      ctx.beginPath();
      ctx.moveTo(625, 300);
      ctx.lineTo(600, 300);
      ctx.stroke();
    }

    // Eave (bottom edge)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(200, 440);
    ctx.lineTo(1000, 440);
    ctx.stroke();

    ctx.fillText('Eave', 600, 480);
    ctx.beginPath();
    ctx.moveTo(600, 465);
    ctx.lineTo(600, 440);
    ctx.stroke();

    // Left rake
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(250, 380);
    ctx.lineTo(200, 440);
    ctx.stroke();

    ctx.fillText('Rake', 180, 420);
    ctx.beginPath();
    ctx.moveTo(200, 415);
    ctx.lineTo(220, 405);
    ctx.stroke();

    // Right rake
    ctx.beginPath();
    ctx.moveTo(950, 380);
    ctx.lineTo(1000, 440);
    ctx.stroke();

    ctx.fillText('Rake', 1020, 420);
    ctx.beginPath();
    ctx.moveTo(1000, 415);
    ctx.lineTo(980, 405);
    ctx.stroke();

    // Flashing indication
    if (wallsFt > 0) {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(400, 180);
      ctx.lineTo(400, 230);
      ctx.stroke();

      ctx.fillText('Flashing', 440, 210);
      ctx.beginPath();
      ctx.moveTo(430, 210);
      ctx.lineTo(405, 210);
      ctx.stroke();
    }

    ctx.restore();
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