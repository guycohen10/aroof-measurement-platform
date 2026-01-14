import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, ArrowRight, ArrowLeft, Sparkles, Download, Mail, Check, MessageSquare, FileText } from "lucide-react";
import { toast } from "sonner";
import AIEstimatorChat from './AIEstimatorChat';

export default function ProposalWizard({ lead, onClose, onSave }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [inputMode, setInputMode] = useState('form'); // 'form' or 'chat'
  
  // Manual input mode
  const [manualSqft, setManualSqft] = useState('');
  const [manualPitch, setManualPitch] = useState('4/12');
  
  // Step 1: Questionnaire with expanded materials
  const [materialCategory, setMaterialCategory] = useState('asphalt');
  const [specificMaterial, setSpecificMaterial] = useState('GAF Timberline HDZ');
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
  
  // Material database with categories
  const materialDatabase = {
    asphalt: {
      label: 'Asphalt Shingles',
      icon: '🏠',
      defaultPrice: 450,
      wasteRange: '10-15%',
      options: [
        'GAF Timberline HDZ',
        'Owens Corning Duration',
        'CertainTeed Landmark',
        'GAF Grand Sequoia',
        'IKO Cambridge'
      ]
    },
    metal: {
      label: 'Metal Roofing',
      icon: '⚡',
      defaultPrice: 900,
      wasteRange: '15-20%',
      options: [
        'Standing Seam',
        'Corrugated Metal',
        'R-Panel',
        'Stone-Coated Steel'
      ]
    },
    tile: {
      label: 'Tile Roofing',
      icon: '🎨',
      defaultPrice: 1100,
      wasteRange: '20-25%',
      options: [
        'Spanish Clay Tile',
        'Concrete S-Tile',
        'Flat Concrete Tile',
        'Slate-Style Tile'
      ]
    },
    flat: {
      label: 'Flat/Commercial',
      icon: '🏢',
      defaultPrice: 650,
      wasteRange: '10-15%',
      options: [
        'TPO Membrane',
        'EPDM Rubber',
        'Modified Bitumen',
        'PVC Membrane'
      ]
    },
    slate: {
      label: 'Natural Slate',
      icon: '💎',
      defaultPrice: 1500,
      wasteRange: '15-20%',
      options: [
        'Pennsylvania Slate',
        'Vermont Slate',
        'Synthetic Slate'
      ]
    }
  };
  
  // Update price when category changes
  const handleCategoryChange = (category) => {
    setMaterialCategory(category);
    const newDefaultPrice = materialDatabase[category].defaultPrice;
    setPricePerSquare(newDefaultPrice);
    setSpecificMaterial(materialDatabase[category].options[0]);
  };
  
  // Handle data from AI chat
  const handleChatDataExtracted = (data) => {
    if (data.materialCategory) setMaterialCategory(data.materialCategory);
    if (data.specificMaterial) setSpecificMaterial(data.specificMaterial);
    if (data.pricePerSquare) setPricePerSquare(data.pricePerSquare);
    if (data.addOns) {
      const newAddOns = { ...addOns };
      data.addOns.forEach(addon => {
        if (addon === 'pipe_boots') newAddOns.pipeBoots = true;
        if (addon === 'ridge_vent') newAddOns.ridgeVent = true;
        if (addon === 'drip_edge') newAddOns.dripEdge = true;
      });
      setAddOns(newAddOns);
    }
  };
  
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
      const materialInfo = materialDatabase[materialCategory];
      const prompt = `Write a professional "Scope of Work" for a roofing project with these details:

Property: ${lead?.property_address || 'Customer Property'}
Total Area: ${totalSqft.toLocaleString()} square feet (${squares.toFixed(1)} squares)
Roof Pitch: ${difficulty}
Material Category: ${materialInfo.label}
Specific Material: ${specificMaterial} - ${shingleColor}
Add-ons: ${Object.entries(addOns).filter(([k,v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1').trim()).join(', ')}

Write 3-4 paragraphs describing:
1. Tear-off and preparation (adjust for material type)
2. Installation of ${specificMaterial} system with proper techniques for this material
3. Details about add-ons and finishing work
4. Cleanup and final walkthrough

Keep it professional, detailed, and homeowner-friendly. No pricing in the text. Emphasize quality and craftsmanship specific to ${materialInfo.label}.`;

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
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setInputMode('form')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            inputMode === 'form'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Form Mode
        </button>
        <button
          onClick={() => setInputMode('chat')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            inputMode === 'chat'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          AI Chat Mode
          <Sparkles className="w-3 h-3" />
        </button>
      </div>

      {inputMode === 'chat' ? (
        <AIEstimatorChat lead={lead} onDataExtracted={handleChatDataExtracted} />
      ) : (
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 mb-6 backdrop-blur-sm">
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
              <Label className="mb-3 block">Material Category</Label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(materialDatabase).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      materialCategory === key
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">{data.icon}</div>
                    <div className="font-bold text-sm text-slate-900">{data.label}</div>
                    <div className="text-xs text-slate-500 mt-1">${data.defaultPrice}/sq</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block">Specific Material</Label>
              <select
                value={specificMaterial}
                onChange={(e) => setSpecificMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                {materialDatabase[materialCategory].options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Typical waste: {materialDatabase[materialCategory].wasteRange}
              </p>
            </div>
            
            <div>
              <Label className="mb-2 block">Color/Finish</Label>
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
                <option value="Copper">Copper</option>
                <option value="Galvalume">Galvalume</option>
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
                  <label key={addon.key} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-all">
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
      )}
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
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Sparkles className="w-10 h-10 text-purple-600" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-purple-400 opacity-20 rounded-full animate-ping"></div>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Generate Your Proposal</h3>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        Our AI will write a professional scope of work based on your selections
      </p>
      <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-xl p-6 max-w-lg mx-auto text-left shadow-xl">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Material Category:</span>
            <span className="font-semibold">{materialDatabase[materialCategory].label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Material:</span>
            <span className="font-semibold">{specificMaterial}</span>
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
          <div className="flex justify-between pt-3 border-t-2 border-slate-300">
            <span className="text-slate-600">Total Investment:</span>
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
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Material System</p>
            <p className="font-semibold">{specificMaterial}</p>
            <p className="text-sm text-slate-500">{shingleColor}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Roof Area</p>
            <p className="font-semibold">{totalSqft.toLocaleString()} sqft</p>
            <p className="text-sm text-slate-500">{squares.toFixed(1)} squares • {materialDatabase[materialCategory].label}</p>
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