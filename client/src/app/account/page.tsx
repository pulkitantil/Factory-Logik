'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  Tag,
  LogOut,
  Bot,
  Truck,
  Calendar,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import { Order, Address, Coupon } from '../../types';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'coupons' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Address form modal
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
      return;
    }

    async function loadAccountData() {
      if (!user) return;
      setLoadingData(true);
      try {
        const [ordersRes, addrRes, coupRes] = await Promise.all([
          fetchApi('/orders/user'),
          fetchApi('/addresses'),
          fetchApi('/coupons'),
        ]);

        if (ordersRes.success) setOrders(ordersRes.orders || []);
        if (addrRes.success) setAddresses(addrRes.addresses || []);
        if (coupRes.success) setCoupons(coupRes.coupons || []);
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    if (user) loadAccountData();
  }, [user, authLoading, router]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/addresses', {
        method: 'POST',
        body: JSON.stringify(newAddr),
      });
      if (res.success && res.address) {
        setAddresses((prev) => [...prev, res.address]);
        setShowAddAddress(false);
        setNewAddr({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
        });
      }
    } catch (err) {
      console.error('Failed to create address:', err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await fetchApi(`/addresses/${id}`, { method: 'DELETE' });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  if (authLoading || (!user && loadingData)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-[#111111] via-[#0B3D2E] to-[#111111] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0B3D2E] to-voltrix-orange flex items-center justify-center text-white font-black text-2xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
              <span className="bg-voltrix-orange/30 text-voltrix-orange border border-voltrix-orange/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                VERIFIED TECH CITIZEN
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">{user.email} • {user.phone || '+91 Registered'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/ai-assistant"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center space-x-1.5"
          >
            <Bot className="w-4 h-4 text-voltrix-orange" />
            <span>AI Concierge</span>
          </Link>
          <button
            onClick={logout}
            className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Tabs Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-3 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'bg-voltrix-orange text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'addresses'
                ? 'bg-voltrix-orange text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'coupons'
                ? 'bg-voltrix-orange text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Available Coupons ({coupons.length})</span>
          </button>

          <Link
            href="/wishlist"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
          >
            <Heart className="w-4 h-4 text-red-500" />
            <span>My Wishlist</span>
          </Link>
        </div>

        {/* Tab Content (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-gray-900 flex items-center space-x-2">
                <Package className="w-5 h-5 text-voltrix-orange" />
                <span>Order History &amp; Consignments</span>
              </h2>

              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-900">No Orders Placed Yet</h3>
                  <p className="text-xs text-gray-500">Your completed purchases and shipments will appear here.</p>
                  <Link
                    href="/products"
                    className="inline-block bg-voltrix-orange text-white text-xs font-bold px-4 py-2 rounded-xl mt-2"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
                    >
                      {/* Top Order Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-black text-gray-900">
                              {order.orderNumber}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          {order.tracking?.trackingNumber && (
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              Tracking ID:{' '}
                              <code className="font-mono text-voltrix-orange font-bold">
                                {order.tracking.trackingNumber}
                              </code>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm font-black text-gray-900">
                            ₹{order.finalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 text-xs">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1 border"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                              <p className="text-gray-500 text-[11px]">
                                {item.brand} • Qty: {item.quantity} • ₹{item.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <div className="text-gray-500 text-[11px]">
                          Expected Arrival:{' '}
                          <strong>
                            {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </strong>
                        </div>

                        <Link
                          href={`/track-order?q=${order.tracking?.trackingNumber || order.orderNumber}`}
                          className="bg-voltrix-dark hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                        >
                          <Truck className="w-3.5 h-3.5 text-voltrix-orange" />
                          <span>Track Order</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-gray-900 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-voltrix-orange" />
                  <span>Saved Delivery Addresses</span>
                </h2>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New</span>
                </button>
              </div>

              {/* Add Modal */}
              {showAddAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3"
                >
                  <h3 className="text-xs font-bold uppercase text-gray-700">Add New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="text-xs border rounded-lg p-2"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="text-xs border rounded-lg p-2"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    required
                    value={newAddr.addressLine1}
                    onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="text-xs border rounded-lg p-2"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="text-xs border rounded-lg p-2"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      required
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      className="text-xs border rounded-lg p-2"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-3 py-1.5 border rounded-lg text-xs font-bold text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-voltrix-dark text-white rounded-lg text-xs font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <strong className="text-xs font-black text-gray-900">{addr.fullName}</strong>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-xs text-gray-600">{addr.addressLine2}</p>}
                      <p className="text-xs text-gray-600">
                        {addr.city}, {addr.state} — <strong>{addr.postalCode}</strong>
                      </p>
                      <p className="text-xs text-gray-500 pt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex justify-end pt-3 border-t mt-3">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COUPONS TAB */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-gray-900 flex items-center space-x-2">
                <Tag className="w-5 h-5 text-voltrix-orange" />
                <span>Available Promotional Coupons</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-5 shadow-sm space-y-2 relative"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-black font-mono text-voltrix-dark bg-gray-100 px-2.5 py-1 rounded border">
                        {c.code}
                      </span>
                      <span className="text-xs font-black text-emerald-700">
                        {c.discountType === 'PERCENTAGE'
                          ? `${c.discountValue}% OFF`
                          : `₹${c.discountValue} FLAT OFF`}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600">{c.description}</p>
                    <div className="text-[10px] text-gray-400">
                      Min Order Value: ₹{c.minOrderValue.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
