import { Configuration, OpenAIApi } from 'openai-edge';
import { getContext } from '@/lib/context';
import { createGoogleCalendarEvent } from '@/lib/create-google-calendar-event'; // Function to create a Google Calendar event based on chatbotId and customer details

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
      // Create a Google Calendar event and get the booking link
      const { bookingUrl } = await createGoogleCalendarEvent(chatbotId, 'dipuoec@gmmail.com');

      // Return the booking link message
      const appointmentResponse = `It looks like you want to schedule a meeting. You can book an appointment here: ${bookingUrl}`;
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
        Always maintain character and stay respectful, and only answer questions related to sales and support. 
        Current context: ${context}
        The next question to ask: ${questionToAsk}.
        If the customer says something out of context or inappropriate, simply say: "This is beyond my scope, I will connect you with a real human." 
        Add the keyword (realtime) at the end only when you cannot answer the question as it's out of context.
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

    console.log('AI Response:', responseContent);
    return responseContent;
  } catch (error) {
    console.error('Error generating AI chat response:', error);
    throw error;
  }
}
