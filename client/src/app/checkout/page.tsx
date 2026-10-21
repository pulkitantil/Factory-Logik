'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Zap,
  ArrowRight,
  Package,
  Clock,
  Banknote,
  Check,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Address } from '../../types';
import { fetchApi } from '../../lib/api';


const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      // Script tag may already have finished loading
      setTimeout(() => resolve(!!window.Razorpay), 1500);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponFromUrl = searchParams.get('coupon') || '';

  const { user } = useAuth();
  const { items, summary, clearCart } = useCart();

  // Multi-step State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Address States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || 'Rohan Sharma',
    phone: user?.phone || '+91 98765 43210',
    addressLine1: 'Flat 402, Tower B, Cyber City Green Park',
    addressLine2: 'Sector 24, DLF Phase 3',
    city: 'Gurugram',
    state: 'Haryana',
    postalCode: '122002',
    isDefault: true,
  });

  // Step 2: Delivery Speed
  const [deliverySpeed, setDeliverySpeed] = useState<'STANDARD' | 'EXPRESS_24H'>('EXPRESS_24H');

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [onlineType, setOnlineType] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');

  // Step 4: Confirmed Order Output
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // A created-but-unpaid order, kept so a retry does not create a duplicate order
  const [pendingOrder, setPendingOrder] = useState<any | null>(null);

  // If the order inputs change, the pending order no longer matches them
  useEffect(() => {
    setPendingOrder(null);
  }, [selectedAddressId, deliverySpeed, paymentMethod, couponFromUrl]);

  // Load user saved addresses
  useEffect(() => {
    async function loadAddresses() {
      if (user) {
        try {
          const res = await fetchApi('/addresses');
          if (res.success && res.addresses?.length > 0) {
            setAddresses(res.addresses);
            const def = res.addresses.find((a: Address) => a.isDefault) || res.addresses[0];
            setSelectedAddressId(def.id);
          } else {
            setShowAddressForm(true);
          }
        } catch (err) {
          setShowAddressForm(true);
        }
      } else {
        setShowAddressForm(true);
      }
    }
    loadAddresses();
  }, [user]);

  // Handle Save New Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.addressLine1 || !newAddress.postalCode) {
      alert('Please fill all required address fields.');
      return;
    }

    if (user) {
      try {
        const res = await fetchApi('/addresses', {
          method: 'POST',
          body: JSON.stringify(newAddress),
        });
        if (res.success && res.address) {
          setAddresses((prev) => [...prev, res.address]);
          setSelectedAddressId(res.address.id);
          setShowAddressForm(false);
        }
      } catch (err) {
        console.error('Failed to save address:', err);
      }
    } else {
      // Mock address for guest
      const mockAddr: Address = {
        id: 'guest-addr-' + Date.now(),
        userId: 'guest',
        ...newAddress,
        country: 'India',
        type: 'HOME',
      };
      setAddresses([mockAddr]);
      setSelectedAddressId(mockAddr.id);
      setShowAddressForm(false);
    }
  };

  // Submit Order
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address.');
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    setOrderError('');

    try {
      // Step 1: Create the application order (or reuse an unpaid one on retry).
      let order = pendingOrder;

      if (!order) {
        const res = await fetchApi('/orders', {
          method: 'POST',
          body: JSON.stringify({
            addressId: selectedAddressId,
            deliverySpeed,
            paymentMethod,
            couponCode: couponFromUrl || undefined,
          }),
        });

        if (!res.success || !res.order || !res.order.id) {
          throw new Error(res.message || 'Order creation failed.');
        }

        order = res.order;
      }

      // COD orders can be confirmed immediately.
      if (paymentMethod === 'COD') {
        setConfirmedOrder({
          ...order,
          paymentMethod: 'COD',
          tracking: {
            trackingNumber: order.trackingNumber,
          },
        });
        setPendingOrder(null);
        
        setCurrentStep(4);
        return;
      }

      // Keep the order so a failed or dismissed payment can be retried safely.
      setPendingOrder(order);

      // Step 2: Load Razorpay Checkout.
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay Checkout. Please try again.');
      }

      // Step 3: Create a Razorpay order on the backend.
      const paymentOrder = await fetchApi('/orders/razorpay-order', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id }),
      });

      if (
        !paymentOrder.success ||
        !paymentOrder.keyId ||
        !paymentOrder.razorpayOrderId
      ) {
        throw new Error(
          paymentOrder.message || 'Unable to initialize online payment.'
        );
      }

      // Step 4: Open Razorpay Checkout and verify payment on the backend.
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        let verifying = false;

        const fail = (message: string) => {
          if (settled) return;
          settled = true;
          reject(new Error(message));
        };

        const razorpay = new window.Razorpay!({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency || 'INR',
          name: 'Voltrix Electronics',
          description: `Order ${paymentOrder.orderNumber || order.orderNumber || ''}`,
          order_id: paymentOrder.razorpayOrderId,
          theme: { color: '#FF6B00' },

          handler: async (response: any) => {
            if (settled) return;
            // Razorpay closes the modal after success; don't treat that as a dismissal.
            verifying = true;

            try {
              const verification = await fetchApi('/orders/verify-payment', {
                method: 'POST',
                body: JSON.stringify({
                  orderId: order.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!verification.success) {
                throw new Error(
                  verification.message || 'Payment verification failed.'
                );
              }

              settled = true;
              setConfirmedOrder({
                ...order,
                paymentMethod: 'ONLINE',
                paymentStatus: 'COMPLETED',
                tracking: {
                  trackingNumber: order.trackingNumber,
                },
              });
              setPendingOrder(null);
              
              setCurrentStep(4);
              resolve();
            } catch (error: any) {
              fail(
                error.message ||
                  'Payment verification failed. Please contact support before retrying.'
              );
            }
          },

          modal: {
            ondismiss: () => {
              if (verifying) return;
              fail(
                'Payment window closed. You can retry payment for the same order below.'
              );
            },
          },
        });

        razorpay.on('payment.failed', (response: any) => {
          const description = response?.error?.description;
          fail(
            typeof description === 'string'
              ? description
              : 'Payment failed. Please try again.'
          );
        });

        razorpay.open();
      });
    } catch (err: any) {
      setOrderError(
        err.message || 'Failed to place order. Please check item stock.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && currentStep !== 4) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/products" className="inline-block bg-voltrix-orange text-white text-xs font-bold px-5 py-2.5 rounded-xl">
          Browse Products
        </Link>
      </div>
    );
  }

  const isCodOrder = confirmedOrder?.paymentMethod === 'COD';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                currentStep >= 1 ? 'bg-voltrix-orange text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-bold mt-1.5 text-gray-900">Delivery Address</span>
          </div>
          <div className={`h-1 flex-1 mx-3 rounded transition ${currentStep >= 2 ? 'bg-voltrix-orange' : 'bg-gray-200'}`} />

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                currentStep >= 2 ? 'bg-voltrix-orange text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-bold mt-1.5 text-gray-900">Delivery Speed</span>
          </div>
          <div className={`h-1 flex-1 mx-3 rounded transition ${currentStep >= 3 ? 'bg-voltrix-orange' : 'bg-gray-200'}`} />

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                currentStep >= 3 ? 'bg-voltrix-orange text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-bold mt-1.5 text-gray-900">Payment</span>
          </div>
          <div className={`h-1 flex-1 mx-3 rounded transition ${currentStep === 4 ? 'bg-emerald-600' : 'bg-gray-200'}`} />

          {/* Step 4 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                currentStep === 4 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              <Check className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold mt-1.5 text-gray-900">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Multi-Step Flow + Summary */}
      {currentStep !== 4 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-voltrix-orange" />
                    <h2 className="text-base font-black text-gray-900">Select Delivery Address</h2>
                  </div>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-xs font-bold text-voltrix-orange hover:text-voltrix-orange-hover flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Address Cards */}
                {!showAddressForm && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition relative ${
                          selectedAddressId === addr.id
                            ? 'border-voltrix-orange bg-orange-50/20 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-black text-gray-900">{addr.fullName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {addr.type || 'HOME'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-xs text-gray-600">{addr.addressLine2}</p>}
                        <p className="text-xs text-gray-600">
                          {addr.city}, {addr.state} — <strong>{addr.postalCode}</strong>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Phone: {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="w-full text-xs border rounded-lg p-2.5 focus:outline-none focus:border-voltrix-orange"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full text-xs border rounded-lg p-2.5 focus:outline-none focus:border-voltrix-orange"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Street Address Line 1 *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        className="w-full text-xs border rounded-lg p-2.5 focus:outline-none focus:border-voltrix-orange"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Apartment, Suite, Landmark</label>
                      <input
                        type="text"
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        className="w-full text-xs border rounded-lg p-2.5 focus:outline-none focus:border-voltrix-orange"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full text-xs border rounded-lg p-2.5 focus:outline-none focus:border-voltrix-orange"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full text-xs border rounded-lg p-2.5 focus:outline-none focus:border-voltrix-orange"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Pincode *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          className="w-full text-xs border rounded-lg p-2.5 focus:outline-none focus:border-voltrix-orange"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-700"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-5 py-2 bg-voltrix-dark text-white rounded-lg text-xs font-bold hover:bg-black"
                      >
                        Save &amp; Use Address
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedAddressId}
                    className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    <span>Proceed to Delivery Speed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Delivery Speed */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center space-x-2 border-b pb-3">
                  <Truck className="w-5 h-5 text-voltrix-orange" />
                  <h2 className="text-base font-black text-gray-900">Select Delivery Method</h2>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                      deliverySpeed === 'EXPRESS_24H'
                        ? 'border-voltrix-orange bg-orange-50/20'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="deliverySpeed"
                        checked={deliverySpeed === 'EXPRESS_24H'}
                        onChange={() => setDeliverySpeed('EXPRESS_24H')}
                        className="mt-1 text-voltrix-orange focus:ring-voltrix-orange"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-xs font-black text-gray-900">
                            Voltrix Express 24-Hour Dispatch
                          </strong>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Guaranteed dispatch from fulfillment hub within 24 hours with priority air-express routing.
                        </p>
                        <span className="text-[11px] text-gray-500 font-medium block mt-1">
                          Estimated Arrival: <strong>Tomorrow, by 8:00 PM</strong>
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-700">FREE</span>
                  </label>

                  <label
                    className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                      deliverySpeed === 'STANDARD'
                        ? 'border-voltrix-orange bg-orange-50/20'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="deliverySpeed"
                        checked={deliverySpeed === 'STANDARD'}
                        onChange={() => setDeliverySpeed('STANDARD')}
                        className="mt-1 text-voltrix-orange focus:ring-voltrix-orange"
                      />
                      <div>
                        <strong className="text-xs font-black text-gray-900">
                          Standard Surface Logistics
                        </strong>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Reliable surface transport for bulky or multi-box shipments.
                        </p>
                        <span className="text-[11px] text-gray-500 font-medium block mt-1">
                          Estimated Arrival: <strong>Within 3 to 4 business days</strong>
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-700">FREE</span>
                  </label>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-700"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center space-x-2"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center space-x-2 border-b pb-3">
                  <CreditCard className="w-5 h-5 text-voltrix-orange" />
                  <h2 className="text-base font-black text-gray-900">Select Payment Method</h2>
                </div>

                <div className="space-y-4">
                  {/* Online Payment Option */}
                  <label
                    className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'ONLINE'
                        ? 'border-voltrix-orange bg-orange-50/20'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'ONLINE'}
                        onChange={() => setPaymentMethod('ONLINE')}
                        className="mt-1 text-voltrix-orange focus:ring-voltrix-orange"
                      />
                      <div className="flex-1">
                        <strong className="text-xs font-black text-gray-900">
                          Prepaid Online Payment (UPI / Cards / NetBanking / Razorpay)
                        </strong>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Instant confirmation, zero transaction fees, and expedited dispatch queue.
                        </p>

                        {/* Sub payment types */}
                        {paymentMethod === 'ONLINE' && (
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-orange-200/50">
                            <button
                              type="button"
                              onClick={() => setOnlineType('UPI')}
                              className={`p-2 rounded-lg text-xs font-bold border transition ${
                                onlineType === 'UPI'
                                  ? 'bg-voltrix-orange text-white border-voltrix-orange'
                                  : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              GPay / PhonePe UPI
                            </button>
                            <button
                              type="button"
                              onClick={() => setOnlineType('CARD')}
                              className={`p-2 rounded-lg text-xs font-bold border transition ${
                                onlineType === 'CARD'
                                  ? 'bg-voltrix-orange text-white border-voltrix-orange'
                                  : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              Credit / Debit Card
                            </button>
                            <button
                              type="button"
                              onClick={() => setOnlineType('NETBANKING')}
                              className={`p-2 rounded-lg text-xs font-bold border transition ${
                                onlineType === 'NETBANKING'
                                  ? 'bg-voltrix-orange text-white border-voltrix-orange'
                                  : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              Net Banking
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'COD'
                        ? 'border-voltrix-orange bg-orange-50/20'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mt-1 text-voltrix-orange focus:ring-voltrix-orange"
                    />
                    <div>
                      <strong className="text-xs font-black text-gray-900">
                        Cash on Delivery (COD)
                      </strong>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Pay via Cash or QR code on delivery. OTP confirmation required at the time of handover.
                      </p>
                    </div>
                  </label>
                </div>

                {orderError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={submitting}
                    className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-700 disabled:opacity-50"
                  >
                    Back to Delivery
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-8 py-3 rounded-xl transition flex items-center space-x-2 shadow-lg disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {submitting
                        ? 'Verifying & Placing Order...'
                        : pendingOrder
                        ? 'Retry Payment'
                        : 'Confirm & Place Order'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Preview */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b pb-2">
              Cart Breakdown ({summary.totalItems} items)
            </h3>

            <div className="max-h-48 overflow-y-auto divide-y space-y-2 pr-1">
              {items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center space-x-3 text-xs">
                  <img
                    src={item.product?.primaryImage}
                    alt={item.product?.name}
                    className="w-10 h-10 object-contain rounded border p-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{item.product?.name}</div>
                    <div className="text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-gray-900">
                    ₹{item.itemTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{summary.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Security Fee</span>
                <span>₹{summary.platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-black text-sm text-gray-950">
                <span>Total Amount</span>
                <span>₹{summary.finalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 4: ORDER CONFIRMATION SCREEN */
        confirmedOrder && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {isCodOrder ? 'Order Placed Successfully!' : 'Order Successfully Confirmed!'}
              </h2>
              <p className="text-xs text-gray-500">
                Thank you for shopping with Voltrix Electronics. Your order has been registered and sent to the fulfillment hub.
              </p>
            </div>

            {/* Key Reference IDs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-left">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Order Reference ID</span>
                <div className="text-sm font-black font-mono text-gray-900">
                  {confirmedOrder.orderNumber}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Assigned Tracking ID</span>
                <div className="text-sm font-black font-mono text-voltrix-orange">
                  {confirmedOrder.tracking?.trackingNumber || 'TRK-IN-PROCESSING'}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="text-left text-xs text-gray-700 border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  {isCodOrder ? 'Amount Payable on Delivery:' : 'Amount Paid:'}
                </span>
                <strong className="font-black text-gray-900">
                  ₹{confirmedOrder.finalAmount?.toLocaleString('en-IN')}
                </strong>
              </div>
              {confirmedOrder.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Delivery:</span>
                  <strong>
                    {new Date(confirmedOrder.estimatedDelivery).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Mode:</span>
                <strong>{confirmedOrder.paymentMethod}</strong>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/track-order?q=${confirmedOrder.tracking?.trackingNumber || confirmedOrder.orderNumber}`}
                className="flex-1 bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold py-3 rounded-xl shadow transition flex items-center justify-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Track Live Delivery</span>
              </Link>
              <Link
                href="/account"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-3 rounded-xl transition text-center"
              >
                View in My Orders
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}