const API_BASE = '/api/products';

export const fetchProductsApi = async () => {
  const res = await fetch(API_BASE);
  return await res.json();
};

export const createProductApi = async (token, productData) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  return await res.json();
};

export const updateProductApi = async (token, id, productData) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  return await res.json();
};

export const deleteProductApi = async (token, id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};
