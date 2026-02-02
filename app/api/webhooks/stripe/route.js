import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { sheetsInventory } from '@/lib/google-sheets';
import { plugsaas } from '@/lib/plugsaas';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds between retries

/**
 * Sleep helper for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry(fn, operationName, maxRetries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(`${operationName} failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retrying ${operationName} in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

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

        // Get order details from metadata
        const email = session.customer_email || session.metadata?.email;
        const phone = session.metadata?.phone || '';
        const orderId = session.metadata?.order_id;
        const domainCount = parseInt(session.metadata?.domain_count || '1');
        const customerId = session.customer;
        const paymentIntentId = session.payment_intent;

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
              phone: phone,
              created_at: new Date().toISOString(),
            });

          if (userError) {
            console.error('Error creating user:', userError);
          }
        }

        // Get pending order data (contains full domain info)
        let orderData = null;
        if (orderId) {
          const { data: pendingOrder } = await supabase
            .from('pending_orders')
            .select('*')
            .eq('id', orderId)
            .single();
          
          if (pendingOrder) {
            orderData = pendingOrder;
          }
        }

        // Create confirmed order record
        const confirmedOrderId = orderId || uuidv4();
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            id: confirmedOrderId,
            user_id: userId,
            email: email,
            phone: phone,
            stripe_customer_id: customerId,
            stripe_payment_intent_id: paymentIntentId,
            domain_count: domainCount,
            domains: orderData?.domains || [],
            total_amount: orderData?.total_amount || (domainCount * 49),
            status: 'paid',
            fulfillment_status: 'pending',
            created_at: new Date().toISOString(),
          });

        if (orderError) {
          console.error('Error creating order:', orderError);
        }

        // Update pending order status
        if (orderId) {
          await supabase
            .from('pending_orders')
            .update({ status: 'paid' })
            .eq('id', orderId);
        }

        // ============ AUTOMATED FULFILLMENT ============
        // This runs after payment is confirmed
        
        try {
          await processAutomatedFulfillment(supabase, confirmedOrderId, orderData, email);
        } catch (fulfillmentError) {
          console.error('Automated fulfillment failed:', fulfillmentError);
          // Update order with error status
          await supabase
            .from('orders')
            .update({
              fulfillment_status: 'failed',
              fulfillment_error: fulfillmentError.message,
            })
            .eq('id', confirmedOrderId);
        }

        console.log(`Successfully processed checkout for ${email}`);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment intent succeeded:', paymentIntent.id);
        // Payment success is handled in checkout.session.completed
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        
        // Mark any pending orders as failed
        const orderId = paymentIntent.metadata?.order_id;
        if (orderId) {
          await supabase
            .from('pending_orders')
            .update({ status: 'payment_failed' })
            .eq('id', orderId);
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

/**
 * Process automated fulfillment after payment
 * With retry logic and rollback on failure
 * 
 * Flow:
 * 1. Get Microsoft accounts from Google Sheets inventory
 * 2. Reserve accounts (can be rolled back)
 * 3. Create order in PlugSaaS (with retry)
 * 4. Get nameservers (with retry)
 * 5. Mark accounts as assigned
 * 6. Update order with nameserver info
 * 7. Check inventory levels
 * 
 * On failure: Release reserved accounts, mark order as failed
 */
