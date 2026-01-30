import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Fetch all orders with subscription data
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        subscriptions (
          stripe_customer_id,
          stripe_subscription_id,
          plan_name,
          inbox_count,
          status as sub_status
        ),
        users (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // Transform data to flat structure
    const transformedOrders = (orders || []).map(order => ({
      id: order.id,
      user_id: order.user_id,
      subscription_id: order.subscription_id,
      status: order.status,
      created_at: order.created_at,
      email: order.users?.email || 'Unknown',
      stripe_customer_id: order.subscriptions?.stripe_customer_id,
      stripe_subscription_id: order.subscriptions?.stripe_subscription_id,
      plan_name: order.subscriptions?.plan_name || 'Growth',
      inbox_count: order.subscriptions?.inbox_count || 1
    }));

    // Calculate stats
    const awaiting = transformedOrders.filter(o => o.status === 'pending').length;
    const completed = transformedOrders.filter(o => o.status === 'fulfilled').length;
    const totalInboxes = transformedOrders.reduce((sum, o) => sum + ((o.inbox_count || 1) * 100), 0);

    return NextResponse.json({
      orders: transformedOrders,
      stats: {
        awaiting,
        completed,
        totalInvoices: transformedOrders.length,
        totalInboxes
      }
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', orders: [], stats: { awaiting: 0, completed: 0, totalInvoices: 0, totalInboxes: 0 } },
      { status: 500 }
    );
  }
}
