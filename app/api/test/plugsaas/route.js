import { NextResponse } from 'next/server';
import { plugsaas } from '@/lib/plugsaas';

export async function GET() {
  const results = {};
  
  // Test 1: List existing orders and get first order ID
  try {
    console.log('Testing listOrders...');
    const ordersResponse = await plugsaas.listOrders();
    console.log('Raw response keys:', Object.keys(ordersResponse));
    
    // Response structure: { data: [...orders], pagination: {...} }
    const orders = ordersResponse?.data || [];
    
    const firstOrder = orders[0];
    results.listOrders = { 
      success: true, 
      responseKeys: Object.keys(ordersResponse),
      orderCount: orders.length,
      totalOrders: ordersResponse?.pagination?.total || orders.length,
      firstOrderId: firstOrder?._id || firstOrder?.id,
      firstOrderDomain: firstOrder?.domain,
      sampleOrder: firstOrder ? {
        id: firstOrder._id || firstOrder.id,
        domain: firstOrder.domain,
        provider: firstOrder.provider,
        onboardStatus: firstOrder.onboardStatus,
        inboxProviderCount: firstOrder.inboxProviders?.length || 0
      } : null
    };
    console.log('Orders count:', orders.length);
    if (firstOrder) {
      console.log('First order ID:', firstOrder._id || firstOrder.id);
    }
  } catch (error) {
    results.listOrders = { success: false, error: error.message };
    console.error('listOrders error:', error.message);
  }

  return NextResponse.json(results);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    let result;

    switch (action) {
      case 'addOrder':
        console.log('Testing addOrder with data:', JSON.stringify(data, null, 2));
        result = await plugsaas.addOrder(data);
        break;
      
      case 'addInboxProvider':
        console.log('Testing addInboxProvider with data:', JSON.stringify(data, null, 2));
        result = await plugsaas.addInboxProvider(data.orderId, data.provider);
        break;

      case 'getNameservers':
        console.log('Testing getNameservers for order:', data.orderId);
        result = await plugsaas.getNameservers(data.orderId);
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('PlugSaaS test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
    }, { status: 200 }); // Return 200 so we can see the error in response
  }
}
