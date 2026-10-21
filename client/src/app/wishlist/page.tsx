'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
  Zap,
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { fetchApi } from '../../lib/api';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (productId: string) => {
    await addToCart(productId, 1);
    await toggleWishlist(productId);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Bookmark high-performance laptops, ANC audio devices, and monitors to keep an eye on price drops and stock.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow"
        >
          <span>Explore Electronics</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
          Saved Tech Wishlist ({wishlist.length} Items)
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Items saved for later. Move them to cart with a single click.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => {
          const prod = item.product;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col justify-between hover:shadow-card-hover transition"
            >
              <div>
                <div className="h-44 flex items-center justify-center relative p-2 bg-gray-50 rounded-xl">
                  {prod.primaryImage && (
                    <img
                      src={prod.primaryImage}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                  <button
                    onClick={() => toggleWishlist(item.productId)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-red-500 shadow-sm border hover:bg-red-50"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-black uppercase text-voltrix-orange">
                    {prod.brand}
                  </span>
                  <Link
                    href={`/products/${prod.slug}`}
                    className="text-xs font-bold text-gray-900 hover:text-voltrix-orange block truncate"
                  >
                    {prod.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-extrabold text-gray-950">
                      ₹{prod.price?.toLocaleString('en-IN')}
                    </span>
                    {prod.discount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {prod.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t flex space-x-2">
                <button
                  onClick={() => handleMoveToCart(item.productId)}
                  className="flex-1 bg-voltrix-dark hover:bg-black text-white text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-voltrix-orange" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
