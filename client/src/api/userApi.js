const API_BASE = '/api/admin';

export const getUsersApi = async (token, { page = 1, limit = 10, search = '', role = '' } = {}) => {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', limit);
  if (search) params.set('search', search);
  if (role) params.set('role', role);

  const res = await fetch(`${API_BASE}/users?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const toggleUserStatusApi = async (token, userId, isActive) => {
  const res = await fetch(`${API_BASE}/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isActive })
  });
  return await res.json();
};
