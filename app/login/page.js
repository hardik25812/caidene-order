'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowRight, CheckCircle2, Sparkles, Zap, Shield, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Failed to send magic link');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <Link href="/order" className="flex items-center gap-3 mb-10 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold text-white tracking-tight">DeliverOn</span>
          </Link>

          {/* Card */}
          <div className="card-elevated rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white">
                {sent ? 'Check your email' : 'Welcome back'}
              </h1>
              <p className="text-[hsl(215,20%,55%)] mt-2">
                {sent
                  ? 'We sent you a magic link to sign in'
                  : 'Sign in to access your dashboard'}
              </p>
            </div>

            {sent ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[hsl(215,20%,65%)]">We sent a magic link to</p>
                  <p className="text-white font-semibold mt-1">{email}</p>
                </div>
                <p className="text-[hsl(215,20%,50%)] text-sm">
                  Click the link in your email to sign in. The link expires in 1 hour.
                </p>
                <Button
                  variant="outline"
                  className="w-full h-11 border-[hsl(222,47%,18%)] text-[hsl(215,20%,60%)] hover:text-white hover:bg-[hsl(222,47%,12%)]"
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[hsl(215,20%,70%)]">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-[hsl(222,47%,9%)] border-[hsl(222,47%,16%)] text-white placeholder:text-[hsl(215,20%,40%)] focus:border-blue-500 focus:ring-blue-500/20"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-400 text-xs font-bold">!</span>
                    </div>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold btn-primary shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Magic Link
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <p className="text-[hsl(215,20%,50%)] text-sm">No password required</p>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-[hsl(215,20%,50%)] text-sm mt-8">
            Don't have an account?{' '}
            <Link href="/order" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Get started
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex w-1/2 bg-[hsl(222,47%,7%)] border-l border-[hsl(222,47%,12%)] items-center justify-center p-12">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-sm text-blue-400 mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Enterprise-Grade Infrastructure</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Cold email infrastructure built for scale
          </h2>
          <p className="text-[hsl(215,20%,55%)] mb-10 text-lg">
            Dedicated Microsoft inboxes with full DNS authentication. 100 inboxes per domain, warmed and ready.
          </p>

          <div className="space-y-5">
            {[
              {
                icon: Mail,
                title: '100 Inboxes per Domain',
                description: 'Microsoft 365 accounts fully configured and ready',
              },
              {
                icon: Shield,
                title: 'Full DNS Authentication',
                description: 'SPF, DKIM, DMARC configured automatically',
              },
              {
                icon: Clock,
                title: '48-Hour Setup',
                description: 'From order to sending in just 2 days',
              },
              {
                icon: Users,
                title: '24/7 WhatsApp Support',
                description: 'Expert help whenever you need it',
              },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{feature.title}</h3>
                  <p className="text-[hsl(215,20%,50%)] text-sm mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-[hsl(222,47%,12%)]">
            {[
              { value: '100', label: 'Inboxes/Domain' },
              { value: '15K', label: 'Monthly Emails' },
              { value: '48h', label: 'Setup Time' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-[hsl(215,20%,50%)] mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
