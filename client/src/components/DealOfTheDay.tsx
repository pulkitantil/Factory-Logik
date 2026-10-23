'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Zap, Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export default function DealOfTheDay({ product }: { product?: Product }) {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!product) return null;

  return (
    <section className="my-8">
      <div className="bg-gradient-to-r from-[#111111] via-[#1A1A1A] to-[#0B3D2E] rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background accent glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-voltrix-orange/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Deal Badge & Timer */}
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-voltrix-orange/20 border border-voltrix-orange/40 text-voltrix-orange px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-voltrix-orange animate-pulse" />
              <span>Flash Deal of the Day</span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
              Save Big on Automation Hardware
            </h2>

            <p className="text-gray-300 text-xs leading-relaxed">
              Limited quantity allocated at special promotional pricing with complimentary 24-hour insured dispatch.
            </p>

            {/* Live Countdown Timer */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block mb-2 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-voltrix-orange" /> Offer Expires In:
              </span>
              <div className="flex items-center space-x-2">
                <div className="bg-black/60 border border-gray-700 px-3 py-2 rounded-lg text-center min-w-[54px]">
                  <span className="text-lg font-black text-voltrix-orange font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] text-gray-400 font-medium">HOURS</span>
                </div>
                <span className="text-voltrix-orange font-black text-lg">:</span>
                <div className="bg-black/60 border border-gray-700 px-3 py-2 rounded-lg text-center min-w-[54px]">
                  <span className="text-lg font-black text-voltrix-orange font-mono">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] text-gray-400 font-medium">MINS</span>
                </div>
                <span className="text-voltrix-orange font-black text-lg">:</span>
                <div className="bg-black/60 border border-gray-700 px-3 py-2 rounded-lg text-center min-w-[54px]">
                  <span className="text-lg font-black text-voltrix-orange font-mono">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] text-gray-400 font-medium">SECS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Product Image */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="w-64 h-64 bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center relative group backdrop-blur-sm">
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow">
                {product.discount}% OFF
              </span>
              <img
                src={product.primaryImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition duration-300"
              />
            </div>
          </div>

          {/* Right Product Specs & Purchase CTA */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-emerald-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center">
                  {product.rating}
                  <Star className="w-3 h-3 ml-0.5 fill-white" />
                </span>
                <span className="text-xs text-gray-400">({product.numReviews} verified reviews)</span>
              </div>
              <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                {product.name}
              </h3>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Save ₹{(product.mrp - product.price).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Stock Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-voltrix-orange font-bold">Only {product.stock} units remaining</span>
                <span className="text-gray-400">85% Claimed</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-voltrix-orange h-full rounded-full w-[85%]" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => addToCart(product.id, 1)}
                className="flex-1 bg-voltrix-orange hover:bg-voltrix-orange-hover text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition shadow-lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Claim Deal Now
              </button>
              <Link
                href={`/products/${product.slug}`}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                aria-label="View product details"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
