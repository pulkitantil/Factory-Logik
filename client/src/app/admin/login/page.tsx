
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  LoaderCircle,
  CheckCircle2,
} from 'lucide-react';
import { fetchApi, setAdminToken } from '../../../lib/api';

type Stage =
  | 'email'
  | 'setup-otp'
  | 'setup-password'
  | 'login-password'
  | 'login-otp';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function AdminLoginPage() {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const runAction = async (action: () => Promise<void>) => {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      await action();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const sendSetupOtp = () =>
    runAction(async () => {
      const result = await fetchApi<{
        success: boolean;
        message: string;
        challengeId: string;
      }>('/auth/admin/setup/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      setChallengeId(result.challengeId);
      setOtp('');
      setStage('setup-otp');
      setNotice(result.message);
    });

  const verifySetupOtp = () =>
    runAction(async () => {
      const result = await fetchApi<{
        success: boolean;
        message: string;
        setupToken: string;
      }>('/auth/admin/setup/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ challengeId, otp }),
      });

      setSetupToken(result.setupToken);
      setPassword('');
      setConfirmPassword('');
      setStage('setup-password');
      setNotice(result.message);
    });

  const completeSetup = () =>
    runAction(async () => {
      if (password.length < 12) {
        throw new Error('Use a password with at least 12 characters.');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      await fetchApi('/auth/admin/setup/set-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${setupToken}`,
        },
        body: JSON.stringify({ password }),
      });

      setPassword('');
      setConfirmPassword('');
      setSetupToken('');
      setStage('login-password');
      setNotice('Password created. Log in to continue.');
    });

  const sendLoginOtp = () =>
    runAction(async () => {
      const result = await fetchApi<{
        success: boolean;
        message: string;
        challengeId: string;
      }>('/auth/admin/login/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      setChallengeId(result.challengeId);
      setOtp('');
      setStage('login-otp');
      setNotice(result.message);
    });

  const verifyLoginOtp = () =>
    runAction(async () => {
      const result = await fetchApi<{
        success: boolean;
        message: string;
        token: string;
      }>('/auth/admin/login/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ challengeId, otp }),
      });

      if (!result.token) {
        throw new Error('The server did not return an admin session.');
      }

      setAdminToken(result.token);
      router.replace('/admin');
    });

  const resendOtp = () =>
    runAction(async () => {
      const endpoint =
        stage === 'setup-otp'
          ? '/auth/admin/setup/send-otp'
          : '/auth/admin/login/send-otp';

      const body =
        stage === 'setup-otp'
          ? { email: email.trim().toLowerCase() }
          : { email: email.trim().toLowerCase(), password };

      const result = await fetchApi<{
        success: boolean;
        message: string;
        challengeId: string;
      }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setChallengeId(result.challengeId);
      setOtp('');
      setNotice(result.message);
    });

  const goBack = () => {
    setError('');
    setNotice('');

    if (stage === 'setup-otp') setStage('email');
    else if (stage === 'setup-password') setStage('setup-otp');
    else if (stage === 'login-password') setStage('email');
    else if (stage === 'login-otp') setStage('login-password');
    else setStage('email');
  };

  const titles: Record<Stage, string> = {
    email: 'Admin verification',
    'setup-otp': 'Verify your email',
    'setup-password': 'Create your password',
    'login-password': 'Welcome back',
    'login-otp': 'Two-step verification',
  };

  const descriptions: Record<Stage, string> = {
    email: 'Enter your configured administrator email to continue.',
    'setup-otp': 'Enter the six-digit code sent to the configured admin inbox.',
    'setup-password': 'Choose a strong password for your administrator account.',
    'login-password': 'Enter your administrator password to receive a login code.',
    'login-otp': 'Enter the six-digit login code to access the dashboard.',
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#111111] border border-gray-800 flex items-center justify-center text-voltrix-orange mx-auto shadow-xl">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Voltrix Management Portal
        </h1>

        <p className="text-xs text-gray-500">
          Protected access for inventory, orders and catalog management.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {titles[stage]}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {descriptions[stage]}
            </p>
          </div>

          {stage !== 'email' && (
            <button
              type="button"
              onClick={goBack}
              disabled={loading}
              aria-label="Go back"
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-semibold"
          >
            {notice}
          </div>
        )}

        {stage === 'email' && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError('');
              setNotice('');
              setStage('login-password');
            }}
          >
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter administrator email"
                  className="w-full text-sm pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#111111] hover:bg-black text-white text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              Continue to login
              <ArrowRight className="w-4 h-4 text-voltrix-orange" />
            </button>

            <button
              type="button"
              disabled={!email.trim() || loading}
              onClick={sendSetupOtp}
              className="w-full border border-gray-300 hover:border-voltrix-orange text-gray-700 text-sm font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Please wait…' : 'First-time password setup'}
            </button>
          </form>
        )}

        {stage === 'setup-otp' && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              verifySetupOtp();
            }}
          >
            <OtpInput otp={otp} setOtp={setOtp} />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#111111] text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-voltrix-orange" />}
              Verify OTP
            </button>

            <button
              type="button"
              onClick={resendOtp}
              disabled={loading}
              className="w-full text-xs font-bold text-gray-500 hover:text-voltrix-orange disabled:opacity-50"
            >
              Resend code
            </button>
          </form>
        )}

        {stage === 'setup-password' && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              completeSetup();
            }}
          >
            <PasswordInput
              label="New password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />

            <p className="text-xs text-gray-500">
              Use at least 12 characters. Avoid reusing passwords from other accounts.
            </p>

            <button
              type="submit"
              disabled={loading || password.length < 12 || password !== confirmPassword}
              className="w-full bg-[#111111] text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4 text-voltrix-orange" />}
              Set password
            </button>
          </form>
        )}

        {stage === 'login-password' && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              sendLoginOtp();
            }}
          >
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
              />
            </div>

            <PasswordInput
              label="Admin password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[#111111] text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 text-voltrix-orange" />}
              Send login OTP
            </button>

            <button
              type="button"
              onClick={() => {
                setPassword('');
                setError('');
                setNotice('');
                setStage('email');
              }}
              className="w-full text-xs text-gray-500 hover:text-voltrix-orange"
            >
              Use a different email
            </button>
          </form>
        )}

        {stage === 'login-otp' && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              verifyLoginOtp();
            }}
          >
            <OtpInput otp={otp} setOtp={setOtp} />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#111111] text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-voltrix-orange" />}
              Verify and access dashboard
            </button>

            <button
              type="button"
              onClick={resendOtp}
              disabled={loading}
              className="w-full text-xs font-bold text-gray-500 hover:text-voltrix-orange disabled:opacity-50"
            >
              Resend code
            </button>
          </form>
        )}

        <div className="text-center pt-3 text-xs text-gray-400 border-t">
          <Lock className="w-3 h-3 inline mr-1" />
          Voltrix administrator access
        </div>
      </div>
    </div>
  );
}

function OtpInput({
  otp,
  setOtp,
}: {
  otp: string;
  setOtp: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-700 block mb-1">
        Six-digit OTP
      </label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        className="w-full text-center tracking-[0.5em] text-lg font-mono px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
      />
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-700 block mb-1">
        {label}
      </label>
      <div className="relative">
        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        <input
          type="password"
          required
          minLength={12}
          maxLength={128}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="At least 12 characters"
          className="w-full text-sm pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-voltrix-orange"
        />
      </div>
    </div>
  );
}
