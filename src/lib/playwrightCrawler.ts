import { chromium } from 'playwright';

export async function crawlWebsite(url: string, depth: number): Promise<{ url: string, charCount: number }[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  let links = new Set<string>();
  await recursiveCrawl(page, url, depth, 0, links);

  const result = [];

  for (const link of Array.from(links)) {
    const content = await fetchContent(link, browser);
    result.push({ url: link, charCount: content.length });
  }

  await browser.close();
  return result;
}

export async function extractContentFromPages(links: string[]): Promise<{ link: string, content: string }[]> {
  const contentList: { link: string, content: string }[] = [];

  for (const link of links) {
    const content = await fetchContent(link);
    contentList.push({ link, content });
  }

  return contentList;
}

async function fetchContent(url: string, browser?): Promise<string> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }

  const page = await browser.newPage();
  await page.goto(url);

  const content = await page.evaluate(() => {
    return document.body.innerText; // Extract text content only
  });

  await page.close();

  if (!browser.isConnected()) {
    await browser.close();
  }

  return content;
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

export async function crawlSitemap(sitemapUrl: string): Promise<{ url: string, charCount: number }[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(sitemapUrl);

  const urls = await page.evaluate(() => {
    const locs = Array.from(document.querySelectorAll('loc'));
    return locs.map(loc => loc.textContent || '');
  });

  const result = [];

  for (const url of urls) {
    const content = await fetchContent(url, browser);
    result.push({ url, charCount: content.length });
  }

  await browser.close();
  return result;
}
