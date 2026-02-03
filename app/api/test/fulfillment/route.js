import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * TEST ENDPOINT - Simulate fulfillment without payment
 * POST /api/test/fulfillment
 * Body: {
 *   email: "test@example.com",
 *   domains: [
 *     {
 *       domain: "example.com",
 *       forwardingUrl: "https://example.com",
 *       names: [
 *         { firstName: "John", lastName: "Doe" }
 *       ]
 *     }
 *   ]
 * }
 */
export async function POST(request) {
  try {
    const { email, domains, phone } = await request.json();

    if (!email || !domains || domains.length === 0) {
      return NextResponse.json(
        { error: 'Email and domains are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if user already exists, if not create one
    let userId;
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      userId = existingUser.id;
      console.log('Using existing user:', userId);
    } else {
      userId = 'test-user-' + Date.now();
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          phone: phone || null,
          created_at: new Date().toISOString(),
        });

      if (userError) {
        console.error('Error creating test user:', userError);
        return NextResponse.json(
          { error: 'Failed to create test user', details: userError.message },
          { status: 500 }
        );
      }
      console.log('Created new user:', userId);
    }

    // Create a test order
    const orderId = uuidv4();
    const totalAmount = domains.length * 49; // $49 per domain

    console.log('Creating test order:', orderId);

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        email: email,
        phone: phone || null,
        stripe_customer_id: 'test_customer',
        stripe_payment_intent_id: 'test_pi_' + Date.now(),
        domain_count: domains.length,
        domains: domains,
        total_amount: totalAmount,
        status: 'pending',
        fulfillment_status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (orderError) {
      console.error('Error creating test order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create test order', details: orderError.message },
        { status: 500 }
      );
    }

    // Trigger fulfillment by calling the webhook's processAutomatedFulfillment
    const { processAutomatedFulfillment } = await import('@/app/api/webhooks/stripe/route');
    
    try {
      const orderData = { domains };
      const fulfillmentResults = await processAutomatedFulfillment(supabase, orderId, orderData, email);
      
      return NextResponse.json({
        success: true,
        orderId,
        email,
        domains,
        fulfillmentResults,
        message: 'Test order created and fulfillment triggered',
        viewOrder: `/dashboard`,
      });
    } catch (fulfillmentError) {
      console.error('Fulfillment error:', fulfillmentError);
      return NextResponse.json({
        success: false,
        orderId,
        error: 'Fulfillment failed',
        details: fulfillmentError.message,
        message: 'Order created but fulfillment failed. Check logs for details.',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test fulfillment error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check if test mode is available
export async function GET() {
  return NextResponse.json({
    message: 'Test fulfillment endpoint',
    usage: 'POST with { email, domains: [{ domain, forwardingUrl, names }] }',
    example: {
      email: 'test@example.com',
      phone: '+1234567890',
      domains: [
        {
          domain: 'testdomain.com',
          forwardingUrl: 'https://example.com',
          names: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Smith' }
          ]
        }
      ]
    }
  });
}
