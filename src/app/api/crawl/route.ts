// src/app/api/crawl/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { crawlWebsite, crawlSitemap } from '@/lib/playwrightCrawler';

const DEFAULT_DEPTH = 2; // Default depth level

export async function POST(req: NextRequest) {
  try {
    const { url, type, depth = DEFAULT_DEPTH } = await req.json();

    if (!url || !type) {
      return NextResponse.json({ message: 'URL, type, and depth are required.' }, { status: 400 });
    }

    let links: string[] = [];
    if (type === 'website') {
      links = await crawlWebsite(url, depth);
    } else if (type === 'sitemap') {
      links = await crawlSitemap(url);
    }

    if (links.length === 0) {
      return NextResponse.json({ message: 'No links found.' }, { status: 400 });
    }

    return NextResponse.json({ links }, { status: 200 });
  } catch (error) {
    console.error('Error during crawling:', error);
    return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
  }
}
