import apiClient from './client';

export interface GeminiModel {
  id: string;
  display_name: string;
  description: string;
  input_token_limit: number;
  output_token_limit: number;
}

export interface GoogleStatus {
  status: 'success' | 'error';
  message: string;
  models?: GeminiModel[];
}

export interface UsageMetrics {
  status: string;
  message: string;
  tracked_locally: boolean;
  request_count?: number;
}

export const googleApi = {
  getStatus: async (): Promise<GoogleStatus> => {
    return apiClient.get('/google/status');
  },
  
  getMetrics: async (): Promise<UsageMetrics> => {
    return apiClient.get('/google/metrics');
  }
};
