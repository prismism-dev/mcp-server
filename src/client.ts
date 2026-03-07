/**
 * Thin HTTP client wrapping the Prismism API.
 * Uses native fetch (Node 18+). Never logs request bodies.
 */

const BASE_URL = (process.env.PRISMISM_BASE_URL || 'https://prismism.dev').replace(/\/$/, '');
const API_KEY = process.env.PRISMISM_API_KEY;

export interface Envelope<T = unknown> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
  _hints?: string[];
}

function redact(text: string): string {
  return text.replace(/pal_[a-f0-9]+/g, 'pal_***').replace(/Bearer\s+\S+/gi, 'Bearer ***');
}

function headers(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { ...extra };
  if (API_KEY) {
    h['x-api-key'] = API_KEY;
  }
  return h;
}

async function handleResponse<T>(res: Response): Promise<Envelope<T>> {
  let body: any;
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    const code = body?.error?.code || body?.code || `HTTP_${res.status}`;
    const message = body?.error?.message || body?.message || body?.error || res.statusText;
    const hints: string[] = [];

    if (body?._hints) {
      hints.push(...body._hints);
    }

    // Add helpful hints for common errors
    if (res.status === 401) {
      hints.push('Check that PRISMISM_API_KEY is set correctly in your MCP config.');
    }
    if (res.status === 403) {
      hints.push('Your plan may not support this feature. Check your account at https://prismism.dev/settings/billing');
    }
    if (res.status === 413) {
      hints.push('File too large for your plan. Check storage limits at https://prismism.dev/settings/billing');
    }

    // Preserve createKey link from 409 responses
    if (body?.createKey) {
      hints.push(`Create a new API key at ${body.createKey}`);
    }

    return { ok: false, error: { code, message: redact(String(message)) }, _hints: hints.length ? hints : undefined };
  }

  return { ok: true, data: body as T };
}

export async function get<T = unknown>(path: string): Promise<Envelope<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
    return handleResponse<T>(res);
  } catch (err: any) {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: redact(err.message) }, _hints: [`Could not reach ${BASE_URL}. Check your network connection.`] };
  }
}

export async function post<T = unknown>(path: string, body?: unknown): Promise<Envelope<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  } catch (err: any) {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: redact(err.message) }, _hints: [`Could not reach ${BASE_URL}. Check your network connection.`] };
  }
}

export async function patch<T = unknown>(path: string, body: unknown): Promise<Envelope<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  } catch (err: any) {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: redact(err.message) }, _hints: [`Could not reach ${BASE_URL}. Check your network connection.`] };
  }
}

export async function del<T = unknown>(path: string): Promise<Envelope<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return handleResponse<T>(res);
  } catch (err: any) {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: redact(err.message) }, _hints: [`Could not reach ${BASE_URL}. Check your network connection.`] };
  }
}

export async function upload<T = unknown>(path: string, fileContent: Uint8Array, filename: string, contentType?: string): Promise<Envelope<T>> {
  try {
    const formData = new FormData();
    const arrayBuf = fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength) as ArrayBuffer;
    const blob = new Blob([arrayBuf], { type: contentType || 'application/octet-stream' });
    formData.append('file', blob, filename);

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: headers(), // Let fetch set Content-Type with boundary
      body: formData,
    });
    return handleResponse<T>(res);
  } catch (err: any) {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: redact(err.message) }, _hints: [`Could not reach ${BASE_URL}. Check your network connection.`] };
  }
}

export function getBaseUrl(): string {
  return BASE_URL;
}

export function hasApiKey(): boolean {
  return !!API_KEY;
}
