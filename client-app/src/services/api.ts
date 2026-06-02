import * as SecureStore from 'expo-secure-store';

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'cg_auth_token';

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? 'Request failed'), { status: res.status });
  return data as T;
}

export interface AuthUser {
  id: string;
  name?: string | null;
  role: 'reporter' | 'officer' | 'admin';
  officerId?: string;
  isAnonymous?: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const api = {
  auth: {
    register: (body: { name: string; phone: string; password: string }) =>
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

    login: (phone: string, password: string) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),

    anonymous: () =>
      request<AuthResponse>('/auth/anonymous', { method: 'POST' }),

    savePushToken: (token: string) =>
      request<{ ok: boolean }>('/auth/push-token', { method: 'POST', body: JSON.stringify({ token }) }),
  },

  cases: {
    list: (params?: { status?: string; priority?: string; region?: string }) => {
      const entries = Object.entries(params ?? {}).filter(([, v]) => v);
      const q = entries.length ? '?' + new URLSearchParams(Object.fromEntries(entries)).toString() : '';
      return request<any[]>(`/cases${q}`);
    },
    getById: (id: string) => request<any>(`/cases/${id}`),
    submit: (body: any) =>
      request<any>('/cases', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id: string, status: string, note: string) =>
      request<any>(`/cases/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
    assign: (caseId: string, officerId: string) =>
      request<any>(`/cases/${caseId}/assign`, { method: 'PATCH', body: JSON.stringify({ officerId }) }),
  },

  officers: {
    list: (params?: { district?: string; region?: string }) => {
      const entries = Object.entries(params ?? {}).filter(([, v]) => v);
      const q = entries.length ? '?' + new URLSearchParams(Object.fromEntries(entries)).toString() : '';
      return request<any[]>(`/officers${q}`);
    },
    getById: (id: string) => request<any>(`/officers/${id}`),
    create: (body: any) =>
      request<any>('/officers', { method: 'POST', body: JSON.stringify(body) }),
  },

  emergency: {
    triggerSOS: (body: any) =>
      request<{ case: any; assignedOfficer: any }>('/emergency/sos', { method: 'POST', body: JSON.stringify(body) }),
  },

  stats: {
    dashboard: () => request<any>('/stats/dashboard'),
    heatmap: () => request<any>('/stats/heatmap'),
  },

  upload: {
    photo: async (uri: string): Promise<{ url: string }> => {
      const token = await getStoredToken();
      const formData = new FormData();
      const filename = uri.split('/').pop() ?? 'photo.jpg';
      formData.append('photo', { uri, name: filename, type: 'image/jpeg' } as any);
      const res = await fetch(`${API_BASE}/upload/photo`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      return data;
    },
  },
};
