import {
  AirVent,
  Award,
  BedDouble,
  Building2,
  CalendarCheck,
  CircleParking,
  Gem,
  Headset,
  LayoutGrid,
  MousePointerClick,
  Presentation,
  ShieldCheck,
  Shirt,
  Speaker,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import heroImage from '@/assets/images/hero-resort.jpg';
import type { VenueType } from '@/types/venue';

const unsplash = (id: string, width = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

export const HERO_IMAGE = heroImage;
export const CTA_IMAGE = unsplash('1510076857177-7470076d4098', 2000);
export const ABOUT_IMAGE = unsplash('1542314831-068cd1dbfeeb', 1200);

export const CITIES = ['Bengaluru', 'Hyderabad', 'Chennai', 'Mumbai', 'Pune'];

export interface SpaceTab {
  type: VenueType;
  label: string;
  icon: LucideIcon;
  route: string;
}

export const SPACE_TABS: SpaceTab[] = [
  { type: 'hall', label: 'Function Hall', icon: Building2, route: '/halls' },
  { type: 'pool', label: 'Swimming Pool', icon: Waves, route: '/pools' },
  { type: 'room', label: 'Rooms', icon: BedDouble, route: '/rooms' },
];

export interface Highlight {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const HERO_HIGHLIGHTS: Highlight[] = [
  { title: 'Wide Range of Venues', description: 'Halls, pools, rooms & more', icon: LayoutGrid },
  { title: 'Real-time Availability', description: 'Check and book instantly', icon: CalendarCheck },
  { title: 'Secure Payments', description: 'Safe and reliable', icon: ShieldCheck },
  { title: 'Easy Booking', description: 'Quick and hassle-free', icon: MousePointerClick },
];

export interface Facility {
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  linkLabel: string;
  to: string;
}

export const FACILITIES: Facility[] = [
  {
    title: 'Function Halls',
    description: 'Perfect for weddings, parties and corporate events.',
    image: unsplash('1587271407850-8d438ca9fdf2'),
    icon: Building2,
    linkLabel: 'View Halls',
    to: '/halls',
  },
  {
    title: 'Swimming Pools',
    description: 'Enjoy a refreshing experience with our clean and spacious pools.',
    image: unsplash('1540541338287-41700207dee6'),
    icon: Waves,
    linkLabel: 'View Pools',
    to: '/pools',
  },
  {
    title: 'Rooms',
    description: 'Comfortable and elegant rooms for your stay.',
    image: unsplash('1611892440504-42a792e24d32'),
    icon: BedDouble,
    linkLabel: 'View Rooms',
    to: '/rooms',
  },
];

export const ABOUT_POINTS: Highlight[] = [
  { title: 'Premium Facilities', description: 'Curated, well-maintained spaces', icon: Gem },
  { title: 'Hassle-free Booking', description: 'Book online in minutes', icon: Award },
  { title: 'Dedicated Support', description: 'We are here when you need us', icon: Headset },
];

export const AMENITIES: { label: string; icon: LucideIcon }[] = [
  { label: 'Spacious Venues', icon: Building2 },
  { label: 'Catering Support', icon: UtensilsCrossed },
  { label: 'Parking Space', icon: CircleParking },
  { label: 'AC & Ventilation', icon: AirVent },
  { label: 'Changing Rooms', icon: Shirt },
  { label: 'Sound System', icon: Speaker },
  { label: 'Stage Setup', icon: Presentation },
  { label: '24/7 Security', icon: ShieldCheck },
];

export type GalleryCategory = 'halls' | 'pools' | 'rooms' | 'events';

export const GALLERY_FILTERS: { value: GalleryCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'halls', label: 'Function Halls' },
  { value: 'pools', label: 'Swimming Pool' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'events', label: 'Events' },
];

export interface GalleryImage {
  id: string;
  category: GalleryCategory;
  alt: string;
}

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: '1587271407850-8d438ca9fdf2', category: 'halls', alt: 'Wedding stage with chandeliers' },
  {
    id: '1519225421980-715cb0215aed',
    category: 'halls',
    alt: 'Banquet tables set for a reception',
  },
  { id: '1520250497591-112f2f40a3f4', category: 'pools', alt: 'Resort pool surrounded by palms' },
  { id: '1631049307264-da0ec9d70304', category: 'rooms', alt: 'Bright hotel room with a king bed' },
  {
    id: '1523438885200-e635ba2c371e',
    category: 'events',
    alt: 'Garden wedding with floral pergola',
  },
  { id: '1505373877841-8d25f7d46678', category: 'events', alt: 'Corporate conference in a hall' },
  { id: '1566073771259-6a8506099945', category: 'pools', alt: 'Poolside loungers at a resort' },
  { id: '1566665797739-1674de7a421a', category: 'rooms', alt: 'Modern bedroom with warm lighting' },
  {
    id: '1511795409834-ef04bbd61622',
    category: 'halls',
    alt: 'Decorated dining tables with flowers',
  },
  {
    id: '1582719478250-c89cae4dc85b',
    category: 'rooms',
    alt: 'Hotel room with a sea-facing balcony',
  },
  {
    id: '1576013551627-0cc20b96c2a7',
    category: 'pools',
    alt: 'Outdoor pool in a landscaped garden',
  },
  { id: '1469371670807-013ccf25f16a', category: 'events', alt: 'Floral wedding aisle outdoors' },
];

export const galleryThumb = (id: string) => unsplash(id, 640);
export const galleryFull = (id: string) => unsplash(id, 1600);

export interface Testimonial {
  quote: string;
  name: string;
  occasion: string;
  avatar?: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The function hall was perfect for our wedding. Excellent service and beautiful venue. Highly recommended!',
    name: 'Priya Sharma',
    occasion: 'Wedding Event',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
  },
  {
    quote:
      'The swimming pool was clean and well-maintained. Our family had a great time. We will definitely book again.',
    name: 'Rohit Kumar',
    occasion: 'Family Outing',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
  },
  {
    quote:
      'Comfortable rooms and great hospitality. Everything was well-organized and the booking process was very easy!',
    name: 'Sneha R',
    occasion: 'Weekend Stay',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5,
  },
  {
    quote:
      'We hosted our annual company meet here. The AV setup, catering and support team were all top-notch.',
    name: 'Arjun Mehta',
    occasion: 'Corporate Event',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 5,
  },
];

export const STATS = [
  { value: '10+', label: 'Years of Excellence' },
  { value: '50+', label: 'Premium Venues' },
  { value: '5,000+', label: 'Events Hosted' },
  { value: '4.8', label: 'Average Rating' },
];
