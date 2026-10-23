'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Flame,
  Tag,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Gift,
  Percent,
} from 'lucide-react';
import DealOfTheDay from '../../components/DealOfTheDay';
import ProductCard from '../../components/ProductCard';
import { Product, Coupon } from '../../types';
import { fetchApi } from '../../lib/api';

export default function DealsPage() {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      setLoading(true);
      try {
        const [prodRes, coupRes] = await Promise.all([
          fetchApi('/products?limit=30'),
          fetchApi('/coupons'),
        ]);

        if (prodRes.success && prodRes.products) {
          // Sort by discount descending
          const discounted = prodRes.products
            .filter((p: Product) => p.discount > 0)
            .sort((a: Product, b: Product) => b.discount - a.discount);
          setDealProducts(discounted);
        }

        if (coupRes.success) {
          setCoupons(coupRes.coupons || []);
        }
      } catch (err) {
        console.error('Failed to load deals:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDeals();
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111111] via-[#1C2826] to-[#0B3D2E] rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 bg-voltrix-orange text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>FESTIVE SAVINGS HUB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Industrial Automation Deals &amp; Volume Discounts
          </h1>
          <p className="text-xs text-gray-300">
            Enjoy exclusive project pricing on certified PLCs, VFD inverters, motors, and electrical control components. Discounts apply automatically or via valid promo codes below.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-center p-4 bg-white/10 rounded-2xl border border-white/20">
            <div className="text-2xl font-black text-voltrix-orange">47%</div>
            <div className="text-[10px] font-bold text-gray-300">MAX DISCOUNT</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-2xl border border-white/20">
            <div className="text-2xl font-black text-emerald-400">24H</div>
            <div className="text-[10px] font-bold text-gray-300">FAST DISPATCH</div>
          </div>
        </div>
      </div>

      {/* Deal of the Day Banner */}
      {dealProducts.length > 0 && <DealOfTheDay product={dealProducts[0]} />}

      {/* Active Coupons Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-voltrix-orange" />
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Active Store Promo Vouchers
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-voltrix-orange transition"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-black font-mono text-gray-900 bg-gray-100 px-2.5 py-1 rounded border">
                    {c.code}
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">{c.description}</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Min Order Value: ₹{c.minOrderValue.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => handleCopyCoupon(c.code)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  copiedCode === c.code
                    ? 'bg-emerald-600 text-white'
                    : 'bg-voltrix-dark hover:bg-black text-white'
                }`}
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Promo Code</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Discounted Products Grid */}
      <section className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Percent className="w-5 h-5 text-voltrix-orange" />
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              All Discounted Products ({dealProducts.length})
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-voltrix-orange hover:text-voltrix-orange-hover flex items-center space-x-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dealProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
