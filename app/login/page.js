'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowRight, CheckCircle2, Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { supabase } = await import('@/lib/supabase');
      
      if (isSignUp) {
        // Sign up new user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // Sync user to database
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email,
          }),
        });

        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        // Sign in existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
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
              {
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-white">{isSignUp ? 'Create account' : 'Welcome back'}</h2>
                    <p className="text-gray-500 mt-2">{isSignUp ? 'Sign up to access your dashboard' : 'Sign in to your account'}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label className="text-gray-400">Email address</Label>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-teal-500"
                        autoFocus
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-400">Password</Label>
                      <div className="relative mt-2">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-teal-500 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-black font-medium py-5"
                    >
                      {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
                    <p className="text-gray-500 text-sm">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setError('');
                        }}
                        className="text-teal-400 hover:text-teal-300 font-medium"
                      >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                      </button>
                    </p>
                  </div>
                </>
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
