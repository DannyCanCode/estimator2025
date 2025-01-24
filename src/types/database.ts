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
  address: string;
  amount: number;
  roofing_type: string;
  status: 'pending' | 'approved' | 'sent';
  date: string;
  created_at: string;
  updated_at: string;
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