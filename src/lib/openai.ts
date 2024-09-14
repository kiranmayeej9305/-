import { Configuration, OpenAIApi } from 'openai-edge';
import { getContext } from '@/lib/context';

const config = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(config);

export async function prepareChatResponse(
  message: string,
  nextQuestion: string | null,
  chatbotId: string,
): Promise<string> {
  try {
    // Get the conversation context
    const context = await getContext(message, chatbotId); 

    // Check if the user is asking for booking an appointment
    const appointmentKeywords = ['book appointment', 'schedule meeting', 'meeting', 'appointment'];
    const isAppointmentRequest = appointmentKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );

    if (isAppointmentRequest) {
      // Provide the public-facing AvailableSlots component URL
      const availableSlotsUrl = `${process.env.NEXT_PUBLIC_URL}public/available-slots?chatbotId=${chatbotId}`;
      
      // Respond with the available slots link
      const appointmentResponse = `It looks like you want to schedule a meeting. You can view available slots and book an appointment here: ${availableSlotsUrl}`;
      return appointmentResponse;
    }

    // Determine the next question or default to a normal conversation
    const questionToAsk = nextQuestion
      ? `${nextQuestion}`
      : 'There are no unanswered questions. You may proceed with normal conversation.';

    // Construct the system prompt with context and the next question
    const prompt = {
      role: 'assistant',
      content: `
        You are a customer support assistant for a chatbot service. 
        Your task is to ask the customer any remaining questions from a pre-defined array of questions, one at a time. 
        If all questions are answered, continue assisting the customer naturally.
           Always maintain character and stay respectfull and answer related to sales and support. 
        please don't answer anything beyond sales and support.
        Current context: ${context}
        The next question to ask: ${questionToAsk}.
         If the customer says something out of context or inapporpriate. Simply say this is beyond you and you will get a real human to continue the conversation. And add a keyword (realtime) at the end.
        Please include (realtime) only when you cannot answer the question as its out of conext not for in context question.Its important.
      `,
    };

    // Call OpenAI's API with the prompt and user's message
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        prompt,
        { role: 'user', content: message },
      ],
    });

    const completion = await response.json();
    const responseContent = completion.choices[0].message.content.trim();
    return responseContent;
  } catch (error) {
    console.error('Error generating AI chat response:', error);
    throw error;
  }
}
