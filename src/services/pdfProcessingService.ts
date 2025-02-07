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
    formData.append('file', file, file.name);

    const response = await fetch('http://localhost:3008/api/process-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || response.statusText;
      console.error('Server error:', errorMessage);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();

    if (!responseData || typeof responseData.total_area === 'undefined') {
      console.error('Invalid response data:', responseData);
      throw new Error('Invalid response from server: Missing required data');
    }

    console.log('Full response data:', JSON.stringify(responseData, null, 2));

    // Transform the data to match the RoofMeasurements interface
    const measurements: RoofMeasurements = {
      total_area: responseData.total_area,
      predominant_pitch: responseData.predominant_pitch || '',
      ridges: responseData.ridges || 0,
      hips: responseData.hips || 0,
      valleys: responseData.valleys || 0,
      rakes: responseData.rakes || 0,
      eaves: responseData.eaves || 0,
      flashing: responseData.flashing || 0,
      step_flashing: responseData.step_flashing || 0,
      areas_per_pitch: responseData.areas_per_pitch || [],
      waste_percentage: responseData.waste_percentage || 12,
    };

    return { measurements };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error instanceof Error ? error : new Error('Failed to process PDF');
  }
};