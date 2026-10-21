'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, Heart, Zap, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const wishlisted = isWishlisted(product.id);

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, 1);
    router.push('/checkout');
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top badges & Wishlist */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center z-10 pointer-events-none">
        {product.discount > 0 ? (
          <span className="bg-emerald-700 text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm">
            {product.discount}% OFF
          </span>
        ) : product.featured ? (
          <span className="bg-[#111111] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center">
            <Zap className="w-2.5 h-2.5 text-voltrix-orange mr-1 fill-voltrix-orange" />
            TOP PICK
          </span>
        ) : <div />}

        <button
          onClick={handleWishlist}
          className={`pointer-events-auto p-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 transition ${
            wishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link href={`/products/${product.slug}`} className="block p-4 pt-6 bg-white overflow-hidden">
        <div className="w-full h-44 flex items-center justify-center relative overflow-hidden">
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Zap className="w-8 h-8 text-gray-300" />
            </div>
          )}
        </div>
      </Link>

      {/* Product Details Block */}
      <div className="p-3.5 pt-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating badge */}
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="inline-flex items-center bg-emerald-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              {product.rating}
              <Star className="w-3 h-3 ml-0.5 fill-white" />
            </span>
            <span className="text-[11px] text-gray-500">
              ({product.numReviews.toLocaleString('en-IN')})
            </span>
            {product.stock > 0 && product.stock <= 10 && (
              <span className="text-[10px] text-amber-700 font-bold ml-auto">
                Only {product.stock} left!
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-voltrix-orange transition">
            <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[34px]">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-base font-black text-[#111111]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* 24h delivery note */}
          <div className="mt-1.5 flex items-center text-[10px] text-emerald-800 font-semibold">
            <Check className="w-3 h-3 mr-1 text-emerald-700" />
            Free 24h Delivery Eligible
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg text-xs font-bold transition border border-gray-200"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full bg-[#FF5A1F] hover:bg-[#E04812] text-white py-2 rounded-lg text-xs font-bold transition shadow-sm"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
