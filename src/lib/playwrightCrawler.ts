// utils/playwrightCrawler.ts
import { chromium } from 'playwright';

export async function crawlWebsite(url: string, depth: number): Promise<string[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  let links = new Set<string>();
  await recursiveCrawl(page, url, depth, 0, links);

  await browser.close();
  return Array.from(links);
}

async function recursiveCrawl(page, url: string, maxDepth: number, currentDepth: number, links: Set<string>) {
  if (currentDepth > maxDepth) return;

  const newLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(anchor => anchor.href);
  });

  newLinks.forEach(link => links.add(link));

  for (const link of newLinks) {
    if (!links.has(link)) {
      await page.goto(link);
      await recursiveCrawl(page, link, maxDepth, currentDepth + 1, links);
    }
  }
}

export async function crawlSitemap(sitemapUrl: string): Promise<string[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(sitemapUrl);

  // Assuming the sitemap is in XML, extract the URLs
  const urls = await page.evaluate(() => {
    const locs = Array.from(document.querySelectorAll('loc'));
    return locs.map(loc => loc.textContent || '');
  });

  await browser.close();
  return urls;
}
