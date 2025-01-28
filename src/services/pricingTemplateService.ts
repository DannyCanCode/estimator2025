import { supabase } from '@/lib/supabase';

export interface PricingTemplate {
  id: string;
  name: string;
  materials: {
    [key: string]: {
      name: string;
      retailPrice: number;
      ourCost: number;
      unit: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export const pricingTemplateService = {
  async getTemplates(): Promise<PricingTemplate[]> {
    const { data, error } = await supabase
      .from('pricing_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTemplate(template: Omit<PricingTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<PricingTemplate> {
    const { data, error } = await supabase
      .from('pricing_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTemplate(id: string, template: Partial<PricingTemplate>): Promise<PricingTemplate> {
    const { data, error } = await supabase
      .from('pricing_templates')
      .update(template)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('pricing_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 