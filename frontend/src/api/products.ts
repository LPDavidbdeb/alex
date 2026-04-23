import apiClient from './client';
import type { Product } from './quotes';

export const productsApi = {
  update: async (productId: number, data: Product): Promise<Product> => {
    // Utilisation de PUT pour garantir l'envoi de l'objet complet
    return apiClient.put(`/products/${productId}`, data);
  }
};
