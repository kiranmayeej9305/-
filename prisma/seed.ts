const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const featuresData = [
    {
      name: '20 message credits/month',
      description: 'Receive 20 message credits every month.',
    },
    {
      name: '1 chatbot',
      description: 'Create and manage 1 chatbot.',
    },
    {
      name: '400,000 characters/chatbot',
      description: 'Each chatbot can have up to 400,000 characters.',
    },
    {
      name: '1 team member',
      description: 'Add 1 team member to your account.',
    },
    {
      name: 'Limit to 10 links to train on',
      description: 'Train your chatbot with up to 10 links.',
    },
    {
      name: 'Unlimited links to train on',
      description: 'Train your chatbot with unlimited links.',
    },
    {
      name: 'Embed on unlimited websites',
      description: 'You can embed your chatbot on any number of websites.',
    },
    {
      name: 'Capture leads',
      description: 'Collect user information for lead generation.',
    },
    {
      name: 'View chat history',
      description: 'Access the chat history between users and chatbots.',
    },
    {
      name: 'GPT-4o',
      description: 'Access to the GPT-4o model.',
    },
    {
      name: '2,000 message credits/month',
      description: 'Receive 2,000 message credits every month.',
    },
    {
      name: '2 chatbots',
      description: 'Create and manage 2 chatbots.',
    },
    {
      name: '11,000,000 characters/chatbot',
      description: 'Each chatbot can have up to 11,000,000 characters.',
    },
    {
      name: 'API access',
      description: 'Access the chatbot via API.',
    },
    {
      name: 'Integrations',
      description: 'Integrate with third-party services.',
    },
    {
      name: 'Basic Analytics',
      description: 'Access to basic analytics features.',
    },
    {
      name: '10,000 message credits/month',
      description: 'Receive 10,000 message credits every month.',
    },
    {
      name: '5 chatbots',
      description: 'Create and manage 5 chatbots.',
    },
    {
      name: '3 team members',
      description: 'Add up to 3 team members to your account.',
    },
    {
      name: 'Option to choose GPT-4 and GPT-4-Turbo',
      description: 'Choose between GPT-4 and GPT-4-Turbo models.',
    },
    {
      name: '40,000 message credits/month included',
      description: 'Receive 40,000 message credits every month. Messages over the limit will use your OpenAI API Key.',
    },
    {
      name: '10 chatbots',
      description: 'Create and manage 10 chatbots.',
    },
    {
      name: '5 team members',
      description: 'Add up to 5 team members to your account.',
    },
    {
      name: "Remove 'Powered by Chatbase'",
      description: "Remove the 'Powered by Chatbase' branding.",
    },
    {
      name: 'Use your own custom domains',
      description: 'Host chatbots on your own custom domains.',
    },
    {
      name: 'Advanced Analytics',
      description: 'Access to advanced analytics features.',
    },
    {
      name: 'Chatbots get deleted after 14 days of inactivity on the free plan.',
      description: 'Inactive chatbots will be deleted after 14 days.',
    },
  ];

  // Create features in the database
  for (const feature of featuresData) {
    await prisma.feature.create({
      data: {
        name: feature.name,
        description: feature.description,
        displayInUI: true,
      },
    });
  }

  // Fetch all created features to get their IDs
  const allFeatures = await prisma.feature.findMany();

  // Helper function to get feature IDs by name
  const getFeatureIdByName = (name) =>
    allFeatures.find((f) => f.name === name)?.id;

  // Create Plans with all details and Stripe price IDs, with quantifiable and unlimited features
  const freePlan = await prisma.plan.create({
    data: {
      name: 'Free',
      description: 'Forever free plan with basic features.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      stripeMonthlyPriceId: null, // Free plan doesn't require Stripe price IDs
      stripeYearlyPriceId: null,
      features: {
        create: [
          { featureId: getFeatureIdByName('20 message credits/month'), value: 20 },
          { featureId: getFeatureIdByName('1 chatbot'), value: 1 },
          { featureId: getFeatureIdByName('400,000 characters/chatbot'), value: 400000 },
          { featureId: getFeatureIdByName('1 team member'), value: 1 },
          { featureId: getFeatureIdByName('Limit to 10 links to train on'), value: 10 },
          { featureId: getFeatureIdByName('Embed on unlimited websites'), value: null }, // Unlimited
          { featureId: getFeatureIdByName('Capture leads'), value: null }, // Unlimited
        ],
      },
    },
  });

  const hobbyPlan = await prisma.plan.create({
    data: {
      name: 'Hobby',
      description: 'For hobbyists who need more features.',
      monthlyPrice: 1900, // $19.00 in cents
      yearlyPrice: 19900, // $199.00 in cents
      stripeMonthlyPriceId: 'price_1PGDITCVtIA4fkI2sApcxiYo',
      stripeYearlyPriceId: 'price_1PIGkNCVtIA4fkI2VrRj5qnH',
      features: {
        create: [
          { featureId: getFeatureIdByName('2,000 message credits/month'), value: 2000 },
          { featureId: getFeatureIdByName('2 chatbots'), value: 2 },
          { featureId: getFeatureIdByName('11,000,000 characters/chatbot'), value: 11000000 },
          { featureId: getFeatureIdByName('Unlimited links to train on'), value: null }, // Unlimited
          { featureId: getFeatureIdByName('API access'), value: null }, // Unlimited
          { featureId: getFeatureIdByName('Integrations'), value: null }, // Unlimited
          { featureId: getFeatureIdByName('Basic Analytics'), value: null }, // Unlimited
        ],
      },
    },
  });

  const standardPlan = await prisma.plan.create({
    data: {
      name: 'Standard',
      description: 'For small businesses needing advanced features.',
      monthlyPrice: 9900, // $99.00 in cents
      yearlyPrice: 99900, // $999.00 in cents
      stripeMonthlyPriceId: 'price_1PIGjrCVtIA4fkI2LyvHLMx0',
      stripeYearlyPriceId: 'price_1PIGjrCVtIA4fkI2LyvHLMx0',
      features: {
        create: [
          { featureId: getFeatureIdByName('10,000 message credits/month'), value: 10000 },
          { featureId: getFeatureIdByName('5 chatbots'), value: 5 },
          { featureId: getFeatureIdByName('3 team members'), value: 3 },
          { featureId: getFeatureIdByName('Option to choose GPT-4 and GPT-4-Turbo'), value: null },
        ],
      },
    },
  });

  const unlimitedPlan = await prisma.plan.create({
    data: {
      name: 'Unlimited',
      description: 'For enterprises needing unlimited access.',
      monthlyPrice: 39900, // $399.00 in cents
      yearlyPrice: 399900, // $3,999.00 in cents
      stripeMonthlyPriceId: 'price_1PGDJZCVtIA4fkI2V8ufr2Hd',
      stripeYearlyPriceId: 'price_1PIGjPCVtIA4fkI2I9z76rke',
      features: {
        create: [
          { featureId: getFeatureIdByName('40,000 message credits/month included'), value: 40000 },
          { featureId: getFeatureIdByName('10 chatbots'), value: 10 },
          { featureId: getFeatureIdByName('5 team members'), value: 5 },
          { featureId: getFeatureIdByName("Remove 'Powered by Chatbase'"), value: null }, // Unlimited
          { featureId: getFeatureIdByName('Use your own custom domains'), value: null }, // Unlimited
          { featureId: getFeatureIdByName('Advanced Analytics'), value: null }, // Unlimited
        ],
      },
    },
  });

  await prisma.accountSidebarOption.createMany({
    data: [
      {
        id: '4d3e8f3d-0a6f-4a58-b9a4-fd5e2b1f3f80',
        name: 'Analytics & Usage',
        link: `/account/{accountId}/analytics`,
        icon: 'chart',
        parentId: null,
        isSubmenu: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'f5a1b0c4-5e9d-4b9d-b3fa-3e7d5d123a1e',
        name: 'Chatbots',
        link: `/account/{accountId}`,
        icon: 'person',
        parentId: null,
        isSubmenu: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '8bdbd1e3-f8c2-4d67-a3e8-fd8b19b8cfe0',
        name: 'Settings',
        link: `/account/{accountId}/settings`,
        icon: 'settings',
        parentId: null,
        isSubmenu: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cbe5d5e4-6c0b-4f12-8f6d-cd5b1f3d5f80',
        name: 'Team',
        link: `/account/{accountId}/team`,
        icon: 'shield',
        parentId: null,
        isSubmenu: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'a1b8d5c2-8d4e-49b5-8d7d-f2e7c8b4f3f0',
        name: 'Billing',
        link: `/account/{accountId}/billing`,
        icon: 'wallet',
        parentId: null,
        isSubmenu: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });
  await prisma.chatbotSidebarOption.createMany({
    data: [
      {
        id: '49efe59f-1b4a-4b4b-bdfa-48457a63c482',
        name: 'Analytics & Usage',
        link: '/chatbot/{chatbotId}/analytics',
        icon: 'chart',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        isSubmenu: false,
      },
      {
        id: '59efe59f-1b4a-4b4b-bdfa-48457a63c483',
        name: 'Settings',
        link: '/chatbot/{chatbotId}/settings',
        icon: 'settings',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        isSubmenu: false,
      },
      {
        id: '69efe59f-1b4a-4b4b-bdfa-48457a63c484',
        name: 'Training',
        link: '/chatbot/{chatbotId}/training',
        icon: 'clipboardIcon',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        isSubmenu: false,
      },
      {
        id: '79efe59f-1b4a-4b4b-bdfa-48457a63c485',
        name: 'Integration',
        link: '/chatbot/{chatbotId}/integration',
        icon: 'link',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        isSubmenu: false,
      },
      {
        id: '89efe59f-1b4a-4b4b-bdfa-48457a63c486',
        name: 'Conversations',
        link: '/chatbot/{chatbotId}/conversations',
        icon: 'messages',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        isSubmenu: false,
      },
      {
        id: '99efe59f-1b4a-4b4b-bdfa-48457a63c487',
        name: 'CRM & Leads',
        link: '/chatbot/{chatbotId}/crm-leads',
        icon: 'person',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        isSubmenu: false,
      },
      {
        id: 'a9efe59f-1b4a-4b4b-bdfa-48457a63c488',
        name: 'Support',
        link: '/chatbot/{chatbotId}/support',
        icon: 'headphone',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        isSubmenu: false,
      },
      {
        id: 'b9efe59f-1b4a-4b4b-bdfa-48457a63c489',
        name: 'Connect',
        link: '/chatbot/{chatbotId}/connect',
        icon: 'power',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        parentId: '79efe59f-1b4a-4b4b-bdfa-48457a63c485',
        isSubmenu: true,
      },
      {
        id: 'c9efe59f-1b4a-4b4b-bdfa-48457a63c490',
        name: 'Embed',
        link: '/chatbot/{chatbotId}/embed',
        icon: 'database',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        parentId: '79efe59f-1b4a-4b4b-bdfa-48457a63c485',
        isSubmenu: true,
      },
      {
        id: 'e9efe59f-1b4a-4b4b-bdfa-48457a63c492',
        name: 'AI Settings',
        link: '/chatbot/{chatbotId}/ai-settings',
        icon: 'compass',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        parentId: '59efe59f-1b4a-4b4b-bdfa-48457a63c483',
        isSubmenu: true,
      },
      {
        id: 'f9efe59f-1b4a-4b4b-bdfa-48457a63c493',
        name: 'Chatbot Settings',
        link: '/chatbot/{chatbotId}/chatbot-settings',
        icon: 'tune',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        parentId: '59efe59f-1b4a-4b4b-bdfa-48457a63c483',
        isSubmenu: true,
      },
      {
        id: 'g9efe59f-1b4a-4b4b-bdfa-48457a63c494',
        name: 'Calendar',
        link: '/chatbot/{chatbotId}/calendar',
        icon: 'calendar',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        parentId: '99efe59f-1b4a-4b4b-bdfa-48457a63c487',
        isSubmenu: true,
      },
      {
        id: 'h9efe59f-1b4a-4b4b-bdfa-48457a63c495',
        name: 'Campaign',
        link: '/chatbot/{chatbotId}/campaign',
        icon: 'flag',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        parentId: '99efe59f-1b4a-4b4b-bdfa-48457a63c487',
        isSubmenu: true,
      },
      {
        id: 'i9efe59f-1b4a-4b4b-bdfa-48457a63c496',
        name: 'Leads',
        link: '/chatbot/{chatbotId}/leads',
        icon: 'star',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        parentId: '99efe59f-1b4a-4b4b-bdfa-48457a63c487',
        isSubmenu: true,
      },
      {
        id: '2dd053f0-ffe5-475d-b68c-f4d9c7e3adac',
        name: 'Playground',
        link: '/chatbot/{chatbotId}/playground',
        icon: 'chip',
        createdAt: new Date('2024-08-18 03:08:34.485'),
        updatedAt: new Date('2024-08-18 03:08:34.485'),
        isSubmenu: false,
      },
      {
        id: 'd9efe59f-1b4a-4b4b-bdfa-48457a63c491',
        name: 'Chat Interface',
        link: '/chatbot/{chatbotId}/interface',
        icon: 'videorecorder',
        createdAt: new Date('2024-08-17 19:27:32.19'),
        updatedAt: new Date('2024-08-17 19:27:32.19'),
        parentId: '59efe59f-1b4a-4b4b-bdfa-48457a63c483',
        isSubmenu: true,
      },
    ],
  });
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
