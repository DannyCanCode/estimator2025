import { RoofMeasurements } from './estimate';

export interface Report {
  id: string;
  file_path: string;
  original_filename: string;
  metadata: any;
  processed_text: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Estimate {
  id: string;
  customer_name: string;
  address: string | null;
  amount: number;
  roofing_type: string;
  status: 'pending' | 'approved' | 'sent';
  date: string | null;
  report_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profit_margin: number;
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
  estimate_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
}