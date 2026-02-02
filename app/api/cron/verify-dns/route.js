import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * DNS Verification Cron Job
 * 
 * This endpoint should be called periodically (every 5-15 minutes) to:
 * 1. Find orders with dns_status = 'pending_verification'
 * 2. Check if nameservers are correctly configured
 * 3. Mark orders as ACTIVE when DNS is verified
 * 
 * Can be triggered by:
 * - Vercel Cron Jobs
 * - External cron service (cron-job.org, etc.)
 * - Manual admin trigger
 * 
 * Security: Add CRON_SECRET to prevent unauthorized access
 */

export async function GET(request) {
  // Verify cron secret if configured
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const results = {
    checked: 0,
    verified: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get orders pending DNS verification
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('dns_status', 'pending_verification')
      .in('fulfillment_status', ['completed', 'partial']);

    if (error) {
      console.error('Error fetching orders for DNS verification:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ 
        message: 'No orders pending DNS verification',
        ...results 
      });
    }

    console.log(`Checking DNS for ${orders.length} orders`);

    for (const order of orders) {
      results.checked++;
      
      try {
        const nameservers = order.nameservers || [];
        let allVerified = true;
        const verificationResults = [];

        for (const ns of nameservers) {
          if (!ns.domain || ns.dns_verified) {
            verificationResults.push({ ...ns, dns_verified: ns.dns_verified || false });
            continue;
          }

          // Check DNS for this domain
          const isVerified = await verifyDomainDNS(ns.domain, ns.nameservers);
          
          verificationResults.push({
            ...ns,
            dns_verified: isVerified,
            last_checked: new Date().toISOString(),
          });

          if (!isVerified) {
            allVerified = false;
          }
        }

        // Update order with verification results
        const updateData = {
          nameservers: verificationResults,
          dns_last_checked: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (allVerified && verificationResults.length > 0) {
          // All domains verified - mark as ACTIVE
          updateData.dns_status = 'verified';
          updateData.fulfillment_status = 'active';
          results.verified++;

          // Create notification for customer
          await notifyCustomerDNSVerified(supabase, order);
        }

        await supabase
          .from('orders')
          .update(updateData)
          .eq('id', order.id);

      } catch (orderError) {
        console.error(`Error verifying DNS for order ${order.id}:`, orderError);
        results.failed++;
        results.errors.push({
          orderId: order.id,
          error: orderError.message,
        });
      }
    }

    return NextResponse.json({
      message: `DNS verification completed`,
      ...results,
    });

  } catch (error) {
    console.error('DNS verification cron error:', error);
    return NextResponse.json(
      { error: 'DNS verification failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Verify domain DNS by checking nameservers
 * Uses DNS lookup to check if expected nameservers are configured
 */
async function verifyDomainDNS(domain, expectedNameservers) {
  if (!domain || !expectedNameservers) {
    return false;
  }

  try {
    // Use DNS-over-HTTPS (DoH) for reliable DNS lookups
    // Google's DoH endpoint
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`,
      {
        headers: {
          'Accept': 'application/dns-json',
        },
      }
    );

    if (!response.ok) {
      console.error(`DNS lookup failed for ${domain}: ${response.status}`);
      return false;
    }

    const data = await response.json();
    
    if (data.Status !== 0) {
      // DNS lookup error (NXDOMAIN, SERVFAIL, etc.)
      console.log(`DNS lookup returned status ${data.Status} for ${domain}`);
      return false;
    }

    if (!data.Answer || data.Answer.length === 0) {
      console.log(`No NS records found for ${domain}`);
      return false;
    }

    // Extract nameservers from response
    const actualNameservers = data.Answer
      .filter(record => record.type === 2) // NS record type
      .map(record => record.data.toLowerCase().replace(/\.$/, '')); // Remove trailing dot

    // Normalize expected nameservers
    const expectedNsNormalized = Array.isArray(expectedNameservers)
      ? expectedNameservers.map(ns => ns.toLowerCase().replace(/\.$/, ''))
      : [expectedNameservers.toLowerCase().replace(/\.$/, '')];

    // Check if all expected nameservers are present
    const allPresent = expectedNsNormalized.every(expected =>
      actualNameservers.some(actual => actual.includes(expected) || expected.includes(actual))
    );

    console.log(`DNS verification for ${domain}:`, {
      expected: expectedNsNormalized,
      actual: actualNameservers,
      verified: allPresent,
    });

    return allPresent;

  } catch (error) {
    console.error(`DNS verification error for ${domain}:`, error);
    return false;
  }
}

/**
 * Notify customer that DNS has been verified and order is active
 */
async function notifyCustomerDNSVerified(supabase, order) {
  try {
    // Store notification in database
    await supabase
      .from('admin_alerts')
      .insert({
        id: uuidv4(),
        type: 'dns_verified',
        message: `DNS verified for order ${order.id} (${order.email}). Order is now ACTIVE.`,
        status: 'unread',
        metadata: { 
          orderId: order.id, 
          email: order.email,
          domains: order.domains?.map(d => d.domain) || [],
        },
        created_at: new Date().toISOString(),
      });

    // TODO: Send email notification to customer
    // await sendEmail({
    //   to: order.email,
    //   subject: 'Your inboxes are ready!',
    //   template: 'dns-verified',
    //   data: { order },
    // });

    console.log(`DNS verified notification sent for order ${order.id}`);
  } catch (error) {
    console.error('Error sending DNS verified notification:', error);
  }
}

/**
 * POST endpoint for manual DNS verification trigger
 */
export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get the specific order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const nameservers = order.nameservers || [];
    const verificationResults = [];
    let allVerified = true;

    for (const ns of nameservers) {
      if (!ns.domain) continue;

      const isVerified = await verifyDomainDNS(ns.domain, ns.nameservers);
      
      verificationResults.push({
        ...ns,
        dns_verified: isVerified,
        last_checked: new Date().toISOString(),
      });

      if (!isVerified) {
        allVerified = false;
      }
    }

    // Update order
    const updateData = {
      nameservers: verificationResults,
      dns_last_checked: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (allVerified && verificationResults.length > 0) {
      updateData.dns_status = 'verified';
      updateData.fulfillment_status = 'active';
      await notifyCustomerDNSVerified(supabase, order);
    }

    await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      verified: allVerified,
      results: verificationResults,
    });

  } catch (error) {
    console.error('Manual DNS verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed', message: error.message },
      { status: 500 }
    );
  }
}
