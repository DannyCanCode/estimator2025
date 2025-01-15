import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EstimatePreview } from './EstimatePreview';
import { PricingLogic } from './PricingLogic';
import { GAFShinglesPricing } from './GAFShinglesPricing';
import { RoofMeasurements, PricingConfig, UnderlaymentType, AdditionalMaterials, VentType } from '@/types/estimate';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EstimateGeneratorProps {
  measurements: RoofMeasurements;
}

const DEFAULT_PRICING: PricingConfig = {
  materials: {
    shingles: {
      price: 152.10,
      cost: 121.68,
      unit: 'per square'
    },
    underlayment: {
      feltbuster: {
        price: 45.00,
        unit: 'per square'
      },
      ice_and_water: {
        price: 65.00,
        unit: 'per square'
      }
    },
    starter: {
      price: 45.00,
      unit: 'per square'
    },
    ridge_caps: {
      price: 12.00,
      unit: 'per linear ft'
    },
    drip_edge: {
      price: 3.50,
      unit: 'per linear ft'
    },
    plywood: {
      price: 85.00,
      unit: 'per square'
    },
    flat_roof_materials: {
      iso: {
        price: 95.00,
        unit: 'per square'
      },
      base_cap: {
        price: 125.00,
        unit: 'per square'
      }
    },
    pipe_flashings: {
      two_inch: {
        price: 25.00,
        unit: 'per piece'
      },
      three_inch: {
        price: 35.00,
        unit: 'per piece'
      }
    },
    vents: {
      gooseneck_4: {
        price: 45.00,
        unit: 'per piece'
      },
      gooseneck_10: {
        price: 65.00,
        unit: 'per piece'
      },
      off_ridge: {
        price: 35.00,
        unit: 'per piece'
      }
    },
    nails: {
      coil_2_3_8: {
        price: 75.00,
        unit: 'per box'
      },
      coil_1_1_4: {
        price: 65.00,
        unit: 'per box'
      },
      plastic_cap: {
        price: 35.00,
        unit: 'per box'
      }
    },
    sealants: {
      geocel: {
        price: 8.50,
        unit: 'per tube'
      },
      roof_tar: {
        price: 45.00,
        unit: 'per bucket'
      }
    }
  },
  labor: {
    base_installation: {
      price: 125.00,
      unit: 'per square'
    },
    steep_slope_factor: {
      price: 35.00,
      unit: 'per square'
    },
    waste_factor: 0.15
  }
};

