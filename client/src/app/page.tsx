'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Flame,
  Sparkles,
  Award,
  CheckCircle2,
  Mail,
  Cpu,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import DealOfTheDay from '../components/DealOfTheDay';
import ServicesSection from '../components/ServicesSection';
import { Product } from '../types';
import { fetchApi } from '../lib/api';
import { INDUSTRIAL_CATEGORIES } from '../lib/constants';

export default function HomePage() {
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
        const prodRes = await fetchApi('/products?limit=24');

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
              <h4 className="text-xs font-bold text-gray-900">Pan-India Express Dispatch</h4>
              <p className="text-[11px] text-gray-500">Secure industrial packaging</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">100% Genuine Components</h4>
              <p className="text-[11px] text-gray-500">Authorized brand warranty &amp; GST</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-voltrix-orange flex items-center justify-center flex-shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">OEM &amp; Engineering Support</h4>
              <p className="text-[11px] text-gray-500">Field tested &amp; verified specs</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Flexible B2B Invoicing</h4>
              <p className="text-[11px] text-gray-500">GST credit, PO &amp; Online Pay</p>
            </div>
          </div>
        </div>

        {/* 2. Industrial Product Categories Grid (10 Categories) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-voltrix-orange flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Industrial Automation Hardware
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Browse by Category
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

          {/* 10 Categories Grid: 2 cols on mobile, 5 cols on tablet/desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {INDUSTRIAL_CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* 3. Dedicated Services Section */}
        <ServicesSection />

        {/* 4. Deal of the Day Section */}
        {dealProduct && <DealOfTheDay product={dealProduct} />}

        {/* 5. Featured Products Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center">
                <Award className="w-3.5 h-3.5 mr-1" /> Handpicked Automation Gear
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Featured Products
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

        {/* 6. Promotional Mid-Banner (Factorylogik AI Concierge Callout) */}
        <div className="rounded-2xl bg-gradient-to-r from-[#111111] via-[#0B3D2E] to-[#111111] p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center space-x-1.5 bg-voltrix-orange/20 border border-voltrix-orange/40 text-voltrix-orange px-2.5 py-0.5 rounded-full text-xs font-bold">
              <Sparkles className="w-3 h-3" />
              <span>POWERED BY FACTORYLOGIK AI</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight leading-snug">
              Need Help Selecting the Right Automation Equipment?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Ask our dedicated AI Assistant to compare technical specifications, match VFD and motor ratings, recommend compatible sensors, or check live order dispatch.
            </p>
          </div>

          <div className="mt-4 md:mt-0 z-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/ai-assistant"
              className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>Chat with Factorylogik AI</span>
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

        {/* 7. Trending Products Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center">
                <Flame className="w-3.5 h-3.5 mr-1 fill-rose-600" /> Industry Favorites
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Popular In-Demand Hardware
              </h2>
            </div>
            <Link
              href="/products?sort=popularity"
              className="text-xs font-bold text-voltrix-orange hover:text-voltrix-orange-hover flex items-center space-x-1"
            >
              <span>Explore In-Demand</span>
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

        {/* 8. Why Choose Us Section */}
        <section className="py-8 border-t border-gray-200">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-voltrix-orange">
              The Factorylogik Advantage
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              Built for Engineers, OEMs &amp; System Integrators
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Combining industrial engineering precision with seamless online procurement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
                01
              </div>
              <h3 className="text-sm font-bold text-gray-900">Direct Authorized Sourcing</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Zero grey-market components. Every item originates directly from verified Indian distributors with valid GST tax invoices and serial-locked manufacturer warranty.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-voltrix-orange flex items-center justify-center font-black">
                02
              </div>
              <h3 className="text-sm font-bold text-gray-900">Industrial Testing &amp; Verification</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our Jaipur engineering center verifies part numbers, terminal integrity, and firmware versions before dispatching high-precision automation hardware.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                03
              </div>
              <h3 className="text-sm font-bold text-gray-900">Real-Time Dispatch &amp; Tracking</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every consignment receives a unique tracking ID with live milestone updates, courier telemetry, and automated delivery notifications.
              </p>
            </div>
          </div>
        </section>

        {/* 9. Newsletter Subscription */}
        <section className="bg-gradient-to-tr from-[#111111] via-[#1A1A1A] to-[#0B3D2E] rounded-2xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-voltrix-orange/20 border border-voltrix-orange/40 text-voltrix-orange flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Stay Informed on Automation Stock &amp; Offers
            </h2>
            <p className="text-xs text-gray-300">
              Subscribe to receive updates on newly arrived PLC modules, drive stock alerts, and technical application guides.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your engineering or company email..."
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
                <span>Thank you! You have been subscribed to Factorylogik automation updates.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
