/**
 * Thin API client for the AdventistStay backend. Persists the auth token in localStorage
 * and attaches it as a Bearer header on every request.
 */

const TOKEN_KEY = 'adventiststay_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T = any>(
  path: string,
  options: { method?: string; body?: any } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError((data && data.error) || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) => request('/auth/register', { method: 'POST', body: payload }),
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),

  // State
  getState: () => request('/state'),

  // Profile
  updateProfile: (updates: any) => request('/me', { method: 'PATCH', body: updates }),

  // Listings
  createListing: (listing: any) => request('/listings', { method: 'POST', body: listing }),
  updateListing: (id: string, updates: any) => request(`/listings/${id}`, { method: 'PATCH', body: updates }),
  deleteListing: (id: string) => request(`/listings/${id}`, { method: 'DELETE' }),

  // Stay requests
  createStayRequest: (req: any) => request('/stay-requests', { method: 'POST', body: req }),
  updateStayRequestStatus: (id: string, status: string, checkInInstructions?: string) =>
    request(`/stay-requests/${id}/status`, { method: 'PATCH', body: { status, checkInInstructions } }),

  // Messages / reviews / verifications
  sendMessage: (msg: any) => request('/messages', { method: 'POST', body: msg }),
  createReview: (review: any) => request('/reviews', { method: 'POST', body: review }),
  createVerification: (v: any) => request('/verifications', { method: 'POST', body: v }),

  // Favorites
  toggleFavorite: (listingId: string) =>
    request('/favorites/toggle', { method: 'POST', body: { listingId } }),

  // Memberships
  subscribe: (payload: any) => request('/memberships/subscribe', { method: 'POST', body: payload }),
  cancelMembership: () => request('/memberships/cancel', { method: 'POST', body: {} }),

  // Family exchange
  createFamilyProfile: (fp: any) => request('/family-profiles', { method: 'POST', body: fp }),
  createFamilyExchangeRequest: (fr: any) =>
    request('/family-exchange-requests', { method: 'POST', body: fr }),
  updateFamilyExchangeRequestStatus: (id: string, status: string) =>
    request(`/family-exchange-requests/${id}/status`, { method: 'PATCH', body: { status } }),

  // Safety
  createSafetyReport: (report: any) => request('/safety-reports', { method: 'POST', body: report }),

  // Admin
  adminUpdateUser: (id: string, updates: any) =>
    request(`/admin/users/${id}`, { method: 'PATCH', body: updates }),
  adminUpdateDoc: (name: string, id: string, updates: any) =>
    request(`/admin/collections/${name}/${id}`, { method: 'PATCH', body: updates }),
  adminCreateDoc: (name: string, doc: any) =>
    request(`/admin/collections/${name}`, { method: 'POST', body: doc }),
  adminDeleteDoc: (name: string, id: string) =>
    request(`/admin/collections/${name}/${id}`, { method: 'DELETE' }),
  adminUpdatePlanPricing: (pricing: any) =>
    request('/admin/settings/plan-pricing', { method: 'PATCH', body: pricing })
};
