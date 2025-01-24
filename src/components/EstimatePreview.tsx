import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoofMeasurements, PricingConfig, AdditionalMaterials, UnderlaymentType, EstimateItem, Estimate } from '@/types/estimate';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { estimateService } from '@/services/estimateService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EstimatePreviewProps {
  measurements: RoofMeasurements;
  pricing: PricingConfig;
  additionalMaterials: AdditionalMaterials;
  underlaymentType: UnderlaymentType;
  onGeneratePDF: () => Promise<void>;
}

type LengthMeasurementKey = keyof NonNullable<RoofMeasurements['length_measurements']>;

type PriceTier = 'standard' | 'economy' | 'premium' | 'custom';

export function EstimatePreview({ measurements, pricing, additionalMaterials, underlaymentType, onGeneratePDF }: EstimatePreviewProps) {
  const [profitMargin, setProfitMargin] = useState(0);
  const [wastePercentage, setWastePercentage] = useState(12); // Default 12% waste
  const [selectedPriceTier, setSelectedPriceTier] = useState<PriceTier>('standard');
  const [shinglesMarkup, setShinglesMarkup] = useState(0);
  const [underlaymentMarkup, setUnderlaymentMarkup] = useState(0);
  const [acmMarkup, setAcmMarkup] = useState(0);
  const [cdxPlywoodQuantity, setCdxPlywoodQuantity] = useState(1);
  const [isRidgeVentSelected, setIsRidgeVentSelected] = useState(false);
  const [ridgeVentQuantity, setRidgeVentQuantity] = useState(0);
  
  // Add state for new add-ons
  const [offRidgeVentSelected, setOffRidgeVentSelected] = useState(false);
  const [offRidgeVentQuantity, setOffRidgeVentQuantity] = useState(0);
  const [gooseneck4Selected, setGooseneck4Selected] = useState(false);
  const [gooseneck4Quantity, setGooseneck4Quantity] = useState(0);
  const [gooseneck10Selected, setGooseneck10Selected] = useState(false);
  const [gooseneck10Quantity, setGooseneck10Quantity] = useState(0);
  const [leadFlashing15Selected, setLeadFlashing15Selected] = useState(false);
  const [leadFlashing15Quantity, setLeadFlashing15Quantity] = useState(0);
  const [leadFlashing2Selected, setLeadFlashing2Selected] = useState(false);
  const [leadFlashing2Quantity, setLeadFlashing2Quantity] = useState(0);
  const [leadFlashing3Selected, setLeadFlashing3Selected] = useState(false);
  const [leadFlashing3Quantity, setLeadFlashing3Quantity] = useState(0);
  const [bulletBoot15Selected, setBulletBoot15Selected] = useState(false);
  const [bulletBoot15Quantity, setBulletBoot15Quantity] = useState(0);
  const [bulletBoot2Selected, setBulletBoot2Selected] = useState(false);
  const [bulletBoot2Quantity, setBulletBoot2Quantity] = useState(0);
  const [bulletBoot3Selected, setBulletBoot3Selected] = useState(false);
  const [bulletBoot3Quantity, setBulletBoot3Quantity] = useState(0);
  const [bulletBoot4Selected, setBulletBoot4Selected] = useState(false);
  const [bulletBoot4Quantity, setBulletBoot4Quantity] = useState(0);
  const [zipSealSelected, setZipSealSelected] = useState(false);
  const [zipSealQuantity, setZipSealQuantity] = useState(0);
  
  // Add new state for ISO Board
  const [isoBoardSelected, setIsoBoardSelected] = useState(false);
  const [isoBoardQuantity, setIsoBoardQuantity] = useState(0);
  
  // Add new state for Base & Cap Install SA
  const [baseCapInstallSelected, setBaseCapInstallSelected] = useState(false);
  const [baseCapInstallQuantity, setBaseCapInstallQuantity] = useState(0);
  
  // Add price constants for ISO Board
  const isoBoardRetailPrice = 54.50;
  const isoBoardOurCost = 54.50;
  const isoBoardCost = isoBoardSelected ? isoBoardQuantity * isoBoardRetailPrice : 0;
  
  // Add price constants for Base & Cap Install SA
  const baseCapInstallRetailPrice = 109.00;
  const baseCapInstallOurCost = 109.00;
  const baseCapInstallCost = baseCapInstallSelected ? baseCapInstallQuantity * baseCapInstallRetailPrice : 0;
  
  // Add state for collapsible sections
  const [isMeasurementsOpen, setIsMeasurementsOpen] = useState(true);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(true);
  const [isLaborOpen, setIsLaborOpen] = useState(true);
  const [isProjectSummaryOpen, setIsProjectSummaryOpen] = useState(true);

  // Add new state for GAF Liberty Base Sheet
  const [isLibertyBaseSheetSelected, setIsLibertyBaseSheetSelected] = useState(false);
  const [libertyBaseSheetQuantity, setLibertyBaseSheetQuantity] = useState(1);

  // Add price constants for Liberty Base Sheet
  const libertyBaseSheetRetailPrice = 112.74;  // Updated from 124.48
  const libertyBaseSheetOurCost = 112.74;  // Updated from 112.74
  const libertyBaseSheetCost = isLibertyBaseSheetSelected ? libertyBaseSheetQuantity * libertyBaseSheetRetailPrice : 0;

  // Add state for Liberty Cap Sheet
  const [isLibertyCapSheetSelected, setIsLibertyCapSheetSelected] = useState(false);
  const [libertyCapSheetQuantity, setLibertyCapSheetQuantity] = useState(1);

  // Add price constants for Liberty Cap Sheet
  const libertyCapSheetRetailPrice = 115.08;  // Updated from 124.48
  const libertyCapSheetOurCost = 115.08;  // Updated from 115.08
  const libertyCapSheetCost = isLibertyCapSheetSelected ? libertyCapSheetQuantity * libertyCapSheetRetailPrice : 0;

  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Add coordinates display at the top
  const hasCoordinates = measurements.longitude !== undefined && measurements.latitude !== undefined;
  const coordinatesSection = hasCoordinates ? (
    <div className="mb-4 text-sm text-gray-600">
      <p>Property Location:</p>
      <p>Longitude: {measurements.longitude?.toFixed(6)}</p>
      <p>Latitude: {measurements.latitude?.toFixed(6)}</p>
    </div>
  ) : null;

  const formatLengthMeasurement = (key: LengthMeasurementKey) => {
    const measurement = measurements.length_measurements?.[key];
    if (measurement) {
      return `${measurement.length} ft (${measurement.count} ${measurement.count > 1 ? 'pieces' : 'piece'})`;
    }
    return `${measurements[key as keyof RoofMeasurements] || 0} ft`;
  };

  // Calculate material quantities
  const calculateValidSquares = () => {
    // Always calculate squares from total area
    const totalSquares = measurements.total_area / 100;

    if (!measurements.areas_per_pitch || !measurements.areas_per_pitch.length) {
      return Math.ceil(totalSquares);
    }

    let lowPitchArea = 0;

    // Calculate total low pitch area to subtract
    measurements.areas_per_pitch.forEach((pitchData) => {
      const pitchValue = parseInt(pitchData.pitch.split('/')[0]);
      if (pitchValue <= 2) {
        lowPitchArea += pitchData.area;
      }
    });

    // Convert low pitch area to squares and subtract from total squares
    const lowPitchSquares = lowPitchArea / 100;
    const validSquares = totalSquares - lowPitchSquares;

    // Round up to the nearest whole number
    const roundedSquares = Math.ceil(validSquares);

    console.log('Total Area (sq ft):', measurements.total_area.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
    console.log('Total Squares (before low pitch subtraction):', totalSquares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    console.log('Low pitch area (1/12 and 2/12) (sq ft):', lowPitchArea.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
    console.log('Low pitch squares:', lowPitchSquares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    console.log('Valid squares for shingles (before rounding):', validSquares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    console.log('Final squares (rounded up):', roundedSquares.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));

    return roundedSquares;
  };

  // Get base squares from the calculation
  const baseSquares = Math.ceil(calculateValidSquares());
  
  // Calculate total squares with waste and round up
  const totalSquares = Math.ceil(baseSquares * (1 + wastePercentage / 100));

  const ridgeLength = measurements.length_measurements?.ridges?.length || 0;
  const valleyLength = measurements.length_measurements?.valleys?.length || 0;
  const eaveLength = measurements.eaves || 0;
  const rakeLength = measurements.rakes || 0;
  const flashingLength = measurements.length_measurements?.flashing?.length || 0;
  const stepFlashingLength = measurements.length_measurements?.step_flashing?.length || 0;

  // Calculate pitch first
  const pitch = measurements.predominant_pitch ? parseInt(measurements.predominant_pitch.split('/')[0]) : 6;
  
  // Calculate base installation price based on pitch
  const baseInstallationManufacturerPrice = pitch <= 7 ? 75.00 : pitch <= 9 ? 90.00 : 100.00;
  const baseInstallationUnitsNeeded = totalSquares;  // 1 EA needed per square
  const baseInstallationCost = baseInstallationUnitsNeeded * baseInstallationManufacturerPrice;  // Using manufacturer cost for customer

  // Calculate quantities and base prices
  const shinglesBasePrice = 121.68;  // Manufacturer cost per square
  const shinglesWasteFactor = 1.12;  // Fixed 12% waste for GAF Timberline HDZ SG Shingles
  const shinglesQuantityNeeded = Math.ceil(baseSquares * shinglesWasteFactor);  // Apply 12% waste to base squares
  const shinglesCost = shinglesQuantityNeeded * shinglesBasePrice;  // Calculate cost with waste

  // Format numbers with commas and proper decimals
  const formatCurrency = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatQuantity = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const underlaymentRollsNeeded = Math.ceil(totalSquares / 1.6);  // 1 roll covers 1.6 squares
  const underlaymentManufacturerPrice = 94.00;  // Manufacturer cost per roll
  const ridgeCapsCost = ridgeLength * pricing.materials.ridge_caps.price;
  const coilNailsManufacturerPrice = 64.44;  // Updated from 66.69
  const smallCoilNailsManufacturerPrice = 53.89;  // Updated from 58.78
  const plasticCapNailsManufacturerPrice = 39.44;  // Updated from 41.39
  const geocelSealantManufacturerPrice = 9.69;  // Updated from 12.11
  const karnakTarManufacturerPrice = 42.06;  // Manufacturer cost per unit
  const cdxPlywoodManufacturerPrice = 100.00;  // Manufacturer cost per board
  const dumpsterManufacturerPrice = 550.00;  // Manufacturer cost per dumpster
  const permitsManufacturerPrice = 2000.00;  // Manufacturer cost per permit

  // Calculate quantities based on measurements
  const coilNailsBoxesNeeded = Math.ceil(totalSquares / 24);  // 1 box per 24 squares
  const smallCoilNailsBoxesNeeded = Math.ceil(totalSquares / 15);  // 1 box per 15 squares
  const plasticCapNailsBoxesNeeded = Math.ceil(totalSquares / 20);  // 1 box per 20 squares
  const geocelSealantUnitsNeeded = Math.ceil(totalSquares / 10);  // 1 unit per 10 squares
  const karnakTarUnitsNeeded = Math.ceil(totalSquares / 20);  // 1 unit per 20 squares
  const dumpsterUnitsNeeded = Math.ceil(totalSquares / 30);  // 1 dumpster per 30 squares
  const permitsUnitsNeeded = 1;  // One permit needed for shingle roofs

  // Calculate costs with manufacturer prices
  const coilNailsCost = coilNailsBoxesNeeded * coilNailsManufacturerPrice;
  const smallCoilNailsCost = smallCoilNailsBoxesNeeded * smallCoilNailsManufacturerPrice;
  const plasticCapNailsCost = plasticCapNailsBoxesNeeded * plasticCapNailsManufacturerPrice;
  const geocelSealantCost = geocelSealantUnitsNeeded * geocelSealantManufacturerPrice;
  const karnakTarCost = karnakTarUnitsNeeded * karnakTarManufacturerPrice;
  const cdxPlywoodCost = cdxPlywoodQuantity * cdxPlywoodManufacturerPrice;
  const dumpsterCost = dumpsterUnitsNeeded * dumpsterManufacturerPrice;
  const permitsCost = permitsUnitsNeeded * permitsManufacturerPrice;

  // Calculate costs with markups
  const underlaymentCost = underlaymentRollsNeeded * underlaymentManufacturerPrice * (1 + underlaymentMarkup / 100);  // Using manufacturer cost for customer
  const acmGalvalumeDripEdgeBasePrice = 6.00;  // Manufacturer's price per piece
  const acmGalvalumeDripEdgeQuantity = Math.ceil((rakeLength + eaveLength) / 9);
  const acmGalvalumeDripEdgeCost = acmGalvalumeDripEdgeQuantity * acmGalvalumeDripEdgeBasePrice;  // Removed markup calculation
  const starterShingleCost = (totalSquares / 3) * 61.20;  // Using manufacturer's price of $61.20/box
  const sealARidgeCost = (totalSquares / 3) * 65.00;  // Using manufacturer's price of $65.00/bundle
  const ridgeVentRetailPrice = 18.89;  // Updated from 22.67
  const ridgeVentOurCost = 18.89;
  const calculatedRidgeVentPieces = Math.ceil(ridgeLength / 5);  // 1 piece covers 5 LF of ridges
  const ridgeVentPiecesNeeded = ridgeVentQuantity || calculatedRidgeVentPieces;
  const ridgeVentCost = isRidgeVentSelected ? ridgeVentPiecesNeeded * ridgeVentRetailPrice : 0;

  // Add new add-on prices and calculations
  const offRidgeVentRetailPrice = 75.00;  // Updated from 78.49
  const offRidgeVentOurCost = 75.00;
  const offRidgeVentCost = offRidgeVentSelected ? offRidgeVentQuantity * offRidgeVentRetailPrice : 0;

  const gooseneck4RetailPrice = 38.50;  // Updated from 41.40
  const gooseneck4OurCost = 38.50;
  const gooseneck4Cost = gooseneck4Selected ? gooseneck4Quantity * gooseneck4RetailPrice : 0;

  const gooseneck10RetailPrice = 48.88;  // Updated from 51.18
  const gooseneck10OurCost = 48.88;
  const gooseneck10Cost = gooseneck10Selected ? gooseneck10Quantity * gooseneck10RetailPrice : 0;

  const leadFlashing15RetailPrice = 13.20;  // Updated from 16.68
  const leadFlashing15OurCost = 13.20;
  const leadFlashing15Cost = leadFlashing15Selected ? leadFlashing15Quantity * leadFlashing15RetailPrice : 0;

  const leadFlashing2RetailPrice = 14.35;  // Updated from 17.83
  const leadFlashing2OurCost = 14.35;
  const leadFlashing2Cost = leadFlashing2Selected ? leadFlashing2Quantity * leadFlashing2RetailPrice : 0;

  const leadFlashing3RetailPrice = 18.95;  // Updated from 22.43
  const leadFlashing3OurCost = 18.95;
  const leadFlashing3Cost = leadFlashing3Selected ? leadFlashing3Quantity * leadFlashing3RetailPrice : 0;

  const bulletBoot15RetailPrice = 20.28;  // Updated from 19.55
  const bulletBoot15OurCost = 20.28;
  const bulletBoot15Cost = bulletBoot15Selected ? bulletBoot15Quantity * bulletBoot15RetailPrice : 0;

  const bulletBoot2RetailPrice = 20.64;  // Updated from 22.47
  const bulletBoot2OurCost = 20.64;
  const bulletBoot2Cost = bulletBoot2Selected ? bulletBoot2Quantity * bulletBoot2RetailPrice : 0;

  const bulletBoot3RetailPrice = 43.00;  // Updated from 53.75
  const bulletBoot3OurCost = 43.00;
  const bulletBoot3Cost = bulletBoot3Selected ? bulletBoot3Quantity * bulletBoot3RetailPrice : 0;

  const bulletBoot4RetailPrice = 43.49;  // Updated from 54.36
  const bulletBoot4OurCost = 43.49;
  const bulletBoot4Cost = bulletBoot4Selected ? bulletBoot4Quantity * bulletBoot4RetailPrice : 0;

  const zipSealRetailPrice = 28.25;  // Updated from 29.97
  const zipSealOurCost = 28.25;
  const zipSealCost = zipSealSelected ? zipSealQuantity * zipSealRetailPrice : 0;

  // Calculate total material cost using retail prices
  const totalMaterialCost = shinglesCost + underlaymentCost + starterShingleCost + sealARidgeCost + acmGalvalumeDripEdgeCost + 
    coilNailsCost + smallCoilNailsCost + plasticCapNailsCost + geocelSealantCost + karnakTarCost + ridgeVentCost +
    offRidgeVentCost + gooseneck4Cost + gooseneck10Cost + leadFlashing15Cost + leadFlashing2Cost + leadFlashing3Cost +
    bulletBoot15Cost + bulletBoot2Cost + bulletBoot3Cost + bulletBoot4Cost + zipSealCost + libertyBaseSheetCost + libertyCapSheetCost +
    isoBoardCost + baseCapInstallCost;

  // Calculate labor based on pitch
  const laborMultiplier = pitch <= 7 ? 1 : pitch <= 9 ? 1.2 : pitch <= 12 ? 1.5 : 2;
  const laborCost = baseInstallationCost + cdxPlywoodCost + dumpsterCost + permitsCost;

  // Calculate the standard price per square based on total cost divided by total squares
  const totalCostWithLabor = totalMaterialCost + laborCost;
  const standardPricePerSquare = totalCostWithLabor / totalSquares;
  const economyPricePerSquare = standardPricePerSquare * 0.9; // -10% markup
  const premiumPricePerSquare = standardPricePerSquare * 1.2; // +20% markup

  // Total cost
  const totalCost = shinglesCost + underlaymentCost + ridgeCapsCost + laborCost;

  console.log('Rake Length:', rakeLength);
  console.log('Eave Length:', eaveLength);

  // Calculate adjusted profits
  const adjustedMaterialProfit = totalMaterialCost * (profitMargin / 100);
  const adjustedLaborProfit = laborCost * (profitMargin / 100);
  const adjustedTotalProfit = adjustedMaterialProfit + adjustedLaborProfit;
  const finalTotalCost = totalMaterialCost + laborCost + adjustedTotalProfit;
  const finalMaterialCost = totalMaterialCost + adjustedMaterialProfit;
  const finalLaborCost = laborCost + adjustedLaborProfit;

  const selectedShingle = pricing.materials.shingles.name;

  // Fix status type and variable declarations
  const estimate: Estimate = {
    customerName: customerName.trim(),
    address: customerAddress.trim(),
    date: new Date().toLocaleDateString(),
    totalCost: totalCost,
    profitMargin: profitMargin,
    status: 'pending',
    selectedPriceTier: selectedPriceTier,
    measurements: {
      ...measurements,
      longitude: measurements.longitude,
      latitude: measurements.latitude
    },
    materialCosts: {
      base: totalMaterialCost,
      withProfit: finalTotalCost
    },
    laborCosts: {
      base: laborCost,
      withProfit: finalTotalCost - totalMaterialCost
    },
    items: [
      {
        name: 'GAF Timberline HDZ SG Shingles',
        quantity: shinglesQuantityNeeded,
        unit: 'squares',
        price: shinglesCost
      }
    ]
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateAndDownloadPDF = async () => {
    try {
      await onGeneratePDF();
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleSaveEstimate = async () => {
    try {
      // Validate customer information
      if (!customerName.trim() || !customerAddress.trim()) {
        toast.error('Please fill in customer information');
        return;
      }

      // Validate price tier selection
      if (!selectedPriceTier) {
        toast.error('Please select a pricing tier (Standard, Economy, Premium, or Custom)');
        return;
      }

      setIsSaving(true);

      // Create the estimate items
      const estimateItems: EstimateItem[] = [
        {
          name: 'GAF Timberline HDZ SG Shingles',
          quantity: shinglesQuantityNeeded,
          unit: 'SQ',
          price: shinglesBasePrice
        },
        {
          name: 'CDX Plywood 4x8 - 7/16"',
          quantity: cdxPlywoodQuantity,
          unit: 'BRD',
          price: cdxPlywoodManufacturerPrice
        }
      ];

      // Create the estimate object
      const estimate: Estimate = {
        customerName: customerName.trim(),
        address: customerAddress.trim(),
        date: new Date().toLocaleDateString(),
        status: 'pending',
        totalCost: totalCost,
        profitMargin: profitMargin,
        selectedPriceTier: selectedPriceTier,
        measurements: {
          ...measurements,
          longitude: measurements.longitude,
          latitude: measurements.latitude
        },
        materialCosts: {
          base: totalMaterialCost,
          withProfit: finalTotalCost,
        },
        laborCosts: {
          base: laborCost,
          withProfit: finalTotalCost - totalMaterialCost,
        },
        items: estimateItems
      };

      // Save the estimate
      await estimateService.saveEstimate(estimate);
      toast.success('Estimate saved successfully!');
      
      // Generate PDF after saving
      await handleGenerateAndDownloadPDF();
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonAriaLabel = () => {
    if (isSaving) return "Saving estimate";
    if (!selectedPriceTier || !customerName.trim() || !customerAddress.trim()) return "Please select a pricing tier and fill in customer information";
    return "Save this estimate";
  };

  const getButtonTitle = () => {
    if (!selectedPriceTier || !customerName.trim() || !customerAddress.trim()) return "Please select a pricing tier and fill in customer information";
    return "Save this estimate";
  };

  // Customer Information Section
  const customerInformationSection = (
    <div className="mb-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="customerAddress">Customer Address</Label>
          <Input
            id="customerAddress"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Enter customer address"
            className="mt-1"
          />
        </div>
        {coordinatesSection}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {coordinatesSection}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Add CustomerInformation component here */}
            {customerInformationSection}
            
            {/* Waste Percentage Input */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-blue-900">Suggested Waste Percentage</h3>
                  <p className="text-sm text-blue-700">Adjust the waste percentage to account for material overage</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={wastePercentage}
                    onChange={(e) => setWastePercentage(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-20 px-2 py-1 text-lg font-semibold text-blue-900 bg-white border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Waste percentage"
                    title="Enter waste percentage"
                  />
                  <span className="text-lg font-semibold text-blue-900">%</span>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-sm text-blue-700">
                <span>Base Squares: {formatQuantity(Math.ceil(baseSquares))}</span>
                <span>→</span>
                <span>Total with Waste: {formatQuantity(Math.ceil(totalSquares))}</span>
              </div>
            </div>

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
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm">{selectedShingle}</td>
                        <td className="px-4 py-3 text-sm">{formatQuantity(shinglesQuantityNeeded)} SQ</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(shinglesBasePrice)}/SQ</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          ${formatCurrency(shinglesCost)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">GAF Weatherwatch Ice & Water Shield (2sq)</td>
                        <td className="px-4 py-3 text-sm">{underlaymentRollsNeeded} EA</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(underlaymentManufacturerPrice)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          ${formatCurrency(underlaymentCost)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">GAF ProStart Starter Shingle Strip (120')</td>
                        <td className="px-4 py-3 text-sm">{formatQuantity(Math.ceil((rakeLength + eaveLength) / 110))} BD</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(61.20)}/BD</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(Math.ceil((rakeLength + eaveLength) / 110) * 61.20)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">GAF Seal-A-Ridge (25')</td>
                        <td className="px-4 py-3 text-sm">{formatQuantity(Math.ceil(((measurements.ridges ?? 0) + (measurements.hips ?? 0)) / 20))} BD</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(65.00)}/BD</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(Math.ceil(((measurements.ridges ?? 0) + (measurements.hips ?? 0)) / 20) * 65.00)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">ACM Galvalume Drip Edge - 26GA - F2.5 (10')</td>
                        <td className="px-4 py-3 text-sm">{formatQuantity(acmGalvalumeDripEdgeQuantity)} PC</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(6.00)}/PC</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(acmGalvalumeDripEdgeCost)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Coil Nails - 2 3/8" (4500 Cnt)</td>
                        <td className="px-4 py-3 text-sm">{coilNailsBoxesNeeded} BX</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(coilNailsManufacturerPrice)}/BX</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(coilNailsCost)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Roofing Coil Nails - 1 1/4" (7200 Cnt)</td>
                        <td className="px-4 py-3 text-sm">{smallCoilNailsBoxesNeeded} BX</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(smallCoilNailsManufacturerPrice)}/BX</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(smallCoilNailsCost)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Plastic Cap Nails - 1" (3000 Cnt)</td>
                        <td className="px-4 py-3 text-sm">{plasticCapNailsBoxesNeeded} BX</td>
                        <td className="px-4 py-3 text-sm">${plasticCapNailsManufacturerPrice.toFixed(2)}/BX</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${plasticCapNailsCost.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Geocel 2300 Construction TriPolymer Sealant (10.3 oz)</td>
                        <td className="px-4 py-3 text-sm">{geocelSealantUnitsNeeded} EA</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(geocelSealantManufacturerPrice)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(geocelSealantCost)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Karnak 19 Ultra Roof Tar - 5Gal</td>
                        <td className="px-4 py-3 text-sm">{karnakTarUnitsNeeded} EA</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(karnakTarManufacturerPrice)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(karnakTarCost)}</td>
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
                              aria-label="Select GAF Cobra Rigid Vent"
                              title="Include GAF Cobra Rigid Vent in estimate"
                            />
                            <span>GAF Cobra Rigid Vent 3 Exhaust Ridge Vent w/ Nails - 11-1/2" (4')</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isRidgeVentSelected ? (
                            <input
                              type="number"
                              value={ridgeVentQuantity}
                              onChange={(e) => setRidgeVentQuantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="Ridge vent quantity"
                              title="Enter quantity of ridge vent pieces"
                            />
                          ) : '-'} PC
                        </td>
                        <td className="px-4 py-3 text-sm">${ridgeVentRetailPrice.toFixed(2)}/PC</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${ridgeVentCost.toFixed(2)}</td>
                      </tr>

                      {/* New Add-ons */}
                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={offRidgeVentSelected}
                              onChange={(e) => {
                                setOffRidgeVentSelected(e.target.checked);
                                if (e.target.checked && !offRidgeVentQuantity) {
                                  setOffRidgeVentQuantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select TAMCO off ridge vent"
                              title="Include TAMCO off ridge vent in estimate"
                            />
                            <span>TAMCO Galvanized Steel Off Ridge Vent (4') - w/ Diverter</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {offRidgeVentSelected ? (
                            <input
                              type="number"
                              value={offRidgeVentQuantity}
                              onChange={(e) => setOffRidgeVentQuantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="Off ridge vent quantity"
                              title="Enter quantity of off ridge vent pieces"
                            />
                          ) : '-'} PC
                        </td>
                        <td className="px-4 py-3 text-sm">${offRidgeVentRetailPrice.toFixed(2)}/PC</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${offRidgeVentCost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={gooseneck4Selected}
                              onChange={(e) => {
                                setGooseneck4Selected(e.target.checked);
                                if (e.target.checked && !gooseneck4Quantity) {
                                  setGooseneck4Quantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select 4-inch gooseneck vent"
                              title="Include 4-inch gooseneck vent in estimate"
                            />
                            <span>Galvanized Steel Gooseneck Exhaust Vent - 4"</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {gooseneck4Selected ? (
                            <input
                              type="number"
                              value={gooseneck4Quantity}
                              onChange={(e) => setGooseneck4Quantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="4-inch gooseneck quantity"
                              title="Enter quantity of 4-inch gooseneck vents"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${gooseneck4RetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${gooseneck4Cost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={gooseneck10Selected}
                              onChange={(e) => {
                                setGooseneck10Selected(e.target.checked);
                                if (e.target.checked && !gooseneck10Quantity) {
                                  setGooseneck10Quantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select 10-inch gooseneck vent"
                              title="Include 10-inch gooseneck vent in estimate"
                            />
                            <span>Galvalume Gooseneck Exhaust Vent - 10"</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {gooseneck10Selected ? (
                            <input
                              type="number"
                              value={gooseneck10Quantity}
                              onChange={(e) => setGooseneck10Quantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="10-inch gooseneck quantity"
                              title="Enter quantity of 10-inch gooseneck vents"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${gooseneck10RetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${gooseneck10Cost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={leadFlashing15Selected}
                              onChange={(e) => {
                                setLeadFlashing15Selected(e.target.checked);
                                if (e.target.checked && !leadFlashing15Quantity) {
                                  setLeadFlashing15Quantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select 1.5-inch lead flashing"
                              title="Include 1.5-inch lead flashing in estimate"
                            />
                            <span>Lead Pipe Flashing - 2.5# - 1 1/2"</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {leadFlashing15Selected ? (
                            <input
                              type="number"
                              value={leadFlashing15Quantity}
                              onChange={(e) => setLeadFlashing15Quantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="1.5-inch lead flashing quantity"
                              title="Enter quantity of 1.5-inch lead flashing"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${leadFlashing15RetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${leadFlashing15Cost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={leadFlashing2Selected}
                              onChange={(e) => {
                                setLeadFlashing2Selected(e.target.checked);
                                if (e.target.checked && !leadFlashing2Quantity) {
                                  setLeadFlashing2Quantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select 2-inch lead flashing"
                              title="Include 2-inch lead flashing in estimate"
                            />
                            <span>Lead Pipe Flashing - 2"</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {leadFlashing2Selected ? (
                            <input
                              type="number"
                              value={leadFlashing2Quantity}
                              onChange={(e) => setLeadFlashing2Quantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="2-inch lead flashing quantity"
                              title="Enter quantity of 2-inch lead flashing"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${leadFlashing2RetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${leadFlashing2Cost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={leadFlashing3Selected}
                              onChange={(e) => {
                                setLeadFlashing3Selected(e.target.checked);
                                if (e.target.checked && !leadFlashing3Quantity) {
                                  setLeadFlashing3Quantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select 3-inch lead flashing"
                              title="Include 3-inch lead flashing in estimate"
                            />
                            <span>Lead Pipe Flashing - 3"</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {leadFlashing3Selected ? (
                            <input
                              type="number"
                              value={leadFlashing3Quantity}
                              onChange={(e) => setLeadFlashing3Quantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="3-inch lead flashing quantity"
                              title="Enter quantity of 3-inch lead flashing"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${leadFlashing3RetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${leadFlashing3Cost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={bulletBoot15Selected}
                              onChange={(e) => {
                                setBulletBoot15Selected(e.target.checked);
                                if (e.target.checked && !bulletBoot15Quantity) {
                                  setBulletBoot15Quantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select 1.5-inch bullet boot"
                              title="Include 1.5-inch bullet boot in estimate"
                            />
                            <span>Bullet Boot Pipe Flashing - 1 1/2"</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {bulletBoot15Selected ? (
                            <input
                              type="number"
                              value={bulletBoot15Quantity}
                              onChange={(e) => setBulletBoot15Quantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="1.5-inch bullet boot quantity"
                              title="Enter quantity of 1.5-inch bullet boots"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${bulletBoot15RetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${bulletBoot15Cost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={bulletBoot2Selected}
                              onChange={(e) => {
                                setBulletBoot2Selected(e.target.checked);
                                if (e.target.checked && !bulletBoot2Quantity) {
                                  setBulletBoot2Quantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select 2-inch bullet boot"
                              title="Include 2-inch bullet boot in estimate"
                            />
                            <span>Bullet Boot Pipe Flashing - 2"</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {bulletBoot2Selected ? (
                            <input
                              type="number"
                              value={bulletBoot2Quantity}
                              onChange={(e) => setBulletBoot2Quantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="2-inch bullet boot quantity"
                              title="Enter quantity of 2-inch bullet boots"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${bulletBoot2RetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${bulletBoot2Cost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={bulletBoot3Selected}
                              onChange={(e) => {
                                setBulletBoot3Selected(e.target.checked);
                                if (e.target.checked && !bulletBoot3Quantity) {
                                  setBulletBoot3Quantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select 3-inch bullet boot"
                              title="Include 3-inch bullet boot in estimate"
                            />
                            <span>Bullet Boot Pipe Flashing - 3"</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {bulletBoot3Selected ? (
                            <input
                              type="number"
                              value={bulletBoot3Quantity}
                              onChange={(e) => setBulletBoot3Quantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="3-inch bullet boot quantity"
                              title="Enter quantity of 3-inch bullet boots"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${bulletBoot3RetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${bulletBoot3Cost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={bulletBoot4Selected}
                              onChange={(e) => {
                                setBulletBoot4Selected(e.target.checked);
                                if (e.target.checked && !bulletBoot4Quantity) {
                                  setBulletBoot4Quantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select 4-inch bullet boot"
                              title="Include 4-inch bullet boot in estimate"
                            />
                            <span>Bullet Boot Pipe Flashing - 4"</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {bulletBoot4Selected ? (
                            <input
                              type="number"
                              value={bulletBoot4Quantity}
                              onChange={(e) => setBulletBoot4Quantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="4-inch bullet boot quantity"
                              title="Enter quantity of 4-inch bullet boots"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${bulletBoot4RetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${bulletBoot4Cost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={zipSealSelected}
                              onChange={(e) => {
                                setZipSealSelected(e.target.checked);
                                if (e.target.checked && !zipSealQuantity) {
                                  setZipSealQuantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select zip seal"
                              title="Include zip seal in estimate"
                            />
                            <span>Golden Rule ZipSeal Large EPDM Retrofit Electric Mast Flashing - 0"-5 3/8" - Black</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {zipSealSelected ? (
                            <input
                              type="number"
                              value={zipSealQuantity}
                              onChange={(e) => setZipSealQuantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="Zip seal quantity"
                              title="Enter quantity of zip seals"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${zipSealRetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${zipSealCost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isLibertyBaseSheetSelected}
                              onChange={(e) => {
                                setIsLibertyBaseSheetSelected(e.target.checked);
                                if (e.target.checked && !libertyBaseSheetQuantity) {
                                  setLibertyBaseSheetQuantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select GAF Liberty SBS SA Base Sheet"
                              title="Include GAF Liberty Base Sheet in estimate"
                            />
                            <span>GAF Liberty SBS SA Base Sheet (2 sq)</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isLibertyBaseSheetSelected ? (
                            <input
                              type="number"
                              value={libertyBaseSheetQuantity}
                              onChange={(e) => setLibertyBaseSheetQuantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="Liberty Base Sheet quantity"
                              title="Enter quantity of Liberty Base Sheets needed"
                            />
                          ) : '-'} RL
                        </td>
                        <td className="px-4 py-3 text-sm">${libertyBaseSheetRetailPrice.toFixed(2)}/RL</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${libertyBaseSheetCost.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isLibertyCapSheetSelected}
                              onChange={(e) => {
                                setIsLibertyCapSheetSelected(e.target.checked);
                                if (e.target.checked && !libertyCapSheetQuantity) {
                                  setLibertyCapSheetQuantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select GAF Liberty SBS SA Cap Sheet"
                              title="Include GAF Liberty Cap Sheet in estimate"
                            />
                            <span>GAF Liberty SBS SA Cap Sheet (1 sq)</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isLibertyCapSheetSelected ? (
                            <input
                              type="number"
                              value={libertyCapSheetQuantity}
                              onChange={(e) => setLibertyCapSheetQuantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="Liberty Cap Sheet quantity"
                              title="Enter quantity of Liberty Cap Sheets needed"
                            />
                          ) : '-'} RL
                        </td>
                        <td className="px-4 py-3 text-sm">${libertyCapSheetRetailPrice.toFixed(2)}/RL</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${libertyCapSheetCost.toFixed(2)}</td>
                      </tr>

                      {/* ISO Board install option */}
                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isoBoardSelected}
                              onChange={(e) => {
                                setIsoBoardSelected(e.target.checked);
                                if (e.target.checked && !isoBoardQuantity) {
                                  setIsoBoardQuantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select ISO Board install"
                              title="Include ISO Board install in estimate"
                            />
                            <span>ISO Board Install</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isoBoardSelected ? (
                            <input
                              type="number"
                              value={isoBoardQuantity}
                              onChange={(e) => setIsoBoardQuantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="ISO Board quantity"
                              title="Enter quantity of ISO Boards needed"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${isoBoardRetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${isoBoardCost.toFixed(2)}</td>
                      </tr>

                      {/* Base & Cap Install SA option */}
                      <tr>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={baseCapInstallSelected}
                              onChange={(e) => {
                                setBaseCapInstallSelected(e.target.checked);
                                if (e.target.checked && !baseCapInstallQuantity) {
                                  setBaseCapInstallQuantity(1);
                                }
                              }}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select Base & Cap Install SA"
                              title="Include Base & Cap Install SA in estimate"
                            />
                            <span>Base & Cap Install SA</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {baseCapInstallSelected ? (
                            <input
                              type="number"
                              value={baseCapInstallQuantity}
                              onChange={(e) => setBaseCapInstallQuantity(Number(e.target.value))}
                              className="ml-2 w-16 text-sm border rounded px-1"
                              aria-label="Base & Cap Install quantity"
                              title="Enter quantity needed for Base & Cap Install"
                            />
                          ) : '-'} EA
                        </td>
                        <td className="px-4 py-3 text-sm">${baseCapInstallRetailPrice.toFixed(2)}/EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${baseCapInstallCost.toFixed(2)}</td>
                      </tr>

                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold">Total Material Cost</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          ${formatCurrency(totalMaterialCost)}
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
                        <td className="px-4 py-3 text-sm whitespace-nowrap">${formatCurrency(baseInstallationManufacturerPrice)}/EA</td>
                        <td className="px-6 py-3 text-sm whitespace-nowrap">{formatQuantity(baseInstallationUnitsNeeded)} EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium whitespace-nowrap">${formatCurrency(baseInstallationCost)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">1/2"x4'x8' CDX Plywood - 4-Ply</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(cdxPlywoodManufacturerPrice)}/BRD</td>
                        <td className="px-4 py-3 text-sm">
                          <label className="sr-only" htmlFor="cdxPlywoodQuantity">CDX Plywood Quantity</label>
                          <input
                            id="cdxPlywoodQuantity"
                            type="number"
                            value={cdxPlywoodQuantity}
                            onChange={(e) => setCdxPlywoodQuantity(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-sm border rounded"
                            aria-label="CDX Plywood Quantity"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(cdxPlywoodCost)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Dumpster Service</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(dumpsterManufacturerPrice)}/EA</td>
                        <td className="px-4 py-3 text-sm">{dumpsterUnitsNeeded} EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(dumpsterCost)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Permits and Inspections</td>
                        <td className="px-4 py-3 text-sm">${formatCurrency(permitsManufacturerPrice)}/EA</td>
                        <td className="px-4 py-3 text-sm">{permitsUnitsNeeded} EA</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${formatCurrency(permitsCost)}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold">Total Labor Cost</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold whitespace-nowrap">${formatCurrency(laborCost)}</td>
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
                  {/* Price Tier Selection */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPriceTier === 'standard' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setSelectedPriceTier('standard');
                        setProfitMargin(0);
                      }}
                    >
                      <h4 className="text-lg font-semibold text-center mb-2">Standard</h4>
                      <p className="text-2xl font-bold text-center text-blue-600">${(totalCostWithLabor / totalSquares).toFixed(2)}<span className="text-sm font-normal">/Square</span></p>
                      <p className="text-sm text-gray-500 text-center mt-2">Base cost (0% profit)</p>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPriceTier === 'economy' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setSelectedPriceTier('economy');
                        setProfitMargin(10);
                      }}
                    >
                      <h4 className="text-lg font-semibold text-center mb-2">Economy</h4>
                      <p className="text-2xl font-bold text-center text-blue-600">${formatCurrency((totalCostWithLabor * 1.1) / totalSquares)}<span className="text-sm font-normal">/Square</span></p>
                      <p className="text-sm text-gray-500 text-center mt-2">10% profit margin</p>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPriceTier === 'premium' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setSelectedPriceTier('premium');
                        setProfitMargin(20);
                      }}
                    >
                      <h4 className="text-lg font-semibold text-center mb-2">Premium</h4>
                      <p className="text-2xl font-bold text-center text-blue-600">${formatCurrency((totalCostWithLabor * 1.2) / totalSquares)}<span className="text-sm font-normal">/Square</span></p>
                      <p className="text-sm text-gray-500 text-center mt-2">20% profit margin</p>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPriceTier === 'custom' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setSelectedPriceTier('custom');
                      }}
                    >
                      <h4 className="text-lg font-semibold text-center mb-2">Custom</h4>
                      <p className="text-2xl font-bold text-center text-blue-600">${formatCurrency((totalCostWithLabor * (1 + profitMargin / 100)) / totalSquares)}<span className="text-sm font-normal">/Square</span></p>
                      <p className="text-sm text-gray-500 text-center mt-2">Adjustable margin</p>
                    </div>
                  </div>

                  {/* Show detailed cost breakdown only when Custom is selected */}
                  {selectedPriceTier === 'custom' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Profit Margin</span>
                            <span className="text-lg font-semibold text-blue-600">{profitMargin}%</span>
                          </div>
                          <Slider
                            defaultValue={[0]}
                            max={100}
                            step={1}
                            className="w-full"
                            onValueChange={(values: number[]) => setProfitMargin(values[0])}
                            aria-label="Adjust profit margin percentage"
                            title="Drag to adjust profit margin percentage"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Total Material Cost (Base)</span>
                            <span className="text-lg font-semibold">
                              ${formatCurrency(totalMaterialCost)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">Additional Material Profit</span>
                            <span className="text-sm font-medium text-green-600">
                              ${formatCurrency(adjustedMaterialProfit)}
                            </span>
                          </div>
                          <div className="mt-4 text-xs space-y-2">
                            <div className="text-gray-600 font-medium border-b pb-1">Material Cost Breakdown:</div>
                            <div>
                              <div className="flex justify-between font-medium">
                                <span>{selectedShingle}</span>
                                <span>${formatCurrency(totalSquares * shinglesBasePrice * (1 + profitMargin / 100))}</span>
                              </div>
                              <div className="text-gray-500 text-[11px] pl-2">
                                Base Cost: ${formatCurrency(totalSquares * shinglesBasePrice)} ($121.68/SQ × {formatQuantity(totalSquares)} SQ)
                                {profitMargin > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (+${formatCurrency(totalSquares * shinglesBasePrice * profitMargin / 100)})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between font-medium">
                                <span>GAF Weatherwatch Ice & Water Shield</span>
                                <span>${formatCurrency(underlaymentRollsNeeded * underlaymentManufacturerPrice * (1 + profitMargin / 100))}</span>
                              </div>
                              <div className="text-gray-500 text-[11px] pl-2">
                                Base Cost: ${formatCurrency(underlaymentRollsNeeded * underlaymentManufacturerPrice)} ($94.00/EA × {underlaymentRollsNeeded} EA)
                                {profitMargin > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (+${formatCurrency(underlaymentRollsNeeded * underlaymentManufacturerPrice * profitMargin / 100)})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between font-medium">
                                <span>GAF ProStart Starter Shingle Strip</span>
                                <span>${formatCurrency(Math.ceil((rakeLength + eaveLength) / 110) * 61.20 * (1 + profitMargin / 100))}</span>
                              </div>
                              <div className="text-gray-500 text-[11px] pl-2">
                                Base Cost: ${formatCurrency(Math.ceil((rakeLength + eaveLength) / 110) * 61.20)} ($61.20/BD × {formatQuantity(Math.ceil((rakeLength + eaveLength) / 110))} BD)
                                {profitMargin > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (+${formatCurrency(Math.ceil((rakeLength + eaveLength) / 110) * 61.20 * profitMargin / 100)})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between font-medium">
                                <span>GAF Seal-A-Ridge</span>
                                <span>${formatCurrency(Math.ceil(((measurements.ridges ?? 0) + (measurements.hips ?? 0)) / 20) * 65.00 * (1 + profitMargin / 100))}</span>
                              </div>
                              <div className="text-gray-500 text-[11px] pl-2" title="Base cost calculation for GAF Seal-A-Ridge">
                                Base Cost: ${formatCurrency(Math.ceil(((measurements.ridges ?? 0) + (measurements.hips ?? 0)) / 20) * 65.00)} ($65.00/BD × {formatQuantity(Math.ceil(((measurements.ridges ?? 0) + (measurements.hips ?? 0)) / 20))} BD)
                                {profitMargin > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (+${formatCurrency(Math.ceil(((measurements.ridges ?? 0) + (measurements.hips ?? 0)) / 20) * 65.00 * profitMargin / 100)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Total Labor Cost (Base)</span>
                            <span className="text-lg font-semibold">${formatCurrency(laborCost)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">Additional Labor Profit</span>
                            <span className="text-sm font-medium text-green-600">
                              ${formatCurrency(adjustedLaborProfit)}
                            </span>
                          </div>
                          <div className="mt-4 text-xs space-y-2">
                            <div className="text-gray-600 font-medium border-b pb-1">Labor Cost Breakdown:</div>
                            <div>
                              <div className="flex justify-between font-medium">
                                <span>Base Installation</span>
                                <span>${formatCurrency(baseInstallationUnitsNeeded * baseInstallationManufacturerPrice)}</span>
                              </div>
                              <div className="text-gray-500 text-[11px] pl-2">
                                Base Rate: ${formatCurrency(baseInstallationManufacturerPrice)}/EA × {formatQuantity(baseInstallationUnitsNeeded)} EA
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between font-medium">
                                <span>CDX Plywood Installation</span>
                                <span>${formatCurrency(cdxPlywoodCost * (1 + profitMargin / 100))}</span>
                              </div>
                              <div className="text-gray-500 text-[11px] pl-2">
                                Base Cost: ${formatCurrency(cdxPlywoodCost)} ($100.00/BRD × {cdxPlywoodQuantity} BRD)
                                {profitMargin > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (+${formatCurrency(cdxPlywoodCost * profitMargin / 100)})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between font-medium">
                                <span>Dumpster Service</span>
                                <span>${formatCurrency(dumpsterCost * (1 + profitMargin / 100))}</span>
                              </div>
                              <div className="text-gray-500 text-[11px] pl-2">
                                Base Cost: ${formatCurrency(dumpsterCost)} ($550.00/EA × {dumpsterUnitsNeeded} EA)
                                {profitMargin > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (+${formatCurrency(dumpsterCost * profitMargin / 100)})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between font-medium">
                                <span>Permits and Inspections</span>
                                <span>${formatCurrency(permitsCost * (1 + profitMargin / 100))}</span>
                              </div>
                              <div className="text-gray-500 text-[11px] pl-2">
                                Base Cost: ${formatCurrency(permitsCost)} ($2000.00/EA × {permitsUnitsNeeded} EA)
                                {profitMargin > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (+${formatCurrency(permitsCost * profitMargin / 100)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Total Project Cost (Base)</span>
                          <span className="text-lg font-semibold">${formatCurrency(totalMaterialCost + laborCost)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">Additional Total Profit</span>
                          <span className="text-sm font-medium text-green-600">
                            ${formatCurrency(adjustedTotalProfit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-semibold text-blue-900">Final Project Total</span>
                        <span className="text-sm text-blue-700 ml-2">({selectedPriceTier} pricing)</span>
                      </div>
                      <span className="text-3xl font-bold text-blue-900">
                        ${formatCurrency(finalTotalCost)}
                      </span>
                    </div>
                  </div>
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

            {/* Add before the final closing div */}
            <div className="mt-8 flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={handleSaveEstimate}
                disabled={isSaving || !selectedPriceTier || !customerName.trim() || !customerAddress.trim()}
                className="min-w-[120px] relative"
                aria-label={getButtonAriaLabel()}
                title={getButtonTitle()}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Estimate'
                )}
              </Button>
              <Button
                variant="default"
                onClick={onGeneratePDF}
                disabled={isSaving || !selectedPriceTier || !customerName.trim() || !customerAddress.trim()}
                className="min-w-[200px]"
                aria-label="Generate professional estimate PDF"
                title={getButtonTitle()}
              >
                Generate Professional Estimate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 