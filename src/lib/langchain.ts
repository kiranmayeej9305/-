// lib/langchain.ts
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";

// Existing function to load and split PDF documents
export async function loadAndSplitPDF(filePath: string): Promise<Document[]> {
  const loader = new PDFLoader(filePath);
  const pages = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter();
  return await splitter.splitDocuments(
    pages.map(
      (page) =>
        new Document({
          pageContent: page.pageContent,
          metadata: page.metadata,
        })
    )
  );
}

// Function to vectorize plain text data
export async function vectorizeText(textData: string[]): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter();

  const docs = textData.map(text => new Document({
    pageContent: text,
    metadata: {}
  }));

  return await splitter.splitDocuments(docs);
}

// Function to vectorize website data
export async function vectorizeWebsite(websiteData: string): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter();

  const doc = new Document({
    pageContent: websiteData,
    metadata: {}
  });

  return await splitter.splitDocuments([doc]);
}

// Function to vectorize Q&A data
export async function vectorizeQA(qaData: { question: string, answer: string }[]): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter();

  const docs = qaData.map(qa => new Document({
    pageContent: `Q: ${qa.question}\nA: ${qa.answer}`,
    metadata: {}
  }));

  return await splitter.splitDocuments(docs);
}
