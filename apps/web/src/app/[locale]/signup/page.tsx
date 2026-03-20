'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth.context';

export default function SignupPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup(form.email, form.password, form.username, form.displayName || undefined);
      router.push(`/${locale}/feed`);
    } catch (err) {
      setError((err as Error).message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
        <h1
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#111827', marginBottom: 6 }}
          className="text-center"
        >
          Join Merror
        </h1>
        <p className="text-center text-[13px] text-gray-500 mb-6">Start spreading good vibes 🌟</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="cool_username"
              pattern="^[a-z0-9_]+$"
              title="Lowercase letters, numbers, and underscores only"
              minLength={3}
              maxLength={30}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">Lowercase letters, numbers, underscores only</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Display Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              placeholder="Your Name"
              maxLength={60}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Min 8 characters"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60 hover:bg-indigo-700 transition-colors"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[12px] text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href={`/${locale}/login`} className="text-indigo-600 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
