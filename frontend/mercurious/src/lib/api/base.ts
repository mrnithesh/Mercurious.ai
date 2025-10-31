import { getCurrentUserToken } from '../firebase/auth';

export interface APIError {
  detail: string;
}

export class BaseAPIClient {
  protected baseURL: string;
  private maxAuthRetries = 3;
  private authRetryDelay = 1000; // 1 second
  private maxRequestRetries = 2;
  private requestRetryDelay = 500; // 500ms

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private async getAuthToken(retryCount = 0): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null;
      
      const token = await getCurrentUserToken();
      
      // If no token and we haven't exceeded retry limit, wait and try again
      if (!token && retryCount < this.maxAuthRetries) {
        await new Promise(resolve => setTimeout(resolve, this.authRetryDelay));
        return this.getAuthToken(retryCount + 1);
      }
      
      return token;
    } catch (error) {
      console.warn('Failed to get authentication token:', error);
      return null;
    }
  }

  private async makeRequestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authentication token if available (client-side only)
    if (typeof window !== 'undefined') {
      const token = await this.getAuthToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
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
      
      // Handle authentication errors with retry
      if (response.status === 401) {
        if (retryCount < this.maxRequestRetries) {
          console.warn(`Authentication failed, retrying... (${retryCount + 1}/${this.maxRequestRetries})`);
          await new Promise(resolve => setTimeout(resolve, this.requestRetryDelay));
          return this.makeRequestWithRetry(endpoint, options, retryCount + 1);
        }
        
        errorMessage = 'Authentication required. Please log in again.';
        // Clear any cached auth state that might be stale
        if (typeof window !== 'undefined') {
          console.warn('Authentication failed - token may be expired');
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.makeRequestWithRetry<T>(endpoint, options);
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