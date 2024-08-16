// src/app/api/fetch-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ content: '', message: 'URL is required.' }, { status: 400 });
    }

    // Launch the browser in headless mode
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url);

    // Extract text content from the page
    const content = await page.evaluate(() => {
      return document.body.innerText;
    });

    await browser.close();

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ content: '', message: 'Error fetching content.' }, { status: 500 });
  }
}
