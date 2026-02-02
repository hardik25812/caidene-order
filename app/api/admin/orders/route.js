import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Fetch all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // Transform data
    const transformedOrders = (orders || []).map(order => ({
      id: order.id,
      user_id: order.user_id,
      email: order.email || 'Unknown',
      phone: order.phone,
      status: order.status,
      fulfillment_status: order.fulfillment_status,
      fulfillment_error: order.fulfillment_error,
      domain_count: order.domain_count || 1,
      domains: order.domains || [],
      nameservers: order.nameservers || [],
      total_amount: order.total_amount || 0,
      stripe_customer_id: order.stripe_customer_id,
      stripe_payment_intent_id: order.stripe_payment_intent_id,
      fulfillment_results: order.fulfillment_results || [],
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));

    // Calculate stats
    const pending = transformedOrders.filter(o => 
      o.fulfillment_status === 'pending' || o.fulfillment_status === 'processing' || o.fulfillment_status === 'queued'
    ).length;
    const completed = transformedOrders.filter(o => o.fulfillment_status === 'completed').length;
    const failed = transformedOrders.filter(o => o.fulfillment_status === 'failed' || o.fulfillment_status === 'partial').length;
    const totalDomains = transformedOrders.reduce((sum, o) => sum + (o.domain_count || 1), 0);
    const totalRevenue = transformedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return NextResponse.json({
      orders: transformedOrders,
      stats: {
        pending,
        completed,
        failed,
        total: transformedOrders.length,
        totalDomains,
        totalRevenue,
      }
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', orders: [], stats: { pending: 0, completed: 0, failed: 0, total: 0, totalDomains: 0, totalRevenue: 0 } },
      { status: 500 }
    );
  }
}
