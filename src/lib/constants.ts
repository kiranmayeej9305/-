import BarChart from '@/components/icons/bar_chart'
import Calendar from '@/components/icons/calendar'
import CheckCircle from '@/components/icons/check_circled'
import Chip from '@/components/icons/chip'
import ClipboardIcon from '@/components/icons/clipboardIcon'
import Compass from '@/components/icons/compass'
import Database from '@/components/icons/database'
import Flag from '@/components/icons/flag'
import Headphone from '@/components/icons/headphone'
import Home from '@/components/icons/home'
import Info from '@/components/icons/info'
import LinkIcon from '@/components/icons/link'
import Lock from '@/components/icons/lock'
import Message from '@/components/icons/messages'
import Notification from '@/components/icons/notification'
import Payment from '@/components/icons/payment'
import Person from '@/components/icons/person'
import Pipelines from '@/components/icons/pipelines'
import PluraCategory from '@/components/icons/plura-category'
import Power from '@/components/icons/power'
import Receipt from '@/components/icons/receipt'
import Send from '@/components/icons/send'
import Settings from '@/components/icons/settings'
import Shield from '@/components/icons/shield'
import Star from '@/components/icons/star'
import Tune from '@/components/icons/tune'
import Video from '@/components/icons/video_recorder'
import Wallet from '@/components/icons/wallet'
import Warning from '@/components/icons/warning'
export const pricingCards = [
  {
    title: 'Starter',
    description: 'For power users who want access to creative features.',
    features: [
      'Unlimited workspace boards',
      'Unlimited viewers',
      'Unlimited project templates',
      'Change management',
      'Taxonomy development',
      'Customer success manager'
    ],
    priceId: '',
    price: '$0'
  },
  {
    title: 'Premium',
    description: 'For creative organizations that need full control & support.',
    features: [
      'Unlimited workspace boards',
      'Unlimited viewers',
      'Unlimited project templates',
      'Change management',
      'Taxonomy development',
      'Customer success manager'
    ],
    priceId: 'price_1PIGjPCVtIA4fkI2I9z76rke',
    price: '$19.99'

  },
  {
    title: 'Enterprise',
    description: 'For large organizations that need full control & support.',
    features: [
      'Unlimited workspace boards',
      'Unlimited viewers',
      'Unlimited project templates',
      'Change management',
      'Taxonomy development',
      'Customer success manager'
    ],
    priceId: 'price_1PGDJZCVtIA4fkI2V8ufr2Hd',
    price: '$29.99'

  }
]
export const faqs = [
  {
    title: 'Can I try the chatbot platform for free?',
    text: 'Yes, you can start using our platform with a free plan. Test the capabilities, explore features, and create basic chatbots without any upfront costs. Upgrade when you are ready to unlock advanced functionalities.',
    active: true,
  },
  {
    title: 'Which payment methods are accepted?',
    text: 'We accept various payment methods including major credit cards, PayPal, and other secure options to ensure seamless transactions.',
    active: false,
  },
  {
    title: 'Can I switch between monthly and yearly billing?',
    text: 'Yes, you have the flexibility to change your billing cycle anytime. Switch between monthly and yearly plans depending on what suits your business best, and enjoy discounts with annual subscriptions.',
    active: false,
  },
  {
    title: 'Can I use the chatbot platform for personal, client, or commercial projects?',
    text: 'Absolutely! Our chatbot platform is designed to be versatile, whether you’re creating chatbots for personal use, working on client projects, or deploying chatbots for large-scale commercial endeavors.',
    active: false,
  },
  {
    title: 'Where can I find support or assistance?',
    text: 'You can access our support portal at any time, or get in touch with our 24/7 customer service team through chat or email. We’re here to help you maximize your chatbot experience.',
    active: false,
  },
  {
    title: 'How does the credit system work?',
    text: 'Our platform operates on a flexible credit system, where each chatbot interaction consumes a certain amount of credits based on its complexity. You can easily purchase additional credits or upgrade your plan as needed.',
    active: false,
  },
  {
    title: 'Can I accumulate my unused credits?',
    text: 'Yes, unused credits roll over to the next billing cycle, so you never lose the credits you’ve paid for. You can accumulate them and use them whenever you need.',
    active: false,
  },
  {
    title: 'What happens if I exceed the limits of my plan?',
    text: 'If you exceed the usage limits of your current plan, you can either upgrade to a higher plan or purchase additional credits to continue uninterrupted service.',
    active: false,
  },
  {
    title: 'Is it possible to train the chatbot on documents, websites, or text files?',
    text: 'Yes, our platform supports training chatbots using various data sources including documents, websites, and text files. This allows you to customize the chatbot’s knowledge and responses to suit your specific needs.',
    active: false,
  },
  {
    title: 'What languages does the chatbot support?',
    text: 'Our AI chatbots currently support only english.',
    active: false,
  },
  {
    title: 'What is the refund policy for my subscription?',
    text: 'We offer a no-refund policy. Once the subscription is purchased, it is non-refundable. However, you can cancel future billing at any time, and your subscription will remain active until the end of the current billing cycle.',
    active: false,
  },
  {
    title: 'What are the supported AI models for chatbots?',
    text: 'We support a diverse range of cutting-edge AI models including GPT-4, Claude 3, Llama 3, Mistral, Perplexity. Each model is optimized for different tasks, ensuring top performance for any use case.',
    active: false,
  },
];

