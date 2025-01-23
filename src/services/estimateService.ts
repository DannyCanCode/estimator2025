import { supabase } from "@/integrations/supabase/client";
import { Estimate as DBEstimate, EstimateItem } from "@/types/database";
import { Estimate as UIEstimate } from '../types/estimate';

export async function createEstimate(estimate: Omit<DBEstimate, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('estimates')
    .insert(estimate)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createEstimateItems(items: Omit<EstimateItem, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('estimate_items')
    .insert(items)
    .select();

  if (error) throw error;
  return data;
}

export async function getEstimates() {
  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEstimateItems(estimateId: string) {
  const { data, error } = await supabase
    .from('estimate_items')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

class EstimateService {
  async saveEstimate(estimate: UIEstimate): Promise<UIEstimate> {
    try {
      // First, save the estimate data
      const savedEstimate = await createEstimate({
        customer_name: estimate.customerName,
        address: estimate.address,
        total_cost: estimate.totalCost,
        profit_margin: estimate.profitMargin,
        status: estimate.status,
        selected_price_tier: estimate.selectedPriceTier,
        measurements: estimate.measurements,
        material_costs: estimate.materialCosts,
        labor_costs: estimate.laborCosts
      });

      if (!savedEstimate?.id) {
        throw new Error('Failed to save estimate');
      }

      // Then, save all the estimate items
      await createEstimateItems(estimate.items.map(item => ({
        estimate_id: savedEstimate.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price
      })));

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
        address: dbEstimate.address,
        date: dbEstimate.created_at,
        status: dbEstimate.status,
        totalCost: dbEstimate.total_cost,
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
      const response = await fetch('/api/estimates/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      return response.blob();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

export const estimateService = new EstimateService();