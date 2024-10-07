// Testimonials.tsx

import Testimonial from './Testimonial';

export default function Testimonials() {
  const getInitials = (name: string) => {
    const [firstName, lastName] = name.split(' ');
    return `${firstName[0]}${lastName[0]}`;
  };

  const testimonials01 = [
    {
      name: 'Lina James',
      designation: 'Customer Support Manager',
      content:
        'Integrating our custom chatbot has streamlined our customer service, cutting response times by 50%. A game-changer for our business!',
    },
    {
      name: 'Ayesha Khan',
      designation: 'Sales Executive',
      content:
        'Our sales team now relies on chatbot-driven lead generation. The accuracy and responsiveness have increased conversions significantly.',
    },
    {
      name: 'Michael Chen',
      designation: 'IT Manager',
      content:
        'Seamless integration with Slack and WhatsApp allowed us to enhance customer support effortlessly across multiple channels.',
    },
    {
      name: 'Emily White',
      designation: 'Product Manager',
      content:
        'With AI chatbot handling 24/7 inquiries, our human agents focus on more complex problems, boosting productivity across the board.',
    },
  ];

  const testimonials02 = [
    {
      name: 'Fatima Ali',
      designation: 'Operations Manager',
      content:
        'The chatbot has revolutionized the way we book appointments with clients. It integrates perfectly with our calendar systems!',
    },
    {
      name: 'Rahul Verma',
      designation: 'Marketing Specialist',
      content:
        'Training the chatbot on documents and websites was simple and effective. It now handles FAQs like a pro, freeing up resources.',
    },
    {
      name: 'Sana Malik',
      designation: 'Digital Marketing Manager',
      content:
        'The custom chatbot is a vital part of our marketing campaigns, delivering personalized content to users and boosting engagement.',
    },
    {
      name: 'Tom Carter',
      designation: 'CRM Specialist',
      content:
        'The integration with our CRM system has been seamless. Capturing and nurturing leads has never been this efficient.',
    },
  ];

  return (
    <section className="bg-zinc-50 dark:bg-zinc-900">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Loved by businesses that embrace AI chatbots
            </h2>
          </div>
        </div>
        <div className="max-w-[94rem] mx-auto space-y-6">
          {/* Row #1 */}
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_28%,_black_calc(100%-28%),transparent_100%)] group">
            <div className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll group-hover:[animation-play-state:paused]">
              {testimonials01.map((testimonial, index) => (
                <Testimonial key={index} testimonial={testimonial}>
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                    {getInitials(testimonial.name)}
                  </div>
                  <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{testimonial.content}</p>
                </Testimonial>
              ))}
            </div>
            <div className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll group-hover:[animation-play-state:paused]" aria-hidden="true">
              {testimonials01.map((testimonial, index) => (
                <Testimonial key={index} testimonial={testimonial}>
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                    {getInitials(testimonial.name)}
                  </div>
                  <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{testimonial.content}</p>
                </Testimonial>
              ))}
            </div>
          </div>
          {/* Row #2 */}
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_28%,_black_calc(100%-28%),transparent_100%)] group">
            <div className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll group-hover:[animation-play-state:paused] [animation-delay:-7.5s]">
              {testimonials02.map((testimonial, index) => (
                <Testimonial key={index} testimonial={testimonial}>
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                    {getInitials(testimonial.name)}
                  </div>
                  <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{testimonial.content}</p>
                </Testimonial>
              ))}
            </div>
            <div className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll group-hover:[animation-play-state:paused] [animation-delay:-7.5s]" aria-hidden="true">
              {testimonials02.map((testimonial, index) => (
                <Testimonial key={index} testimonial={testimonial}>
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                    {getInitials(testimonial.name)}
                  </div>
                  <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{testimonial.content}</p>
                </Testimonial>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
