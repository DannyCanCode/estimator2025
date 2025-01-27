import { supabase } from "@/integrations/supabase/client";
import { Estimate as DBEstimate, EstimateItem } from "@/types/database";
import { Estimate as UIEstimate } from '../types/estimate';

export async function createEstimate(estimate: Omit<DBEstimate, 'id' | 'created_at' | 'updated_at'>) {
  try {
    console.log('Creating estimate with data:', estimate);
    
    const { data, error } = await supabase
      .from('estimates')
      .insert({
        customer_name: estimate.customer_name,
        address: estimate.address,
        amount: estimate.amount,
        roofing_type: estimate.roofing_type,
        status: estimate.status,
        date: estimate.date,
        profit_margin: estimate.profit_margin,
        selected_price_tier: estimate.selected_price_tier,
        measurements: estimate.measurements,
        material_costs: estimate.material_costs,
        labor_costs: estimate.labor_costs,
        report_id: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating estimate:', error);
      if (error.message.includes('Invalid API key')) {
        // Try enabling RLS policy for anon access
        throw new Error('Database access error - please check Supabase RLS policies');
      }
      throw error;
    }

    console.log('Successfully created estimate:', data);
    return data;
  } catch (error) {
    console.error('Error in createEstimate:', error);
    throw error;
  }
}

export async function createEstimateItems(items: Omit<EstimateItem, 'id' | 'created_at' | 'updated_at'>[]) {
  try {
    console.log('Creating estimate items:', items);
    
    const { data, error } = await supabase
      .from('estimate_items')
      .insert(items)
      .select();

    if (error) {
      console.error('Error creating estimate items:', error);
      if (error.message.includes('Invalid API key')) {
        throw new Error('Database access error - please check Supabase RLS policies');
      }
      throw error;
    }

    console.log('Successfully created estimate items:', data);
    return data;
  } catch (error) {
    console.error('Error in createEstimateItems:', error);
    throw error;
  }
}

export async function getEstimates() {
  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as DBEstimate[];
}

export async function getEstimateItems(estimateId: string) {
  const { data, error } = await supabase
    .from('estimate_items')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as EstimateItem[];
}

class EstimateService {
  async saveEstimate(estimate: UIEstimate): Promise<UIEstimate> {
    try {
      // First, save the estimate data with all calculation details
      const savedEstimate = await createEstimate({
        customer_name: estimate.customerName,
        address: estimate.address,
        amount: estimate.totalCost,
        roofing_type: 'GAF Timberline HDZ SG',
        status: estimate.status,
        date: estimate.date,
        profit_margin: estimate.profitMargin,
        selected_price_tier: estimate.selectedPriceTier,
        measurements: estimate.measurements,
        material_costs: estimate.materialCosts,
        labor_costs: estimate.laborCosts,
        report_id: null
      });

      if (!savedEstimate?.id) {
        throw new Error('Failed to save estimate');
      }

      // Then, save all the estimate items
      if (estimate.items.length > 0) {
        await createEstimateItems(estimate.items.map(item => ({
          estimate_id: savedEstimate.id,
          description: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.price,
          total: item.quantity * item.price
        })));
      }

      return {
        ...estimate,
        id: savedEstimate.id
      };
    } catch (error) {
      console.error('Error saving estimate:', error);
      throw error;
    }
  }

  async getEstimates(): Promise<UIEstimate[]> {
    try {
      const estimates = await getEstimates();
      return estimates.map(dbEstimate => ({
        id: dbEstimate.id,
        customerName: dbEstimate.customer_name,
        address: dbEstimate.address || '',
        date: dbEstimate.date || new Date().toLocaleDateString(),
        status: dbEstimate.status,
        totalCost: dbEstimate.amount,
        profitMargin: dbEstimate.profit_margin,
        selectedPriceTier: dbEstimate.selected_price_tier,
        measurements: dbEstimate.measurements,
        materialCosts: dbEstimate.material_costs,
        laborCosts: dbEstimate.labor_costs,
        items: [] // We'll load items separately if needed
      }));
    } catch (error) {
      console.error('Error getting estimates:', error);
      throw error;
    }
  }

  async generatePDF(estimate: UIEstimate): Promise<Blob> {
    try {
      // Format the data for PDF generation
      const pdfData = {
        ...estimate,
        companyInfo: {
          name: '3MG Roofing',
          address: '1127 Solana Ave',
          city: 'Winter Park',
          state: 'FL',
          zip: '32789',
          phone: '407-420-0201',
          email: 'Daniel.Pedraza@3MGRoofing.com',
          representative: 'Daniel Pedraza-T',
          repPhone: '(407) 495-2386'
        },
        pricing: {
          materials: estimate.items.reduce((acc, item) => ({
            ...acc,
            [item.name.toLowerCase().replace(/\s+/g, '_')]: {
              price: item.price,
              quantity: item.quantity,
              unit: item.unit,
              total: item.price * item.quantity
            }
          }), {}),
          totalMaterialCost: estimate.materialCosts.base,
          totalMaterialWithProfit: estimate.materialCosts.withProfit,
          laborCost: estimate.laborCosts.base,
          laborWithProfit: estimate.laborCosts.withProfit,
          totalCost: estimate.totalCost
        }
      };

      const response = await fetch('http://localhost:8000/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Check if the response is a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Invalid response format');
      }

      return response.blob();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

export const estimateService = new EstimateService();