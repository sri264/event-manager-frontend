export type VenueType = 'hall' | 'pool' | 'room';

export type PriceUnit = 'day' | 'night';

export interface Venue {
  id: number;
  name: string;
  slug: string;
  type: VenueType;
  description: string;
  location: string;
  address: string;
  capacity: number;
  price: number;
  priceUnit: PriceUnit;
  amenities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVenue extends Venue {
  bookingCount: number;
  revenue?: number;
}

export type VenueRef = Pick<Venue, 'id' | 'name' | 'type'> &
  Partial<Pick<Venue, 'slug' | 'location' | 'address' | 'images' | 'priceUnit' | 'capacity'>>;

export interface Quote {
  available: boolean;
  startDate: string;
  endDate: string;
  units: number;
  priceUnit: PriceUnit;
  unitPrice: number;
  baseAmount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
}

export interface VenueInput {
  name: string;
  type: VenueType;
  description: string;
  location: string;
  address: string;
  capacity: number;
  price: number;
  priceUnit?: PriceUnit;
  amenities: string[];
  images: string[];
  isFeatured?: boolean;
  isActive?: boolean;
}
