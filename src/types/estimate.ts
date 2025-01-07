export interface RoofMeasurements {
  totalArea: number;
  pitchBreakdown: {
    pitch: string;
    area: number;
  }[];
  suggestedWaste?: number;
}

export interface ProcessedPdfData {
  measurements: {
    total_area: number;
    predominant_pitch?: string;
    suggested_waste_percentage?: number;
    // ... other measurement fields
  };
  error?: string;
  debug?: any;
}

export interface Material {
  name: string;
  basePrice: number;
  unit: string;
  quantity: number;
}

export interface Labor {
  pitch: string;
  rate: number;
  area: number;
}

export interface EstimateItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export type RoofingCategory = "SHINGLE" | "TILE" | "METAL";

export interface Estimate {
  materials: Material[];
  labor: Labor[];
  profitMargin: number;
  totalCost: number;
  totalPrice: number;
  category: RoofingCategory;
}
