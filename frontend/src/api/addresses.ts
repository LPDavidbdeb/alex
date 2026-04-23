import apiClient from './client';

export interface Country {
  id: number;
  name: string;
  iso2: string;
}

export const addressesApi = {
  getCountries: async (): Promise<Country[]> => {
    return apiClient.get('/addresses/countries');
  }
};
