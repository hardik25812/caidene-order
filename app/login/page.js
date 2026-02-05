'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a0a0a] to-[#0a1a1a] border-r border-[#1a1a1a] flex-col justify-between p-12">
        <div>
          <Link href="/order" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">DELIVERON</span>
          </Link>
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">Scale your cold outreach with confidence</h2>
            <p className="text-gray-400 text-lg">Dedicated Microsoft inboxes, fully authenticated and ready to send in 48 hours.</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-gray-300">100 inboxes per domain</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-gray-300">Full DNS authentication</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-gray-300">24/7 WhatsApp support</span>
            </div>
          </div>
        </div>

        <div className="text-gray-600 text-sm">
          © {new Date().getFullYear()} DeliverOn. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/order" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">DELIVERON</span>
            </Link>
          </div>

          <Card className="bg-[#111111] border-[#1a1a1a]">
            <CardContent className="p-8">
              {sent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Check your email</h2>
                  <p className="text-gray-400">
                    We sent a magic link to <span className="text-white font-medium">{email}</span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Click the link in your email to sign in. The link expires in 1 hour.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
                    onClick={() => {
                      setSent(false);
                      setEmail('');
                    }}
                  >
                    Use a different email
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
                    <p className="text-gray-500 mt-2">Sign in to your account with magic link</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <Label className="text-gray-400">Email address</Label>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-teal-500"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-black font-medium py-5"
                    >
                      {loading ? 'Sending...' : 'Send Magic Link'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
                    <p className="text-gray-500 text-sm">
                      Don't have an account?{' '}
                      <Link href="/order" className="text-teal-400 hover:text-teal-300 font-medium">
                        Get started
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
