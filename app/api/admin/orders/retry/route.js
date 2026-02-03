import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { plugsaas } from '@/lib/plugsaas';
import { supabaseInventory } from '@/lib/supabase-inventory';

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get domains that need fulfillment
    const domains = order.domains || [];
    const existingResults = order.fulfillment_results || [];
    
    // Find domains that failed or weren't processed
    const domainsToRetry = domains.filter(d => {
      const result = existingResults.find(r => r.domain === d.domain);
      return !result || result.status === 'failed';
    });

    if (domainsToRetry.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'All domains already fulfilled',
        fulfillmentResults: existingResults 
      });
    }

    const newResults = [];

    for (const domainEntry of domainsToRetry) {
      try {
        // Get available MS account
        const accounts = await supabaseInventory.getAvailableAccounts(1);
        if (accounts.length === 0) {
          newResults.push({
            domain: domainEntry.domain,
            status: 'failed',
            error: 'No available MS accounts in inventory'
          });
          continue;
        }

        const msAccount = accounts[0];

        // Reserve the account
        await supabaseInventory.reserveAccounts([msAccount], orderId);

        // Extract tenant name
        const tenantName = msAccount.email.split('@')[1]?.split('.')[0] || 'Tenant';

        // Create order in Scalesends
        const plugsaasOrder = await plugsaas.addOrder({
          domain: domainEntry.domain,
          provider: 'outlook',
          name: tenantName,
          email: msAccount.email,
          password: msAccount.password,
        });

        const plugsaasOrderId = plugsaasOrder?.data?._id || plugsaasOrder?.data?.id || 
                               plugsaasOrder?.order_id || plugsaasOrder?.id;

        // Get nameservers
        let nameservers = ['ns1.infra.email', 'ns2.infra.email'];
        if (plugsaasOrderId) {
          try {
            const nsResponse = await plugsaas.getNameservers(plugsaasOrderId);
            nameservers = nsResponse?.nameservers || nsResponse?.data?.nameservers || nameservers;
          } catch (e) {
            console.log('Nameservers not available yet:', e.message);
          }
        }

        // Assign the account
        await supabaseInventory.assignAccounts(
          [msAccount],
          orderId,
          order.email,
          domainEntry.domain
        );

        newResults.push({
          domain: domainEntry.domain,
          forwardingUrl: domainEntry.forwardingUrl,
          msAccountEmail: msAccount.email,
          plugsaasOrderId: plugsaasOrderId,
          nameservers: nameservers,
          status: 'completed',
          dns_status: 'pending_verification',
          retriedAt: new Date().toISOString()
        });

      } catch (error) {
        console.error('Retry error for domain:', domainEntry.domain, error);
        newResults.push({
          domain: domainEntry.domain,
          status: 'failed',
          error: error.message,
          retriedAt: new Date().toISOString()
        });
      }
    }

    // Merge with existing results
    const mergedResults = existingResults.filter(r => 
      !newResults.find(n => n.domain === r.domain)
    ).concat(newResults);

    // Collect all nameservers
    const allNameservers = [...new Set(
      mergedResults
        .filter(r => r.nameservers)
        .flatMap(r => r.nameservers)
    )];

    // Determine overall status
    const allCompleted = mergedResults.every(r => r.status === 'completed');
    const anyCompleted = mergedResults.some(r => r.status === 'completed');
    const fulfillmentStatus = allCompleted ? 'completed' : (anyCompleted ? 'partial' : 'failed');

    // Update order
    await supabase
      .from('orders')
      .update({
        fulfillment_results: mergedResults,
        fulfillment_status: fulfillmentStatus,
        nameservers: allNameservers,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      message: `Retried ${domainsToRetry.length} domain(s)`,
      fulfillmentResults: mergedResults,
      fulfillmentStatus: fulfillmentStatus,
      nameservers: allNameservers
    });

  } catch (error) {
    console.error('Retry fulfillment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
