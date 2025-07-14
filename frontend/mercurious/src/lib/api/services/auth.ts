import { BaseAPIClient } from '../base';

export interface AuthVerificationResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    created_at: string;
    last_login: string;
  };
  firebase_user: {
    uid: string;
    email: string | null;
    name: string | null;
    email_verified: boolean;
  };
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
}

export class AuthAPIService extends BaseAPIClient {
  /**
   * Verify Firebase token with backend and get/create user
   */
  async verifyToken(): Promise<AuthVerificationResponse> {
    return this.makePostRequest<AuthVerificationResponse>('/api/auth/verify-token', {});
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<AuthVerificationResponse['user']> {
    return this.makeGetRequest<AuthVerificationResponse['user']>('/api/auth/me');
  }

  /**
   * Update current user information
   */
  async updateUser(updates: UserUpdateRequest): Promise<AuthVerificationResponse['user']> {
    return this.makePutRequest<AuthVerificationResponse['user']>('/api/auth/me', updates);
  }

  /**
   * Delete current user account
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return this.makeDeleteRequest<{ success: boolean; message: string }>('/api/auth/me');
  }

  /**
   * Logout (backend cleanup)
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    return this.makePostRequest<{ success: boolean; message: string }>('/api/auth/logout', {});
  }

  /**
   * Health check for auth service
   */
  async healthCheck(): Promise<{ status: string; service: string; firebase: string }> {
    return this.makeGetRequest<{ status: string; service: string; firebase: string }>('/api/auth/health');
  }
} 