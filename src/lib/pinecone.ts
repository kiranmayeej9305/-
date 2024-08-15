import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-download";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { generateEmbeddings } from "./embeddings";
import stream from "stream";
import fs from "fs";

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

export async function loadS3IntoPinecone(fileKey: string, chatbotId: string, fileType: string) {
  try {
    console.log(`Downloading file from S3 with key: ${fileKey}`);
    const file_name = await downloadFromS3(fileKey, fileType);
    console.log("File downloaded successfully:", file_name);

    let documents: Document[];

    if (fileType === 'pdf') {
      const loader = new PDFLoader(file_name);
      const pages = await loader.load();
      console.log("PDF loaded successfully. Number of pages:", pages.length);

      documents = await Promise.all(pages.map(prepareDocument));
      console.log("Documents prepared. Number of documents:", documents.length);
    } else if (fileType === 'json') {
      const jsonString = await streamToString(fs.createReadStream(file_name));
      const jsonData = JSON.parse(jsonString);

      documents = await processJsonData(jsonData);
    } else {
      throw new Error("Unsupported file type");
    }

    const vectors = await Promise.all(documents.flat().map(embedDocument));

    if (vectors.length === 0) {
      throw new Error("No vectors were generated from the provided document.");
    }
    console.log("Vectors generated successfully. Number of vectors:", vectors.length);

    await upsertVectors(vectors, chatbotId);
    console.log("Vectors upserted successfully to Pinecone.");
  } catch (error) {
    console.error("Error in loadS3IntoPinecone:", error);
    throw error;
  }
}

export async function embedDocument(doc: Document): Promise<PineconeRecord> {
  try {
    if (!doc || !doc.pageContent) {
      console.error('Document or page content is empty:', doc);
      throw new Error('Document or page content is empty.');
    }

    console.log('Generating embeddings for document content:', doc.pageContent);
    const embeddings = await generateEmbeddings(doc.pageContent);

    if (!embeddings || embeddings.length === 0) {
      console.error('No embeddings generated for the document:', doc);
      throw new Error('No embeddings generated for the document.');
    }

    const sanitizedMetadata = sanitizeMetadata(doc.metadata);

    return {
      id: md5(doc.pageContent),
      values: embeddings,
      metadata: sanitizedMetadata,
    } as PineconeRecord;
  } catch (error) {
    console.error('Error in embedding document:', error);
    throw error;
  }
}

async function processJsonData(jsonData: any) {
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent: JSON.stringify(jsonData),
      metadata: { source: "json" },
    }),
  ]);
  return docs;
}

function sanitizeMetadata(metadata: any): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
      sanitized[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = JSON.stringify(value);
    } else {
      console.warn(`Skipping metadata field '${key}' with unsupported value type:`, value);
    }
  }
  return sanitized;
}

export async function upsertVectors(vectors: PineconeRecord[], chatbotId: string) {
  try {
    if (vectors.length === 0) {
      throw new Error("No vectors provided for upsert.");
    }

    const client = getPineconeClient();
    const pineconeIndex = await client.index("insert-bot");
    const namespace = pineconeIndex.namespace(chatbotId);

    await namespace.upsert(vectors);
    console.log("Vectors successfully upserted to Pinecone.");
  } catch (error) {
    console.error("Error upserting vectors to Pinecone:", error);
    throw error;
  }
}

function streamToString(stream: stream.Readable): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", (err) => reject(err));
  });
}

async function prepareDocument(page: Document) {
  const { pageContent, metadata } = page;

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent: pageContent.replace(/\n/g, ""),
      metadata: { pageNumber: metadata.loc.pageNumber, text: pageContent },
    }),
  ]);

  return docs;
}

export async function vectorizeText(textData: string, chatbotId: string): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = [new Document({ pageContent: textData, metadata: { chatbotId } })];
  return await splitter.splitDocuments(docs);
}