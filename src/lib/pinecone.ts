import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter, Document } from "@pinecone-database/doc-splitter";
import { generateEmbeddings } from "./embeddings";
import md5 from "md5";
import { downloadFromS3 } from "./b2-download";

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

export async function loadS3IntoPinecone(fileKey: string, chatbotId: string) {
  try {
    console.log("Downloading file from S3 with key:", fileKey);
    const file_name = await downloadFromS3(fileKey);
    if (!file_name) {
      throw new Error("Could not download from S3");
    }

    console.log("Loading PDF from:", file_name);
    const loader = new PDFLoader(file_name);
    const pages = await loader.load();

    console.log("Splitting and preparing documents from PDF");
    const documents = await Promise.all(pages.map(prepareDocument));

    console.log("Embedding documents");
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    console.log("Connecting to Pinecone and upserting vectors");
    const client = getPineconeClient();
    const pineconeIndex = await client.index("insert-bot");
    const namespace = pineconeIndex.namespace(convertToAscii(chatbotId));

    await namespace.upsert(vectors);
    console.log("Vectors upserted successfully to Pinecone");
  } catch (error) {
    console.error("Error in loadS3IntoPinecone:", error);
    throw error;
  }
}

export async function vectorizeText(textData: string, chatbotId: string): Promise<Document[]> {
  try {
    console.log("Vectorizing text data");
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = [new Document({ pageContent: textData, metadata: { chatbotId } })];
    return await splitter.splitDocuments(docs);
  } catch (error) {
    console.error("Error in vectorizing text data:", error);
    throw error;
  }
}

export async function vectorizeWebsite(websiteData: string, chatbotId: string): Promise<Document[]> {
  try {
    console.log("Vectorizing website data");
    const splitter = new RecursiveCharacterTextSplitter();
    const doc = new Document({ pageContent: websiteData, metadata: { chatbotId } });
    return await splitter.splitDocuments([doc]);
  } catch (error) {
    console.error("Error in vectorizing website data:", error);
    throw error;
  }
}

export async function vectorizeQA(qaData: { question: string, answer: string }[], chatbotId: string): Promise<Document[]> {
  try {
    console.log("Vectorizing Q&A data");
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = qaData.map(qa => new Document({ pageContent: `Q: ${qa.question}\nA: ${qa.answer}`, metadata: { chatbotId } }));
    return await splitter.splitDocuments(docs);
  } catch (error) {
    console.error("Error in vectorizing Q&A data:", error);
    throw error;
  }
}

export async function embedDocument(doc: Document) {
  try {
    console.log("Generating embeddings for document:", doc.pageContent);
    const embeddings = await generateEmbeddings(doc.pageContent);

    // Sanitize metadata to ensure it's compatible with Pinecone
    const sanitizedMetadata = sanitizeMetadata(doc.metadata);

    return {
      id: md5(doc.pageContent),
      values: embeddings,
      metadata: sanitizedMetadata,
    } as PineconeRecord;
  } catch (error) {
    console.error("Error in embedding document:", error);
    throw error;
  }
}

export async function upsertVectors(vectors: PineconeRecord[], chatbotId: string) {
  try {
    console.log("Upserting vectors to Pinecone:", vectors);
    const client = getPineconeClient();
    const pineconeIndex = await client.index("insert-bot");
    const namespace = pineconeIndex.namespace(chatbotId);

    await namespace.upsert(vectors);
    console.log("Vectors successfully upserted to Pinecone");
  } catch (error) {
    console.error("Error in upserting vectors to Pinecone:", error);
    throw error;
  }
}

function sanitizeMetadata(metadata: any): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
      sanitized[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      // If value is an object, serialize it to JSON string
      sanitized[key] = JSON.stringify(value);
    } else {
      console.warn(`Skipping metadata field '${key}' with unsupported value type:`, value);
    }
  }
  return sanitized;
}