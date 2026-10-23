'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Heart,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  AlertCircle,
  ShoppingBag,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { fetchApi } from '../../lib/api';

export default function CartPage() {
  const router = useRouter();
  const { items, summary, updateQuantity, removeItem, loading } = useCart();
  const { toggleWishlist } = useWishlist();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetchApi('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: summary.subtotal,
        }),
      });

      if (res.success && res.valid) {
        setAppliedCoupon({
          code: res.coupon.code,
          discountAmount: res.discountAmount,
          description: res.coupon.description,
        });
        setCouponError('');
      } else {
        setCouponError(res.message || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleMoveToWishlist = async (productId: string, itemId: string) => {
    toggleWishlist(productId);
    await removeItem(itemId);
  };

  const finalCalculatedAmount = Math.max(
    0,
    summary.finalAmount - (appliedCoupon?.discountAmount || 0)
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Explore our certified PLCs, VFD inverters, motors, and automation components to fill your cart.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
          Shopping Cart ({summary.totalItems} Items)
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review your items, apply promotional vouchers, and proceed to secure checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Product Image & Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-200 p-2 flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.product?.primaryImage}
                      alt={item.product?.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-black uppercase text-voltrix-orange">
                      {item.product?.brand}
                    </span>
                    <Link
                      href={`/products/${item.product?.slug}`}
                      className="text-xs sm:text-sm font-bold text-gray-900 hover:text-voltrix-orange block truncate max-w-xs sm:max-w-md"
                    >
                      {item.product?.name}
                    </Link>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-extrabold text-gray-950">
                        ₹{item.product?.price.toLocaleString('en-IN')}
                      </span>
                      {item.product?.mrp > item.product?.price && (
                        <span className="text-gray-400 line-through text-[11px]">
                          ₹{item.product?.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                      {item.product?.discount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {item.product?.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between w-full sm:w-auto space-x-6">
                  {/* Qty */}
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-l-lg"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-xs sm:text-sm font-black text-gray-950">
                      ₹{item.itemTotal?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Remove & Wishlist */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMoveToWishlist(item.productId, item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition"
                      title="Move to Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Protection Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center space-x-3 text-xs text-emerald-900">
              <Truck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <div>
                <strong className="block text-emerald-950">Free Express 24H Shipping</strong>
                Insured transit with sealed tamper-evident packaging.
              </div>
            </div>
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center space-x-3 text-xs text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-700 flex-shrink-0" />
              <div>
                <strong className="block text-blue-950">Genuine Brand Warranty</strong>
                Authorized tax invoice included with serial activation.
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-200 pb-3 uppercase tracking-wider">
              Order Summary
            </h3>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total MRP ({summary.totalItems} items)</span>
                <span>₹{summary.mrpTotal.toLocaleString('en-IN')}</span>
              </div>

              {summary.itemDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Product Discount</span>
                  <span>- ₹{summary.itemDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span className="flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1" />
                    Coupon ({appliedCoupon.code})
                  </span>
                  <span>- ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ₹{summary.subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>

              <div className="flex justify-between">
                <span>Platform Security Fee</span>
                <span>₹{summary.platformFee}</span>
              </div>

              <div className="flex justify-between text-[11px] text-gray-400">
                <span>GST Breakdown (18% included)</span>
                <span>₹{summary.gstAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-black text-gray-900">Total Payable</span>
                <span className="text-xl font-black text-gray-950">
                  ₹{finalCalculatedAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Coupon Code Box */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-voltrix-orange" />
                <span>Have a Promotional Coupon?</span>
              </label>

              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter WELCOME10"
                    className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 uppercase font-mono font-bold focus:outline-none focus:border-voltrix-orange"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-voltrix-dark hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{appliedCoupon.code} Applied</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-500 hover:text-red-700 font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 flex items-center space-x-1 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}

              {/* Sample Coupons Hint */}
              <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded border border-gray-100">
                💡 Try: <code className="font-bold text-gray-700">WELCOME10</code> (10% OFF) or{' '}
                <code className="font-bold text-gray-700">FESTIVE20</code> (20% OFF)
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => {
                const query = appliedCoupon ? `?coupon=${appliedCoupon.code}` : '';
                router.push(`/checkout${query}`);
              }}
              className="w-full bg-voltrix-orange hover:bg-voltrix-orange-hover text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Proceed to Multi-Step Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
