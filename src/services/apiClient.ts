/**
 * AOSS FrontDesk - API Client Architecture
 * 
 * In this demonstration phase, the frontend operates completely independently using
 * mock data and local storage. No network requests are sent.
 * 
 * When backend services are introduced, configure `VITE_API_BASE_URL` to route
 * requests to real REST or GraphQL endpoints without changing the UI components.
 */

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private baseUrl: string;

  constructor() {
    // Configurable base URL for future backend integration
    this.baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public isLiveBackendConfigured(): boolean {
    return Boolean((import.meta as any).env?.VITE_API_BASE_URL);
  }

  /**
   * Safe simulated delay for realistic frontend loading states
   */
  public async simulateLatency(minMs = 150, maxMs = 350): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Future HTTP GET implementation stub
   */
  public async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    if (!this.isLiveBackendConfigured()) {
      console.warn(`[Demo Mode] Simulated GET request to: ${endpoint}`, options);
      throw new Error('Live backend is not connected. Application running in demo mode.');
    }
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined) url.searchParams.append(key, String(val));
      });
    }
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return response.json();
  }

  /**
   * Future HTTP POST implementation stub
   */
  public async post<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    if (!this.isLiveBackendConfigured()) {
      console.warn(`[Demo Mode] Simulated POST request to: ${endpoint}`, body);
      throw new Error('Live backend is not connected. Application running in demo mode.');
    }
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return response.json();
  }

  /**
   * Future HTTP PUT implementation stub
   */
  public async put<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    if (!this.isLiveBackendConfigured()) {
      console.warn(`[Demo Mode] Simulated PUT request to: ${endpoint}`, body);
      throw new Error('Live backend is not connected. Application running in demo mode.');
    }
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return response.json();
  }

  /**
   * Future HTTP DELETE implementation stub
   */
  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    if (!this.isLiveBackendConfigured()) {
      console.warn(`[Demo Mode] Simulated DELETE request to: ${endpoint}`, options);
      throw new Error('Live backend is not connected. Application running in demo mode.');
    }
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return response.json();
  }
}

export const apiClient = new ApiClient();
