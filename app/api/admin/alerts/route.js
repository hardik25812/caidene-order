import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Fetch unread alerts
    const { data: alerts, error } = await supabase
      .from('admin_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching alerts:', error);
    }

    const unreadCount = (alerts || []).filter(a => a.status === 'unread').length;

    return NextResponse.json({
      alerts: alerts || [],
      unreadCount,
    });
  } catch (error) {
    console.error('Admin alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts', alerts: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { alertId, status } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('admin_alerts')
      .update({ status: status || 'read' })
      .eq('id', alertId);

    if (error) {
      console.error('Error updating alert:', error);
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update alert error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
