import axios from 'axios';

export async function trainChatbot(chatbotId: string, trainData: any) {
  try {
    if (Array.isArray(trainData)) {
      throw new Error("trainData should be an object, not an array");
    }

    const response = await axios.post('/api/train', { chatbotId, trainData });
    return response.data;
  } catch (error) {
    console.error("Error in trainChatbot:", error);
    throw error;
  }
}
