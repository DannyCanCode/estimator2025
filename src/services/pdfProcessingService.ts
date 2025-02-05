import { RoofMeasurements } from "@/types/estimate";

interface BackendResponse {
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

export const processPdfFile = async (
  file: File,
  profitMargin: number,
  roofingType: string
): Promise<{ measurements: RoofMeasurements }> => {
  console.log('Processing PDF file:', file.name);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3008/api/process-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to process PDF: ${errorText || response.statusText}`);
    }

    const data = await response.json() as BackendResponse;
    
    if (!data || typeof data.total_area === 'undefined') {
      throw new Error('Invalid response from server: Missing required data');
    }

    console.log('Full response data:', JSON.stringify(data, null, 2));

    // Transform the data to match the RoofMeasurements interface
    const measurements: RoofMeasurements = {
      total_area: data.total_area,
      predominant_pitch: data.predominant_pitch || '',
      ridges: data.ridges || 0,
      hips: data.hips || 0,
      valleys: data.valleys || 0,
      rakes: data.rakes || 0,
      eaves: data.eaves || 0,
      flashing: data.flashing || 0,
      step_flashing: data.step_flashing || 0,
      areas_per_pitch: data.areas_per_pitch || [],
      waste_percentage: data.waste_percentage || 0,
    };

    return { measurements };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error instanceof Error ? error : new Error('Failed to process PDF');
  }
};