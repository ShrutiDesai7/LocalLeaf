export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

let authToken = '';

export function setAuthToken(token) {
  authToken = token || '';
}

export function resolveApiUrl(value) {
  if (!value) return '';
  const str = String(value);
  if (/^https?:\/\//i.test(str)) return str;
  if (str.startsWith('/')) return `${API_BASE_URL}${str}`;
  return `${API_BASE_URL}/${str}`;
}

async function request(path, options = {}) {
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  if (authToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || 'Something went wrong';
    const details = data.error ? `: ${data.error}` : '';
    throw new Error(`${message}${details}`);
  }

  return data;
}

export const api = {
  register: (payload) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  me: () => request('/api/auth/me'),
  getPlants: (params = {}) => {
    const query = new URLSearchParams();

    if (params.category && params.category !== 'All') {
      query.set('category', params.category);
    }

    if (params.search) {
      query.set('search', params.search);
    }

    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);

    const queryString = query.toString();
    return request(`/plants${queryString ? `?${queryString}` : ''}`);
  },
  getMyPlants: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const queryString = query.toString();
    return request(`/plants/mine${queryString ? `?${queryString}` : ''}`);
  },
  getOrders: (params = {}) => {
    const query = new URLSearchParams();

    if (params.phone) {
      query.set('phone', params.phone);
    }

    if (params.status) {
      query.set('status', params.status);
    }

    const queryString = query.toString();
    return request(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  getMyOrders: () => request('/orders/mine'),
  createOrder: (payload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  createPlant: (formData) =>
    request('/plants', {
      method: 'POST',
      body: formData
    }),
  updatePlant: (id, formData) =>
    request(`/plants/${id}`, {
      method: 'PATCH',
      body: formData
    }),
  deletePlant: (id) =>
    request(`/plants/${id}`, {
      method: 'DELETE'
    }),
  getMyNursery: () => request('/api/nursery/me'),
  updateMyNursery: (payload) =>
    request('/api/nursery/me', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  subscribe: (months = 1) =>
    request('/api/nursery/subscribe', {
      method: 'POST',
      body: JSON.stringify({ months })
    }),
  listNurseryDocuments: () => request('/api/nursery/documents'),
  uploadNurseryDocument: ({ doc_type, file }) => {
    const form = new FormData();
    form.append('doc_type', doc_type);
    form.append('document', file);

    return request('/api/nursery/documents', {
      method: 'POST',
      body: form
    });
  },
  deleteNurseryDocument: (id) =>
    request(`/api/nursery/documents/${id}`, {
      method: 'DELETE'
    })
};
