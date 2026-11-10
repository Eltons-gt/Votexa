import { ApiResponse } from '@votexa/shared';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private activeTenantId: string | null = null;
  private authToken: string | null = null;

  setTenant(tenantId: string | null): void {
    this.activeTenantId = tenantId;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
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

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const json = (await response.json()) as ApiResponse<T>;
    return json;
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

