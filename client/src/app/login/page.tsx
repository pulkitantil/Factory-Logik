'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const { login, verifyOtp, resendOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step state: 'LOGIN' or 'OTP' (for unverified existing accounts)
  const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 60-second cooldown timer for resend OTP
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await login(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      if (err.data?.requiresVerification || err.message?.includes('not verified')) {
        setStep('OTP');
        setCooldown(60);
        setSuccessMsg(
          err.data?.message || 'Your email is not verified yet. A 6-digit verification code has been sent to your email.'
        );
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtp(email, otp.trim());
      if (res.success) {
        setSuccessMsg('Email verified successfully! Signing in...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await resendOtp(email);
      setCooldown(60);
      setSuccessMsg(res.message || 'A fresh 6-digit code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B3D2E] to-voltrix-orange flex items-center justify-center text-white mx-auto shadow-md">
          {step === 'OTP' ? <ShieldCheck className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {step === 'OTP' ? 'Verify Your Account' : 'Sign In to Factorylogik'}
        </h1>
        <p className="text-xs text-gray-500">
          {step === 'OTP'
            ? 'Enter the 6-digit code sent to your email to complete verification and sign in.'
            : 'Access your orders, saved addresses, personal AI tracking, and exclusive discounts.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'LOGIN' && (
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
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Code sent to:</span>
                <span className="text-xs font-bold text-gray-900 truncate max-w-[220px] block">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('LOGIN');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-[11px] font-bold text-voltrix-orange hover:underline flex items-center space-x-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Back to Sign In</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Enter 6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full text-center tracking-[8px] font-mono text-base font-bold py-2.5 px-9 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Check your inbox and spam folder. Valid for 10 minutes.</p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Code...' : 'Verify Email & Sign In'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            {/* Resend OTP with cooldown */}
            <div className="pt-2 text-center text-xs text-gray-500 flex items-center justify-center space-x-1">
              <span>Didn&apos;t receive the code?</span>
              {cooldown > 0 ? (
                <span className="font-semibold text-gray-400">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-voltrix-orange font-bold hover:underline inline-flex items-center space-x-1 disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>
          </form>
        )}

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
