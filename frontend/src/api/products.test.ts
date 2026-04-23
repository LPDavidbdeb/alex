import { describe, it, expect, vi } from 'vitest';
import { productsApi } from './products';
import apiClient from './client';

vi.mock('./client', () => ({
  default: {
    put: vi.fn(),
  },
}));

describe('productsApi', () => {
  it('should update product using PUT', async () => {
    const mockProduct = { 
        id: 1, 
        product_type: 'Goods', 
        is_perishable: true, 
        is_dangerous: false 
    };
    vi.mocked(apiClient.put).mockResolvedValue(mockProduct);

    const result = await productsApi.update(1, mockProduct as unknown as Product);
    
    expect(apiClient.put).toHaveBeenCalledWith('/products/1', mockProduct);
    expect(result).toEqual(mockProduct);
  });
});
