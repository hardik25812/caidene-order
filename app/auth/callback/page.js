'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle PKCE flow (modern Supabase magic links use ?code= parameter)
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Error exchanging code for session:', error);
            router.push('/login?error=auth_error');
            return;
          }

          if (data.session) {
            // Sync user to database (include name from metadata if available)
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: data.session.user.id,
                email: data.session.user.email,
                name: data.session.user.user_metadata?.full_name || null,
              }),
            });

            router.push('/dashboard');
            return;
          }
        }

        // Handle legacy hash-based tokens (#access_token=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            router.push('/login?error=auth_error');
            return;
          }

          if (data.session) {
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: data.session.user.id,
                email: data.session.user.email,
                name: data.session.user.user_metadata?.full_name || null,
              }),
            });

            router.push('/dashboard');
            return;
          }
        }

        // If no tokens in URL, check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        router.push('/login?error=callback_error');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.15)] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#217aff]/30 border-t-[#217aff] rounded-full animate-spin" />
        </div>
        <p className="font-body text-sm font-medium text-[#727272]">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.15)] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#217aff]/30 border-t-[#217aff] rounded-full animate-spin" />
          </div>
          <p className="font-body text-sm font-medium text-[#727272]">Signing you in...</p>
        </div>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
