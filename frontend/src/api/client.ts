/**
 * Client API de base utilisant Fetch.
 * Le proxy Vite redirige les appels de /api/ vers http://localhost:8000/api/.
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

const BASE_URL = '/api';

async function client(endpoint: string, { data, params, ...customConfig }: any = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customConfig.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Optionnel: Gérer le refresh token ou la déconnexion
    return Promise.reject({ status: 401, message: 'Non autorisé' });
  }

  const result = await response.json();

  if (response.ok) {
    return result;
  }

  return Promise.reject(result);
}

export const apiClient = {
  get: (endpoint: string, config: any = {}) => client(endpoint, { ...config, method: 'GET' }),
  post: (endpoint: string, data: any, config: any = {}) => client(endpoint, { ...config, data, method: 'POST' }),
  put: (endpoint: string, data: any, config: any = {}) => client(endpoint, { ...config, data, method: 'PUT' }),
  delete: (endpoint: string, config: any = {}) => client(endpoint, { ...config, method: 'DELETE' }),
};

export default apiClient;
