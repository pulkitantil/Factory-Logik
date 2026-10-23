'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Trash2,
  ArrowLeft,
  X,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { fetchApi, getAdminToken } from '../../../lib/api';
import { Coupon } from '../../../types';

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 2000,
    maxDiscount: 5000,
    active: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/coupons', {}, true);
      if (res.success && res.coupons) {
        setCoupons(res.coupons);
      }
    } catch (err) {
      console.error('Failed to load admin coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadCoupons();
  }, [router]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi(
        '/admin/coupons',
        {
          method: 'POST',
          body: JSON.stringify(formData),
        },
        true
      );
      if (res.success) {
        setShowModal(false);
        loadCoupons();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleToggleStatus = async (id: string, current: boolean) => {
    try {
      await fetchApi(
        `/admin/coupons/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ active: !current }),
        },
        true
      );
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !current } : c))
      );
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await fetchApi(`/admin/coupons/${id}`, { method: 'DELETE' }, true);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin"
            className="p-2 border rounded-xl hover:bg-gray-100 text-gray-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
              Promotional Coupons &amp; Discount Vouchers
            </h1>
            <p className="text-xs text-gray-500">
              Create and manage percentage discounts, minimum cart values, and voucher rules.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 font-bold">
                <th className="p-3">Coupon Code</th>
                <th className="p-3">Discount Type &amp; Value</th>
                <th className="p-3">Minimum Cart Value</th>
                <th className="p-3">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="p-3">
                    <span className="font-mono font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded border">
                      {c.code}
                    </span>
                  </td>

                  <td className="p-3 font-bold text-emerald-800">
                    {c.discountType === 'PERCENTAGE'
                      ? `${c.discountValue}% OFF`
                      : `₹${c.discountValue} FLAT OFF`}
                    {c.maxDiscount && (
                      <span className="text-[10px] text-gray-400 font-normal block">
                        Cap: ₹{c.maxDiscount}
                      </span>
                    )}
                  </td>

                  <td className="p-3 font-semibold text-gray-700">
                    ₹{c.minOrderValue.toLocaleString('en-IN')}
                  </td>

                  <td className="p-3 text-gray-600 max-w-xs truncate">{c.description}</td>

                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(c.id, c.active)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${
                        c.active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {c.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-gray-900">Create Promotion Coupon</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE20"
                  className="w-full border rounded-lg p-2.5 font-mono uppercase font-bold focus:border-voltrix-orange focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full border rounded-lg p-2.5 font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Flat 20% OFF on industrial automation gear"
                  className="w-full border rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-voltrix-orange text-white rounded-xl font-bold hover:bg-voltrix-orange-hover transition shadow"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
