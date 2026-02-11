'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }

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

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (signUpError) throw signUpError;

      // Sync user to database with name
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: name.trim(),
        }),
      });

      // Redirect to order page (authenticated now)
      window.location.href = '/order';
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col">
      {/* Header */}
      <header className="h-[72px] border-b border-[#363636] shrink-0">
        <div className="flex items-center h-full max-w-[1200px] mx-auto px-6">
          <Link href="/order" aria-label="DeliverOn home">
            <img
              src="https://framerusercontent.com/images/4xMhy82Xz334ZgDkWW9tGUV0iI.png?scale-down-to=512"
              alt="DeliverOn logo"
              className="h-9 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Main: 2-column grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 max-w-[1200px] mx-auto w-full px-6 items-center gap-16 py-8 lg:py-0">
        {/* Left: Hero / Value Props */}
        <div
          ref={(el) => (revealRefs.current[0] = el)}
          className="do-reveal py-8 lg:py-16 text-center lg:text-left"
        >
          <h1 className="font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.2] tracking-[-0.03em] text-[#f2f2f2] mb-6">
            Scale your cold outreach with confidence
          </h1>
          <p className="font-body text-[clamp(0.875rem,1.5vw,1.125rem)] text-[#969696] mb-12 leading-[1.7] max-w-[480px] lg:max-w-[480px] mx-auto lg:mx-0">
            Dedicated Microsoft inboxes, fully authenticated and ready to send in 48 hours.
          </p>
          <div className="flex flex-col gap-4 items-center lg:items-start">
            {['100 inboxes per domain', 'Full DNS authentication', '24/7 WhatsApp support'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 font-body text-[0.9375rem] font-medium text-[#f2f2f2]">
                <span className="material-symbols-filled text-[1.375rem] text-[#217aff]">check_circle</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Signup Form Card */}
        <div
          ref={(el) => (revealRefs.current[1] = el)}
          className="do-reveal do-reveal-delay-1 bg-[#020202] border border-[#363636] rounded-[20px] p-8 lg:p-12 shadow-glow-blue transition-colors hover:border-[rgba(33,122,255,0.2)]"
        >
          <h2 className="font-heading text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-[-0.03em] text-[#f2f2f2] mb-2">
            Create your account
          </h2>
          <p className="font-body text-[0.9375rem] text-[#969696] mb-8">
            Sign up to start placing orders
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block font-body text-[0.8125rem] font-medium text-[#969696] mb-2">
                Full Name <span className="text-[#217aff]">*</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="do-form-input"
                autoFocus
                required
              />
            </div>

            <div className="mb-6">
              <label className="block font-body text-[0.8125rem] font-medium text-[#969696] mb-2">
                Email address <span className="text-[#217aff]">*</span>
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="do-form-input"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block font-body text-[0.8125rem] font-medium text-[#969696] mb-2">
                Password <span className="text-[#217aff]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="do-form-input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727272] hover:text-[#f2f2f2] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[#ff4d4d] text-sm mb-4 font-body">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="do-btn do-btn--primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="font-body text-[0.8125rem] text-[#727272]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#00a3e0] hover:text-[#00b8fc] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#363636] py-6 shrink-0">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <p className="text-[0.75rem] text-[#727272]">© {new Date().getFullYear()} DeliverOn. All rights reserved.</p>
          <Link href="/order" aria-label="DeliverOn home">
            <img
              src="https://framerusercontent.com/images/4xMhy82Xz334ZgDkWW9tGUV0iI.png?scale-down-to=512"
              alt="DeliverOn logo"
              className="h-[26px] w-auto"
            />
          </Link>
        </div>
      </footer>
    </div>
  );
}
