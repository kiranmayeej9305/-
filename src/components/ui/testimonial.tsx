// Testimonial.tsx

interface TestimonialProps {
  testimonial: {
    name: string;
    content: string;
    designation: string;
  };
  children: React.ReactNode;
}

const getInitials = (name: string) => {
  const [firstName, lastName] = name.split(' ');
  return `${firstName[0]}${lastName[0]}`;
};

// Function to generate random pastel colors for the initials background
const getColorFromInitials = (initials: string) => {
  const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-teal-500'];
  const index = initials.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function Testimonial({ testimonial, children }: TestimonialProps) {
  const initials = getInitials(testimonial.name);
  const colorClass = getColorFromInitials(initials);

  return (
    <div className="rounded-lg h-full w-[22rem] border border-transparent bg-white dark:bg-zinc-800 p-5 shadow-md">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg ${colorClass}`}>
          {initials}
        </div>
        <div className="ml-3">
          <div className="font-inter-tight font-bold text-zinc-900 dark:text-zinc-100">{testimonial.name}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{testimonial.designation}</div>
        </div>
      </div>
      <div className="text-zinc-700 dark:text-zinc-300">
        {testimonial.content}
      </div>
    </div>
  );
}
