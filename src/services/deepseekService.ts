import { toast } from '@/components/ui/use-toast';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = import.meta.env.VITE_DEEPSEEK_MODEL;

if (!DEEPSEEK_API_KEY) {
  console.error('Missing Deepseek API key');
}

export class DeepseekService {
  private static instance: DeepseekService;
  private apiKey: string;
  private model: string;

  private constructor() {
    this.apiKey = DEEPSEEK_API_KEY;
    this.model = DEEPSEEK_MODEL;
  }

  public static getInstance(): DeepseekService {
    if (!DeepseekService.instance) {
      DeepseekService.instance = new DeepseekService();
    }
    return DeepseekService.instance;
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Deepseek API:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate completion. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }
}

export const deepseekService = DeepseekService.getInstance(); 