'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link href="/order" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-semibold text-white tracking-tight">DeliverOn</span>
        </Link>

        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm card-glow">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-white font-semibold">
              {sent ? 'Check your email' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              {sent
                ? 'We sent you a magic link to sign in'
                : 'Sign in to access your dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {sent ? (
              <div className="text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-300">
                    We sent a magic link to
                  </p>
                  <p className="text-white font-medium mt-1">{email}</p>
                </div>
                <p className="text-slate-500 text-sm">
                  Click the link in your email to sign in. The link expires in 1 hour.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-2 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-colors h-11"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-400 text-xs">!</span>
                    </div>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white py-5 font-medium btn-glow shadow-lg shadow-indigo-500/20 disabled:opacity-50"
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

                <div className="flex items-center gap-2 justify-center pt-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <p className="text-slate-500 text-xs">No password required</p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-8">
          Don't have an account?{' '}
          <Link href="/order" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
