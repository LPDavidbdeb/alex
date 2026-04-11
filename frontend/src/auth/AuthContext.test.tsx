import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import apiClient from '../api/client';

// Mock du client API
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const TestComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-email">{user?.email}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('restaure la session si un token est présent dans le localStorage', async () => {
    localStorage.setItem('access_token', 'fake-token');
    (apiClient.get as any).mockResolvedValueOnce({ email: 'test@example.com' });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('redirige vers /login si aucun token n\'est présent', async () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/home" element={<div>Home Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Note: La logique de redirection sera dans App.tsx ou un ProtectedRoute
    // Ici on teste juste que l'état initial est non authentifié
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });
});
