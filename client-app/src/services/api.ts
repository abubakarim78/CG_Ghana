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
  if (!res.ok) {
    // Zod validation errors — build a readable message from field issues
    let message = data.error ?? 'Request failed';
    if (data.issues && typeof data.issues === 'object') {
      const fields = Object.entries(data.issues as Record<string, string[]>)
        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
        .join('\n');
      if (fields) message = fields;
    }
    throw Object.assign(new Error(message), { status: res.status });
  }
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

// Maps the flat Prisma response shape to the nested Case shape the app uses
function transformCase(c: any) {
  return {
    id: c.id,
    caseNumber: c.caseNumber,
    type: c.type,
    childAge: c.childAge,
    childGender: c.childGender,
    location: {
      district: c.district,
      region: c.region,
      lat: c.lat,
      lng: c.lng,
      description: c.locationDescription ?? undefined,
    },
    description: c.description,
    photos: c.photos ?? [],
    isAnonymous: c.isAnonymous,
    isEmergency: c.isEmergency,
    status: c.status,
    priority: c.priority,
    riskScore: c.riskScore,
    reportedAt: c.reportedAt,
    updatedAt: c.updatedAt,
    assignedOfficerId: c.assignedOfficerId ?? undefined,
    assignedOfficerName: c.assignedOfficer?.name ?? undefined,
    timeline: (c.timeline ?? []).map((t: any) => ({
      id: t.id,
      status: t.status,
      timestamp: t.timestamp,
      title: t.title,
      description: t.description,
      officerName: t.officerName ?? undefined,
      isSystemEvent: t.isSystemEvent,
    })),
  };
}

export const api = {
  auth: {
    register: (body: { name: string; phone: string; password: string; role?: string }) =>
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

    login: (phone: string, password: string) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),

    anonymous: () =>
      request<AuthResponse>('/auth/anonymous', { method: 'POST' }),

    savePushToken: (token: string) =>
      request<{ ok: boolean }>('/auth/push-token', { method: 'POST', body: JSON.stringify({ token }) }),
  },

  cases: {
    list: async (params?: { status?: string; priority?: string; region?: string }) => {
      const entries = Object.entries(params ?? {}).filter(([, v]) => v);
      const q = entries.length ? '?' + new URLSearchParams(Object.fromEntries(entries)).toString() : '';
      const data = await request<any[]>(`/cases${q}`);
      return data.map(transformCase);
    },
    getById: async (id: string) => {
      const data = await request<any>(`/cases/${id}`);
      return transformCase(data);
    },
    submit: async (body: any) => {
      const data = await request<any>('/cases', { method: 'POST', body: JSON.stringify(body) });
      return transformCase(data);
    },
    updateStatus: async (id: string, status: string, note: string) => {
      const data = await request<any>(`/cases/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) });
      return transformCase(data);
    },
    assign: async (caseId: string, officerId: string) => {
      const data = await request<any>(`/cases/${caseId}/assign`, { method: 'PATCH', body: JSON.stringify({ officerId }) });
      return transformCase(data);
    },
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
    triggerSOS: async (body: any) => {
      const data = await request<{ case: any; assignedOfficer: any }>('/emergency/sos', { method: 'POST', body: JSON.stringify(body) });
      return {
        case: data.case ? transformCase(data.case) : null,
        assignedOfficer: data.assignedOfficer,
      };
    },
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
