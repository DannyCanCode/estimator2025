export interface PitchArea {
  pitch: string;
  area: number;
  percentage: number;
}

export interface RoofMeasurements {
  ridges: number;
  hips: number;
  total_area: number;
  predominant_pitch: string;
  valleys: number;
  rakes: number;
  eaves: number;
  flashing: number;
  step_flashing: number;
  longitude?: number;
  latitude?: number;
  property_address?: string;
  waste_percentage: number;
  areas_per_pitch: PitchArea[];
  pitch_details: Array<{ pitch: string; area: number }>;
  debug_info?: {
    extraction_method: string;
    error?: string;
    tables_found?: number;
  };
} 