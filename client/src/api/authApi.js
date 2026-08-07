const API_BASE = '/api/auth';

export const registerApi = async (userData) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return await res.json();
};

export const loginApi = async (credentials) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return await res.json();
};

export const getProfileApi = async (token) => {
  const res = await fetch(`${API_BASE}/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const updateProfileApi = async (token, profileData) => {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  return await res.json();
};

export const addAddressApi = async (token, addressData) => {
  const res = await fetch(`${API_BASE}/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(addressData)
  });
  return await res.json();
};

export const fetchCustomersApi = async (token) => {
  const res = await fetch(`${API_BASE}/customers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};
