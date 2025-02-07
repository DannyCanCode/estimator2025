// Measurement Types
export enum MeasurementType {
  TOTAL_AREA = 'total_area',
  PITCH_AREAS = 'pitch_areas',
  RIDGES = 'ridges',
  HIPS = 'hips',
  VALLEYS = 'valleys',
  RAKES = 'rakes',
  EAVES = 'eaves',
  DRIP_EDGE = 'drip_edge',
  FLASHING = 'flashing',
  STEP_FLASHING = 'step_flashing',
  PARAPET_WALLS = 'parapet_walls',
  PENETRATIONS = 'penetrations'
}

// Validation Rules
export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: RegExp;
  required?: boolean;
}

export const VALIDATION_RULES: Record<string, ValidationRule> = {
  totalArea: { min: 100, max: 100000, required: true },
  totalSquares: { min: 1, max: 1000, required: true },
  predominantPitch: { pattern: /^\d{1,2}\/12$/, required: true },
  ridgesLength: { min: 0, max: 1000, required: false },
  valleysLength: { min: 0, max: 1000, required: false },
  eavesLength: { min: 0, max: 1000, required: false },
  wasteSquares: { min: 0, max: 1000, required: false },
  suggestedWastePercentage: { min: 5, max: 20, required: false },
  numberOfStories: { min: 1, max: 5, required: true }
}

// Utility Functions
export const calculateWasteSquares = (
  totalSquares: number,
  ridgeLength: number,
  valleyLength: number,
  rakeLength: number,
  eaveLength: number
): number => {
  const baseWaste = 0.10; // 10% base waste
  const complexityFactor = (ridgeLength + valleyLength * 2 + rakeLength + eaveLength) / 1000;
  const additionalWaste = Math.min(0.05, complexityFactor * 0.01);
  return totalSquares * (baseWaste + additionalWaste);
};

// Measurement Interfaces
export interface LengthMeasurement {
  length: number;
  count: number;
}

export interface PitchDetail {
  pitch: string;
  area: number;
}

export interface RoofFacet {
  number: number;
  area: number;
}

export interface DebugInfo {
  extraction_method: string;
  tables_found?: number;
  parsed_data?: Array<{
    table_index: number;
    rows: string[];
  }>;
  extracted_text?: string;
  matches_found?: Record<string, any>;
  error?: string;
}

export interface ProcessedPdfData {
  measurements: RoofMeasurements;
  error?: string;
}

export interface RoofMeasurements {
  total_area: number;
  total_squares?: number;
  predominant_pitch: string;
  ridges?: number;
  valleys?: number;
  eaves?: number;
  rakes?: number;
  hips?: number;
  flashing?: number;
  step_flashing?: number;
  penetrations?: number;
  penetrations_perimeter?: number;
  waste_percentage?: number;
  suggested_waste_percentage?: number;
  debug_info?: {
    extraction_method: string;
    error?: string;
    tables_found?: number;
    extracted_text?: string;
    matches_found?: Record<string, boolean>;
  };
  areas_per_pitch?: Array<{
    pitch: string;
    area: number;
    percentage: number;
  }>;
  length_measurements?: {
    [key: string]: {
      length: number;
      count: number;
    };
  };
}

export interface MaterialCost {
  shingles: number;
  underlayment: number;
  starter: number;
  ridge_caps: number;
  drip_edge: number;
  ice_water: number;
  total: number;
}

export interface LaborCost {
  base: number;
  steep_slope: number;
  total: number;
}

export interface EstimateCosts {
  materials: MaterialCost;
  labor: LaborCost;
  total: number;
}

export interface PricingItem {
  name?: string;
  price: number;
  cost?: number;
  unit: string;
}

export enum UnderlaymentType {
  FELTBUSTER = 'GAF FeltBuster Synthetic Underlayment',
  ICE_AND_WATER = 'GAF Weatherwatch Ice & Water Shield',
  BOTH = 'Both FeltBuster and Ice & Water Shield'
}

export enum VentType {
  GOOSENECK_4 = 'Galvanized Steel Gooseneck Exhaust Vent - 4"',
  GOOSENECK_10 = 'Galvalume Gooseneck Exhaust Vent - 10"',
  OFF_RIDGE = 'Galvanized Steel 4ft Off Ridge Vent (Colored)'
}

export interface AdditionalMaterials {
  plywood_replacement?: boolean;
  flat_roof_iso?: boolean;
  base_cap?: boolean;
  pipe_flashings: Array<{
    size: '2"' | '3"';
    quantity: number;
  }>;
  vents: Array<{
    type: VentType;
    quantity: number;
  }>;
}

export interface MaterialsPricing {
  shingles: PricingItem;
  underlayment: {
    feltbuster: PricingItem;
    ice_and_water: PricingItem;
  };
  starter: PricingItem;
  ridge_caps: PricingItem;
  drip_edge: PricingItem;
  plywood: PricingItem;
  flat_roof_materials: {
    iso: PricingItem;
    base_cap: PricingItem;
  };
  pipe_flashings: {
    two_inch: PricingItem;
    three_inch: PricingItem;
  };
  vents: {
    gooseneck_4: PricingItem;
    gooseneck_10: PricingItem;
    off_ridge: PricingItem;
  };
  nails: {
    coil_2_3_8: PricingItem;
    coil_1_1_4: PricingItem;
    plastic_cap: PricingItem;
  };
  sealants: {
    geocel: PricingItem;
    roof_tar: PricingItem;
  };
}

export interface LaborPricing {
  base_installation: PricingItem;
  steep_slope_factor: PricingItem;
  waste_factor: number;
}

export interface PricingConfig {
  materials: MaterialsPricing;
  labor: LaborPricing;
}

export interface EstimateItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface Estimate {
  id?: string;
  customerName: string;
  address: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  measurements: RoofMeasurements;
  totalCost: number;
  profitMargin: number;
  selectedPriceTier: 'standard' | 'economy' | 'premium' | 'custom';
  materialCosts: Record<string, number>;
  laborCosts: Record<string, number>;
  items: EstimateItem[];
}

export type AdditionalMaterials = {
  ridgeVent?: boolean;
  offRidgeVent?: boolean;
  gooseneck4?: boolean;
  gooseneck10?: boolean;
  leadFlashing15?: boolean;
  leadFlashing2?: boolean;
  leadFlashing3?: boolean;
  bulletBoot15?: boolean;
  bulletBoot2?: boolean;
  bulletBoot3?: boolean;
  bulletBoot4?: boolean;
  zipSeal?: boolean;
};

export type UnderlaymentType = 'synthetic' | 'felt' | 'premium'; 