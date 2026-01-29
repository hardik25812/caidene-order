import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  // If no webhook secret configured, process without verification (for initial setup)
  let event;
  
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      );
    }
  } else {
    // Parse the event directly (not recommended for production)
    event = JSON.parse(body);
  }

  const supabase = createServerClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);

        // Get customer email
        const email = session.customer_email || session.metadata?.email;
        const inboxCount = parseInt(session.metadata?.inbox_count || '1');
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!email) {
          console.error('No email found in session');
          break;
        }

        // Create or get user
        let userId;
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          userId = uuidv4();
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: email,
              created_at: new Date().toISOString(),
            });

          if (userError) {
            console.error('Error creating user:', userError);
          }
        }

        // Get subscription details from Stripe
        let currentPeriodEnd = null;
        if (subscriptionId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
          currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();
        }

        // Create subscription record
        const subId = uuidv4();
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            id: subId,
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_name: 'Growth',
            inbox_count: inboxCount,
            status: 'active',
            current_period_end: currentPeriodEnd,
            created_at: new Date().toISOString(),
          });

        if (subError) {
          console.error('Error creating subscription:', subError);
        }

        // Create order record (pending manual fulfillment)
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            id: uuidv4(),
            user_id: userId,
            subscription_id: subId,
            status: 'pending',
            created_at: new Date().toISOString(),
          });

        if (orderError) {
          console.error('Error creating order:', orderError);
        }

        console.log(`Successfully processed checkout for ${email}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription deleted:', subscription.id);

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating canceled subscription:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
