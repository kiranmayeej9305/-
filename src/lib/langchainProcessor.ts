// utils/langchainProcessor.ts
import { RecursiveCharacterTextSplitter, Document } from '@pinecone-database/doc-splitter';
import { generateEmbeddings } from './embeddings'; // Assume you have this utility
import { chromium } from 'playwright';

export async function extractContentFromPages(links: string[]): Promise<{ link: string, content: string }[]> {
  const contentList: { link: string, content: string }[] = [];

  for (const link of links) {
    const content = await fetchContent(link);
    contentList.push({ link, content });
  }

  return contentList;
}

async function fetchContent(url: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const content = await page.content(); // Get the full HTML content
  await browser.close();
  return content;
}

export async function processContent(contentList: { link: string, content: string }[]): Promise<Document[]> {
  const documents: Document[] = [];
  const splitter = new RecursiveCharacterTextSplitter();

  for (const { content, link } of contentList) {
    const doc = new Document({ pageContent: content, metadata: { source: link } });
    const splitDocs = await splitter.splitDocuments([doc]);
    documents.push(...splitDocs);
  }

  return documents;
}
