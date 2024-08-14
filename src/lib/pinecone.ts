import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter, Document } from "@pinecone-database/doc-splitter";
import { generateEmbeddings } from "./embedding";
import md5 from "md5";

export const getPineconeClient = () => {
  return new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

export async function loadS3IntoPinecone(fileKey: string) {
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
    const pineconeIndex = await client.index("chatpdf");
    const namespace = pineconeIndex.namespace(md5(fileKey));

    await namespace.upsert(vectors);
    console.log("Vectors upserted successfully to Pinecone");
  } catch (error) {
    console.error("Error in loadS3IntoPinecone:", error);
    throw error;
  }
}

export async function vectorizeText(textData: string): Promise<Document[]> {
  try {
    console.log("Vectorizing text data");
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = [new Document({ pageContent: textData, metadata: {} })];
    return await splitter.splitDocuments(docs);
  } catch (error) {
    console.error("Error in vectorizing text data:", error);
    throw error;
  }
}

export async function vectorizeWebsite(websiteData: string): Promise<Document[]> {
  try {
    console.log("Vectorizing website data");
    const splitter = new RecursiveCharacterTextSplitter();
    const doc = new Document({ pageContent: websiteData, metadata: {} });
    return await splitter.splitDocuments([doc]);
  } catch (error) {
    console.error("Error in vectorizing website data:", error);
    throw error;
  }
}

export async function vectorizeQA(qaData: { question: string, answer: string }[]): Promise<Document[]> {
  try {
    console.log("Vectorizing Q&A data");
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = qaData.map(qa => new Document({ pageContent: `Q: ${qa.question}\nA: ${qa.answer}`, metadata: {} }));
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
    return {
      id: md5(doc.pageContent),
      values: embeddings,
      metadata: doc.metadata,
    } as PineconeRecord;
  } catch (error) {
    console.error("Error in embedding document:", error);
    throw error;
  }
}

// Example function for upserting vectors into Pinecone (already in the API route)
export async function upsertVectors(vectors: PineconeRecord[], chatbotId: string) {
  try {
    console.log("Upserting vectors to Pinecone:", vectors);
    const client = getPineconeClient();
    const pineconeIndex = await client.index("chatpdf");
    const namespace = pineconeIndex.namespace(chatbotId);
    await namespace.upsert(vectors);
    console.log("Vectors successfully upserted to Pinecone");
  } catch (error) {
    console.error("Error in upserting vectors to Pinecone:", error);
    throw error;
  }
}
