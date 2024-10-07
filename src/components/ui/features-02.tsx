export default function Features02() {
  const useCases = [
    {
      title: '1. 24/7 Customer Support',
      description:
        'Ensure your customers are never left waiting with AI-powered chatbots that provide round-the-clock assistance, offering quick resolutions to inquiries without human intervention.',
    },
    {
      title: '2. Lead Generation & Qualification',
      description:
        'Capture and qualify leads automatically by engaging visitors with pre-set questions. Send hot leads directly to your sales team for immediate follow-up, ensuring no opportunity slips away.',
    },
    {
      title: '3. E-commerce Personalization',
      description:
        'Boost conversions by recommending personalized products based on customer behavior and preferences. Chatbots can act as virtual shopping assistants, guiding users through tailored product suggestions.',
    },
    {
      title: '4. Instant Appointment Booking',
      description:
        'Integrate with your calendar and allow customers to book appointments effortlessly. AI chatbots handle scheduling, rescheduling, and reminders—streamlining the entire booking process.',
    },
    {
      title: '5. Interactive FAQs & Knowledge Base',
      description:
        'Reduce workload on your support team by automating FAQs. Chatbots can provide instant answers from your knowledge base, allowing customers to resolve common issues without agent assistance.',
    },
    {
      title: '6. Employee Onboarding & Training',
      description:
        'Accelerate onboarding with AI chatbots that guide new employees through the company’s resources, policies, and compliance procedures. Tailor responses to answer onboarding-related queries in real time.',
    },
    {
      title: '7. Seamless Feedback Collection',
      description:
        'Engage users in providing valuable feedback or completing surveys through friendly and interactive chatbot conversations, improving response rates while capturing critical insights.',
    },
    {
      title: '8. Real-time Order Tracking & Notifications',
      description:
        'Offer your customers real-time order status updates directly through the chatbot, eliminating the need for them to contact customer service for tracking information.',
    },
    {
      title: '9. Multilingual Support',
      description:
        'Expand your business globally by deploying chatbots that offer multilingual support. Cater to a wider audience by providing personalized experiences in their native languages.',
    },
    {
      title: '10. Intelligent Customer Insights',
      description:
        'Analyze customer interactions to generate valuable insights and track trends. This data can help optimize your chatbot and improve marketing and product strategies over time.',
    },
    {
      title: '11. Upsell & Cross-sell Promotions',
      description:
        'AI chatbots can offer personalized upsell or cross-sell opportunities during customer interactions, increasing average order value and providing tailored offers at the right moment.',
    },
    {
      title: '12. Seamless Integration with Business Tools',
      description:
        'Extend chatbot capabilities by connecting with business tools like CRM, ERP, and communication platforms such as Slack or WhatsApp to automate workflows and improve internal operations.',
    },
  ];

  return (
    <section className="relative bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-800 dark:to-blue-900">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              Unlock Game-Changing Use Cases with AI-Powered Custom Chatbots
            </h2>
            <p className="text-lg text-black dark:text-white">
              From boosting customer engagement to automating key processes, AI chatbots transform the way you do business. Here are 12 compelling use cases to inspire your chatbot strategy.
            </p>
          </div>

          <div className="max-w-xs mx-auto sm:max-w-none grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-4 lg:gap-8">
            {useCases.map((useCase, index) => (
              <article
                key={index}
                className="flex flex-col border border-transparent bg-gradient-to-b from-white to-gray-50 dark:from-zinc-800 dark:to-zinc-700 rounded-lg p-5 shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-2 rounded-full">
                    <svg
                      className="inline-flex text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                    >
                      <path d="M10 0a10 10 0 110 20 10 10 0 010-20zm0 18.75c4.83 0 8.75-3.92 8.75-8.75S14.83 1.25 10 1.25 1.25 5.17 1.25 10 5.17 18.75 10 18.75z" />
                    </svg>
                  </div>
                  <h3 className="font-inter-tight font-semibold text-black dark:text-white">{useCase.title}</h3>
                </div>
                <p className="grow max-w-md text-sm text-black dark:text-white">
                  {useCase.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
