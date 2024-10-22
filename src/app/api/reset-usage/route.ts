// File: /app/api/reset-usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { resetUsageForAllAccounts } from '@/lib/queries'; // Import your reset function

export async function POST(req: NextRequest) {
  try {
    const { features } = await req.json(); // Parse JSON from the request body

    if (!features || !Array.isArray(features)) {
      return NextResponse.json({ error: 'Feature identifiers are required.' }, { status: 400 });
    }

    // Reset usage for all accounts for the specified features
    await resetUsageForAllAccounts(features);

    return NextResponse.json({ message: 'Usage reset successfully for specified features' }, { status: 200 });
  } catch (error) {
    console.error('Error resetting usage:', error);
    return NextResponse.json({ error: 'Failed to reset usage' }, { status: 500 });
  }
}
