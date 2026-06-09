import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import userApi from '../utils/userApi';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('cartItems') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    const token = localStorage.getItem('userToken');
    if (!token) return;
    const timer = setTimeout(() => {
      userApi.put('/cart', { cart: cartItems }).catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [cartItems]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    userApi
      .get('/cart')
      .then((res) => {
        const remote = Array.isArray(res.data?.cart) ? res.data.cart : [];
        if (remote.length > 0) setCartItems(remote);
      })
      .catch(() => {});
  }, []);

  const addToCart = (product, color, size, quantity = 1, overrideImage = null) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        String(item.id) === String(product.id) && 
        String(item.selectedColor).toLowerCase() === String(color).toLowerCase() && 
        String(item.selectedSize).toLowerCase() === String(size).toLowerCase()
      );

      if (existingItem) {
        return prev.map(item => 
          (String(item.id) === String(product.id) && 
           String(item.selectedColor).toLowerCase() === String(color).toLowerCase() && 
           String(item.selectedSize).toLowerCase() === String(size).toLowerCase()) 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
        );
      }
      
      // Determine the image to show in cart
      let cartImage = overrideImage || product.image;
      
      // If no override provided, try to find it in colorImages
      if (!overrideImage) {
        const colorKey = product.colorImages ? Object.keys(product.colorImages).find(
          k => k.trim().toLowerCase() === String(color || '').trim().toLowerCase()
        ) : null;

        if (colorKey && product.colorImages[colorKey]) {
          const imgs = product.colorImages[colorKey];
          cartImage = Array.isArray(imgs) ? (imgs.length > 0 ? imgs[0] : product.image) : imgs;
        }
      }
      
      return [...prev, { ...product, image: cartImage, quantity, selectedColor: color, selectedSize: size }];
    });
  };

  const removeFromCart = (id, color, size) => {
    setCartItems(prev => prev.filter(item => 
      !(String(item.id) === String(id) && 
        String(item.selectedColor).toLowerCase() === String(color).toLowerCase() && 
        String(item.selectedSize).toLowerCase() === String(size).toLowerCase())
    ));
  };

  const updateQuantity = (id, color, size, delta) => {
    setCartItems(prev => prev.map(item => 
      (String(item.id) === String(id) && 
       String(item.selectedColor).toLowerCase() === String(color).toLowerCase() && 
       String(item.selectedSize).toLowerCase() === String(size).toLowerCase())
      ? { ...item, quantity: Math.max(1, item.quantity + delta) }
      : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [cartItems]
  );
  const cartCount = useMemo(
    () => cartItems.reduce((count, item) => count + Number(item.quantity || 0), 0),
    [cartItems]
  );

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
