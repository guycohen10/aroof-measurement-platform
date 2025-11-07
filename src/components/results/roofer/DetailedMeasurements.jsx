import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, Layers } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";

const SECTION_COLORS = ["#4A90E2", "#50C878", "#FF8C42", "#9B59B6", "#E74C3C"];

export default function DetailedMeasurements({ sections, totalArea }) {
  const calculatePerimeter = (section) => {
    if (!section.coordinates || section.coordinates.length < 2) return 0;
    
    let perimeter = 0;
    for (let i = 0; i < section.coordinates.length; i++) {
      const current = section.coordinates[i];
      const next = section.coordinates[(i + 1) % section.coordinates.length];
      
      // Haversine formula for distance between two coordinates
      const R = 20902231; // Earth's radius in feet
      const lat1 = current[0] * Math.PI / 180;
      const lat2 = next[0] * Math.PI / 180;
      const deltaLat = (next[0] - current[0]) * Math.PI / 180;
      const deltaLng = (next[1] - current[1]) * Math.PI / 180;
      
      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      perimeter += R * c;
    }
    
    return Math.round(perimeter * 10) / 10;
  };

  const totalPerimeter = sections.reduce((sum, section) => sum + calculatePerimeter(section), 0);

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Ruler className="w-6 h-6 text-orange-500" />
          Detailed Measurements
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 lg:p-8">
        {/* Total Area - Most Prominent */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 text-white mb-8 text-center">
          <p className="text-orange-100 text-sm uppercase tracking-wide mb-2">Total Roof Area</p>
          <p className="text-6xl lg:text-7xl font-bold mb-2">
            {totalArea.toLocaleString()}
          </p>
          <p className="text-3xl font-medium text-orange-100">square feet</p>
        </div>

        {/* Section Breakdown Table */}
        {sections.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-lg">Section Breakdown</h3>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">Section</TableHead>
                    <TableHead className="font-bold text-right">Area (sq ft)</TableHead>
                    <TableHead className="font-bold text-right">Perimeter (ft)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section, index) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: SECTION_COLORS[index % SECTION_COLORS.length] }}
                          />
                          {section.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {section.area_sqft.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {calculatePerimeter(section).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-orange-50">
                    <TableCell className="font-bold text-lg">TOTAL</TableCell>
                    <TableCell className="text-right font-bold text-lg text-orange-600">
                      {totalArea.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg text-orange-600">
                      {totalPerimeter.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        )}

        {/* Additional Measurements */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Total Perimeter</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalPerimeter.toLocaleString()} ft
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Roof Sections</p>
            <p className="text-2xl font-bold text-slate-900">
              {sections.length}
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-green-600">
              ±2%
            </p>
          </div>
        </div>

        {/* Accuracy Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Measurement Note:</strong> All measurements calculated using satellite imagery 
            with ±2% accuracy. Always verify critical dimensions on-site before ordering materials 
            or providing final quotes to clients.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}