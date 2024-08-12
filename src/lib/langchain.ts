// lib/langchain.ts
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";

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
