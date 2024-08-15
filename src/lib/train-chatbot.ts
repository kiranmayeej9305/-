import axios from 'axios';

export async function trainChatbot(chatbotId: string, trainData: any) {
  try {
    if (Array.isArray(trainData)) {
      throw new Error("trainData should be an object, not an array");
    }

    // Logging the data before sending
    console.log("Sending data to /api/train:", { chatbotId, trainData });

    const response = await axios.post('/api/train', { chatbotId, trainData });

    // Log the response from the server
    console.log("Response from /api/train:", response.data);

    return response.data;
  } catch (error) {
    // Log detailed error information
    console.error("Error in trainChatbot:", {
      message: error.message,
      config: error.config,
      request: error.request,
      response: error.response ? error.response.data : null,
    });
    throw error;
  }
}
