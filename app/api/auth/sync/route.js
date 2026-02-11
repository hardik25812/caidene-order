import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { id, email, name } = await request.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingUser) {
      // Check if user exists by email
      const { data: userByEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (!userByEmail) {
        // Create new user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: id,
            email: email,
            name: name || null,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error creating user:', insertError);
          return NextResponse.json(
            { error: 'Failed to sync user' },
            { status: 500 }
          );
        }
      }
    }

    // Update name if provided and user already exists
    if (name) {
      await supabase
        .from('users')
        .update({ name })
        .eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
