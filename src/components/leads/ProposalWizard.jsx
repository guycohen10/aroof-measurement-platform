import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, ArrowRight, ArrowLeft, Sparkles, Download, Mail, Check } from "lucide-react";
import { toast } from "sonner";

export default function ProposalWizard({ lead, onClose, onSave }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  
  // Manual input mode
  const [manualSqft, setManualSqft] = useState('');
  const [manualPitch, setManualPitch] = useState('4/12');
  
  // Step 1: Questionnaire
  const [shingleSystem, setShingleSystem] = useState('GAF Timberline HDZ');
  const [shingleColor, setShingleColor] = useState('Charcoal');
  const [difficulty, setDifficulty] = useState(lead?.pitch_breakdown ? Object.keys(lead.pitch_breakdown)[0] : '4/12');
  const [addOns, setAddOns] = useState({
    pipeBoots: true,
    ridgeVent: true,
    dripEdge: true,
    gutterCleaning: false
  });
  const [pricingModel, setPricingModel] = useState('per_square');
  const [pricePerSquare, setPricePerSquare] = useState(450);
  const [profitMargin, setProfitMargin] = useState(35);
  
  // Step 3: AI Generated Scope
  const [scopeOfWork, setScopeOfWork] = useState('');
  
  // Calculations
  const totalSqft = lead?.total_sqft || lead?.total_adjusted_sqft || parseFloat(manualSqft) || 0;
  const squares = totalSqft / 100;
  
  const calculateTotal = () => {
    let basePrice = 0;
    if (pricingModel === 'per_square') {
      basePrice = squares * pricePerSquare;
    } else {
      // Simplified cost estimate
      const materialCost = squares * 250;
      const laborCost = squares * 150;
      basePrice = (materialCost + laborCost) * (1 + profitMargin / 100);
    }
    
    // Add-ons
    let addOnsTotal = 0;
    if (addOns.pipeBoots) addOnsTotal += 150;
    if (addOns.ridgeVent) addOnsTotal += squares * 15;
    if (addOns.dripEdge) addOnsTotal += 200;
    if (addOns.gutterCleaning) addOnsTotal += 300;
    
    return Math.round(basePrice + addOnsTotal);
  };
  
  const totalPrice = calculateTotal();
  
  const handleGenerateScopeOfWork = async () => {
    setGenerating(true);
    try {
      const prompt = `Write a professional "Scope of Work" for a residential roofing project with these details:

Property: ${lead?.property_address || 'Customer Property'}
Total Area: ${totalSqft.toLocaleString()} square feet (${squares.toFixed(1)} squares)
Roof Pitch: ${difficulty}
Shingle System: ${shingleSystem} - ${shingleColor}
Add-ons: ${Object.entries(addOns).filter(([k,v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1').trim()).join(', ')}

Write 3-4 paragraphs describing:
1. Tear-off and preparation
2. Installation of ${shingleSystem} system
3. Details about add-ons and finishing work
4. Cleanup and final walkthrough

Keep it professional, detailed, and homeowner-friendly. No pricing in the text.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });
      
      setScopeOfWork(response);
      setCurrentStep(4);
    } catch (err) {
      console.error('Error generating scope:', err);
      toast.error('Failed to generate scope of work');
    } finally {
      setGenerating(false);
    }
  };
  
  const handleNext = () => {
    if (currentStep === 1 && totalSqft === 0) {
      toast.error('Please enter square footage');
      return;
    }
    
    if (currentStep === 3) {
      handleGenerateScopeOfWork();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const toggleAddOn = (key) => {
    setAddOns({ ...addOns, [key]: !addOns[key] });
  };
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">📋 Project Details</h3>
        
        {!lead && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Square Footage *</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  value={manualSqft}
                  onChange={(e) => setManualSqft(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2 block">Roof Pitch</Label>
                <select
                  value={manualPitch}
                  onChange={(e) => setManualPitch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="3/12">3/12 (Low)</option>
                  <option value="4/12">4/12 (Standard)</option>
                  <option value="5/12">5/12</option>
                  <option value="6/12">6/12</option>
                  <option value="8/12">8/12 (Steep)</option>
                  <option value="10/12">10/12 (Very Steep)</option>
                  <option value="12/12">12/12 (45°)</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {lead && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-600">Total Area</p>
                <p className="text-2xl font-bold text-blue-600">{totalSqft.toLocaleString()} sqft</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Squares</p>
                <p className="text-2xl font-bold text-blue-600">{squares.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Pitch</p>
                <p className="text-2xl font-bold text-blue-600">{difficulty}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Shingle System</Label>
            <select
              value={shingleSystem}
              onChange={(e) => setShingleSystem(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="GAF Timberline HDZ">GAF Timberline HDZ</option>
              <option value="Owens Corning Duration">Owens Corning Duration</option>
              <option value="CertainTeed Landmark">CertainTeed Landmark</option>
              <option value="GAF Grand Sequoia">GAF Grand Sequoia (Premium)</option>
              <option value="IKO Cambridge">IKO Cambridge</option>
            </select>
          </div>
          
          <div>
            <Label className="mb-2 block">Shingle Color</Label>
            <select
              value={shingleColor}
              onChange={(e) => setShingleColor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="Charcoal">Charcoal</option>
              <option value="Weathered Wood">Weathered Wood</option>
              <option value="Mission Brown">Mission Brown</option>
              <option value="Pewter Gray">Pewter Gray</option>
              <option value="Hickory">Hickory</option>
              <option value="Hunter Green">Hunter Green</option>
            </select>
          </div>
          
          <div>
            <Label className="mb-3 block">Add-Ons & Services</Label>
            <div className="space-y-2">
              {[
                { key: 'pipeBoots', label: 'Replace Pipe Boots', price: '$150' },
                { key: 'ridgeVent', label: 'Install Ridge Vent', price: `$${Math.round(squares * 15)}` },
                { key: 'dripEdge', label: 'Replace Drip Edge', price: '$200' },
                { key: 'gutterCleaning', label: 'Gutter Cleaning', price: '$300' }
              ].map(addon => (
                <label key={addon.key} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addOns[addon.key]}
                    onChange={() => toggleAddOn(addon.key)}
                    className="w-5 h-5"
                  />
                  <span className="flex-1 font-medium text-slate-900">{addon.label}</span>
                  <span className="text-slate-600">{addon.price}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">💰 Pricing Model</h3>
        
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setPricingModel('per_square')}
              className={`p-4 border-2 rounded-lg transition-all ${
                pricingModel === 'per_square'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-slate-900 mb-1">Price Per Square</div>
              <div className="text-sm text-slate-600">Set your rate per 100 sqft</div>
            </button>
            
            <button
              onClick={() => setPricingModel('profit_margin')}
              className={`p-4 border-2 rounded-lg transition-all ${
                pricingModel === 'profit_margin'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-slate-900 mb-1">Profit Margin</div>
              <div className="text-sm text-slate-600">Target margin percentage</div>
            </button>
          </div>
          
          {pricingModel === 'per_square' ? (
            <div>
              <Label className="mb-2 block">Price Per Square (100 sqft)</Label>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">$</span>
                <Input
                  type="number"
                  value={pricePerSquare}
                  onChange={(e) => setPricePerSquare(Number(e.target.value))}
                  className="text-2xl font-bold"
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Industry average: $350-$600 per square
              </p>
            </div>
          ) : (
            <div>
              <Label className="mb-2 block">Target Profit Margin (%)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="20"
                  max="50"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold w-20">{profitMargin}%</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Typical range: 25-40%
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6">
          <div className="text-center">
            <p className="text-sm text-green-700 mb-2">Estimated Total Investment</p>
            <p className="text-5xl font-bold text-green-900">${totalPrice.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-2">
              {squares.toFixed(1)} squares × ${pricingModel === 'per_square' ? pricePerSquare : Math.round(totalPrice/squares)} per square
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Generate Your Proposal</h3>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        Our AI will write a professional scope of work based on your selections
      </p>
      <div className="bg-slate-50 rounded-lg p-6 max-w-lg mx-auto text-left">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Shingle System:</span>
            <span className="font-semibold">{shingleSystem}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Color:</span>
            <span className="font-semibold">{shingleColor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Roof Size:</span>
            <span className="font-semibold">{squares.toFixed(1)} squares</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Add-ons:</span>
            <span className="font-semibold">{Object.values(addOns).filter(v => v).length} selected</span>
          </div>
          <div className="flex justify-between pt-3 border-t">
            <span className="text-slate-600">Total Price:</span>
            <span className="font-bold text-green-600 text-lg">${totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-xl p-8">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">ROOFING PROPOSAL</div>
          <p className="text-blue-200">Professional Estimate</p>
        </div>
      </div>
      
      {lead && (
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="font-bold text-slate-900 mb-3">Property Information</h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-slate-600">Customer:</span> <span className="font-semibold">{lead.customer_name}</span></p>
            <p><span className="text-slate-600">Address:</span> <span className="font-semibold">{lead.property_address}</span></p>
            {lead.customer_phone && <p><span className="text-slate-600">Phone:</span> <span className="font-semibold">{lead.customer_phone}</span></p>}
          </div>
        </div>
      )}
      
      <div>
        <h4 className="font-bold text-slate-900 mb-3">Scope of Work</h4>
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-slate-700 leading-relaxed whitespace-pre-wrap">
          {scopeOfWork}
        </div>
      </div>
      
      <div>
        <h4 className="font-bold text-slate-900 mb-3">Project Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Shingle System</p>
            <p className="font-semibold">{shingleSystem}</p>
            <p className="text-sm text-slate-500">{shingleColor}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Roof Area</p>
            <p className="font-semibold">{totalSqft.toLocaleString()} sqft</p>
            <p className="text-sm text-slate-500">{squares.toFixed(1)} squares</p>
          </div>
        </div>
      </div>
      
      {Object.values(addOns).some(v => v) && (
        <div>
          <h4 className="font-bold text-slate-900 mb-3">Included Services</h4>
          <div className="space-y-2">
            {addOns.pipeBoots && (
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Replace Pipe Boots</span>
              </div>
            )}
            {addOns.ridgeVent && (
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Install Ridge Vent</span>
              </div>
            )}
            {addOns.dripEdge && (
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Replace Drip Edge</span>
              </div>
            )}
            {addOns.gutterCleaning && (
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Gutter Cleaning</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-8">
        <div className="text-center">
          <p className="text-green-700 font-semibold mb-2">Total Project Investment</p>
          <p className="text-6xl font-bold text-green-900 mb-4">${totalPrice.toLocaleString()}</p>
          <p className="text-sm text-green-600">
            Valid for 30 days • Financing available
          </p>
        </div>
      </div>
      
      <div className="text-xs text-slate-500 text-center">
        <p>This estimate is based on the information provided and is subject to site inspection.</p>
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {currentStep === 4 ? '✅ Proposal Ready' : '✨ Proposal Generator'}
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                {lead ? `${lead.customer_name} • ${lead.property_address}` : 'Quick Calculator Mode'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: 'Details' },
              { num: 2, label: 'Pricing' },
              { num: 3, label: 'Generate' },
              { num: 4, label: 'Preview' }
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.num
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.num}
                  </div>
                  <span className="text-xs mt-1 text-slate-600">{step.label}</span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step.num ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>
          
          {/* Navigation */}
          <div className="flex gap-3 justify-between mt-8 pt-6 border-t">
            <div>
              {currentStep > 1 && currentStep < 4 && (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              {currentStep === 4 ? (
                <>
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Edit Proposal
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Mail className="w-4 h-4 mr-2" />
                    Send via Email
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={generating || (currentStep === 1 && totalSqft === 0)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {generating ? (
                      'Generating...'
                    ) : currentStep === 3 ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Proposal
                      </>
                    ) : (
                      <>
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}