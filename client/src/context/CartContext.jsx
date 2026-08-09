import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import * as cartApi from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const initialState = { items: [], loading: false, error: null };

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR':
      return { ...initialState };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch({ type: 'LOAD_START' });
    try {
      const { data } = await cartApi.getCart();
      dispatch({ type: 'LOAD_SUCCESS', payload: data.items });
    } catch (err) {
      dispatch({ type: 'LOAD_ERROR', payload: err.message });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else dispatch({ type: 'CLEAR' });
  }, [isAuthenticated, fetchCart]);

  const addItem = useCallback(async (productId, size, quantity = 1) => {
    await cartApi.addToCart(productId, size, quantity);
    await fetchCart();
  }, [fetchCart]);

  const updateItem = useCallback(async (productId, data) => {
    await cartApi.updateCartItem(productId, data);
    await fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (productId) => {
    await cartApi.removeCartItem(productId);
    await fetchCart();
  }, [fetchCart]);

  const clear = useCallback(async () => {
    await cartApi.clearCart();
    dispatch({ type: 'CLEAR' });
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, totalItems, fetchCart, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
