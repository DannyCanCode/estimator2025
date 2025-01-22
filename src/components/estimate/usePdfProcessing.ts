import { useMutation } from "@tanstack/react-query";
import { processPdfFile } from "@/services/pdfProcessingService";
import { useToast } from "@/hooks/use-toast";
import { ProcessedPdfData, RoofMeasurements } from "@/types/estimate";

interface PdfProcessingCallbacks {
  onSuccess: (measurements: RoofMeasurements, rawData: Record<string, any>) => void;
}

export const usePdfProcessing = ({ onSuccess }: PdfProcessingCallbacks) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File): Promise<ProcessedPdfData> => {
      try {
        console.log('Processing PDF file:', file.name);
        const data = await processPdfFile(file, 0.2, 'standard'); // Default values for now
        console.log('Received data from API:', data);

        if (!data.measurements.total_area) {
          console.error('Invalid or missing total area in response:', data);
          throw new Error('Could not extract roof area from PDF');
        }

        // Keep the data in its original format
        const processedData: ProcessedPdfData = {
          measurements: data.measurements
        };

        console.log('Processed data:', processedData);
        return processedData;
      } catch (error) {
        console.error('Error processing PDF:', error);
        throw error;
      }
    },
    onSuccess: (data: ProcessedPdfData) => {
      console.log('Mutation succeeded with data:', data);
      // Pass the measurements directly without transformation
      onSuccess(data.measurements, data.measurements);
      toast({
        title: "PDF Processed Successfully",
        description: "Your roof measurements have been extracted.",
      });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error Processing PDF",
        description: error.message || "Failed to process the PDF report",
        variant: "destructive",
      });
    },
  });
};