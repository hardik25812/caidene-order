import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // First try to get subscription by user_id directly
    let { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription by user_id:', error);
    }

    // If no subscription found, try to find user by email match
    if (!subscription) {
      // Get user email from auth user id
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (user?.email) {
        // Find user by email
        const { data: userByEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userByEmail) {
          const { data: subByEmail } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userByEmail.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          subscription = subByEmail;
        }
      }
    }

    return NextResponse.json({ subscription: subscription || null });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
