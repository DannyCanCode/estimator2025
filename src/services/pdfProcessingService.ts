import { RoofMeasurements } from "@/types/estimate";

interface BackendResponse {
  measurements: {
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
    longitude?: number;
    latitude?: number;
  }
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

    const response = await fetch('/api/process-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process PDF');
    }

    const data = await response.json() as BackendResponse;
    console.log('Full response data:', JSON.stringify(data, null, 2));

    // Transform the data to match the RoofMeasurements interface
    const measurements: RoofMeasurements = {
      total_area: data.measurements.total_area,
      predominant_pitch: data.measurements.predominant_pitch || '',
      ridges: data.measurements.ridges || 0,
      hips: data.measurements.hips || 0,
      valleys: data.measurements.valleys || 0,
      rakes: data.measurements.rakes || 0,
      eaves: data.measurements.eaves || 0,
      flashing: data.measurements.flashing || 0,
      step_flashing: data.measurements.step_flashing || 0,
      areas_per_pitch: data.measurements.areas_per_pitch?.map(pitch => ({
        pitch: pitch.pitch,
        area: pitch.area,
        percentage: pitch.percentage
      })) || [],
      waste_percentage: data.measurements.waste_percentage || 12,
      longitude: data.measurements.longitude,
      latitude: data.measurements.latitude
    };

    console.log('Final measurements:', JSON.stringify(measurements, null, 2));
    return { measurements };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};