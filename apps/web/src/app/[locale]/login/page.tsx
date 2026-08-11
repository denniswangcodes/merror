'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth.context';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usersApi, friendsApi } from '@/lib/api';

export default function LoginPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      if (ref) {
        try {
          const refUser = await usersApi.getByUsername(ref);
          await friendsApi.sendRequest(refUser.id).catch(() => {});
        } catch { /* noop */ }
        router.push(`/${locale}/profile/${ref}`);
      } else {
        router.push(`/${locale}/feed`);
      }
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AuthBrandPanel />
      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-2xl font-bold text-text-primary mb-1.5">Welcome back</h1>
          <p className="text-sm text-text-muted mb-7">Sign in to your Merror account</p>

          {error && (
            <div className="bg-danger/10 border border-danger/25 text-danger rounded-xl px-3.5 py-2.5 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href={ref ? `/${locale}/signup?ref=${encodeURIComponent(ref)}` : `/${locale}/signup`} className="text-accent font-semibold no-underline hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
