'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchApi, getAuthToken } from '../lib/api';
import { useAuth } from './AuthContext';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: number;
    mrp: number;
    discount: number;
    rating: number;
    stock: number;
    primaryImage: string;
  };
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const refreshWishlist = async () => {
    const token = getAuthToken();
    if (!token || !user) {
      setWishlist([]);
      return;
    }

    try {
      const res = await fetchApi('/wishlist');
      if (res.success && res.wishlist) {
        setWishlist(res.wishlist);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const isWishlisted = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const toggleWishlist = async (productId: string) => {
    const token = getAuthToken();
    if (!token || !user) {
      alert('Please log in to save items to your wishlist.');
      return;
    }

    try {
      const res = await fetchApi('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      if (res.success) {
        await refreshWishlist();
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
