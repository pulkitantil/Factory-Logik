'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Instagram,
  Cpu,
} from 'lucide-react';
import { fetchApi } from '../lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#111111] text-gray-400 text-xs">
      {/* Trust Highlight Banner */}
      <div className="border-b border-gray-800 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-voltrix-orange flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">24h Express Delivery</h4>
              <p className="text-gray-400 text-[11px]">Free delivery on orders over ₹999</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Tech</h4>
              <p className="text-gray-400 text-[11px]">Direct brand authorized warranty</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">7-Day Easy Returns</h4>
              <p className="text-gray-400 text-[11px]">No questions asked replacements</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">24/7 Expert Support</h4>
              <p className="text-gray-400 text-[11px]">Dedicated engineers & AI guidance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand & About */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B3D2E] flex items-center justify-center shadow">
              <Cpu className="w-5 h-5 text-voltrix-orange" />
            </div>
            <div className="flex items-center">
              <span className="text-xl font-black tracking-tight text-white">FACTORY</span>
              <span className="text-xl font-black tracking-tight text-voltrix-orange">LOGIK</span>
            </div>
          </Link>
          <span className="text-[10px] uppercase tracking-widest block font-bold text-emerald-400 -mt-2">
            and Controls
          </span>
          <p className="text-gray-400 leading-relaxed text-xs max-w-sm">
            Factorylogik and Controls is Jaipur&apos;s premier industrial automation products &amp; engineering services marketplace.
            Delivering certified PLCs, VFDs, control panels, and automation components with express dispatch across India.
          </p>

          <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <MapPin className="w-4 h-4 text-voltrix-orange shrink-0" />
              <span>Jaipur, Rajasthan, India</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <a href="tel:+919743012001" className="hover:text-white transition">+91 97430 12001</a>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <a href="mailto:info3factorylogik@gmail.com" className="hover:text-white transition">info3factorylogik@gmail.com</a>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
              <a
                href="https://instagram.com/Factorylogik.controls"
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-300 transition font-medium"
              >
                @Factorylogik.controls
              </a>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Popular Categories</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/products?category=plc" className="hover:text-white transition">
                PLCs &amp; Automation
              </Link>
            </li>
            <li>
              <Link href="/products?category=vfd" className="hover:text-white transition">
                Variable Frequency Drives (VFD)
              </Link>
            </li>
            <li>
              <Link href="/products?category=hmi" className="hover:text-white transition">
                HMI &amp; Touch Displays
              </Link>
            </li>
            <li>
              <Link href="/products?category=motors" className="hover:text-white transition">
                Industrial AC &amp; Servo Motors
              </Link>
            </li>
            <li>
              <Link href="/products?category=sensors" className="hover:text-white transition">
                Sensors &amp; Encoders
              </Link>
            </li>
            <li>
              <Link href="/products?category=electrical-control-panels" className="hover:text-white transition">
                Electrical Control Panels
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Customer Service</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/track-order" className="hover:text-white transition">
                Track Order & Live GPS
              </Link>
            </li>
            <li>
              <Link href="/ai-assistant" className="hover:text-white transition text-voltrix-orange font-medium">
                Factorylogik AI Shopping Assistant
              </Link>
            </li>
            <li>
              <Link href="/account?tab=orders" className="hover:text-white transition">
                Return & Replacement
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Store Location & Directions
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Business & Bulk GST Invoicing
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-white transition text-gray-500">
                Staff & Admin Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="text-white font-bold text-sm mb-2">Join Tech Insiders</h4>
          <p className="text-gray-400 mb-3 text-[11px]">
            Subscribe to get flash launch notifications and an instant ₹500 discount coupon code.
          </p>
          {subscribed ? (
            <div className="bg-emerald-950/80 border border-emerald-700/50 p-3 rounded-xl text-emerald-300 space-y-1">
              <div className="flex items-center font-bold">
                <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
                Subscribed!
              </div>
              <p className="text-[10px]">Use coupon code <span className="text-white font-bold underline">WELCOME10</span> for 10% OFF your first order!</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-voltrix-orange"
              />
              <button
                type="submit"
                className="w-full bg-voltrix-orange hover:bg-voltrix-orange-hover text-white py-2 rounded-lg font-bold text-xs transition shadow"
              >
                Get ₹500 Off Coupon
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Legal & Payment Badges */}
      <div className="border-t border-gray-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} Factorylogik and Controls. All rights reserved. Jaipur, Rajasthan, India.
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span className="bg-gray-800 px-2 py-1 rounded text-[10px] font-bold">UPI</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-[10px] font-bold">RuPay</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-[10px] font-bold">VISA</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-[10px] font-bold">Mastercard</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-[10px] font-bold">NetBanking</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-[10px] font-bold">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
