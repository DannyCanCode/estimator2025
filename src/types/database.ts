import { RoofMeasurements } from './estimate';

export interface Report {
  id: string;
  file_path: string;
  original_filename: string;
  status: string;
  error_message: string | null;
  metadata: any;
  processed_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface Estimate {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  address: string;
  total_cost: number;
  profit_margin: number;
  status: 'pending' | 'approved' | 'sent';
  selected_price_tier: 'standard' | 'economy' | 'premium' | 'custom';
  measurements: RoofMeasurements;
  material_costs: {
    base: number;
    withProfit: number;
  };
  labor_costs: {
    base: number;
    withProfit: number;
  };
}

export interface EstimateItem {
  id: string;
  created_at: string;
  updated_at: string;
  estimate_id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}