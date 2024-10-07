const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const featuresData = [
    {
      name: 'Message Credits',
      description: 'Provides a limit for message credits.',
      identifier: 'message_credits',
      type: 'account',
    },
    {
      name: 'Chatbots',
      description: 'Allows managing multiple chatbots.',
      identifier: 'chatbots',
      type: 'account',
    },
    {
      name: 'Characters Per Chatbot',
      description: 'Defines characters limit per chatbot.',
      identifier: 'characters_per_chatbot',
      type: 'chatbot',
    },
    {
      name: 'Team Members',
      description: 'Allows adding team members.',
      identifier: 'team_members',
      type: 'account',
    },
    {
      name: 'Links for Training',
      description: 'Limit for chatbot training links.',
      identifier: 'links_for_training',
      type: 'chatbot',
    },
    {
      name: 'Unlimited Embedding',
      description: 'Ability to embed on multiple websites.',
      identifier: 'unlimited_embedding',
      type: 'account',
    },
    {
      name: 'Leads Capture',
      description: 'Capture leads from users.',
      identifier: 'leads_capture',
      type: 'chatbot',
    },
    {
      name: 'Chat History',
      description: 'Access to chat history.',
      identifier: 'chat_history',
      type: 'chatbot',
    },
    {
      name: 'API Access',
      description: 'Access the chatbot via API.',
      identifier: 'api_access',
      type: 'account',
    },
    {
      name: 'Analytics',
      description: 'Access to chatbot analytics.',
      identifier: 'analytics',
      type: 'chatbot',
    },
    {
      name: 'Remove "Powered by InsertBot"',
      description: 'Remove the "Powered by InsertBot" branding.',
      identifier: 'remove_powered_by_InsertBot',
      type: 'account',
    },
    {
      name: 'Use Your Own Custom Domains',
      description: 'Host chatbots on your own custom domains.',
      identifier: 'custom_domains',
      type: 'account',
    },
    {
      name: 'Advanced Analytics',
      description: 'Access to advanced analytics features.',
      identifier: 'advanced_analytics',
      type: 'chatbot',
    },
  ];

  // Insert Feature data
  for (const feature of featuresData) {
    await prisma.feature.create({
      data: feature,
    });
  }

  // Seed Frontend Features with quantity in description
  const frontendFeaturesData = [
    {
      name: 'Message Credits',
      description: 'Receive 20 message credits per month for chatbot conversations.',
    },
    {
      name: 'Chatbots',
      description: 'Manage up to 1 chatbot with full access to configuration and settings.',
    },
    {
      name: 'Characters Per Chatbot',
      description: 'Set a limit of 600,000 characters per chatbot to handle various interactions.',
    },
    {
      name: 'Team Members',
      description: 'Add up to 1 team member to collaborate on chatbot management.',
    },
    {
      name: 'Links for Training',
      description: 'Allow up to 10 links for chatbot training to optimize performance.',
    },
    {
      name: 'Unlimited Embedding',
      description: 'Embed the chatbot across unlimited websites for broader reach.',
    },
    {
      name: 'Leads Capture',
      description: 'Capture an unlimited number of leads directly through your chatbot.',
    },
    {
      name: 'Chat History',
      description: 'Enjoy unlimited access to your chatbot’s complete chat history.',
    },
    {
      name: 'API Access',
      description: 'Gain unlimited access to the chatbot API for seamless integrations.',
    },
    {
      name: 'Analytics',
      description: 'Access unlimited data and insights from chatbot analytics to track performance.',
    },
    {
      name: 'Remove "Powered by InsertBot"',
      description: 'Remove the "Powered by InsertBot" branding to personalize your chatbot.',
    },
    {
      name: 'Use Your Own Custom Domains',
      description: 'Host chatbots on your own custom domains with no limitations.',
    },
    {
      name: 'Advanced Analytics',
      description: 'Get advanced analytics features for in-depth insights on chatbot usage.',
    },
  ];
  

  // Insert FrontendFeature data
  for (const frontendFeature of frontendFeaturesData) {
    await prisma.frontendFeature.create({
      data: frontendFeature,
    });
  }

  // Fetch all created features and frontend features to get their IDs
  const allFeatures = await prisma.feature.findMany();
  const allFrontendFeatures = await prisma.frontendFeature.findMany();

  // Helper functions to get feature IDs by name
  const getFeatureIdByName = (name) => allFeatures.find((f) => f.name === name)?.id;
  const getFrontendFeatureIdByName = (name) => allFrontendFeatures.find((f) => f.name === name)?.id;

  // Seed Plans with related features (Plan, PlanFeature, and PlanFrontendFeature)
  const freePlan = await prisma.plan.create({
    data: {
      name: 'Free',
      description: 'A basic plan for testing.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      stripeMonthlyPriceId: null,
      stripeYearlyPriceId: null,
      isAddOn: false,
      features: {
        create: [
          { featureId: getFeatureIdByName('Message Credits'), value: 20 },
          { featureId: getFeatureIdByName('Chatbots'), value: 1 },
          { featureId: getFeatureIdByName('Characters Per Chatbot'), value: 400000 },
          { featureId: getFeatureIdByName('Team Members'), value: 1 },
          { featureId: getFeatureIdByName('Links for Training'), value: 10 },
          { featureId: getFeatureIdByName('Unlimited Embedding'), value: null },
        ],
      },
      frontendFeatures: {
        create: [
          { featureId: getFrontendFeatureIdByName('Message Credits') },
          { featureId: getFrontendFeatureIdByName('Chatbots') },
          { featureId: getFrontendFeatureIdByName('Characters Per Chatbot') },
          { featureId: getFrontendFeatureIdByName('Team Members') },
          { featureId: getFrontendFeatureIdByName('Links for Training') },
          { featureId: getFrontendFeatureIdByName('Unlimited Embedding') },
        ],
      },
    },
  });

  const hobbyPlan = await prisma.plan.create({
    data: {
      name: 'Hobby',
      description: 'For hobbyists with more needs.',
      monthlyPrice: 1900, // $19.00 in cents
      yearlyPrice: 19900, // $199.00 in cents
      stripeMonthlyPriceId: 'price_1PGDITCVtIA4fkI2sApcxiYo',
      stripeYearlyPriceId: 'price_1PIGkNCVtIA4fkI2VrRj5qnH',
      isAddOn: false,
      features: {
        create: [
          { featureId: getFeatureIdByName('Message Credits'), value: 2000 },
          { featureId: getFeatureIdByName('Chatbots'), value: 2 },
          { featureId: getFeatureIdByName('Characters Per Chatbot'), value: 11000000 },
          { featureId: getFeatureIdByName('API Access'), value: null },
          { featureId: getFeatureIdByName('Analytics'), value: null },
        ],
      },
      frontendFeatures: {
        create: [
          { featureId: getFrontendFeatureIdByName('Message Credits') },
          { featureId: getFrontendFeatureIdByName('Chatbots') },
          { featureId: getFrontendFeatureIdByName('Characters Per Chatbot') },
          { featureId: getFrontendFeatureIdByName('API Access') },
          { featureId: getFrontendFeatureIdByName('Analytics') },
        ],
      },
    },
  });

  const standardPlan = await prisma.plan.create({
    data: {
      name: 'Standard',
      description: 'For small businesses needing more power.',
      monthlyPrice: 9900, // $99.00 in cents
      yearlyPrice: 99900, // $999.00 in cents
      stripeMonthlyPriceId: 'price_1PIGjrCVtIA4fkI2LyvHLMx0',
      stripeYearlyPriceId: 'price_1PIGjrCVtIA4fkI2LyvHLMx0',
      isAddOn: false,
      features: {
        create: [
          { featureId: getFeatureIdByName('Message Credits'), value: 10000 },
          { featureId: getFeatureIdByName('Chatbots'), value: 5 },
          { featureId: getFeatureIdByName('Team Members'), value: 3 },
          { featureId: getFeatureIdByName('API Access'), value: null },
        ],
      },
      frontendFeatures: {
        create: [
          { featureId: getFrontendFeatureIdByName('Message Credits') },
          { featureId: getFrontendFeatureIdByName('Chatbots') },
          { featureId: getFrontendFeatureIdByName('Team Members') },
          { featureId: getFrontendFeatureIdByName('API Access') },
        ],
      },
    },
  });

  const unlimitedPlan = await prisma.plan.create({
    data: {
      name: 'Unlimited',
      description: 'For enterprises needing everything.',
      monthlyPrice: 39900, // $399.00 in cents
      yearlyPrice: 399900, // $3999.00 in cents
      stripeMonthlyPriceId: 'price_1PGDJZCVtIA4fkI2V8ufr2Hd',
      stripeYearlyPriceId: 'price_1PIGjPCVtIA4fkI2I9z76rke',
      isAddOn: false,
      features: {
        create: [
          { featureId: getFeatureIdByName('Message Credits'), value: 40000 },
          { featureId: getFeatureIdByName('Chatbots'), value: 10 },
          { featureId: getFeatureIdByName('Team Members'), value: 5 },
          { featureId: getFeatureIdByName('Remove "Powered by InsertBot"'), value: null },
          { featureId: getFeatureIdByName('Use Your Own Custom Domains'), value: null },
          { featureId: getFeatureIdByName('Advanced Analytics'), value: null },
        ],
      },
      frontendFeatures: {
        create: [
          { featureId: getFrontendFeatureIdByName('Message Credits') },
          { featureId: getFrontendFeatureIdByName('Chatbots') },
          { featureId: getFrontendFeatureIdByName('Team Members') },
          { featureId: getFrontendFeatureIdByName('Remove "Powered by InsertBot"') },
          { featureId: getFrontendFeatureIdByName('Use Your Own Custom Domains') },
          { featureId: getFrontendFeatureIdByName('Advanced Analytics') },
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
