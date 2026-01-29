import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email, inboxCount } = await request.json();

    if (!email || !inboxCount) {
      return NextResponse.json(
        { error: 'Email and inbox count are required' },
        { status: 400 }
      );
    }

    const pricePerDomain = 4900; // $49 in cents
    const totalPrice = pricePerDomain * inboxCount;

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `DeliverOn Growth - ${inboxCount} Domain${inboxCount > 1 ? 's' : ''}`,
              description: `${inboxCount * 100} Microsoft inboxes, ${(inboxCount * 15000).toLocaleString()} emails/month`,
            },
            unit_amount: pricePerDomain,
            recurring: {
              interval: 'month',
            },
          },
          quantity: inboxCount,
        },
      ],
      metadata: {
        inbox_count: inboxCount.toString(),
        email: email,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
