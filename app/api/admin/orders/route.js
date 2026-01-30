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
      return NextResponse.json({ orders: [], stats: { awaiting: 0, completed: 0, totalInvoices: 0, totalInboxes: 0 } });
    }

    // Fetch all subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*');

    // Fetch all users
    const { data: users } = await supabase
      .from('users')
      .select('*');

    // Create lookup maps
    const subsMap = {};
    (subscriptions || []).forEach(s => { subsMap[s.id] = s; });
    
    const usersMap = {};
    (users || []).forEach(u => { usersMap[u.id] = u; });

    // Transform data to flat structure
    const transformedOrders = (orders || []).map(order => {
      const subscription = subsMap[order.subscription_id] || {};
      const user = usersMap[order.user_id] || {};
      
      return {
        id: order.id,
        user_id: order.user_id,
        subscription_id: order.subscription_id,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        email: user.email || 'Unknown',
        stripe_customer_id: subscription.stripe_customer_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
        plan_name: subscription.plan_name || 'Growth',
        inbox_count: subscription.inbox_count || 1
      };
    });

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
