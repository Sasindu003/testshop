import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('stylehub_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('stylehub_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  useEffect(() => {
    localStorage.setItem('stylehub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('stylehub_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToCart = (product, selectedSize = 'M', selectedColor = 'Black', quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item._id === product._id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { ...product, selectedSize, selectedColor, quantity }];
      }
    });
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCartItems([]);

  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.some(item => item._id === product._id);
      if (exists) {
        return prev.filter(item => item._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      wishlistItems, 
      selectedDepartment,
      setSelectedDepartment,
      addToCart, 
      removeFromCart, 
      clearCart, 
      toggleWishlist, 
      isInWishlist, 
      subtotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};
