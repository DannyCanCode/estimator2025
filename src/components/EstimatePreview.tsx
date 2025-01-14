import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoofMeasurements, PricingConfig, AdditionalMaterials, UnderlaymentType } from '@/types/estimate';
import { Slider } from '@/components/ui/slider';

interface EstimatePreviewProps {
  measurements: RoofMeasurements;
  pricing: PricingConfig;
  additionalMaterials: AdditionalMaterials;
  underlaymentType: UnderlaymentType;
  onGeneratePDF: () => Promise<void>;
}

type LengthMeasurementKey = keyof NonNullable<RoofMeasurements['length_measurements']>;

export function EstimatePreview({ measurements, pricing, additionalMaterials, underlaymentType, onGeneratePDF }: EstimatePreviewProps) {
  const [profitMargin, setProfitMargin] = useState(20);
  const [shinglesMarkup, setShinglesMarkup] = useState(12);
  const [underlaymentMarkup, setUnderlaymentMarkup] = useState(12);
  const [acmMarkup, setAcmMarkup] = useState(12);

  const formatLengthMeasurement = (key: LengthMeasurementKey) => {
    const measurement = measurements.length_measurements?.[key];
    if (measurement) {
      return `${measurement.length} ft (${measurement.count} ${measurement.count > 1 ? 'pieces' : 'piece'})`;
    }
    return `${measurements[key as keyof RoofMeasurements] || 0} ft`;
  };

  // Calculate material quantities
  const totalSquares = measurements.total_squares || (measurements.total_area / 100);
  const ridgeLength = measurements.length_measurements?.ridges?.length || 0;
  const valleyLength = measurements.length_measurements?.valleys?.length || 0;
  const eaveLength = measurements.eaves || 0;
  const rakeLength = measurements.rakes || 0;
  const flashingLength = measurements.length_measurements?.flashing?.length || 0;
  const stepFlashingLength = measurements.length_measurements?.step_flashing?.length || 0;

  // Calculate quantities and base prices
  const acmGalvalumeDripEdgeBasePrice = 7.50;
  const acmGalvalumeDripEdgeQuantity = Math.ceil((rakeLength + eaveLength) / 9);
  const shinglesBasePrice = pricing.materials.shingles.price;
  const underlaymentRollsNeeded = Math.ceil(totalSquares / 1.6);  // 1 roll covers 1.6 squares
  const underlaymentRetailPrice = 117.50;  // Retail price per roll
  const ridgeCapsCost = ridgeLength * pricing.materials.ridge_caps.price;
  const coilNailsRetailPrice = 66.69;  // Retail price per box
  const coilNailsOurCost = 64.44;  // Our cost per box
  const coilNailsBoxesNeeded = Math.ceil(totalSquares / 24);  // 1 box per 24 squares
  const smallCoilNailsRetailPrice = 58.78;  // Retail price per box for 1 1/4" nails
  const smallCoilNailsOurCost = 53.89;  // Our cost per box for 1 1/4" nails
  const smallCoilNailsBoxesNeeded = Math.ceil(totalSquares / 15);  // 1 box per 15 squares
  const plasticCapNailsRetailPrice = 41.39;  // Retail price per box
  const plasticCapNailsOurCost = 39.44;  // Our cost per box
  const plasticCapNailsBoxesNeeded = Math.ceil(totalSquares / 20);  // 1 box per 20 squares
  const geocelSealantRetailPrice = 12.11;  // Retail price per unit
  const geocelSealantOurCost = 9.69;  // Our cost per unit
  const geocelSealantUnitsNeeded = Math.ceil(totalSquares / 20);  // 1 unit per 20 squares
  const karnakTarRetailPrice = 58.33;  // Retail price per unit
  const karnakTarOurCost = 42.06;  // Our cost per unit
  const karnakTarUnitsNeeded = Math.ceil(totalSquares / 20);  // 1 unit per 20 squares

  // Calculate costs with markups
  const shinglesCost = totalSquares * shinglesBasePrice * (1 + shinglesMarkup / 100);
  const underlaymentCost = underlaymentRollsNeeded * underlaymentRetailPrice * (1 + underlaymentMarkup / 100);
  const acmGalvalumeDripEdgeCost = acmGalvalumeDripEdgeQuantity * acmGalvalumeDripEdgeBasePrice * (1 + acmMarkup / 100);
  const starterShingleCost = (totalSquares / 3) * 63.25;
  const sealARidgeCost = (totalSquares / 3) * 66.41;
  const coilNailsCost = coilNailsBoxesNeeded * coilNailsRetailPrice;  // Using retail price for customer
  const smallCoilNailsCost = smallCoilNailsBoxesNeeded * smallCoilNailsRetailPrice;  // Using retail price for customer
  const plasticCapNailsCost = plasticCapNailsBoxesNeeded * plasticCapNailsRetailPrice;  // Using retail price for customer
  const geocelSealantCost = geocelSealantUnitsNeeded * geocelSealantRetailPrice;  // Using retail price for customer
  const karnakTarCost = karnakTarUnitsNeeded * karnakTarRetailPrice;  // Using retail price for customer

  // Calculate total material cost
  const totalMaterialCost = shinglesCost + underlaymentCost + starterShingleCost + sealARidgeCost + acmGalvalumeDripEdgeCost + 
    coilNailsCost + smallCoilNailsCost + plasticCapNailsCost + geocelSealantCost + karnakTarCost;

  // Calculate labor based on pitch
  const pitch = measurements.predominant_pitch ? parseInt(measurements.predominant_pitch.split('/')[0]) : 6;
  const laborMultiplier = pitch <= 7 ? 1 : pitch <= 9 ? 1.2 : pitch <= 12 ? 1.5 : 2;
  const laborCost = totalSquares * pricing.labor.base_installation.price * laborMultiplier;

  // Total cost
  const totalCost = shinglesCost + underlaymentCost + ridgeCapsCost + laborCost;

  console.log('Rake Length:', rakeLength);
  console.log('Eave Length:', eaveLength);

  // Log the entire measurements object for debugging
  console.log('Measurements Object:', measurements);

  const wastePercentage = Math.max(measurements.suggested_waste_percentage || 12, 12);

  return (
    <div className="space-y-4">
      <Card className="w-full">
      <CardHeader>
        <CardTitle>Estimate Preview</CardTitle>
          <p className="text-sm text-gray-500">Review extracted measurements, material costs, and labor charges for your roofing project.</p>
      </CardHeader>
      <CardContent>
          <div className="space-y-8">
            {/* Extracted Measurements Table */}
          <div>
              <h3 className="text-base font-semibold mb-4">Extracted Measurements</h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Measurement Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Value</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Area Measurements */}
                    <tr>
                      <td className="px-4 py-3 text-sm">Total Area</td>
                      <td className="px-4 py-3 text-sm font-medium">{measurements.total_area} sq ft</td>
                      <td className="px-4 py-3 text-sm">
                        {measurements.total_area ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Total Squares</td>
                      <td className="px-6 py-3 text-sm whitespace-nowrap">{totalSquares.toFixed(2)} SQ</td>
                      <td className="px-4 py-3 text-sm">✅ Complete</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Predominant Pitch</td>
                      <td className="px-4 py-3 text-sm font-medium">{measurements.predominant_pitch || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        {measurements.predominant_pitch ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>

                    {/* Length Measurements */}
                    {/* Check for ridges */}
                    <tr>
                      <td className="px-4 py-3 text-sm">Ridges</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {measurements.length_measurements?.ridges 
                          ? `${measurements.length_measurements.ridges.length} ft (${measurements.length_measurements.ridges.count} ${measurements.length_measurements.ridges.count > 1 ? 'pieces' : 'piece'})`
                          : measurements.ridges
                          ? `${measurements.ridges} ft`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(measurements.length_measurements?.ridges || measurements.ridges) ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>

                    {/* Check for valleys */}
                    <tr>
                      <td className="px-4 py-3 text-sm">Valleys</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {measurements.length_measurements?.valleys 
                          ? `${measurements.length_measurements.valleys.length} ft (${measurements.length_measurements.valleys.count} ${measurements.length_measurements.valleys.count > 1 ? 'pieces' : 'piece'})`
                          : measurements.valleys
                          ? `${measurements.valleys} ft`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(measurements.length_measurements?.valleys || measurements.valleys) ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>

                    {/* Check for eaves */}
                    <tr>
                      <td className="px-4 py-3 text-sm">Eaves</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {measurements.length_measurements?.eaves 
                          ? `${measurements.length_measurements.eaves.length} ft (${measurements.length_measurements.eaves.count} ${measurements.length_measurements.eaves.count > 1 ? 'pieces' : 'piece'})`
                          : measurements.eaves
                          ? `${measurements.eaves} ft`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(measurements.length_measurements?.eaves || measurements.eaves) ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>

                    {/* Check for rakes */}
                    <tr>
                      <td className="px-4 py-3 text-sm">Rakes</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {measurements.length_measurements?.rakes 
                          ? `${measurements.length_measurements.rakes.length} ft (${measurements.length_measurements.rakes.count} ${measurements.length_measurements.rakes.count > 1 ? 'pieces' : 'piece'})`
                          : measurements.rakes
                          ? `${measurements.rakes} ft`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(measurements.length_measurements?.rakes || measurements.rakes) ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>

                    {/* Check for flashing */}
                    <tr>
                      <td className="px-4 py-3 text-sm">Flashing</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {measurements.length_measurements?.flashing 
                          ? `${measurements.length_measurements.flashing.length} ft (${measurements.length_measurements.flashing.count} ${measurements.length_measurements.flashing.count > 1 ? 'pieces' : 'piece'})`
                          : measurements.flashing
                          ? `${measurements.flashing} ft`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(measurements.length_measurements?.flashing || measurements.flashing) ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>

                    {/* Check for step flashing */}
                    <tr>
                      <td className="px-4 py-3 text-sm">Step Flashing</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {measurements.length_measurements?.step_flashing 
                          ? `${measurements.length_measurements.step_flashing.length} ft (${measurements.length_measurements.step_flashing.count} ${measurements.length_measurements.step_flashing.count > 1 ? 'pieces' : 'piece'})`
                          : measurements.step_flashing
                          ? `${measurements.step_flashing} ft`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(measurements.length_measurements?.step_flashing || measurements.step_flashing) ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>

                    {/* Penetrations */}
                    {measurements.penetrations !== undefined && (
                      <tr>
                        <td className="px-4 py-3 text-sm">Total Penetrations</td>
                        <td className="px-4 py-3 text-sm font-medium">{measurements.penetrations}</td>
                        <td className="px-4 py-3 text-sm">✅ Complete</td>
                      </tr>
                    )}
                    {measurements.penetrations_area !== undefined && (
                      <tr>
                        <td className="px-4 py-3 text-sm">Total Roof Area Less Penetration</td>
                        <td className="px-4 py-3 text-sm font-medium">{measurements.penetrations_area} sq ft</td>
                        <td className="px-4 py-3 text-sm">✅ Complete</td>
                      </tr>
                    )}
                    {measurements.penetrations_perimeter !== undefined && (
                      <tr>
                        <td className="px-4 py-3 text-sm">Total Penetrations Perimeter</td>
                        <td className="px-4 py-3 text-sm font-medium">{measurements.penetrations_perimeter} ft</td>
                        <td className="px-4 py-3 text-sm">✅ Complete</td>
                      </tr>
                    )}

                    {/* Check for hips */}
                    <tr>
                      <td className="px-4 py-3 text-sm">Hips</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {measurements.length_measurements?.hips 
                          ? `${measurements.length_measurements.hips.length} ft (${measurements.length_measurements.hips.count} ${measurements.length_measurements.hips.count > 1 ? 'pieces' : 'piece'})`
                          : measurements.hips
                          ? `${measurements.hips} ft`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(measurements.length_measurements?.hips || measurements.hips) ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>

                    {/* Add Total Roof Area Less Penetration */}
                    {measurements.penetrations_area !== undefined && (
                      <tr>
                        <td className="px-4 py-3 text-sm">Total Roof Area Less Penetration</td>
                        <td className="px-4 py-3 text-sm font-medium">{measurements.penetrations_area} sq ft</td>
                        <td className="px-4 py-3 text-sm">✅ Complete</td>
                      </tr>
                    )}

                    {/* Add Total Penetrations Perimeter */}
                    {measurements.penetrations_perimeter !== undefined && (
                      <tr>
                        <td className="px-4 py-3 text-sm">Total Penetrations Perimeter</td>
                        <td className="px-4 py-3 text-sm font-medium">{measurements.penetrations_perimeter} ft</td>
                        <td className="px-4 py-3 text-sm">✅ Complete</td>
                      </tr>
                    )}

                    <tr>
                      <td className="px-4 py-3 text-sm">Total Penetrations Area</td>
                      <td className="px-4 py-3 text-sm font-medium">{measurements.penetrations_area || 'N/A'} sq ft</td>
                      <td className="px-4 py-3 text-sm">
                        {measurements.penetrations_area ? '✅ Complete' : '❌ Missing'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Material Costs Table */}
            <div>
              <h3 className="text-base font-semibold mb-4">Material Costs</h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Material</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quantity Needed</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price per Unit</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm">GAF Timberline HDZ Shingles</td>
                      <td className="px-4 py-3 text-sm">{totalSquares.toFixed(2)} SQ</td>
                      <td className="px-4 py-3 text-sm">${shinglesBasePrice.toFixed(2)}/SQ</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ${shinglesCost.toFixed(2)}
                        <input
                          type="number"
                          value={shinglesMarkup}
                          onChange={(e) => setShinglesMarkup(Number(e.target.value))}
                          className="ml-1 w-12 text-xs text-gray-500 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">GAF Weatherwatch Ice & Water Shield (2sq)</td>
                      <td className="px-4 py-3 text-sm">{underlaymentRollsNeeded} EA</td>
                      <td className="px-4 py-3 text-sm">${underlaymentRetailPrice.toFixed(2)}/EA</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ${underlaymentCost.toFixed(2)}
                        <input
                          type="number"
                          value={underlaymentMarkup}
                          onChange={(e) => setUnderlaymentMarkup(Number(e.target.value))}
                          className="ml-1 w-12 text-xs text-gray-500 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">GAF ProStart Starter Shingle Strip (120')</td>
                      <td className="px-4 py-3 text-sm">{(totalSquares / 3).toFixed(2)} BD</td>
                      <td className="px-4 py-3 text-sm">$63.25/BD</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">${((totalSquares / 3) * 63.25).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">GAF Seal-A-Ridge (25')</td>
                      <td className="px-4 py-3 text-sm">{(totalSquares / 3).toFixed(2)} BD</td>
                      <td className="px-4 py-3 text-sm">$66.41/BD</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">${(totalSquares / 3 * 66.41).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">ACM Galvalume Drip Edge - 26GA - F2.5 (10')</td>
                      <td className="px-4 py-3 text-sm">{acmGalvalumeDripEdgeQuantity} PC</td>
                      <td className="px-4 py-3 text-sm">${acmGalvalumeDripEdgeBasePrice.toFixed(2)}/PC</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ${acmGalvalumeDripEdgeCost.toFixed(2)}
                        <input
                          type="number"
                          value={acmMarkup}
                          onChange={(e) => setAcmMarkup(Number(e.target.value))}
                          className="ml-1 w-12 text-xs text-gray-500 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Coil Nails - 2 3/8" (4500 Cnt)</td>
                      <td className="px-4 py-3 text-sm">{coilNailsBoxesNeeded} BX</td>
                      <td className="px-4 py-3 text-sm">${coilNailsRetailPrice.toFixed(2)}/BX</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">${coilNailsCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Roofing Coil Nails - 1 1/4" (7200 Cnt)</td>
                      <td className="px-4 py-3 text-sm">{smallCoilNailsBoxesNeeded} BX</td>
                      <td className="px-4 py-3 text-sm">${smallCoilNailsRetailPrice.toFixed(2)}/BX</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">${smallCoilNailsCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Plastic Cap Nails - 1" (3000 Cnt)</td>
                      <td className="px-4 py-3 text-sm">{plasticCapNailsBoxesNeeded} BX</td>
                      <td className="px-4 py-3 text-sm">${plasticCapNailsRetailPrice.toFixed(2)}/BX</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">${plasticCapNailsCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Geocel 2300 Construction TriPolymer Sealant (10.3 oz)</td>
                      <td className="px-4 py-3 text-sm">{geocelSealantUnitsNeeded} EA</td>
                      <td className="px-4 py-3 text-sm">${geocelSealantRetailPrice.toFixed(2)}/EA</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">${geocelSealantCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Karnak 19 Ultra Roof Tar - 5Gal</td>
                      <td className="px-4 py-3 text-sm">{karnakTarUnitsNeeded} EA</td>
                      <td className="px-4 py-3 text-sm">${karnakTarRetailPrice.toFixed(2)}/EA</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">${karnakTarCost.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold">Total Material Cost</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        ${totalMaterialCost.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Labor Costs Table */}
          <div>
              <h3 className="text-base font-semibold mb-4">Labor Costs</h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[24%]" />
                    <col className="w-[24%]" />
                    <col className="w-[24%]" />
                    <col className="w-[28%]" />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Task</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rate per Unit</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Units Needed</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm truncate">Base Installation ({measurements.predominant_pitch} pitch)</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">${pricing.labor.base_installation.price.toFixed(2)}/SQ</td>
                      <td className="px-6 py-3 text-sm whitespace-nowrap">{totalSquares.toFixed(2)} SQ</td>
                      <td className="px-4 py-3 text-sm text-right font-medium whitespace-nowrap">${laborCost.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold">Total Labor Cost</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold whitespace-nowrap">${laborCost.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Project Summary */}
            <div className="border-t pt-8">
              <h3 className="text-base font-semibold mb-4">Project Summary</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Material Cost</span>
                      <span className="text-lg font-semibold">
                        ${totalMaterialCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Labor Cost</span>
                      <span className="text-lg font-semibold">${laborCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Profit Margin Slider */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Profit Margin</span>
                      <span className="text-lg font-semibold text-blue-600">{profitMargin}%</span>
                    </div>
                    <Slider
                      defaultValue={[20]}
                      max={50}
                      step={1}
                      className="w-full"
                      onValueChange={(values: number[]) => setProfitMargin(values[0])}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                    </div>
            </div>
          </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex justify-between items-center">
          <div>
                      <span className="text-lg font-semibold text-blue-900">Grand Total</span>
                      <span className="text-sm text-blue-700 ml-2">(with {profitMargin}% margin)</span>
                    </div>
                    <span className="text-3xl font-bold text-blue-900">
                      ${(totalCost * (1 + profitMargin / 100)).toFixed(2)}
                    </span>
            </div>
          </div>

                <button
                  onClick={onGeneratePDF}
                  className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  Generate PDF Estimate
                </button>
              </div>
            </div>

            {/* PDF Parsing Details */}
            {measurements.debug_info && (
              <div className="border-t pt-8">
                <h3 className="text-base font-semibold mb-4">PDF Parsing Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-sm font-medium">Method: </span>
                    <span className="text-sm text-gray-600">{measurements.debug_info.extraction_method}</span>
                  </div>
                  {measurements.debug_info.error && (
                    <div className="text-red-600 text-sm">
                      <span className="font-medium">Error: </span>
                      {measurements.debug_info.error}
                    </div>
                  )}
                  {measurements.debug_info.tables_found !== undefined && (
                    <div>
                      <span className="text-sm font-medium">Tables Found: </span>
                      <span className="text-sm text-gray-600">{measurements.debug_info.tables_found}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Areas by Pitch */}
            {measurements.areas_per_pitch && measurements.areas_per_pitch.length > 0 && (
              <div className="border-t pt-8">
                <h3 className="text-base font-semibold mb-4">Areas by Pitch</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Pitch</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Area</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {measurements.areas_per_pitch.map((detail, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium">{detail.pitch} pitch</td>
                          <td className="px-4 py-3 text-sm">{detail.area} sq ft</td>
                          <td className="px-4 py-3 text-sm text-right">{detail.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
} 