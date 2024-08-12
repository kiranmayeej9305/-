// lib/pinecone.ts
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";

export const getPineconeClient = () => {
  return new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

export async function upsertVectors(vectors: PineconeRecord[], namespace: string) {
  const client = getPineconeClient();
  const pineconeIndex = await client.index("chatpdf");
  const ns = pineconeIndex.namespace(namespace);
  await ns.upsert(vectors);
}

export async function queryVectors(embedding: number[], namespace: string) {
  const client = getPineconeClient();
  const pineconeIndex = await client.index("chatpdf");
  const ns = pineconeIndex.namespace(namespace);

  return await ns.query({
    topK: 5,
    vector: embedding,
    includeMetadata: true,
  });
}
