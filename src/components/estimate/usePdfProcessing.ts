import { useMutation } from "@tanstack/react-query";
import { processPdfReport } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { ProcessedPdfData, RoofMeasurements } from "@/types/estimate";

interface PdfProcessingCallbacks {
  onSuccess: (measurements: RoofMeasurements) => void;
}

export const usePdfProcessing = ({ onSuccess }: PdfProcessingCallbacks) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File): Promise<ProcessedPdfData> => {
      try {
        console.log('Processing PDF file:', file.name);
        const data = await processPdfReport(file);
        console.log('Received data from API:', data);

        // Ensure we have the required data with fallbacks
        const processedData: ProcessedPdfData = {
          totalArea: data.totalArea || 0,
          pitch: data.pitchBreakdown?.[0]?.pitch || "4/12",
          suggestedWaste: data.suggestedWaste || 15
        };

        console.log('Processed data:', processedData);
        return processedData;
      } catch (error) {
        console.error('Error processing PDF:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to process PDF');
      }
    },
    onSuccess: (data: ProcessedPdfData) => {
      console.log('Mutation succeeded with data:', data);
      const formattedMeasurements: RoofMeasurements = {
        totalArea: data.totalArea,
        pitchBreakdown: [{
          pitch: data.pitch,
          area: data.totalArea
        }],
        suggestedWaste: data.suggestedWaste
      };
      onSuccess(formattedMeasurements);
      toast({
        title: "PDF Processed Successfully",
        description: "Your roof measurements have been extracted.",
      });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error Processing PDF",
        description: error.message || "Failed to process the PDF report. Please try again.",
        variant: "destructive",
      });
    },
  });
};