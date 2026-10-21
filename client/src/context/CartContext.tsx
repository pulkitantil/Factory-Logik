'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, CartSummary } from '../types';
import { fetchApi, getAuthToken } from '../lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const defaultSummary: CartSummary = {
  totalItems: 0,
  mrpTotal: 0,
  itemDiscount: 0,
  subtotal: 0,
  gstAmount: 0,
  shippingFee: 0,
  platformFee: 0,
  finalAmount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(defaultSummary);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  const refreshCart = async () => {
    const token = getAuthToken();
    if (!token || !user) {
      // Local fallback for guest
      const localCart = localStorage.getItem('voltrix_guest_cart');
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          setItems(parsed);
          calculateGuestSummary(parsed);
        } catch {
          setItems([]);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/cart');
      if (res.success && res.cart) {
        setItems(res.cart.items);
        setSummary(res.cart.summary);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateGuestSummary = (guestItems: CartItem[]) => {
    const mrpTotal = guestItems.reduce((acc, curr) => acc + curr.mrpTotal, 0);
    const subtotal = guestItems.reduce((acc, curr) => acc + curr.itemTotal, 0);
    const itemDiscount = mrpTotal - subtotal;
    const gstAmount = Math.round(subtotal * 0.18);
    const platformFee = guestItems.length > 0 ? 19 : 0;
    const finalAmount = subtotal + platformFee;

    setSummary({
      totalItems: guestItems.reduce((acc, curr) => acc + curr.quantity, 0),
      mrpTotal,
      itemDiscount,
      subtotal,
      gstAmount,
      shippingFee: 0,
      platformFee,
      finalAmount,
    });
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: string, quantity = 1) => {
    const token = getAuthToken();
    if (!token || !user) {
      // Fetch product to add to guest cart
      try {
        const pRes = await fetchApi(`/products/${productId}`);
        if (pRes.success && pRes.product) {
          const prod = pRes.product;
          const current = [...items];
          const existingIdx = current.findIndex((i) => i.productId === productId);

          if (existingIdx > -1) {
            current[existingIdx].quantity += quantity;
            current[existingIdx].itemTotal = current[existingIdx].quantity * prod.price;
            current[existingIdx].mrpTotal = current[existingIdx].quantity * prod.mrp;
          } else {
            current.push({
              id: `guest-${Date.now()}`,
              productId: prod.id,
              quantity,
              product: {
                id: prod.id,
                name: prod.name,
                slug: prod.slug,
                brand: prod.brand,
                price: prod.price,
                mrp: prod.mrp,
                discount: prod.discount,
                stock: prod.stock,
                primaryImage: prod.primaryImage,
              },
              itemTotal: prod.price * quantity,
              mrpTotal: prod.mrp * quantity,
            });
          }

          setItems(current);
          localStorage.setItem('voltrix_guest_cart', JSON.stringify(current));
          calculateGuestSummary(current);
          setIsCartDrawerOpen(true);
        }
      } catch (err) {
        console.error('Guest add to cart error:', err);
      }
      return;
    }

    try {
      const res = await fetchApi('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.success) {
        await refreshCart();
        setIsCartDrawerOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const token = getAuthToken();
    if (!token || !user) {
      let current = [...items];
      if (quantity <= 0) {
        current = current.filter((i) => i.id !== itemId);
      } else {
        const item = current.find((i) => i.id === itemId);
        if (item) {
          item.quantity = quantity;
          item.itemTotal = item.product.price * quantity;
          item.mrpTotal = item.product.mrp * quantity;
        }
      }
      setItems(current);
      localStorage.setItem('voltrix_guest_cart', JSON.stringify(current));
      calculateGuestSummary(current);
      return;
    }

    try {
      await fetchApi(`/cart/item/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      await refreshCart();
    } catch (err) {
      console.error('Update quantity error:', err);
    }
  };

  const removeItem = async (itemId: string) => {
    const token = getAuthToken();
    if (!token || !user) {
      const current = items.filter((i) => i.id !== itemId);
      setItems(current);
      localStorage.setItem('voltrix_guest_cart', JSON.stringify(current));
      calculateGuestSummary(current);
      return;
    }

    try {
      await fetchApi(`/cart/item/${itemId}`, { method: 'DELETE' });
      await refreshCart();
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  const clearCart = async () => {
    const token = getAuthToken();
    if (!token || !user) {
      setItems([]);
      localStorage.removeItem('voltrix_guest_cart');
      setSummary(defaultSummary);
      return;
    }

    try {
      await fetchApi('/cart/clear', { method: 'DELETE' });
      await refreshCart();
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
