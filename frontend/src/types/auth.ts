/**
 * Interface pour les informations de l'utilisateur.
 */
export type User = {
  email: string;
}

/**
 * Interface pour les identifiants de connexion.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Type pour la réponse JWT du backend.
 */
export interface JWTResponse {
  access: string;
  refresh: string;
  email: string;
}
