// File: /app/api/reset-usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { resetUsageForAllAccounts } from '@/lib/queries'; // Import your reset function

export async function GET(req: Request, { params }: { params: { chatbotId: string } }) {
  return NextResponse.json({ message: 'Test response', chatbotId: params.chatbotId });
}
