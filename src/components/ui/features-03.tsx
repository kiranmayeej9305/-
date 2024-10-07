import {
  Code, Phone, ShieldCheck, User, Settings, Database, Languages, Network, ChevronRight, Calendar, MessageSquare, Users, Clock, Monitor
} from 'lucide-react';

export default function Features03() {
  const features = [
    {
      title: 'UI Customizations',
      description: 'Align your chatbot’s design with your brand’s identity for a seamless user experience.',
      icon: <User className="text-blue-500 w-8 h-8" />,
    },
    {
      title: 'White-label & Reseller',
      description: 'Rebrand our chatbot platform as your own and offer it to clients or resell under your name.',
      icon: <ShieldCheck className="text-green-500 w-8 h-8" />,
    },
    {
      title: 'AI Training & Auto-Retrain',
      description: 'Continuously train and improve your chatbot with customized datasets and auto-retrain for optimal accuracy.',
      icon: <User className="text-purple-500 w-8 h-8" />,
    },
    {
      title: 'Best AI Models',
      description: 'Leverage cutting-edge AI models for accurate and contextually relevant responses across industries.',
      icon: <Settings className="text-indigo-500 w-8 h-8" />,
    },
    {
      title: 'Inbuilt Messenger',
      description: 'Chat with your users in real-time using an integrated messenger platform for seamless communication.',
      icon: <MessageSquare className="text-red-500 w-8 h-8" />,
    },
    {
      title: 'Live Agent Support',
      description: 'Switch between chatbot and live agent support, ensuring users can escalate complex queries to a human agent.',
      icon: <Users className="text-pink-500 w-8 h-8" />,
    },
    {
      title: 'Calendar Integration',
      description: 'Allow users to book appointments through a built-in calendar integration with real-time availability.',
      icon: <Calendar className="text-teal-500 w-8 h-8" />,
    },
    {
      title: '24/7 Support with Paid Plan',
      description: 'Access round-the-clock support to resolve any chatbot-related issues with our premium paid plans.',
      icon: <Clock className="text-blue-500 w-8 h-8" />,
    },
    {
      title: 'Playground to Test Your Chatbot',
      description: 'Experiment and test your chatbot in a dedicated playground to fine-tune its responses and behavior before going live.',
      icon: <Monitor className="text-purple-500 w-8 h-8" />,
    },
    {
      title: 'Lead Generation & CRM',
      description: 'Capture leads automatically, manage customer data, and nurture them through a simple CRM.',
      icon: <Database className="text-orange-500 w-8 h-8" />,
    },
    {
      title: 'Data Sources & Cloud Storage',
      description: 'Utilize multiple data sources like files, URLs, and cloud storage (S3) for optimal chatbot performance.',
      icon: <Network className="text-yellow-500 w-8 h-8" />,
    },
    {
      title: 'Advanced Analytics',
      description: 'Get actionable insights into user behavior and chatbot performance through deep analytics and reporting.',
      icon: <ChevronRight className="text-purple-500 w-8 h-8" />,
    },
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center pb-12 md:pb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white">
            Cutting-Edge Features for Smart AI Chatbots
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
            Elevate your business with our custom AI chatbot platform packed with features designed to boost efficiency, drive sales, and delight users.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative p-6 bg-white dark:bg-white rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-zinc-50">
                  {feature.icon}
                </div>
                <div className="text-lg font-semibold text-zinc-900">{feature.title}</div>
              </div>
              <p className="mt-3 text-zinc-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
