'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Users,
  DollarSign,
  Truck,
  Tag,
  LogOut,
  ChevronRight,
  Clock,
  Layers,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { fetchApi, getAdminToken, removeAdminToken } from '../../lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    async function loadAdminData() {
      setLoading(true);
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          fetchApi('/admin/analytics', {}, true),
          fetchApi('/admin/orders?limit=6', {}, true),
        ]);

        if (analyticsRes.success) {
          setStats(analyticsRes.stats);
          setChartData(analyticsRes.chartData || []);
        }

        if (ordersRes.success) {
          setRecentOrders(ordersRes.orders || []);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
        removeAdminToken();
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [router]);

  const handleAdminLogout = () => {
    removeAdminToken();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-20 bg-gray-200 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Bar */}
      <div className="bg-[#111111] text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-gray-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-black tracking-tight">Voltrix Operations Center</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time telemetry, order fulfillment, product catalog, and revenue intelligence.
          </p>
        </div>

        {/* Quick Hub Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/20 transition flex items-center space-x-1.5"
          >
            <Package className="w-3.5 h-3.5 text-voltrix-orange" />
            <span>Products &amp; Stock</span>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/20 transition flex items-center space-x-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Order Fulfillment</span>
          </Link>
          <Link
            href="/admin/coupons"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/20 transition flex items-center space-x-1.5"
          >
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span>Coupons</span>
          </Link>
          <button
            onClick={handleAdminLogout}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <div className="text-2xl font-black text-gray-950">
              ₹{stats.totalSales?.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18.4% compared to last cycle
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Consignments</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-950">{stats.totalOrders} Orders</div>
            <p className="text-[11px] text-gray-500 font-medium">
              {stats.pendingOrders} Pending Fulfillment
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Catalog Active</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-voltrix-orange flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-950">{stats.totalProducts} Devices</div>
            <p className="text-[11px] text-amber-700 font-bold flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {stats.lowStockProducts} Low-Stock Alert
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-950">{stats.totalCustomers} Accounts</div>
            <p className="text-[11px] text-purple-700 font-semibold">Active Indian Consumer Base</p>
          </div>
        </div>
      )}

      {/* Monthly Revenue Trend Bar Visual */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-black text-gray-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-voltrix-orange" />
                <span>Monthly Revenue Run-Rate (₹ INR)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Simulated financial trajectory across quarters</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6">
            {chartData.map((d, i) => {
              const max = Math.max(...chartData.map((c) => c.revenue));
              const heightPercent = Math.max(20, Math.round((d.revenue / max) * 100));

              return (
                <div key={i} className="flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-bold text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition">
                    ₹{(d.revenue / 1000).toFixed(0)}k
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-[#111111] to-voltrix-orange rounded-t-xl group-hover:brightness-110 transition shadow"
                  />
                  <span className="text-xs font-bold text-gray-600 mt-2">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-sm font-black text-gray-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Recent Consignments Requiring Action</span>
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-voltrix-orange hover:text-voltrix-orange-hover flex items-center space-x-1"
          >
            <span>View All Consignments</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="p-3 font-bold">Order ID</th>
                <th className="p-3 font-bold">Customer</th>
                <th className="p-3 font-bold">Consignment Total</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold">Tracking Reference</th>
                <th className="p-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                  <td className="p-3">
                    <div className="font-semibold text-gray-900">{ord.user?.name || 'Customer'}</div>
                    <div className="text-[11px] text-gray-400">{ord.user?.email}</div>
                  </td>
                  <td className="p-3 font-bold text-gray-950">
                    ₹{ord.finalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-voltrix-orange font-semibold">
                    {ord.tracking?.trackingNumber || 'Pending Dispatch'}
                  </td>
                  <td className="p-3">
                    <Link
                      href="/admin/orders"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-lg text-[11px]"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
