import apiClient from './client';

export interface AIScenario {
  name: string;
  type: string;
  estimated_total_cost: number;
  transit_time: string;
  pros: string[];
  cons: string[];
  risk_score: number;
}

export interface QuoteAnalysis {
  id: number;
  full_response: {
    scenarios: AIScenario[];
    global_analysis: string;
    recommendation: string;
  };
  model_version: string;
  created_at: string;
}

export const analyticsApi = {
  analyze: async (quoteId: number): Promise<QuoteAnalysis> => {
    return apiClient.post(`/analytics/${quoteId}/analyze`);
  },
  
  get: async (quoteId: number): Promise<QuoteAnalysis> => {
    return apiClient.get(`/analytics/${quoteId}`);
  }
};