export function EstimateGenerator({ measurements }: EstimateGeneratorProps) {
  const [selectedShingle] = useState('Timberline HDZ');
  const [underlaymentType, setUnderlaymentType] = useState<UnderlaymentType>(UnderlaymentType.FELTBUSTER);
  const [additionalMaterials, setAdditionalMaterials] = useState<AdditionalMaterials>({
    plywood_replacement: false,
    flat_roof_iso: false,
    base_cap: false,
    pipe_flashings: [],
    vents: []
  });
  const [selectedRoofType, setSelectedRoofType] = useState('shingle');
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleUnderlaymentChange = (value: string) => {
    setUnderlaymentType(value as UnderlaymentType);
  };

  const handleAdditionalMaterialChange = (key: keyof AdditionalMaterials) => {
    setAdditionalMaterials(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAddPipeFlashing = (size: '2"' | '3"') => {
    setAdditionalMaterials(prev => ({
      ...prev,
      pipe_flashings: [...prev.pipe_flashings, { size, quantity: 1 }]
    }));
  };

  const handleAddVent = (type: VentType) => {
    setAdditionalMaterials(prev => ({
      ...prev,
      vents: [...prev.vents, { type, quantity: 1 }]
    }));
  };

  const handleRoofTypeChange = (value: string) => {
    setSelectedRoofType(value);
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch('/api/generate-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          measurements,
          pricing: DEFAULT_PRICING,
          selectedShingle,
          additionalMaterials,
          underlaymentType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'estimate.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Estimate Generator</CardTitle>
          <p className="text-sm text-gray-500">Configure your estimate settings and preview the results.</p>
        </CardHeader>
        <CardContent>
          {/* Estimate Configuration Section */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
            >
              <h3 className="text-base font-semibold">Estimate Configuration</h3>
              {isConfigOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
            <div className={`transition-all duration-300 ease-in-out ${isConfigOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Roof Type</Label>
                <Select value={selectedRoofType} onValueChange={handleRoofTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select roof type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shingle">Shingle</SelectItem>
                    <SelectItem value="tile" disabled>Tile</SelectItem>
                    <SelectItem value="metal" disabled>Metal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedRoofType === "shingle" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-20 gap-y-12">
                  {/* Existing Roof Type */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Existing Roof Type</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="existing-shingle" />
                      <label htmlFor="existing-shingle" className="text-sm">Shingle</label>
                      <Checkbox id="existing-tile" />
                      <label htmlFor="existing-tile" className="text-sm">Tile</label>
                      <Checkbox id="existing-metal" />
                      <label htmlFor="existing-metal" className="text-sm">Metal</label>
                    </div>
                  </div>

                  {/* Manufacturer, Type, Color, Pitch */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Manufacturer</Label>
                    <Select onValueChange={(value) => console.log(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GAF">GAF</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label className="text-base font-semibold">Type</Label>
                    <Select onValueChange={(value) => console.log(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GAF Timberline HDZ SG">GAF Timberline HDZ SG</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label className="text-base font-semibold">Color</Label>
                    <Select onValueChange={(value) => console.log(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pewter Gray">Pewter Gray</SelectItem>
                        <SelectItem value="Appalachian Sky">Appalachian Sky</SelectItem>
                        <SelectItem value="Barkwood">Barkwood</SelectItem>
                        <SelectItem value="Birchwood">Birchwood</SelectItem>
                        <SelectItem value="Biscayne Blue">Biscayne Blue</SelectItem>
                        <SelectItem value="Cedar Falls">Cedar Falls</SelectItem>
                        <SelectItem value="Charcoal">Charcoal</SelectItem>
                        <SelectItem value="Copper Canyon">Copper Canyon</SelectItem>
                        <SelectItem value="Driftwood">Driftwood</SelectItem>
                        <SelectItem value="Fox Hollow Gray">Fox Hollow Gray</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label className="text-base font-semibold">Pitch</Label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Pitch" value={measurements.predominant_pitch || ''} readOnly />
                  </div>

                  {/* Drip Edge Color, GAF Warranty */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Drip Edge Color</Label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Drip Edge Color" />
                    <Label className="text-base font-semibold">GAF Warranty</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="gaf-yes" />
                      <label htmlFor="gaf-yes" className="text-sm">YES</label>
                      <Checkbox id="gaf-no" />
                      <label htmlFor="gaf-no" className="text-sm">NO</label>
                      <Checkbox id="gaf-silver" />
                      <label htmlFor="gaf-silver" className="text-sm">Silver</label>
                      <Checkbox id="gaf-gold" />
                      <label htmlFor="gaf-gold" className="text-sm">Gold</label>
                    </div>
                  </div>

                  {/* Flat Roof, Iso, Dead Valley */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Flat Roof</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="flat-yes" />
                      <label htmlFor="flat-yes" className="text-sm">YES</label>
                      <Checkbox id="flat-no" />
                      <label htmlFor="flat-no" className="text-sm">NO</label>
                    </div>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="SF" />
                    <Label className="text-base font-semibold">Iso</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="iso-yes" />
                      <label htmlFor="iso-yes" className="text-sm">YES</label>
                      <Checkbox id="iso-no" />
                      <label htmlFor="iso-no" className="text-sm">NO</label>
                    </div>
                    <Label className="text-base font-semibold">Dead Valley</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="dead-valley-yes" />
                      <label htmlFor="dead-valley-yes" className="text-sm">YES</label>
                      <Checkbox id="dead-valley-no" />
                      <label htmlFor="dead-valley-no" className="text-sm">NO</label>
                    </div>
                  </div>

                  {/* Goosenecks, Boots */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Goosenecks</Label>
                    <div className="flex items-center space-x-3">
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="4”" />
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="6”" />
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="10”" />
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="12”" />
                    </div>
                    <Label className="text-base font-semibold">Boots</Label>
                    <div className="flex items-center space-x-3">
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="1.5”" />
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="2”" />
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="3”" />
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="4”" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="lead-yes" />
                      <label htmlFor="lead-yes" className="text-sm">Lead?</label>
                      <Checkbox id="lead-no" />
                      <label htmlFor="lead-no" className="text-sm">NO</label>
                      <Checkbox id="lead-some" />
                      <label htmlFor="lead-some" className="text-sm">SOME</label>
                    </div>
                  </div>

                  {/* Electrical Boot/Mast, Furnace Vent */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Electrical Boot/Mast</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="electrical-yes" />
                      <label htmlFor="electrical-yes" className="text-sm">YES</label>
                      <Checkbox id="electrical-no" />
                      <label htmlFor="electrical-no" className="text-sm">NO</label>
                    </div>
                    <Label className="text-base font-semibold">Furnace Vent</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="furnace-yes" />
                      <label htmlFor="furnace-yes" className="text-sm">YES</label>
                      <Checkbox id="furnace-no" />
                      <label htmlFor="furnace-no" className="text-sm">NO</label>
                    </div>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Quantity" />
                  </div>

                  {/* Vents/Pipes painted?, Off Ridge Vents */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Vents/Pipes painted?</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="painted-yes" />
                      <label htmlFor="painted-yes" className="text-sm">YES</label>
                      <Checkbox id="painted-no" />
                      <label htmlFor="painted-no" className="text-sm">NO</label>
                      <Checkbox id="painted-some" />
                      <label htmlFor="painted-some" className="text-sm">SOME</label>
                    </div>
                    <Label className="text-base font-semibold">Off Ridge Vents</Label>
                    <div className="flex flex-wrap items-center space-x-5">
                      <Checkbox id="off-ridge-4" />
                      <label htmlFor="off-ridge-4" className="text-sm">4’</label>
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="Quantity" />
                      <Checkbox id="off-ridge-6" />
                      <label htmlFor="off-ridge-6" className="text-sm">6’</label>
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="Quantity" />
                      <Checkbox id="off-ridge-8" />
                      <label htmlFor="off-ridge-8" className="text-sm">8’</label>
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="Quantity" />
                    </div>
                  </div>

                  {/* Ridge Vents, Satellite */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Ridge Vents</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="ridge-yes" />
                      <label htmlFor="ridge-yes" className="text-sm">YES</label>
                      <Checkbox id="ridge-no" />
                      <label htmlFor="ridge-no" className="text-sm">NO</label>
                    </div>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="LF" />
                    <Label className="text-base font-semibold">Satellite</Label>
                    <div className="flex flex-wrap items-center justify-between space-x-6">
                      <Checkbox id="satellite-yes" />
                      <label htmlFor="satellite-yes" className="text-sm">YES</label>
                      <Checkbox id="satellite-no" />
                      <label htmlFor="satellite-no" className="text-sm">NO</label>
                    </div>
                    <div className="flex items-center space-x-5">
                      <Checkbox id="satellite-keep" />
                      <label htmlFor="satellite-keep" className="text-sm">Keep?</label>
                      <Checkbox id="satellite-no-keep" />
                      <label htmlFor="satellite-no-keep" className="text-sm">NO</label>
                    </div>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Quantity" />
                  </div>

                  {/* Solar Attic Fan, Skylight */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Solar Attic Fan</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="solar-yes" />
                      <label htmlFor="solar-yes" className="text-sm">YES</label>
                      <Checkbox id="solar-no" />
                      <label htmlFor="solar-no" className="text-sm">NO</label>
                    </div>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Size" />
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Quantity" />
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Color" />
                    <div className="flex items-center space-x-3">
                      <Checkbox id="solar-powered-yes" />
                      <label htmlFor="solar-powered-yes" className="text-sm">Powered?</label>
                      <Checkbox id="solar-powered-no" />
                      <label htmlFor="solar-powered-no" className="text-sm">NO</label>
                    </div>
                    <Label className="text-base font-semibold">Skylight</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="skylight-yes" />
                      <label htmlFor="skylight-yes" className="text-sm">YES</label>
                      <Checkbox id="skylight-no" />
                      <label htmlFor="skylight-no" className="text-sm">NO</label>
                    </div>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Type" />
                    <div className="flex items-center space-x-3">
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="2’x2’" />
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="2’x4’" />
                      <input type="text" className="w-16 border rounded-lg px-3 py-2" placeholder="Dome" />
                    </div>
                  </div>

                  {/* Cornice Gable Return(s), Chimney */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Cornice Gable Return(s)</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="cornice-return-yes" />
                      <label htmlFor="cornice-return-yes" className="text-sm">YES</label>
                      <Checkbox id="cornice-return-no" />
                      <label htmlFor="cornice-return-no" className="text-sm">NO</label>
                    </div>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Quantity" />
                    <Label className="text-base font-semibold">Cornice Gable Strip(s)</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="cornice-strip-yes" />
                      <label htmlFor="cornice-strip-yes" className="text-sm">YES</label>
                      <Checkbox id="cornice-strip-no" />
                      <label htmlFor="cornice-strip-no" className="text-sm">NO</label>
                    </div>
                    <Label className="text-base font-semibold">Chimney</Label>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="chimney-yes" />
                      <label htmlFor="chimney-yes" className="text-sm">YES</label>
                      <Checkbox id="chimney-no" />
                      <label htmlFor="chimney-no" className="text-sm">NO</label>
                    </div>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Length" />
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Width" />
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Height" />
                    <div className="flex items-center space-x-3">
                      <Checkbox id="chimney-stucco" />
                      <label htmlFor="chimney-stucco" className="text-sm">Stucco</label>
                      <Checkbox id="chimney-siding" />
                      <label htmlFor="chimney-siding" className="text-sm">Siding</label>
                      <Checkbox id="chimney-brick" />
                      <label htmlFor="chimney-brick" className="text-sm">Brick</label>
                      <Checkbox id="chimney-other" />
                      <label htmlFor="chimney-other" className="text-sm">Other</label>
                    </div>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Other" />
                  </div>

                  {/* Roofing Notes */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Roofing Notes</Label>
                    <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Roofing Notes" rows={4}></textarea>
                  </div>
                </div>
              )}

              {/* Selected Items Display */}
              {(additionalMaterials.pipe_flashings.length > 0 || additionalMaterials.vents.length > 0) && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-base font-semibold mb-4">Selected Items</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {additionalMaterials.pipe_flashings.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Pipe Flashings</h4>
                        <div className="space-y-2">
                          {additionalMaterials.pipe_flashings.map((flashing, index) => (
                            <div key={index} className="text-sm text-gray-600 flex justify-between">
                              <span>{flashing.size} Flashing</span>
                              <span>Qty: {flashing.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {additionalMaterials.vents.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Vents</h4>
                        <div className="space-y-2">
                          {additionalMaterials.vents.map((vent, index) => (
                            <div key={index} className="text-sm text-gray-600 flex justify-between">
                              <span>{vent.type}</span>
                              <span>Qty: {vent.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="w-full">
        <EstimatePreview
          measurements={measurements}
          pricing={DEFAULT_PRICING}
          additionalMaterials={additionalMaterials}
          underlaymentType={underlaymentType}
          onGeneratePDF={handleGeneratePDF}
        />
      </div>
    </div>
  );
} 