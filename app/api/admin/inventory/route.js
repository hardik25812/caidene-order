import { NextResponse } from 'next/server';
import { sheetsInventory } from '@/lib/google-sheets';

export async function GET() {
  try {
    const stats = await sheetsInventory.getStats();
    const inventory = await sheetsInventory.getAllInventory();

    return NextResponse.json({
      stats,
      inventory: inventory.slice(0, 100), // Limit to first 100 for performance
      total: inventory.length,
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch inventory',
        message: error.message,
        stats: { total: 0, available: 0, assigned: 0, reserved: 0, depleted: 0, isLow: true, threshold: 10 },
        inventory: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { accounts } = await request.json();

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json(
        { error: 'Accounts array is required' },
        { status: 400 }
      );
    }

    // Validate accounts have email and password
    const validAccounts = accounts.filter(acc => acc.email && acc.password);
    
    if (validAccounts.length === 0) {
      return NextResponse.json(
        { error: 'No valid accounts found. Each account needs email and password.' },
        { status: 400 }
      );
    }

    const addedCount = await sheetsInventory.addAccounts(validAccounts);

    return NextResponse.json({
      success: true,
      added: addedCount,
      message: `Successfully added ${addedCount} accounts to inventory`,
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to add accounts', message: error.message },
      { status: 500 }
    );
  }
}
