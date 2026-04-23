import apiClient from './client';

export interface EquipmentType {
  id: number;
  name: string;
  label_fr: string;
}

export interface AddressResult {
  label: string;
  latitude: number;
  longitude: number;
  source: string;
  raw_json: Record<string, unknown>;
  country_ref_id?: number | null;
}

export interface Product {
  id?: number;
  product_type: string;
  value?: number | null;
  is_perishable: boolean;
  is_dangerous: boolean;
  hs_code?: string | null;
  weight_kg?: number | null;
  volume_m3?: number | null;
}

export interface UserInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  unit_name: string | null;
  banner_name: string | null;
  unit_address: AddressResult | null;
}

export interface QuoteRequest {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  client: UserInfo | null;
  equipment_types: EquipmentType[];
  pick_up_address: AddressResult;
  final_drop_address: AddressResult;
  is_multi_drop: boolean;
  pickup_date: string | null;
  delivery_date: string | null;
  estimated_distance_km: number | null;
  estimated_duration_min: number | null;
  product: Product | null;
  incoterm: string | null;
  special_instructions: string | null;
  created_at: string;
}

export interface QuoteDetailContext {
  quote: QuoteRequest;
  client_history: QuoteRequest[];
}

export const quotesApi = {
  list: async (): Promise<QuoteRequest[]> => {
    return apiClient.get('/quotes/list');
  },
  
  get: async (id: number): Promise<QuoteDetailContext> => {
    return apiClient.get(`/quotes/${id}`);
  },

  getEquipmentTypes: async (): Promise<EquipmentType[]> => {
    return apiClient.get('/quotes/equipment-types');
  },

  updateMetrics: async (id: number, distance: number, duration: number): Promise<void> => {
    return apiClient.patch(`/quotes/${id}/metrics`, {
        estimated_distance_km: distance,
        estimated_duration_min: Math.round(duration)
    });
  },

  updateCompanyAddress: async (userId: number, address: AddressResult): Promise<void> => {
    return apiClient.patch(`/companies/update-address/${userId}`, address);
  },

  submitQuote: async (data: Partial<QuoteRequest> & { company_name?: string }): Promise<{status: string, uuid: string}> => {
    return apiClient.post('/quotes/', data);
  }
};
