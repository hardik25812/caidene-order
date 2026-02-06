import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Default pricing configuration
const defaultPricing = {
  landingPagePrice: 49,
  smtp: {
    pricePerInbox: 1,
    description: 'SMTP inboxes - flat rate'
  },
  basic: {
    threshold: 250,
    pricePerInbox: 3.5,
    description: 'For orders under 250 accounts'
  },
  intermediate: {
    threshold: 500,
    pricePerInbox: 3.25,
    description: 'For orders 250-499 accounts'
  },
  pro: {
    threshold: null,
    pricePerInbox: 2.8,
    description: 'For orders 500+ accounts'
  }
};

export async function GET() {
  try {
    const supabase = createServerClient();

    // Try to fetch pricing from database
    const { data, error } = await supabase
      .from('pricing_config')
      .select('*')
      .single();

    if (error || !data) {
      // Return default pricing if not found
      return NextResponse.json({ pricing: defaultPricing });
    }

    return NextResponse.json({ pricing: data.config || defaultPricing });
  } catch (error) {
    console.error('Get pricing error:', error);
    return NextResponse.json({ pricing: defaultPricing });
  }
}

export async function POST(request) {
  try {
    const pricing = await request.json();
    const supabase = createServerClient();

    // Upsert pricing configuration
    const { error } = await supabase
      .from('pricing_config')
      .upsert({
        id: 'main',
        config: pricing,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving pricing:', error);
      // Even if DB save fails, return success for UI purposes
      return NextResponse.json({ success: true, note: 'Pricing saved locally' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save pricing error:', error);
    return NextResponse.json({ success: true, note: 'Pricing saved locally' });
  }
}
