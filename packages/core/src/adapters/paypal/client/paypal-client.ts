/**
 * Lightweight PayPal REST API client.
 *
 * PayPal does not provide an official Node.js SDK, so this client wraps
 * the REST API directly. It handles OAuth 2.0 client-credentials token
 * management with automatic refresh.
 */

export interface PayPalClientConfig {
  clientId: string;
  clientSecret: string;
  sandbox?: boolean;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

const LIVE_BASE = 'https://api-m.paypal.com';
const SANDBOX_BASE = 'https://api-m.sandbox.paypal.com';

export class PayPalClient {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: PayPalClientConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.baseUrl = config.sandbox !== false ? SANDBOX_BASE : LIVE_BASE;
  }

  /**
   * Obtain an OAuth 2.0 access token using client credentials.
   * Tokens are cached and refreshed 60 seconds before expiry.
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      const text = await res.text();
      throw new PayPalApiError(res.status, 'AUTHENTICATION_FAILURE', `OAuth token request failed: ${text}`);
    }

    const data = (await res.json()) as TokenResponse;
    this.accessToken = data.access_token;
    // Refresh 60s before actual expiry
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return this.accessToken;
  }

  /**
   * Make an authenticated request to the PayPal REST API.
   */
  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { idempotencyKey?: string },
  ): Promise<T> {
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    if (options?.idempotencyKey) {
      headers['PayPal-Request-Id'] = options.idempotencyKey;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // 204 No Content — return empty
    if (res.status === 204) {
      return undefined as T;
    }

    const data = await res.json();

    if (!res.ok) {
      throw PayPalApiError.fromResponse(res.status, data);
    }

    return data as T;
  }
}

/**
 * Structured PayPal API error for mapping to PaymentError.
 */
export class PayPalApiError extends Error {
  readonly statusCode: number;
  readonly errorName: string;
  readonly details?: Array<{ issue: string; description: string }>;

  constructor(statusCode: number, errorName: string, message: string, details?: Array<{ issue: string; description: string }>) {
    super(message);
    this.name = 'PayPalApiError';
    this.statusCode = statusCode;
    this.errorName = errorName;
    this.details = details;
  }

  static fromResponse(statusCode: number, data: any): PayPalApiError {
    const errorName = data?.name ?? data?.error ?? 'UNKNOWN_ERROR';
    const message = data?.message ?? data?.error_description ?? `PayPal API error: ${statusCode}`;
    const details = data?.details;
    return new PayPalApiError(statusCode, errorName, message, details);
  }
}
