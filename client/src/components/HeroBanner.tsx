'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Zap, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Upgrade Your Tech. Upgrade Your Life.',
    subtitle: 'Next-Gen M3 Pro Workstations, 5G Flagships & Pro ANC Audio.',
    offer: 'Flat 10% Instant Discount on HDFC & ICICI Cards',
    ctaText: 'Shop Electronics',
    ctaLink: '/products',
    secondaryCtaText: 'Explore Deals',
    secondaryCtaLink: '/products?featured=true',
    badge: 'FESTIVE MEGA LAUNCH',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80',
    bgColor: 'from-[#0B3D2E] via-[#111111] to-[#111111]',
  },
  {
    id: 2,
    title: 'Cinematic Sound. Industry-Leading Silence.',
    subtitle: 'Sony WH-1000XM5 & Apple AirPods Pro with Adaptive Noise Cancellation.',
    offer: 'Complimentary 24-Hour Express Shipping',
    ctaText: 'Explore Audio Gear',
    ctaLink: '/products?category=audio',
    secondaryCtaText: 'Compare ANC',
    secondaryCtaLink: '/ai-assistant?prompt=Compare+Sony+WH-1000XM5+and+AirPods+Pro',
    badge: 'AUDIOPHILE SHOWCASE',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80',
    bgColor: 'from-[#1A1A1A] via-[#111111] to-[#0B3D2E]',
  },
  {
    id: 3,
    title: 'Pure Visual Immersion: 240Hz OLED & 4K Displays',
    subtitle: 'LG UltraGear & Samsung Odyssey with 0.03ms response time for gaming & code.',
    offer: 'Up to 30% OFF + 3 Years Warranty with Burn-In Protection',
    ctaText: 'Discover Monitors',
    ctaLink: '/products?category=monitors',
    secondaryCtaText: 'Shop Gaming Gear',
    secondaryCtaLink: '/products?category=gaming',
    badge: 'ULTRA-WIDE EXPEDITION',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900&q=80',
    bgColor: 'from-[#111111] via-[#1C2826] to-[#111111]',
  },
];

const brandOffers = [
  { brand: 'Apple', discount: 'Up to 15% OFF', desc: 'MacBook Pro & iPhone 16 Pro', link: '/products?brand=Apple', color: 'bg-zinc-900 text-white' },
  { brand: 'Sony', discount: 'Up to 47% OFF', desc: 'Audio, Alpha Cameras & PS5', link: '/products?brand=Sony', color: 'bg-zinc-800 text-white' },
  { brand: 'Samsung', discount: 'Up to 35% OFF', desc: 'Galaxy S24 Ultra & Neo G9', link: '/products?brand=Samsung', color: 'bg-blue-950 text-white' },
  { brand: 'Dell', discount: 'Up to 25% OFF', desc: 'XPS 16 & UltraSharp 4K', link: '/products?brand=Dell', color: 'bg-slate-900 text-white' },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const slide = slides[currentSlide];

  return (
    <div className="space-y-4 my-4">
      {/* 1. Main Hero Carousel */}
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${slide.bgColor} text-white shadow-xl min-h-[380px] lg:min-h-[440px] flex items-center transition-all duration-700`}>
        {/* Background accent glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-voltrix-orange/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full relative z-10">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-voltrix-orange/20 border border-voltrix-orange/40 text-voltrix-orange px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-voltrix-orange animate-pulse" />
              <span>{slide.badge}</span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {slide.title}
            </h1>

            <p className="text-sm lg:text-base text-gray-300 max-w-xl leading-relaxed">
              {slide.subtitle}
            </p>

            {/* Bank offer strip */}
            <div className="inline-flex items-center space-x-2 bg-black/40 border border-white/10 px-3.5 py-1.5 rounded-lg text-xs text-emerald-400 font-semibold backdrop-blur-sm">
              <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{slide.offer}</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={slide.ctaLink}
                className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href={slide.secondaryCtaLink}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition backdrop-blur-sm"
              >
                {slide.secondaryCtaText}
              </Link>
            </div>
          </div>

          {/* Right Product Image Showcase */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-6 flex items-center justify-center relative group">
              <img
                src={slide.image}
                alt={slide.title}
                className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 backdrop-blur-sm transition z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 backdrop-blur-sm transition z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === idx ? 'w-8 bg-voltrix-orange' : 'w-2 bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Quad Brand Promo Strip (Moglix style below hero) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {brandOffers.map((item) => (
          <Link
            key={item.brand}
            href={item.link}
            className={`${item.color} rounded-xl p-3.5 border border-gray-800 flex items-center justify-between hover:scale-[1.02] transition shadow-sm group`}
          >
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-voltrix-orange block">
                {item.discount}
              </span>
              <h4 className="font-extrabold text-sm text-white group-hover:text-voltrix-orange transition">
                {item.brand} Official
              </h4>
              <p className="text-[11px] text-gray-400">{item.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-voltrix-orange group-hover:translate-x-1 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
