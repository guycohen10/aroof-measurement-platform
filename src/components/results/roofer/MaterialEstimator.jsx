import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Package, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MaterialEstimator({ totalArea }) {
  const [roofConditions, setRoofConditions] = useState({
    valleys: false,
    steepPitch: false,
    multipleStories: false,
    chimneySkylights: false
  });

  const wasteArea = Math.round(totalArea * 1.10);
  const shingles3Tab = Math.ceil(wasteArea / 33.3);
  const shinglesArchitectural = Math.ceil(wasteArea / 32);
  const underlayment = Math.ceil(wasteArea / 400);
  const ridgeCap = Math.round(totalArea * 0.15); // Estimate ridge length
  const starterStrip = ridgeCap;

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="text-xl flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" />
          Material Quantity Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 lg:p-8">
        <div className="space-y-6">
          {/* Material Quantities Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Material</TableHead>
                  <TableHead className="font-bold text-right">Quantity</TableHead>
                  <TableHead className="font-bold">Unit</TableHead>
                  <TableHead className="text-sm text-slate-600">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Base Roof Area</TableCell>
                  <TableCell className="text-right font-bold">{totalArea.toLocaleString()}</TableCell>
                  <TableCell>sq ft</TableCell>
                  <TableCell className="text-sm text-slate-600">Measured area</TableCell>
                </TableRow>
                <TableRow className="bg-orange-50">
                  <TableCell className="font-medium">With 10% Waste Factor</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">{wasteArea.toLocaleString()}</TableCell>
                  <TableCell>sq ft</TableCell>
                  <TableCell className="text-sm text-slate-600">Order quantity</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">3-Tab Shingles</TableCell>
                  <TableCell className="text-right font-bold">{shingles3Tab}</TableCell>
                  <TableCell>bundles</TableCell>
                  <TableCell className="text-sm text-slate-600">@ 33.3 sq ft/bundle</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Architectural Shingles</TableCell>
                  <TableCell className="text-right font-bold">{shinglesArchitectural}</TableCell>
                  <TableCell>bundles</TableCell>
                  <TableCell className="text-sm text-slate-600">@ 32 sq ft/bundle</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Underlayment</TableCell>
                  <TableCell className="text-right font-bold">{underlayment}</TableCell>
                  <TableCell>rolls</TableCell>
                  <TableCell className="text-sm text-slate-600">@ 400 sq ft/roll</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ridge Cap</TableCell>
                  <TableCell className="text-right font-bold">{ridgeCap}</TableCell>
                  <TableCell>linear ft</TableCell>
                  <TableCell className="text-sm text-slate-600">Estimated ridge length</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Starter Strip</TableCell>
                  <TableCell className="text-right font-bold">{starterStrip}</TableCell>
                  <TableCell>linear ft</TableCell>
                  <TableCell className="text-sm text-slate-600">Perimeter estimate</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Roof Conditions Checklist */}
          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="font-bold text-slate-900 mb-4">Roof Conditions (affects material needs)</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="valleys"
                  checked={roofConditions.valleys}
                  onCheckedChange={(checked) => 
                    setRoofConditions({...roofConditions, valleys: checked})
                  }
                />
                <Label htmlFor="valleys" className="cursor-pointer font-medium">
                  Valleys Present
                  <span className="block text-sm text-slate-600 font-normal">
                    Additional ice & water shield needed
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="steepPitch"
                  checked={roofConditions.steepPitch}
                  onCheckedChange={(checked) => 
                    setRoofConditions({...roofConditions, steepPitch: checked})
                  }
                />
                <Label htmlFor="steepPitch" className="cursor-pointer font-medium">
                  Steep Pitch (6/12 or greater)
                  <span className="block text-sm text-slate-600 font-normal">
                    Additional safety equipment & time required
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="multipleStories"
                  checked={roofConditions.multipleStories}
                  onCheckedChange={(checked) => 
                    setRoofConditions({...roofConditions, multipleStories: checked})
                  }
                />
                <Label htmlFor="multipleStories" className="cursor-pointer font-medium">
                  Multiple Stories
                  <span className="block text-sm text-slate-600 font-normal">
                    Affects tear-off and disposal costs
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="chimneySkylights"
                  checked={roofConditions.chimneySkylights}
                  onCheckedChange={(checked) => 
                    setRoofConditions({...roofConditions, chimneySkylights: checked})
                  }
                />
                <Label htmlFor="chimneySkylights" className="cursor-pointer font-medium">
                  Chimney/Skylights Present
                  <span className="block text-sm text-slate-600 font-normal">
                    Extra flashing materials needed
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-blue-900">
                <p>
                  <strong>Important:</strong> Material quantities are estimates only based on measured roof area.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Always verify measurements on-site before ordering materials</li>
                  <li>Adjust quantities for roof complexity, pitch, and waste</li>
                  <li>Check specific product coverage rates (varies by manufacturer)</li>
                  <li>Order extra materials for complex roofs with many penetrations</li>
                  <li>Consider local building code requirements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* No Pricing Note */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900">
              <strong>Note:</strong> This estimator provides <strong>quantities only</strong>. 
              No pricing information is included. Use these quantities with your supplier's current 
              pricing to prepare accurate estimates for your clients.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}