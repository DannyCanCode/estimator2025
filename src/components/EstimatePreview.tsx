import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoofMeasurements, PricingConfig, AdditionalMaterials, UnderlaymentType } from '@/types/estimate';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [cdxPlywoodQuantity, setCdxPlywoodQuantity] = useState(1);
  const [isRidgeVentSelected, setIsRidgeVentSelected] = useState(false);
  const [ridgeVentQuantity, setRidgeVentQuantity] = useState(0);
  
  // Add state for collapsible sections
  const [isMeasurementsOpen, setIsMeasurementsOpen] = useState(true);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(true);
  const [isLaborOpen, setIsLaborOpen] = useState(true);
  const [isProjectSummaryOpen, setIsProjectSummaryOpen] = useState(true);

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
  const cdxPlywoodRetailPrice = 125.00;  // Retail price per board
  const cdxPlywoodOurCost = 100.00;  // Our cost per board
  const cdxPlywoodCost = cdxPlywoodQuantity * cdxPlywoodRetailPrice;  // Using retail price for customer
  const dumpsterRetailPrice = 687.50;  // Retail price per dumpster
  const dumpsterOurCost = 550.00;  // Our cost per dumpster
  const dumpsterUnitsNeeded = Math.ceil(totalSquares / 30);  // 1 dumpster per 30 squares
  const dumpsterCost = dumpsterUnitsNeeded * dumpsterRetailPrice;  // Using retail price for customer

  // Add permits and inspections constants
  const permitsRetailPrice = 2500.00;  // Retail price per permit
  const permitsOurCost = 2000.00;  // Our cost per permit
  const permitsUnitsNeeded = 1;  // One permit needed for shingle roofs
  const permitsCost = permitsUnitsNeeded * permitsRetailPrice;  // Using retail price for customer

  // Add re-nailing constants
  const reNailingRetailPrice = 0.00;  // No cost for demonstration
  const reNailingOurCost = 0.00;  // No cost for demonstration
  const reNailingUnitsNeeded = totalSquares;  // One unit per square

  // Calculate pitch first
  const pitch = measurements.predominant_pitch ? parseInt(measurements.predominant_pitch.split('/')[0]) : 6;
  
  // Calculate base installation cost based on pitch
  const baseInstallationRetailPrice = pitch <= 7 ? 100.00 : pitch <= 9 ? 110.00 : 150.00;
  const baseInstallationOurCost = pitch <= 7 ? 75.00 : pitch <= 9 ? 90.00 : 100.00;
  const baseInstallationUnitsNeeded = totalSquares;  // 1 EA needed per square
  const baseInstallationCost = baseInstallationUnitsNeeded * baseInstallationRetailPrice;  // Using retail price for customer

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

  // Update ridge vent calculations
  const ridgeVentRetailPrice = 22.67;  // Retail price per piece
  const ridgeVentOurCost = 18.89;  // Our cost per piece
  const calculatedRidgeVentPieces = Math.ceil(ridgeLength / 5);  // 1 piece covers 5 LF of ridges
  const ridgeVentPiecesNeeded = ridgeVentQuantity || calculatedRidgeVentPieces;
  const ridgeVentCost = isRidgeVentSelected ? ridgeVentPiecesNeeded * ridgeVentRetailPrice : 0;

  // Update total material cost calculation
  const totalMaterialCost = shinglesCost + underlaymentCost + starterShingleCost + sealARidgeCost + acmGalvalumeDripEdgeCost + 
    coilNailsCost + smallCoilNailsCost + plasticCapNailsCost + geocelSealantCost + karnakTarCost + ridgeVentCost;

  // Calculate labor based on pitch
  const laborMultiplier = pitch <= 7 ? 1 : pitch <= 9 ? 1.2 : pitch <= 12 ? 1.5 : 2;
  const laborCost = baseInstallationCost + cdxPlywoodCost + dumpsterCost + permitsCost;

  // Total cost
  const totalCost = shinglesCost + underlaymentCost + ridgeCapsCost + laborCost;

  console.log('Rake Length:', rakeLength);
  console.log('Eave Length:', eaveLength);

  // Log the entire measurements object for debugging
  console.log('Measurements Object:', measurements);
  console.log('Areas per Pitch:', measurements?.areas_per_pitch);

  const wastePercentage = Math.max(measurements.suggested_waste_percentage || 12, 12);

  // Calculate base profits (difference between retail and our cost)
  const materialBaseProfit = (
    ((totalSquares * shinglesBasePrice) - (totalSquares * 121.68)) +  // GAF Timberline HDZ Shingles
    ((underlaymentRollsNeeded * underlaymentRetailPrice) - (underlaymentRollsNeeded * 94.00)) +  // GAF Weatherwatch
    ((acmGalvalumeDripEdgeQuantity * acmGalvalumeDripEdgeBasePrice) - (acmGalvalumeDripEdgeQuantity * 5.50)) +  // ACM Galvalume
    ((coilNailsBoxesNeeded * coilNailsRetailPrice) - (coilNailsBoxesNeeded * coilNailsOurCost)) +  // Coil Nails 2 3/8"
    ((smallCoilNailsBoxesNeeded * smallCoilNailsRetailPrice) - (smallCoilNailsBoxesNeeded * smallCoilNailsOurCost)) +  // Coil Nails 1 1/4"
    ((plasticCapNailsBoxesNeeded * plasticCapNailsRetailPrice) - (plasticCapNailsBoxesNeeded * plasticCapNailsOurCost)) +  // Plastic Cap Nails
    ((geocelSealantUnitsNeeded * geocelSealantRetailPrice) - (geocelSealantUnitsNeeded * geocelSealantOurCost)) +  // Geocel Sealant
    ((karnakTarUnitsNeeded * karnakTarRetailPrice) - (karnakTarUnitsNeeded * karnakTarOurCost)) +  // Karnak Roof Tar
    (isRidgeVentSelected ? ((ridgeVentPiecesNeeded * ridgeVentRetailPrice) - (ridgeVentPiecesNeeded * ridgeVentOurCost)) : 0)  // GAF Cobra Rigid Vent
  );

  const laborBaseProfit = (
    (baseInstallationCost - (baseInstallationUnitsNeeded * baseInstallationOurCost)) +
    (cdxPlywoodCost - (cdxPlywoodQuantity * cdxPlywoodOurCost)) +
    (dumpsterCost - (dumpsterUnitsNeeded * dumpsterOurCost)) +
    (permitsCost - (permitsUnitsNeeded * permitsOurCost))
  );

  const totalBaseProfit = materialBaseProfit + laborBaseProfit;

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
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => setIsMeasurementsOpen(!isMeasurementsOpen)}
              >
                <h3 className="text-base font-semibold">Extracted Measurements</h3>
                {isMeasurementsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <div className={`transition-all duration-300 ease-in-out ${isMeasurementsOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
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
                          {formatLengthMeasurement('hips')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {measurements.hips ? '✅ Complete' : '❌ Missing'}
                        </td>
                      </tr>

                      {/* Areas per Pitch */}
                      {measurements?.areas_per_pitch && measurements.areas_per_pitch.length > 0 && (
                        <tr>
                          <td className="px-4 py-3 text-sm">Areas per Pitch</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {measurements.areas_per_pitch.map((pitch, index) => (
                              <div key={index}>
                                Pitch: {pitch.pitch}, Area: {pitch.area.toLocaleString()} sq ft, Percentage: {pitch.percentage}%
                              </div>
                            ))}
                          </td>
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
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Material Costs Table */}
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}
              >
                <h3 className="text-base font-semibold">Material Costs</h3>
                {isMaterialsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <div className={`transition-all duration-300 ease-in-out ${isMaterialsOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
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
                        <td colSpan={4} className="px-4 py-3 text-sm font-semibold">Add-ons or Upgrades</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isRidgeVentSelected}
                              onChange={(e) => {
                                setIsRidgeVentSelected(e.target.checked);
                                if (e.target.checked && !ridgeVentQuantity) {
                                  setRidgeVentQuantity(calculatedRidgeVentPieces);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>GAF Cobra Rigid Vent 3 Exhaust Ridge Vent w/ Nails - 11-1/2" (4')</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isRidgeVentSelected ? (
                            <input
                              type="number"
                              value={ridgeVentQuantity}
                              onChange={(e) => setRidgeVentQuantity(Math.max(0, Number(e.target.value)))}
                              min="0"
                              className="w-20 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                          ) : '-'} PC
                        </td>
                        <td className="px-4 py-3 text-sm">${ridgeVentRetailPrice.toFixed(2)}/PC</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${ridgeVentCost.toFixed(2)}</td>
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
            </div>

            {/* Labor Costs Table */}
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => setIsLaborOpen(!isLaborOpen)}
              >
                <h3 className="text-base font-semibold">Labor Costs</h3>
                {isLaborOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <div className={`transition-all duration-300 ease-in-out ${isLaborOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
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
                        <td className="px-4 py-3 text-sm whitespace-nowrap">${baseInstallationRetailPrice.toFixed(2)}/EA</td>
                        <td className="px-6 py-3 text-sm whitespace-nowrap">{baseInstallationUnitsNeeded.toFixed(2)} EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium whitespace-nowrap">${baseInstallationCost.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">1/2"x4'x8' CDX Plywood - 4-Ply</td>
                        <td className="px-4 py-3 text-sm">${cdxPlywoodRetailPrice.toFixed(2)}/BRD</td>
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="number"
                            value={cdxPlywoodQuantity}
                            onChange={(e) => setCdxPlywoodQuantity(Number(e.target.value))}
                            min="0"
                            className="w-16 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                          /> BRD
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${cdxPlywoodCost.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Dumpster 12 yard</td>
                        <td className="px-4 py-3 text-sm">${dumpsterRetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm">{dumpsterUnitsNeeded} EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${dumpsterCost.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Perform Required Permits and Inspections</td>
                        <td className="px-4 py-3 text-sm">${permitsRetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm">{permitsUnitsNeeded} EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${permitsCost.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Re-Nail the decking and trusses Per FL Building Code</td>
                        <td className="px-4 py-3 text-sm">${reNailingRetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm">{reNailingUnitsNeeded.toFixed(2)} EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${(reNailingUnitsNeeded * reNailingRetailPrice).toFixed(2)}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold">Total Labor Cost</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold whitespace-nowrap">${laborCost.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Project Summary */}
            <div className="border-t pt-8">
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => setIsProjectSummaryOpen(!isProjectSummaryOpen)}
              >
                <h3 className="text-base font-semibold">Project Summary</h3>
                {isProjectSummaryOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <div className={`transition-all duration-300 ease-in-out ${isProjectSummaryOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Total Material Cost</span>
                        <span className="text-lg font-semibold">
                          ${totalMaterialCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">Base Material Profit</span>
                        <span className="text-sm font-medium text-green-600">
                          ${materialBaseProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-3 text-xs space-y-1">
                        <div className="text-gray-500 font-medium">Material Profit Details:</div>
                        <div>
                          <div className="flex justify-between">
                            <span>GAF Timberline HDZ Shingles</span>
                            <span className="text-green-600">${((totalSquares * shinglesBasePrice) - (totalSquares * 121.68)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${shinglesBasePrice.toFixed(2)}/SQ × {totalSquares.toFixed(2)} SQ
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: $121.68/SQ × {totalSquares.toFixed(2)} SQ
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>GAF Weatherwatch Ice & Water Shield</span>
                            <span className="text-green-600">${((underlaymentRollsNeeded * underlaymentRetailPrice) - (underlaymentRollsNeeded * 94.00)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${underlaymentRetailPrice.toFixed(2)}/EA × {underlaymentRollsNeeded} EA
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: $94.00/EA × {underlaymentRollsNeeded} EA
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>ACM Galvalume Drip Edge</span>
                            <span className="text-green-600">${((acmGalvalumeDripEdgeQuantity * acmGalvalumeDripEdgeBasePrice) - (acmGalvalumeDripEdgeQuantity * 5.50)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${acmGalvalumeDripEdgeBasePrice.toFixed(2)}/PC × {acmGalvalumeDripEdgeQuantity} PC
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: $5.50/PC × {acmGalvalumeDripEdgeQuantity} PC
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>Coil Nails (2 3/8")</span>
                            <span className="text-green-600">${((coilNailsBoxesNeeded * coilNailsRetailPrice) - (coilNailsBoxesNeeded * coilNailsOurCost)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${coilNailsRetailPrice.toFixed(2)}/BX × {coilNailsBoxesNeeded} BX
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: ${coilNailsOurCost.toFixed(2)}/BX × {coilNailsBoxesNeeded} BX
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>Coil Nails (1 1/4")</span>
                            <span className="text-green-600">${((smallCoilNailsBoxesNeeded * smallCoilNailsRetailPrice) - (smallCoilNailsBoxesNeeded * smallCoilNailsOurCost)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${smallCoilNailsRetailPrice.toFixed(2)}/BX × {smallCoilNailsBoxesNeeded} BX
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: ${smallCoilNailsOurCost.toFixed(2)}/BX × {smallCoilNailsBoxesNeeded} BX
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>Plastic Cap Nails</span>
                            <span className="text-green-600">${((plasticCapNailsBoxesNeeded * plasticCapNailsRetailPrice) - (plasticCapNailsBoxesNeeded * plasticCapNailsOurCost)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${plasticCapNailsRetailPrice.toFixed(2)}/BX × {plasticCapNailsBoxesNeeded} BX
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: ${plasticCapNailsOurCost.toFixed(2)}/BX × {plasticCapNailsBoxesNeeded} BX
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>Geocel Sealant</span>
                            <span className="text-green-600">${((geocelSealantUnitsNeeded * geocelSealantRetailPrice) - (geocelSealantUnitsNeeded * geocelSealantOurCost)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${geocelSealantRetailPrice.toFixed(2)}/EA × {geocelSealantUnitsNeeded} EA
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: ${geocelSealantOurCost.toFixed(2)}/EA × {geocelSealantUnitsNeeded} EA
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>Karnak Roof Tar</span>
                            <span className="text-green-600">${((karnakTarUnitsNeeded * karnakTarRetailPrice) - (karnakTarUnitsNeeded * karnakTarOurCost)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${karnakTarRetailPrice.toFixed(2)}/EA × {karnakTarUnitsNeeded} EA
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: ${karnakTarOurCost.toFixed(2)}/EA × {karnakTarUnitsNeeded} EA
                          </div>
                        </div>
                        {isRidgeVentSelected && (
                          <div>
                            <div className="flex justify-between">
                              <span>GAF Cobra Rigid Vent</span>
                              <span className="text-green-600">${((ridgeVentPiecesNeeded * ridgeVentRetailPrice) - (ridgeVentPiecesNeeded * ridgeVentOurCost)).toFixed(2)}</span>
                            </div>
                            <div className="text-gray-400 text-[11px] italic pl-2">
                              Our Retail Price: ${ridgeVentRetailPrice.toFixed(2)}/PC × {ridgeVentPiecesNeeded} PC
                            </div>
                            <div className="text-gray-400 text-[11px] italic pl-2">
                              Manufacturer Cost: ${ridgeVentOurCost.toFixed(2)}/PC × {ridgeVentPiecesNeeded} PC
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Total Labor Cost</span>
                        <span className="text-lg font-semibold">${laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">Base Labor Profit</span>
                        <span className="text-sm font-medium text-green-600">
                          ${laborBaseProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-3 text-xs space-y-1">
                        <div className="text-gray-500 font-medium">Labor Profit Details:</div>
                        <div>
                          <div className="flex justify-between">
                            <span>Base Installation</span>
                            <span className="text-green-600">${(baseInstallationCost - (baseInstallationUnitsNeeded * baseInstallationOurCost)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${baseInstallationRetailPrice.toFixed(2)}/EA × {baseInstallationUnitsNeeded.toFixed(2)} EA
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: ${baseInstallationOurCost.toFixed(2)}/EA × {baseInstallationUnitsNeeded.toFixed(2)} EA
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>CDX Plywood</span>
                            <span className="text-green-600">${(cdxPlywoodCost - (cdxPlywoodQuantity * cdxPlywoodOurCost)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${cdxPlywoodRetailPrice.toFixed(2)}/BRD × {cdxPlywoodQuantity} BRD
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: ${cdxPlywoodOurCost.toFixed(2)}/BRD × {cdxPlywoodQuantity} BRD
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>Dumpster</span>
                            <span className="text-green-600">${(dumpsterCost - (dumpsterUnitsNeeded * dumpsterOurCost)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${dumpsterRetailPrice.toFixed(2)}/EA × {dumpsterUnitsNeeded} EA
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: ${dumpsterOurCost.toFixed(2)}/EA × {dumpsterUnitsNeeded} EA
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>Permits and Inspections</span>
                            <span className="text-green-600">${(permitsCost - (permitsUnitsNeeded * permitsOurCost)).toFixed(2)}</span>
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Our Retail Price: ${permitsRetailPrice.toFixed(2)}/EA × {permitsUnitsNeeded} EA
                          </div>
                          <div className="text-gray-400 text-[11px] italic pl-2">
                            Manufacturer Cost: ${permitsOurCost.toFixed(2)}/EA × {permitsUnitsNeeded} EA
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Base Profit</span>
                      <span className="text-lg font-semibold text-green-600">
                        ${totalBaseProfit.toFixed(2)}
                      </span>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 