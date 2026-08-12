const TOKEN_KEY = 'adventiststay_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new ApiError(
      data?.error || data?.message || `Request failed (${res.status})`,
      res.status,
      data
    );
  }

  return data as T;
}

export const api = {
  health: () => apiRequest('/health'),
  bootstrap: () => apiRequest('/bootstrap'),
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  demoLogin: (role: 'ADMIN' | 'HOST' | 'GUEST') =>
    apiRequest<{ token: string; user: any }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
  register: (payload: Record<string, unknown>) =>
    apiRequest<{ token: string; user: any; membership?: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => apiRequest('/auth/me'),
  createStay: (payload: Record<string, unknown>) =>
    apiRequest('/stays', { method: 'POST', body: JSON.stringify(payload) }),
  updateStayStatus: (id: string, payload: { status: string; checkInInstructions?: string }) =>
    apiRequest(`/stays/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  sendMessage: (payload: { receiverId: string; content: string; stayRequestId?: string }) =>
    apiRequest('/messages', { method: 'POST', body: JSON.stringify(payload) }),
  createListing: (payload: Record<string, unknown>) =>
    apiRequest('/listings', { method: 'POST', body: JSON.stringify(payload) }),
  updateListing: (id: string, payload: Record<string, unknown>) =>
    apiRequest(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  approveListing: (id: string) => apiRequest(`/listings/${id}/approve`, { method: 'POST' }),
  rejectListing: (id: string) => apiRequest(`/listings/${id}/reject`, { method: 'POST' }),
  disableListing: (id: string) => apiRequest(`/listings/${id}/disable`, { method: 'POST' }),
  enableListing: (id: string) => apiRequest(`/listings/${id}/enable`, { method: 'POST' }),
  removeListing: (id: string) => apiRequest(`/listings/${id}`, { method: 'DELETE' }),
  subscribe: (payload: Record<string, unknown>) =>
    apiRequest('/memberships/subscribe', { method: 'POST', body: JSON.stringify(payload) }),
  cancelMembership: () => apiRequest('/memberships/cancel', { method: 'POST' }),
  submitVerification: (payload: Record<string, unknown>) =>
    apiRequest('/verifications', { method: 'POST', body: JSON.stringify(payload) }),
  updateVerification: (id: string, payload: { status: string; notes?: string }) =>
    apiRequest(`/verifications/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  addReview: (payload: Record<string, unknown>) =>
    apiRequest('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  deleteReview: (id: string) => apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
  updateUser: (id: string, payload: Record<string, unknown>) =>
    apiRequest(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  suspendUser: (id: string) => apiRequest(`/users/${id}/suspend`, { method: 'POST' }),
  reactivateUser: (id: string) => apiRequest(`/users/${id}/reactivate`, { method: 'POST' }),
  deleteUser: (id: string) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  createSafetyReport: (payload: Record<string, unknown>) =>
    apiRequest('/safety-reports', { method: 'POST', body: JSON.stringify(payload) }),
  resolveSafetyReport: (id: string) =>
    apiRequest(`/safety-reports/${id}/resolve`, { method: 'PATCH' }),
  toggleFavorite: (listingId: string) =>
    apiRequest<{ favorited?: boolean; listingId?: string; favorites?: string[] }>(
      `/favorites/${listingId}/toggle`,
      { method: 'POST' }
    ),
  addFamilyProfile: (payload: Record<string, unknown>) =>
    apiRequest('/families', { method: 'POST', body: JSON.stringify(payload) }),
  createFamilyExchange: (payload: Record<string, unknown>) =>
    apiRequest('/family-exchanges', { method: 'POST', body: JSON.stringify(payload) }),
  updateFamilyExchangeStatus: (id: string, status: string) =>
    apiRequest(`/family-exchanges/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  addCategory: (payload: Record<string, unknown>) =>
    apiRequest('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id: string, payload: Record<string, unknown>) =>
    apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};
