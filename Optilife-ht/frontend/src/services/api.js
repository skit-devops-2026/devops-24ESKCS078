// Small wrapper around fetch.
// It adds the login token to every request and turns errors into thrown Error objects.

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('habitToken');

  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));

  // If the token has expired, send the user back to the login page
  if (response.status === 401 && path !== '/api/auth/login') {
    localStorage.removeItem('habitToken');
    window.location.href = '/login';
    throw new Error('Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
