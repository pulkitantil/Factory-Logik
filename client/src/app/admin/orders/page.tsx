'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  Package,
  Search,
  ArrowLeft,
  Edit2,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  X,
  Plus,
} from 'lucide-react';
import { fetchApi, getAdminToken } from '../../../lib/api';

const ORDER_STATUS_OPTIONS = [
  'ORDER_PLACED',
  'CONFIRMED',
  'PROCESSING',
  'PACKAGED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Status modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('PROCESSING');
  const [updateCity, setUpdateCity] = useState('Gurugram Hub');
  const [updateNotes, setUpdateNotes] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/orders?limit=50', {}, true);
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
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
    loadOrders();
  }, [router]);

  const handleOpenStatusModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setUpdateCity(order.tracking?.currentCity || 'Gurugram Logistics Hub');
    setUpdateNotes('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setModalLoading(true);
    try {
      const res = await fetchApi(
        `/admin/orders/${selectedOrder.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: newStatus,
            city: updateCity,
            notes: updateNotes,
          }),
        },
        true
      );

      if (res.success) {
        setSelectedOrder(null);
        loadOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tracking?.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin"
            className="p-2 border rounded-xl hover:bg-gray-100 text-gray-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
              Order Fulfillment &amp; Logistics Dispatch
            </h1>
            <p className="text-xs text-gray-500">
              Dispatch consignments, assign tracking numbers, and publish telemetry updates.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by Order ID, Customer name, or Tracking ID..."
          className="text-xs flex-1 focus:outline-none"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 font-bold">
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer &amp; Address</th>
                <th className="p-3">Items &amp; Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Tracking Reference</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-mono font-bold text-gray-900">{ord.orderNumber}</td>

                  <td className="p-3">
                    <div className="font-bold text-gray-900">{ord.user?.name || 'Customer'}</div>
                    <div className="text-[11px] text-gray-500">{ord.address?.city}, {ord.address?.state}</div>
                    <div className="text-[10px] text-gray-400">{ord.user?.phone}</div>
                  </td>

                  <td className="p-3">
                    <div className="font-black text-gray-950">
                      ₹{ord.finalAmount?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {ord.items?.length || 0} item(s) • {ord.paymentMethod}
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="p-3">
                    {ord.tracking?.trackingNumber ? (
                      <span className="font-mono text-voltrix-orange font-bold text-[11px]">
                        {ord.tracking.trackingNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">Pending Shipped</span>
                    )}
                  </td>

                  <td className="p-3 text-[11px] text-gray-500">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleOpenStatusModal(ord)}
                      className="bg-voltrix-dark hover:bg-black text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition shadow-sm"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">
                  Update Consignment Status
                </h3>
                <span className="text-xs font-mono text-voltrix-orange font-bold">
                  {selectedOrder.orderNumber}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">New Order Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border rounded-lg p-2.5 font-bold"
                >
                  {ORDER_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Marking as &apos;SHIPPED&apos; automatically generates and links a unique TRK-IN ID if not present.
                </span>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Current Transit Hub / City</label>
                <input
                  type="text"
                  value={updateCity}
                  onChange={(e) => setUpdateCity(e.target.value)}
                  placeholder="e.g. Gurugram Sort Facility, Delhi Air Cargo"
                  className="w-full border rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Logistics Event Description (Appears on Customer Live Timeline)
                </label>
                <textarea
                  rows={3}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="e.g. Package arrived at local sorting station. Out for delivery with rider."
                  className="w-full border rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow"
                >
                  {modalLoading ? 'Publishing...' : 'Save & Append Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
