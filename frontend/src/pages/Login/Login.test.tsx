import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';
import apiClient from '../../api/client';
import { AuthProvider } from '../../auth/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock du client API
vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Page de Connexion', () => {
  it('affiche les champs Email et Mot de passe', () => {
    renderLogin();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  it('affiche un message d\'erreur en Français en cas d\'échec 401', async () => {
    // Mock d'une erreur 401
    vi.mocked(apiClient.post).mockRejectedValueOnce({ status: 401, message: 'Non autorisé' });

    renderLogin();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Identifiants invalides/i)).toBeInTheDocument();
    });
  });

  it('affiche un état de chargement pendant l\'appel API', async () => {
    vi.mocked(apiClient.post).mockReturnValue(new Promise(() => {})); // Promesse qui ne se résout jamais

    renderLogin();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    expect(screen.getByText(/Connexion en cours/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Connexion en cours/i })).toBeDisabled();
  });
});
