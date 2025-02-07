export interface RoofMeasurements {
  total_area: number;
  predominant_pitch: string;
  ridges: number;
  hips: number;
  valleys: number;
  rakes: number;
  eaves: number;
  flashing: number;
  step_flashing: number;
  areas_per_pitch: Array<{
    pitch: string;
    area: number;
    percentage: number;
  }>;
  waste_percentage: number;
} 