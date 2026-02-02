import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { orderId, nameservers } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Build update object
    const updateData = { 
      status: 'paid',
      fulfillment_status: 'completed',
      updated_at: new Date().toISOString()
    };

    // If nameservers provided, add them
    if (nameservers) {
      updateData.nameservers = nameservers;
    }

    // Update order status to completed
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Error completing order:', error);
      return NextResponse.json(
        { error: 'Failed to complete order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Complete order error:', error);
    return NextResponse.json(
      { error: 'Failed to complete order' },
      { status: 500 }
    );
  }
}
