import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RoofMeasurements } from '../types/measurements';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  category: 'base' | 'upgrade' | 'addon';
}

interface Estimate {
  id: string;
  created_at: string;
  customer_name: string;
  address: string;
  total_cost: number | null;
  base_cost: number;
  profit_margin: number;
  materials: MaterialItem[];
  measurements: RoofMeasurements;
  pdf_url?: string;
  notes?: string;
}

export function EstimatesTab() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);

  useEffect(() => {
    async function fetchEstimates() {
      try {
        const { data, error } = await supabase
          .from('estimates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const validEstimates = (data || []).map(estimate => ({
          ...estimate,
          customer_name: estimate.customer_name || 'Unknown Customer',
          address: estimate.address || 'No Address',
          total_cost: estimate.total_cost || 0,
          created_at: estimate.created_at || new Date().toISOString(),
          base_cost: estimate.base_cost || 0,
          profit_margin: estimate.profit_margin || 0
        }));
        
        setEstimates(validEstimates);
      } catch (error) {
        console.error('Error fetching estimates:', error);
        setError('Failed to load estimates');
      } finally {
        setLoading(false);
      }
    }

    fetchEstimates();
  }, []);

  const downloadPdf = async (pdfUrl: string, customerName: string) => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${customerName.replace(/\s+/g, '_')}_estimate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const calculateTotalsByCategory = (materials: MaterialItem[]) => {
    return materials.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.total;
      return acc;
    }, {} as Record<string, number>);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No estimates found</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Saved Estimates</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estimates.map((estimate) => (
            <Card 
              key={estimate.id} 
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedEstimate(estimate)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{estimate.customer_name}</h3>
                  <p className="text-sm text-gray-500">{estimate.address}</p>
                  <p className="text-sm">
                    Total Cost: ${(estimate.total_cost || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(estimate.created_at).toLocaleDateString()}
                  </p>
                  {estimate.pdf_url && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPdf(estimate.pdf_url!, estimate.customer_name);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                    >
                      Download Customer PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedEstimate} onOpenChange={() => setSelectedEstimate(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Estimate Details</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEstimate(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEstimate && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="measurements">Measurements</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <p className="text-sm">{selectedEstimate.customer_name}</p>
                    <p className="text-sm text-gray-500">{selectedEstimate.address}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Financial Summary</h4>
                    <div className="space-y-1">
                      <p className="text-sm">Base Cost: ${selectedEstimate.base_cost.toLocaleString()}</p>
                      <p className="text-sm">Profit Margin: {selectedEstimate.profit_margin}%</p>
                      <p className="text-sm font-semibold">Final Cost: ${(selectedEstimate.total_cost || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                <div className="space-y-6">
                  {['base', 'upgrade', 'addon'].map((category) => {
                    const materials = selectedEstimate.materials.filter(m => m.category === category);
                    if (materials.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold capitalize">{category} Materials</h4>
                        <div className="border rounded-lg">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm">Item</th>
                                <th className="px-4 py-2 text-right text-sm">Qty</th>
                                <th className="px-4 py-2 text-right text-sm">Unit</th>
                                <th className="px-4 py-2 text-right text-sm">Price/Unit</th>
                                <th className="px-4 py-2 text-right text-sm">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {materials.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm">{item.name}</td>
                                  <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                                  <td className="px-4 py-2 text-sm text-right">{item.unit}</td>
                                  <td className="px-4 py-2 text-sm text-right">${item.unit_price.toLocaleString()}</td>
                                  <td className="px-4 py-2 text-sm text-right">${item.total.toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50 font-semibold">
                                <td colSpan={4} className="px-4 py-2 text-sm text-right">Subtotal:</td>
                                <td className="px-4 py-2 text-sm text-right">
                                  ${calculateTotalsByCategory(selectedEstimate.materials)[category].toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="measurements" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Roof Measurements</h4>
                    <div className="space-y-1 text-sm">
                      <p>Total Area: {selectedEstimate.measurements.total_area} sq ft</p>
                      <p>Predominant Pitch: {selectedEstimate.measurements.predominant_pitch}</p>
                      <p>Ridges: {selectedEstimate.measurements.ridges} ft</p>
                      <p>Hips: {selectedEstimate.measurements.hips} ft</p>
                      <p>Valleys: {selectedEstimate.measurements.valleys} ft</p>
                      <p>Rakes: {selectedEstimate.measurements.rakes} ft</p>
                      <p>Eaves: {selectedEstimate.measurements.eaves} ft</p>
                      <p>Flashing: {selectedEstimate.measurements.flashing} ft</p>
                      <p>Property Location:</p>
                      <p className="ml-4">Longitude: {selectedEstimate.measurements.longitude}</p>
                      <p className="ml-4">Latitude: {selectedEstimate.measurements.latitude}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Areas per Pitch</h4>
                    <div className="space-y-1 text-sm">
                      {selectedEstimate.measurements.areas_per_pitch.map((area: { pitch: string; area: number; percentage: number }, idx: number) => (
                        <p key={idx}>
                          {area.pitch}: {area.area} sq ft ({area.percentage}%)
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            {selectedEstimate?.pdf_url && (
              <Button
                onClick={() => downloadPdf(selectedEstimate.pdf_url!, selectedEstimate.customer_name)}
                variant="outline"
              >
                Download Customer PDF
              </Button>
            )}
            <Button variant="default" onClick={() => setSelectedEstimate(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 