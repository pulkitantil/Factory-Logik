'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Package,
  MapPin,
  Menu,
  X,
  Zap,
  ChevronDown,
  ShieldCheck,
  Headphones,
  Laptop,
  Smartphone,
  Watch,
  Gamepad2,
  Camera,
  Monitor,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchApi } from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { summary, setIsCartDrawerOpen } = useCart();
  const { wishlist } = useWishlist();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{
    products: any[];
    categories: any[];
    brands: string[];
  }>({ products: [], categories: [], brands: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Location / Pincode modal
  const [pincode, setPincode] = useState('302001');
  const [city, setCity] = useState('Jaipur');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [newPincode, setNewPincode] = useState('');

  // Mobile navigation
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Search autocomplete debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions({ products: [], categories: [], brands: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetchApi(`/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPincode.trim().length === 6) {
      setPincode(newPincode.trim());
      setCity(
        newPincode.startsWith('11') || newPincode.startsWith('12')
          ? 'Delhi NCR'
          : newPincode.startsWith('56')
          ? 'Bengaluru'
          : newPincode.startsWith('40')
          ? 'Mumbai'
          : 'Express Zone'
      );
      setShowPincodeModal(false);
      setNewPincode('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      {/* 1. Top Enterprise / Business Switch Banner */}
      <div className="bg-[#111111] text-gray-300 text-xs px-4 py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-white font-medium">
              <Zap className="w-3.5 h-3.5 text-voltrix-orange mr-1 fill-voltrix-orange" />
              Factorylogik Pro
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">Smart Electronics &amp; Controls Procurement • Jaipur, Rajasthan</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/track-order" className="hover:text-white transition flex items-center">
              <Package className="w-3 h-3 mr-1 text-voltrix-orange" /> Track Order
            </Link>
            <Link href="/contact" className="hover:text-white transition">
              Customer Support 24/7
            </Link>
            <Link href="/admin/login" className="text-voltrix-orange hover:underline font-medium">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#0B3D2E] flex items-center justify-center shadow-md">
            <Cpu className="w-6 h-6 text-voltrix-orange" />
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-xl font-black tracking-tight text-[#111111]">FACTORY</span>
              <span className="text-xl font-black tracking-tight text-voltrix-orange">LOGIK</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest block font-bold text-voltrix-green -mt-1">
              &amp; Controls
            </span>
          </div>
        </Link>

        {/* Location / Pincode Selector */}
        <div
          onClick={() => setShowPincodeModal(true)}
          className="hidden lg:flex items-center space-x-2 text-xs text-gray-700 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg hover:border-voltrix-orange cursor-pointer transition shrink-0"
        >
          <MapPin className="w-4 h-4 text-voltrix-orange shrink-0" />
          <div className="text-left">
            <span className="text-gray-400 block text-[10px]">Deliver to</span>
            <span className="font-semibold text-gray-900 truncate max-w-[110px] block">
              {city} ({pincode})
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>

        {/* Search Bar with Autocomplete */}
        <div ref={searchRef} className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.products.length > 0 || suggestions.categories.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Search 4K TVs, Laptops, M3 MacBook, Sony ANC, boAt, PS5..."
                className="w-full pl-4 pr-12 py-2.5 rounded-l-lg border border-gray-300 focus:border-voltrix-orange focus:ring-1 focus:ring-voltrix-orange text-sm outline-none transition bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white px-5 py-2.5 rounded-r-lg font-medium text-sm transition flex items-center shrink-0 shadow-sm"
            >
              <Search className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
              {suggestions.products.length === 0 && suggestions.categories.length === 0 && suggestions.brands.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No electronics found for &quot;{searchQuery}&quot;</div>
              ) : (
                <>
                  {/* Category Matches */}
                  {suggestions.categories.length > 0 && (
                    <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mb-1">
                        Categories
                      </span>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {suggestions.categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/products?category=${cat.slug}`}
                            onClick={() => setShowSuggestions(false)}
                            className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-700 hover:border-voltrix-orange hover:text-voltrix-orange transition"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brand Matches */}
                  {suggestions.brands.length > 0 && (
                    <div className="p-2 border-b border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mb-1">
                        Brands
                      </span>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {suggestions.brands.map((brand) => (
                          <Link
                            key={brand}
                            href={`/products?brand=${encodeURIComponent(brand)}`}
                            onClick={() => setShowSuggestions(false)}
                            className="text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md hover:bg-voltrix-orange hover:text-white transition font-medium"
                          >
                            {brand}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Suggestions */}
                  {suggestions.products.length > 0 && (
                    <div className="p-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mb-1">
                        Matching Electronics
                      </span>
                      {suggestions.products.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.slug}`}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition group"
                        >
                          <div className="w-10 h-10 rounded border border-gray-100 bg-white p-1 shrink-0 mr-3 flex items-center justify-center">
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                            ) : (
                              <Zap className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-voltrix-orange transition">
                              {prod.name}
                            </p>
                            <span className="text-[11px] text-gray-500">{prod.brand}</span>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <span className="text-xs font-bold text-[#111111]">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                            {prod.discount > 0 && (
                              <span className="text-[10px] text-green-600 block font-semibold">
                                {prod.discount}% OFF
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* User Actions Right Side */}
        <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
          {/* AI Assistant Quick Link */}
          <Link
            href="/ai-assistant"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-voltrix-green hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Factorylogik AI</span>
          </Link>

          {/* Account Dropdown */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1.5 text-xs text-gray-700 hover:text-voltrix-orange px-2.5 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <span className="block font-medium truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-gray-400">Account</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-gray-500 truncate text-[11px]">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                    >
                      My Dashboard & Orders
                    </Link>
                    <Link
                      href="/track-order"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                    >
                      Track Active Orders
                    </Link>
                    <Link
                      href="/account?tab=addresses"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                    >
                      Saved Addresses
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-orange-50 text-voltrix-orange font-bold border-t border-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-100 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/account?mode=login"
                className="flex items-center space-x-1.5 text-xs text-gray-800 hover:text-voltrix-orange px-2.5 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <UserIcon className="w-5 h-5 text-gray-700" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>

          {/* Wishlist Button */}
          <Link
            href="/account?tab=wishlist"
            className="relative p-2 text-gray-700 hover:text-voltrix-orange hover:bg-gray-50 rounded-lg transition"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-voltrix-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-2 rounded-lg transition"
            aria-label="Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-[#111111]" />
              {summary.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-voltrix-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {summary.totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-gray-900">
              ₹{summary.subtotal.toLocaleString('en-IN')}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Category Ribbon Bar (Moglix-inspired quick navigation) */}
      <div className="bg-white border-t border-gray-100 overflow-x-auto scrollbar-none py-2 px-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex items-center space-x-6 min-w-max text-xs font-semibold text-gray-700">
          <Link
            href="/products?featured=true"
            className="flex items-center text-voltrix-orange font-bold hover:text-voltrix-orange-hover transition"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 fill-voltrix-orange" />
            24h Express Deals
          </Link>
          <Link href="/products?category=smartphones" className="flex items-center hover:text-voltrix-orange transition">
            <Smartphone className="w-3.5 h-3.5 mr-1 text-gray-400" />
            Smartphones
          </Link>
          <Link href="/products?category=laptops" className="flex items-center hover:text-voltrix-orange transition">
            <Laptop className="w-3.5 h-3.5 mr-1 text-gray-400" />
            Laptops & PCs
          </Link>
          <Link href="/products?category=audio" className="flex items-center hover:text-voltrix-orange transition">
            <Headphones className="w-3.5 h-3.5 mr-1 text-gray-400" />
            Audio & Sound
          </Link>
          <Link href="/products?category=smartwatches" className="flex items-center hover:text-voltrix-orange transition">
            <Watch className="w-3.5 h-3.5 mr-1 text-gray-400" />
            Smart Watches
          </Link>
          <Link href="/products?category=gaming" className="flex items-center hover:text-voltrix-orange transition">
            <Gamepad2 className="w-3.5 h-3.5 mr-1 text-gray-400" />
            Gaming Gear
          </Link>
          <Link href="/products?category=cameras" className="flex items-center hover:text-voltrix-orange transition">
            <Camera className="w-3.5 h-3.5 mr-1 text-gray-400" />
            Cameras & Drones
          </Link>
          <Link href="/products?category=monitors" className="flex items-center hover:text-voltrix-orange transition">
            <Monitor className="w-3.5 h-3.5 mr-1 text-gray-400" />
            Displays & Monitors
          </Link>
          <Link href="/products?category=accessories" className="flex items-center hover:text-voltrix-orange transition">
            <Cpu className="w-3.5 h-3.5 mr-1 text-gray-400" />
            Tech Accessories
          </Link>
        </div>
      </div>

      {/* Pincode Change Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center">
                <MapPin className="w-4 h-4 text-voltrix-orange mr-2" />
                Select Delivery Location
              </h3>
              <button onClick={() => setShowPincodeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Enter your 6-digit postal code to check 24-Hour Express delivery and local warehouse availability.
            </p>
            <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 110001 or 560001"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-voltrix-orange focus:ring-1 focus:ring-voltrix-orange text-sm font-semibold tracking-wider outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-voltrix-orange hover:bg-voltrix-orange-hover text-white py-2.5 rounded-lg text-sm font-bold transition shadow"
              >
                Apply Pincode
              </button>
            </form>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Popular Hubs:</span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setPincode('110001');
                    setCity('Delhi NCR');
                    setShowPincodeModal(false);
                  }}
                  className="text-voltrix-green font-semibold hover:underline"
                >
                  Delhi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPincode('560001');
                    setCity('Bengaluru');
                    setShowPincodeModal(false);
                  }}
                  className="text-voltrix-green font-semibold hover:underline"
                >
                  Bengaluru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPincode('400001');
                    setCity('Mumbai');
                    setShowPincodeModal(false);
                  }}
                  className="text-voltrix-green font-semibold hover:underline"
                >
                  Mumbai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-3">
          <Link
            href="/ai-assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between bg-emerald-50 text-voltrix-green font-bold text-xs p-3 rounded-lg border border-emerald-200"
          >
            <span className="flex items-center">
              <Zap className="w-4 h-4 text-emerald-600 mr-2" />
              Ask Factorylogik AI Assistant
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-700">
            <Link
              href="/products?category=smartphones"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center"
            >
              <Smartphone className="w-4 h-4 mr-2 text-gray-500" /> Smartphones
            </Link>
            <Link
              href="/products?category=laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center"
            >
              <Laptop className="w-4 h-4 mr-2 text-gray-500" /> Laptops
            </Link>
            <Link
              href="/products?category=audio"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center"
            >
              <Headphones className="w-4 h-4 mr-2 text-gray-500" /> Audio & Sound
            </Link>
            <Link
              href="/products?category=gaming"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center"
            >
              <Gamepad2 className="w-4 h-4 mr-2 text-gray-500" /> Gaming
            </Link>
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center text-gray-800 font-semibold p-2 rounded hover:bg-gray-50"
            >
              <Package className="w-4 h-4 mr-2 text-voltrix-orange" /> Track Your Order
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center text-gray-800 font-semibold p-2 rounded hover:bg-gray-50"
            >
              <Headphones className="w-4 h-4 mr-2 text-voltrix-green" /> Contact Support & Store Location
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center text-voltrix-orange font-bold p-2 rounded hover:bg-orange-50"
            >
              <ShieldCheck className="w-4 h-4 mr-2" /> Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
