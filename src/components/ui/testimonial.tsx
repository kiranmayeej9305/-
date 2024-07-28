import Image, { StaticImageData } from 'next/image'

interface TestimonialProps {
  testimonial: {
    image: StaticImageData
    name: string
    user: string
    link: string
    content: string
  }
  children: React.ReactNode
}

export default function Testimonial({ testimonial, children }: TestimonialProps) {
  return (
    <div className="rounded-lg h-full w-[22rem] border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] dark:[background:linear-gradient(theme(colors.zinc.800),theme(colors.zinc.800))_padding-box,linear-gradient(120deg,theme(colors.zinc.500),theme(colors.zinc.700),theme(colors.zinc.500))_border-box] p-5">
      <div className="flex items-center mb-4">
        <Image className="shrink-0 rounded-full mr-3" src={testimonial.image} width={44} height={44} alt={testimonial.name} />
        <div>
          <div className="font-inter-tight font-bold text-zinc-900 dark:text-zinc-100">{testimonial.name}</div>
          <div>
            <a className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition" href={testimonial.link}>{testimonial.user}</a>
          </div>
        </div>
      </div>
      <div className="text-zinc-700 dark:text-zinc-300 before:content-['\0022'] after:content-['\0022']">
        {children}
      </div>
    </div>
  )
}
