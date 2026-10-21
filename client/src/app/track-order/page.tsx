'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Building,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { fetchApi } from '../../lib/api';

const ALL_STATUSES = [
  { key: 'ORDER_PLACED', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'PACKAGED', label: 'Packaged' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchId, setSearchId] = useState(queryParam);
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (queryToSearch?: string) => {
    const term = (queryToSearch || searchId).trim();
    if (!term) return;

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const res = await fetchApi(`/tracking/${encodeURIComponent(term)}`);
      if (res.success && res.tracking) {
        setTrackingData(res.tracking);
      } else {
        setError(res.message || `No tracking information found for '${term}'`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve tracking details. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      setSearchId(queryParam);
      handleTrack(queryParam);
    }
  }, [queryParam]);

  // Determine current step index
  const currentStatusIndex = trackingData
    ? ALL_STATUSES.findIndex((s) => s.key === trackingData.currentStatus)
    : -1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-voltrix-orange flex items-center justify-center">
          <Truck className="w-4 h-4 mr-1.5" /> Real-Time Telemetry
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Track Your Tech Shipment
        </h1>
        <p className="text-xs text-gray-500">
          Enter your Order Reference ID (e.g. <code className="font-bold text-gray-700">ORD-2026-8F4K29</code>) or Tracking Number (<code className="font-bold text-gray-700">TRK-IN-...</code>) to check live logistics milestones.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="flex shadow-md rounded-2xl overflow-hidden border border-gray-300 focus-within:border-voltrix-orange bg-white"
        >
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            placeholder="Enter ORD-2026-... or TRK-IN-..."
            className="flex-1 px-4 py-3.5 text-xs sm:text-sm font-mono font-bold uppercase focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-6 py-3.5 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Locating...' : 'Track'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Results Card */}
      {trackingData && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in">
          {/* Top Status Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-bold uppercase">Carrier:</span>
                <span className="text-xs font-black text-gray-900">{trackingData.carrier}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-950 mt-1">
                Tracking ID: <span className="font-mono text-voltrix-orange">{trackingData.trackingNumber}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Order Reference: <strong>{trackingData.order?.orderNumber}</strong>
              </p>
            </div>

            <div className="sm:text-right bg-emerald-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <span className="text-xs text-gray-500 block">Estimated Delivery Date</span>
              <span className="text-base font-black text-emerald-800 sm:text-emerald-700">
                {new Date(trackingData.estimatedDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">
                Current Hub: <strong>{trackingData.currentCity || 'In Transit'}</strong>
              </span>
            </div>
          </div>

          {/* Visual Tracking Timeline Stepper */}
          <div className="py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">
              Logistics Journey &amp; Milestones
            </h3>

            {/* Desktop Timeline */}
            <div className="hidden md:flex items-center justify-between relative">
              <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0" />
              <div
                className="absolute top-4 left-6 h-1 bg-emerald-600 -z-0 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStatusIndex) / (ALL_STATUSES.length - 1)) * 100}%`,
                }}
              />

              {ALL_STATUSES.map((step, idx) => {
                const isPassed = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isCurrent
                          ? 'bg-voltrix-orange text-white ring-4 ring-orange-100 scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-2 font-bold text-center max-w-[80px] ${
                        isCurrent
                          ? 'text-voltrix-orange font-black'
                          : isPassed
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="md:hidden space-y-4 border-l-2 border-gray-200 pl-4 ml-2">
              {ALL_STATUSES.map((step, idx) => {
                const isPassed = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={step.key} className="relative">
                    <div
                      className={`absolute -left-[23px] top-0 w-4 h-4 rounded-full ${
                        isCurrent
                          ? 'bg-voltrix-orange ring-4 ring-orange-100'
                          : isPassed
                          ? 'bg-emerald-600'
                          : 'bg-gray-300'
                      }`}
                    />
                    <div className="text-xs font-bold">
                      <span className={isCurrent ? 'text-voltrix-orange' : isPassed ? 'text-gray-900' : 'text-gray-400'}>
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timestamped Tracking Event History */}
          {trackingData.events && trackingData.events.length > 0 && (
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Detailed Telemetry Log
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {trackingData.events.map((evt: any) => (
                  <div key={evt.id} className="p-3.5 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-900">{evt.description}</div>
                      <div className="text-gray-500 text-[11px] flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{evt.city} • {evt.location || 'Hub'}</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-gray-400 sm:text-right">
                      {new Date(evt.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items & Shipping Address Snapshot */}
          {trackingData.order && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
              {/* Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Consignment Items
                </h4>
                <div className="space-y-2">
                  {trackingData.order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded bg-white p-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{item.name}</div>
                        <div className="text-gray-500 text-[11px]">Brand: {item.brand} • Qty: {item.quantity}</div>
                      </div>
                      <div className="font-black text-gray-900">
                        ₹{item.price?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {trackingData.order.address && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Destination Address
                  </h4>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1">
                    <div className="font-bold text-gray-900">{trackingData.order.address.fullName}</div>
                    <div>{trackingData.order.address.addressLine1}</div>
                    {trackingData.order.address.addressLine2 && <div>{trackingData.order.address.addressLine2}</div>}
                    <div>
                      {trackingData.order.address.city}, {trackingData.order.address.state} —{' '}
                      <strong>{trackingData.order.address.postalCode}</strong>
                    </div>
                    <div className="text-gray-500 pt-1">Contact: {trackingData.order.address.phone}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
