import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AddressAutocomplete } from './AddressAutocomplete';
import apiClient from '@/api/client';

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('AddressAutocomplete', () => {
  it('should include country parameter in API call if provided', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);

    render(
        <AddressAutocomplete 
            onAddressSelect={() => {}} 
            country="NO" 
            placeholder="SearchHere" 
        />
    );

    const input = screen.getByRole('combobox');
    
    // Simulation de la saisie utilisateur
    fireEvent.change(input, { target: { value: 'Oslo' } });

    await waitFor(() => {
      // Vérifie que l'URL contient bien le paramètre de pays strict
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('country=NO'));
    });
  });
});
