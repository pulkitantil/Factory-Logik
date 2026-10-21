'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('user@voltrix.com');
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B3D2E] to-voltrix-orange flex items-center justify-center text-white mx-auto shadow-md">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Sign In to Voltrix
        </h1>
        <p className="text-xs text-gray-500">
          Access your orders, saved addresses, personal AI tracking, and exclusive discounts.
        </p>
      </div>

      {/* Demo Credentials Helper Pill */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between shadow-sm">
        <div>
          <strong className="block text-emerald-950 font-bold">Quick Demo Login</strong>
          <span>user@voltrix.com / password123</span>
        </div>
        <button
          type="button"
          onClick={handleDemoFill}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
        >
          Autofill
        </button>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500 border-t">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-voltrix-orange font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
