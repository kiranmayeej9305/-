const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.aIModel.createMany({
    data: [
      {
        id: '1',
        name: 'gpt-4o',
        provider: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/gpt-4',
        description: 'Advanced model from OpenAI capable of generating human-like text.',
      },
      {
        id: '2',
        name: 'gpt-4o-mini',
        provider: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/gpt-4',
        description: 'Advanced model from OpenAI capable of generating human-like text.',
      },
      {
        id: '3',
        name: 'gpt-4-turbo',
        provider: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/gpt-4',
        description: 'Advanced model from OpenAI capable of generating human-like text.',
      },
      {
        id: '4',
        name: 'gpt-4',
        provider: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/gpt-4',
        description: 'Advanced model from OpenAI capable of generating human-like text.',
      },
      {
        id: '5',
        name: 'gpt-3.5-turbo',
        provider: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/gpt-4',
        description: 'Advanced model from OpenAI capable of generating human-like text.',
      },
      {
        id: '6',
        name: 'BERT',
        provider: 'Google',
        apiUrl: 'https://api.google.com/v1/bert',
        description: 'Model from Google designed for natural language understanding.',
      },
      {
        id: '7',
        name: 'RoBERTa',
        provider: 'Meta',
        apiUrl: 'https://api.meta.com/v1/roberta',
        description: 'Optimized version of BERT from Meta for better performance on various NLP tasks.',
      },
      {
        id: '8',
        name: 'T5',
        provider: 'Google',
        apiUrl: 'https://api.google.com/v1/t5',
        description: 'Text-to-Text Transfer Transformer model from Google.',
      },
      {
        id: '9',
        name: 'XLNet',
        provider: 'Google',
        apiUrl: 'https://api.google.com/v1/xlnet',
        description: 'Model from Google that outperforms BERT on several benchmarks.',
      },
    ],
  });

  await prisma.chatbotType.createMany({
    data: [
      {
        id: '1',
        name: 'Sales Agent',
        defaultPrompts: 'You are a sales agent. Your goal is to assist customers with their purchases.',
        description: 'A chatbot type designed to assist users in making purchasing decisions.',
      },
      {
        id: '2',
        name: 'Life Coach',
        defaultPrompts: 'You are a life coach. Your goal is to provide advice and support to users.',
        description: 'A chatbot type designed to offer advice and support on various life topics.',
      },
      {
        id: '3',
        name: 'Travel Planner',
        defaultPrompts: 'You are a travel planner. Your goal is to help users plan their trips.',
        description: 'A chatbot type designed to assist users in planning their travels.',
      },
      {
        id: '4',
        name: 'Customer Support Agent',
        defaultPrompts: 'You are a customer support agent. Your goal is to assist users with their inquiries.',
        description: 'A chatbot type designed to provide customer support and handle inquiries.',
      },
      {
        id: '5',
        name: 'Technical Support',
        defaultPrompts: 'You are a technical support agent. Your goal is to assist users with technical issues.',
        description: 'A chatbot type designed to assist users with technical problems and troubleshooting.',
      },
      {
        id: '6',
        name: 'AI Bot',
        defaultPrompts: 'Primary Function: You are an AI chatbot who helps users with their inquiries, issues and requests. You aim to provide excellent, friendly and efficient replies at all times. Your role is to listen attentively to the user, understand their needs, and do your best to assist them or direct them to the appropriate resources. If a question is not clear, ask clarifying questions. Make sure to end your replies with a positive note.',
        description: 'A chatbot type designed to assist users with technical problems and troubleshooting.',
      },
      {
        id: '7',
        name: 'Custom',
        defaultPrompts: 'You are an AI chatbot who helps users with their inquiries, issues and requests. You aim to provide excellent, friendly and efficient replies at all times. Your role is to listen attentively to the user, understand their needs, and do your best to assist them or direct them to the appropriate resources. If a question is not clear, ask clarifying questions. Make sure to end your replies with a positive note.',
        description: 'A chatbot type designed to assist users with technical problems and troubleshooting.',
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
