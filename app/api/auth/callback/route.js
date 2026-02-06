import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Handle PKCE flow (code exchange)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Sync user to database
      try {
        await fetch(`${origin}/api/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.session.user.id,
            email: data.session.user.email,
          }),
        });
      } catch (e) {
        console.error('Sync error:', e);
      }

      // Redirect to client callback page with tokens in hash for client-side session setup
      const redirectUrl = new URL('/auth/callback', origin);
      redirectUrl.hash = `access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;
      return NextResponse.redirect(redirectUrl.toString());
    }

    console.error('Code exchange error:', error);
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
  }

  // Handle token_hash flow (email OTP verification)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error && data.session) {
      try {
        await fetch(`${origin}/api/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.session.user.id,
            email: data.session.user.email,
          }),
        });
      } catch (e) {
        console.error('Sync error:', e);
      }

      const redirectUrl = new URL('/auth/callback', origin);
      redirectUrl.hash = `access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;
      return NextResponse.redirect(redirectUrl.toString());
    }

    console.error('OTP verify error:', error);
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
  }

  // No code or token_hash — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
