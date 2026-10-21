'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
  Flame,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import DealOfTheDay from '../components/DealOfTheDay';
import { Product, Category } from '../types';
import { fetchApi } from '../lib/api';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [dealProduct, setDealProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetchApi('/categories'),
          fetchApi('/products?limit=24'),
        ]);

        if (catRes.success) {
          setCategories(catRes.categories || []);
        }

        if (prodRes.success && prodRes.products) {
          const prods: Product[] = prodRes.products;
          // Featured products
          const featured = prods.filter((p) => p.featured).slice(0, 8);
          setFeaturedProducts(featured.length > 0 ? featured : prods.slice(0, 8));

          // Trending products
          const trending = prods
            .filter((p) => p.rating >= 4.5 && p.stock > 0)
            .slice(0, 8);
          setTrendingProducts(trending.length > 0 ? trending : prods.slice(8, 16));

          // Deal of the day
          const deal = prods.find((p) => p.discount >= 20) || prods[0];
          setDealProduct(deal);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Section */}
      <HeroBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Trust Badges Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-voltrix-green flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">24H Express Dispatch</h4>
              <p className="text-[11px] text-gray-500">Free shipping across India</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">100% Genuine Tech</h4>
              <p className="text-[11px] text-gray-500">Direct brand warranty</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-voltrix-orange flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Easy 7-Day Replacement</h4>
              <p className="text-[11px] text-gray-500">Hassle-free doorstep pickup</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Flexible Payments</h4>
              <p className="text-[11px] text-gray-500">UPI, Cards, No-Cost EMI</p>
            </div>
          </div>
        </div>

        {/* 2. Categories Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-voltrix-orange flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Curated Collections
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-voltrix-orange hover:text-voltrix-orange-hover flex items-center space-x-1"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </section>

        {/* 3. Deal of the Day Section */}
        {dealProduct && <DealOfTheDay product={dealProduct} />}

        {/* 4. Featured Products Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center">
                <Award className="w-3.5 h-3.5 mr-1" /> Handpicked Excellence
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Featured Electronics
              </h2>
            </div>
            <Link
              href="/products?featured=true"
              className="text-xs font-bold text-voltrix-orange hover:text-voltrix-orange-hover flex items-center space-x-1"
            >
              <span>See All Featured</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 5. Promotional Mid-Banner (AI Concierge Callout) */}
        <div className="rounded-2xl bg-gradient-to-r from-[#111111] via-[#0B3D2E] to-[#111111] p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center space-x-1.5 bg-voltrix-orange/20 border border-voltrix-orange/40 text-voltrix-orange px-2.5 py-0.5 rounded-full text-xs font-bold">
              <Sparkles className="w-3 h-3" />
              <span>POWERED BY VOLTRIX AI ENGINE</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight leading-snug">
              Need Help Choosing the Right Laptop or Audio Gear?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Ask our dedicated AI Assistant to compare real hardware specifications, match your budget in ₹ INR, or track your live shipments in real time.
            </p>
          </div>

          <div className="mt-4 md:mt-0 z-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/ai-assistant"
              className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>Chat with Voltrix AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-4 py-3 rounded-xl transition text-center"
            >
              Browse Catalog
            </Link>
          </div>
        </div>

        {/* 6. Trending Products Carousel / Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center">
                <Flame className="w-3.5 h-3.5 mr-1 fill-rose-600" /> Community Favorites
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Trending Right Now
              </h2>
            </div>
            <Link
              href="/products?sort=popularity"
              className="text-xs font-bold text-voltrix-orange hover:text-voltrix-orange-hover flex items-center space-x-1"
            >
              <span>Explore Trending</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 7. Why Choose Us Section */}
        <section className="py-8 border-t border-gray-200">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-voltrix-orange">
              The Voltrix Advantage
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              Built for Tech Enthusiasts & Professionals
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Combining industrial reliability with next-gen consumer electronics shopping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
                01
              </div>
              <h3 className="text-sm font-bold text-gray-900">Direct Brand Authorized</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Zero grey-market units. Every device originates directly from authorized Indian distributors with valid GST tax invoices and serial-locked brand warranty.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-voltrix-orange flex items-center justify-center font-black">
                02
              </div>
              <h3 className="text-sm font-bold text-gray-900">Precision Technical Testing</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our logistics hubs perform barcode verification, seal inspection, and tamper diagnostics before dispatching any flagship item.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                03
              </div>
              <h3 className="text-sm font-bold text-gray-900">Real-Time Transit Telemetry</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every shipment receives a unique TRK-IN ID with live status milestones, carrier telemetry, and automated OTP delivery safeguards.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Newsletter Subscription */}
        <section className="bg-gradient-to-tr from-[#111111] via-[#1A1A1A] to-[#0B3D2E] rounded-2xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-voltrix-orange/20 border border-voltrix-orange/40 text-voltrix-orange flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Stay Ahead of Tech Drops & Flash Deals
            </h2>
            <p className="text-xs text-gray-300">
              Subscribe to receive weekly curated hardware benchmarks, festive coupon drops, and VIP launch alerts.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-voltrix-orange focus:ring-1 focus:ring-voltrix-orange"
              />
              <button
                type="submit"
                className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md whitespace-nowrap"
              >
                Subscribe Free
              </button>
            </form>

            {subscribed && (
              <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-full mt-2 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Thank you! You have been subscribed to Voltrix VIP Tech Alerts.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