export const addOnProducts = [
  { title: 'Priority Support', id: 'prod_PNjJAE2EpP16pn' },
]

export const icons = [
  {
    value: 'chart',
    label: 'Bar Chart',
    path: BarChart,
  },
  {
    value: 'headphone',
    label: 'Headphones',
    path: Headphone,
  },
  {
    value: 'send',
    label: 'Send',
    path: Send,
  },
  {
    value: 'pipelines',
    label: 'Pipelines',
    path: Pipelines,
  },
  {
    value: 'calendar',
    label: 'Calendar',
    path: Calendar,
  },
  {
    value: 'settings',
    label: 'Settings',
    path: Settings,
  },
  {
    value: 'check',
    label: 'Check Circled',
    path: CheckCircle,
  },
  {
    value: 'chip',
    label: 'Chip',
    path: Chip,
  },
  {
    value: 'compass',
    label: 'Compass',
    path: Compass,
  },
  {
    value: 'database',
    label: 'Database',
    path: Database,
  },
  {
    value: 'flag',
    label: 'Flag',
    path: Flag,
  },
  {
    value: 'home',
    label: 'Home',
    path: Home,
  },
  {
    value: 'info',
    label: 'Info',
    path: Info,
  },
  {
    value: 'link',
    label: 'Link',
    path: LinkIcon,
  },
  {
    value: 'lock',
    label: 'Lock',
    path: Lock,
  },
  {
    value: 'messages',
    label: 'Messages',
    path: Message,
  },
  {
    value: 'notification',
    label: 'Notification',
    path: Notification,
  },
  {
    value: 'payment',
    label: 'Payment',
    path: Payment,
  },
  {
    value: 'power',
    label: 'Power',
    path: Power,
  },
  {
    value: 'receipt',
    label: 'Receipt',
    path: Receipt,
  },
  {
    value: 'shield',
    label: 'Shield',
    path: Shield,
  },
  {
    value: 'star',
    label: 'Star',
    path: Star,
  },
  {
    value: 'tune',
    label: 'Tune',
    path: Tune,
  },
  {
    value: 'videorecorder',
    label: 'Video Recorder',
    path: Video,
  },
  {
    value: 'wallet',
    label: 'Wallet',
    path: Wallet,
  },
  {
    value: 'warning',
    label: 'Warning',
    path: Warning,
  },
  {
    value: 'person',
    label: 'Person',
    path: Person,
  },
  {
    value: 'category',
    label: 'Category',
    path: PluraCategory,
  },
  {
    value: 'clipboardIcon',
    label: 'Clipboard Icon',
    path: ClipboardIcon,
  },
]

export type EditorBtns =
  | 'text'
  | 'container'
  | 'section'
  | 'contactForm'
  | 'paymentForm'
  | 'link'
  | '2Col'
  | 'video'
  | '__body'
  | 'image'
  | null
  | '3Col'

export const defaultStyles: React.CSSProperties = {
  backgroundPosition: 'center',
  objectFit: 'cover',
  backgroundRepeat: 'no-repeat',
  textAlign: 'left',
  opacity: '100%',
}
