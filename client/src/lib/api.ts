import { ApiResponse } from '@votexa/shared';

const rawApiUrl = import.meta.env.VITE_API_URL;
// When deployed on production (e.g. Vercel), never route API calls to localhost
const isLocalhostHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE =
  !isLocalhostHost && rawApiUrl && rawApiUrl.includes('localhost')
    ? '/api/v1'
    : rawApiUrl || '/api/v1';

class ApiClient {
  private activeTenantId: string | null = null;
  private authToken: string | null = null;

  setTenant(tenantId: string | null): void {
    this.activeTenantId = tenantId;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.authToken) {
      headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    if (this.activeTenantId) {
      headers.set('X-Organization-Id', this.activeTenantId);
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text) as ApiResponse<T>;
        return json;
      } catch {
        return {
          success: response.ok,
          data: undefined,
          error: {
            message: response.ok ? 'Unexpected response format' : `Server responded with HTTP ${response.status}`,
            code: 'SERVER_RESPONSE_ERROR'
          },
          timestamp: new Date().toISOString()
        };
      }
    } catch (networkErr: any) {
      return {
        success: false,
        error: {
          message: networkErr?.message || 'Network communication error',
          code: 'NETWORK_ERROR'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  put<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  patch<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

