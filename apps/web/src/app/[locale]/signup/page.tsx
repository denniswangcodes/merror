'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth.context';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SignupPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', username: '', displayName: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signup({ email: form.email, password: form.password, username: form.username, displayName: form.displayName || undefined });
      router.push(`/${locale}/feed`);
    } catch (err) {
      setError((err as Error).message || 'Signup failed');
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
          <h1 className="font-display text-2xl font-bold text-text-primary mb-1.5">Join Merror</h1>
          <p className="text-sm text-text-muted mb-7">Start spreading good vibes 🌟</p>

          {error && (
            <div className="bg-danger/10 border border-danger/25 text-danger rounded-xl px-3.5 py-2.5 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />

            <Input
              label="Username"
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
              hint="Lowercase letters, numbers, underscores only"
              autoComplete="username"
            />

            <Input
              label="Display Name (optional)"
              type="text"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              placeholder="Your Name"
              maxLength={60}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={passwordMismatch ? 'Passwords do not match' : undefined}
            />

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{' '}
            <Link href={`/${locale}/login`} className="text-accent font-semibold no-underline hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
