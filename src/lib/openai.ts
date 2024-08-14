import { Configuration, OpenAIApi } from "openai-edge";
import { getContext } from "@/lib/context";

const config = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(config);

export async function prepareChatResponse(message: string, chatbotId: string): Promise<string> {
  try {
    const context = await getContext(message, chatbotId);

    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in its brain, and is able to accurately answer nearly any question about any topic in conversation.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to a question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicate that new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.`,
    };

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        prompt,
        { role: "user", content: message },
      ],
    });
    const completion = await response.json();

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error during chat response generation:', error);
    throw error;
  }
}
