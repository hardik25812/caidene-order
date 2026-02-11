import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { email, phone, domains, domainCount, user_id } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!domains || domains.length === 0) {
      return NextResponse.json(
        { error: 'At least one domain is required' },
        { status: 400 }
      );
    }

    const pricePerDomain = 4900; // $49 in cents
    const totalDomains = domains.length;

    // Generate a unique order ID to track this order
    const orderId = uuidv4();

    // Store order data in Supabase before payment (pending status)
    const supabase = createServerClient();
    
    const { error: orderError } = await supabase
      .from('pending_orders')
      .insert({
        id: orderId,
        email: email,
        phone: phone || null,
        domains: domains,
        domain_count: totalDomains,
        total_amount: (pricePerDomain * totalDomains) / 100,
        status: 'pending_payment',
        user_id: user_id || null,
        created_at: new Date().toISOString(),
      });

    if (orderError) {
      console.error('Error storing pending order:', orderError);
      // Continue anyway - we'll store in Stripe metadata
    }

    // Create a Stripe Checkout Session (one-time payment, not subscription)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Microsoft Inboxes - ${totalDomains} Domain${totalDomains > 1 ? 's' : ''}`,
              description: `${totalDomains * 100} Microsoft inboxes across ${totalDomains} domain(s)`,
            },
            unit_amount: pricePerDomain,
          },
          quantity: totalDomains,
        },
      ],
      metadata: {
        order_id: orderId,
        domain_count: totalDomains.toString(),
        email: email,
        phone: phone || '',
        user_id: user_id || '',
        // Store domains as JSON string (Stripe metadata has 500 char limit per value)
        domains_summary: JSON.stringify(domains.slice(0, 3).map(d => d.domain)).substring(0, 500),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url, orderId });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
