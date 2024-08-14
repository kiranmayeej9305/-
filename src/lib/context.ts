import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  chatbotId: string
) {
  try {
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = await client.index("insert-bot");
    const namespace = pineconeIndex.namespace(convertToAscii(chatbotId));
    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, chatbotId: string) {
  if (!chatbotId) {
    throw new Error("Chatbot ID is required");
  }

  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, chatbotId);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );
  console.log(qualifyingDocs);
  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  return docs.join("\n").substring(0, 3000);
}
