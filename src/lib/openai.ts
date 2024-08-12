// lib/openai.ts
'use server';

import OpenAi from 'openai';

const openai = new OpenAi({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function prepareChatResponse(prompt: string): Promise<string> {
    const aiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      return aiResponse.choices[0].message?.content?.trim();
}
