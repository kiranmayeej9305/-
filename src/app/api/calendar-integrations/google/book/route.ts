// src/app/api/calendar-integrations/google/book/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Test response' });
}
