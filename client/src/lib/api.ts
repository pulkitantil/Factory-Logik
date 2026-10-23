const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('voltrix_auth_token');
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('voltrix_auth_token', token);
}

export function removeAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('voltrix_auth_token');
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('voltrix_admin_token');
}

export function setAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('voltrix_admin_token', token);
}

export function removeAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('voltrix_admin_token');
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
  isAdmin = false
): Promise<T> {
  const token = isAdmin ? getAdminToken() : getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    const error: any = new Error(data.message || 'API request failed');
    error.data = data;
    error.status = res.status;
    throw error;
  }

  return data;
}
