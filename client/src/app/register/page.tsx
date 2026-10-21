'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B3D2E] to-voltrix-orange flex items-center justify-center text-white mx-auto shadow-md">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Create a Voltrix Account
        </h1>
        <p className="text-xs text-gray-500">
          Join thousands of tech enthusiasts for 24h guaranteed dispatches and AI order assistance.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rohan Sharma"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
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
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500 border-t">
          Already have an account?{' '}
          <Link href="/login" className="text-voltrix-orange font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
