// src/app/api/calendar-integrations/google/available-slots/route.ts

import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { chatbotId: string } }) {
  return NextResponse.json({ message: 'Test response', chatbotId: params.chatbotId });
}
