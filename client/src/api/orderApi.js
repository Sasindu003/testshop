const API_BASE = '/api/orders';

export const createOrderApi = async (token, orderData) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  return await res.json();
};

export const getMyOrdersApi = async (token) => {
  const res = await fetch(`${API_BASE}/my-orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const getAllOrdersApi = async (token) => {
  const res = await fetch(API_BASE, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

export const updateOrderStatusApi = async (token, orderId, status) => {
  const res = await fetch(`${API_BASE}/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return await res.json();
};
