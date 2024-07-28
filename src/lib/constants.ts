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
    priceId: 'price_1PGDJZCVtIA4fkI2V8ufr2Hd'
  }
]
export const faqs = [
  {
    title: 'Can I use the product for free?',
    text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
    active: false,
  },
  {
    title: 'What payment methods can I use?',
    text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
    active: false,
  },
  {
    title: 'Can I change from monthly to yearly billing?',
    text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
    active: false,
  },
  {
    title: 'Can I use the tool for personal, client, and commercial projects?',
    text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
    active: true,
  },
  {
    title: 'How can I ask other questions about pricing?',
    text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
    active: false,
  },
  {
    title: 'Do you offer discount for students and non-profit companies?',
    text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
    active: false,
  },
]
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