async function processAutomatedFulfillment(supabase, orderId, orderData, customerEmail) {
  console.log(`Starting automated fulfillment for order ${orderId}`);

  const domains = orderData?.domains || [];
  if (domains.length === 0) {
    throw new Error('No domains found in order');
  }

  // Update status to processing
  await supabase
    .from('orders')
    .update({ 
      fulfillment_status: 'processing',
      retry_count: 0,
    })
    .eq('id', orderId);

  const fulfillmentResults = [];
  const reservedAccounts = []; // Track reserved accounts for rollback

  for (const domainEntry of domains) {
    let msAccount = null;
    
    try {
      // Step 1: Get available Microsoft account from inventory (with retry)
      const availableAccounts = await withRetry(
        () => sheetsInventory.getAvailableAccounts(1),
        'Get available accounts'
      );
      
      if (availableAccounts.length === 0) {
        // No inventory available - queue for manual fulfillment
        await supabase
          .from('orders')
          .update({
            fulfillment_status: 'queued',
            fulfillment_error: 'Insufficient inventory - queued for manual fulfillment',
          })
          .eq('id', orderId);

        // Send low inventory alert
        await sendLowInventoryAlert(supabase);
        
        throw new Error('Insufficient inventory');
      }

      msAccount = availableAccounts[0];

      // Step 2: Reserve the account (with retry)
      await withRetry(
        () => sheetsInventory.reserveAccounts([msAccount], orderId),
        'Reserve account'
      );
      reservedAccounts.push({ account: msAccount, domain: domainEntry.domain });

      // Step 3: Create order in PlugSaaS (with retry)
      const customerNames = domainEntry.names || [];
      const namesForApi = customerNames.map(n => `${n.firstName} ${n.lastName}`).filter(n => n.trim());

      let plugsaasOrderId = null;
      let nameservers = null;

      try {
        const plugsaasOrder = await withRetry(
          () => plugsaas.addOrder({
            domain: domainEntry.domain,
            forwarding_url: domainEntry.forwardingUrl,
            names: namesForApi,
            microsoft_email: msAccount.email,
            microsoft_password: msAccount.password,
          }),
          'PlugSaaS addOrder'
        );

        plugsaasOrderId = plugsaasOrder.order_id || plugsaasOrder.id;

        // Step 4: Get nameservers (with retry)
        if (plugsaasOrderId) {
          const nsResponse = await withRetry(
            () => plugsaas.getNameservers(plugsaasOrderId),
            'PlugSaaS getNameservers'
          );
          nameservers = nsResponse.nameservers || nsResponse;
        }
      } catch (apiError) {
        console.error('PlugSaaS API error after retries:', apiError);
        // Continue with partial fulfillment - admin can complete manually
        // But still mark the account as assigned since we reserved it
      }

      // Step 5: Mark account as assigned (with retry)
      await withRetry(
        () => sheetsInventory.assignAccounts(
          [msAccount],
          orderId,
          customerEmail,
          domainEntry.domain
        ),
        'Assign account'
      );

      // Remove from reserved list since it's now assigned
      const reservedIndex = reservedAccounts.findIndex(r => r.account.email === msAccount.email);
      if (reservedIndex > -1) {
        reservedAccounts.splice(reservedIndex, 1);
      }

      fulfillmentResults.push({
        domain: domainEntry.domain,
        forwardingUrl: domainEntry.forwardingUrl,
        names: namesForApi,
        msAccountEmail: msAccount.email,
        plugsaasOrderId,
        nameservers,
        status: plugsaasOrderId ? 'completed' : 'partial',
        dns_status: 'pending_verification',
      });

    } catch (domainError) {
      console.error(`Error processing domain ${domainEntry.domain}:`, domainError);
      
      // Rollback: Release the reserved account if we have one
      if (msAccount && reservedAccounts.some(r => r.account.email === msAccount.email)) {
        try {
          console.log(`Rolling back: Releasing reserved account for ${domainEntry.domain}`);
          await sheetsInventory.releaseAccounts(orderId);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
          // Log rollback failure but continue
          await logRollbackFailure(supabase, orderId, domainEntry.domain, rollbackError);
        }
      }

      fulfillmentResults.push({
        domain: domainEntry.domain,
        error: domainError.message,
        status: 'failed',
        retried: true,
      });
    }
  }

  // Final rollback check: Release any remaining reserved accounts
  if (reservedAccounts.length > 0) {
    console.log(`Releasing ${reservedAccounts.length} remaining reserved accounts`);
    try {
      await sheetsInventory.releaseAccounts(orderId);
    } catch (rollbackError) {
      console.error('Final rollback failed:', rollbackError);
    }
  }

  // Determine final status
  const allSuccessful = fulfillmentResults.every(r => r.status === 'completed');
  const anySuccessful = fulfillmentResults.some(r => r.status === 'completed' || r.status === 'partial');
  const allFailed = fulfillmentResults.every(r => r.status === 'failed');

  let finalStatus = 'completed';
  if (allFailed) {
    finalStatus = 'failed';
  } else if (!allSuccessful) {
    finalStatus = 'partial';
  }

  // Update order with fulfillment results
  await supabase
    .from('orders')
    .update({
      fulfillment_status: finalStatus,
      dns_status: finalStatus === 'completed' || finalStatus === 'partial' ? 'pending_verification' : null,
      fulfillment_results: fulfillmentResults,
      nameservers: fulfillmentResults.filter(r => r.nameservers).map(r => ({
        domain: r.domain,
        nameservers: r.nameservers,
        dns_verified: false,
      })),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  // Check inventory levels and send alert if low
  try {
    const inventoryStatus = await sheetsInventory.isInventoryLow();
    if (inventoryStatus.isLow) {
      await sendLowInventoryAlert(supabase, inventoryStatus);
    }
  } catch (inventoryError) {
    console.error('Error checking inventory levels:', inventoryError);
  }

  console.log(`Fulfillment completed for order ${orderId}:`, fulfillmentResults);
  return fulfillmentResults;
}

/**
 * Log rollback failure for admin review
 */
async function logRollbackFailure(supabase, orderId, domain, error) {
  try {
    await supabase
      .from('admin_alerts')
      .insert({
        id: uuidv4(),
        type: 'rollback_failure',
        message: `Rollback failed for order ${orderId}, domain ${domain}: ${error.message}. Manual intervention required.`,
        status: 'unread',
        metadata: { orderId, domain, error: error.message },
        created_at: new Date().toISOString(),
      });
  } catch (e) {
    console.error('Failed to log rollback failure:', e);
  }
}

/**
 * Send low inventory alert
 */
async function sendLowInventoryAlert(supabase, inventoryStatus = null) {
  try {
    // Store alert in database
    await supabase
      .from('admin_alerts')
      .insert({
        id: uuidv4(),
        type: 'low_inventory',
        message: `Low inventory alert: Only ${inventoryStatus?.count || 'few'} Microsoft accounts remaining (threshold: ${inventoryStatus?.threshold || 10})`,
        status: 'unread',
        created_at: new Date().toISOString(),
      });

    // TODO: Send email/SMS notification to admin
    console.log('Low inventory alert sent');
  } catch (error) {
    console.error('Error sending low inventory alert:', error);
  }
}
