const API_BASE = '/api/admin';

export const getAdminStatsApi = async (token) => {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const getEmployeesApi = async (token) => {
  const res = await fetch(`${API_BASE}/employees`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const createEmployeeApi = async (token, employeeData) => {
  const res = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(employeeData)
  });
  return await res.json();
};

export const getCouponsApi = async (token) => {
  const res = await fetch(`${API_BASE}/coupons`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const createCouponApi = async (token, couponData) => {
  const res = await fetch(`${API_BASE}/coupons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(couponData)
  });
  return await res.json();
};
