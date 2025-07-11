import { getCurrentUserToken } from '../firebase/auth';

export interface APIError {
  detail: string;
}

export class BaseAPIClient {
  protected baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authentication token if available (client-side only)
    if (typeof window !== 'undefined') {
      try {
        const token = await getCurrentUserToken();
        if (token) {
          defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get authentication token:', error);
      }
    }

    const response = await fetch(url, {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const error: APIError = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch {
        // If JSON parsing fails, use the default error message
      }
      
      // Handle authentication errors
      if (response.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  protected async makePostRequest<T>(
    endpoint: string,
    data: any
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  protected async makeGetRequest<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
    });
  }

  protected async makePutRequest<T>(
    endpoint: string,
    data: any
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  protected async makeDeleteRequest<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async checkHealth(): Promise<{ status: string; service: string; message: string }> {
    return this.makeGetRequest('/api/health');
  }
} 