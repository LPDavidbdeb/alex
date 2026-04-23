import { describe, it, expect, vi } from 'vitest';
import { quotesApi } from './quotes';
import apiClient from './client';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('quotesApi', () => {
  it('should fetch equipment types', async () => {
    const mockTypes = [{ id: 1, name: 'Dry Van', label_fr: 'Dry Van' }];
    vi.mocked(apiClient.get).mockResolvedValue(mockTypes);

    const result = await quotesApi.getEquipmentTypes();
    
    expect(apiClient.get).toHaveBeenCalledWith('/quotes/equipment-types');
    expect(result).toEqual(mockTypes);
  });

  it('should submit a quote', async () => {
    const mockPayload = { first_name: 'Test' };
    const mockResponse = { status: 'success', uuid: '123' };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    const result = await quotesApi.submitQuote(mockPayload);
    
    expect(apiClient.post).toHaveBeenCalledWith('/quotes/', mockPayload);
    expect(result).toEqual(mockResponse);
  });
});
