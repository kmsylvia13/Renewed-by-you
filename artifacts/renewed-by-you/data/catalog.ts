import type { ImageSourcePropType } from 'react-native';

export type ListingMode = 'rent' | 'swap' | 'both';

export type ClothingItem = {
  id: string;
  title: string;
  category: string;
  size: string;
  condition: string;
  price: number;
  mode: ListingMode;
  description: string;
  owner: string;
  isMine?: boolean;
  image: ImageSourcePropType;
};

export type Rental = {
  id: string;
  itemId: string;
  title: string;
  image: ImageSourcePropType;
  startDate: string;
  endDate: string;
  total: number;
  status: 'active' | 'upcoming' | 'completed';
};

export type SwapRequest = {
  id: string;
  itemId: string;
  title: string;
  image: ImageSourcePropType;
  requestedAt: string;
  status: 'pending';
};

export type ExtensionRequest = {
  id: string;
  rentalId: string;
  days: number;
  requestedAt: string;
};

export const seedItems: ClothingItem[] = [
  {
    id: 'cardigan',
    title: 'Sunday cardigan',
    category: 'Knitwear',
    size: 'S · fits XS–S',
    condition: 'Like new',
    price: 7,
    mode: 'both',
    description: 'The coziest butter-yellow knit for library days, coffee runs, and that first chilly walk across campus.',
    owner: 'Mia R.',
    image: require('../assets/images/cardigan.jpg'),
  },
  {
    id: 'floral-dress',
    title: 'Garden party dress',
    category: 'Dresses',
    size: 'M · true to size',
    condition: 'Excellent',
    price: 10,
    mode: 'rent',
    description: 'A floaty floral midi that feels made for spring formals, picnics, and all the photos after.',
    owner: 'Jules K.',
    image: require('../assets/images/dress.jpg'),
  },
  {
    id: 'denim-jacket',
    title: 'Campus denim jacket',
    category: 'Jackets',
    size: 'M · relaxed fit',
    condition: 'Loved, lots of life',
    price: 8,
    mode: 'both',
    description: 'An easy throw-on vintage wash. Roomy enough for a hoodie underneath and better with every wear.',
    owner: 'Noah P.',
    image: require('../assets/images/denim.jpg'),
  },
  {
    id: 'soft-cardigan',
    title: 'Cloud-soft cardigan',
    category: 'Knitwear',
    size: 'L · oversized',
    condition: 'Like new',
    price: 6,
    mode: 'swap',
    description: 'A soft neutral layer with roomy sleeves. Swap for any fun top or a book you loved.',
    owner: 'Avery T.',
    image: require('../assets/images/cardigan.jpg'),
  },
  {
    id: 'date-night-dress',
    title: 'Rose garden midi',
    category: 'Dresses',
    size: 'S · adjustable straps',
    condition: 'Excellent',
    price: 12,
    mode: 'rent',
    description: 'A romantic little number for a date, a dinner out, or just because it is Friday.',
    owner: 'Sam L.',
    image: require('../assets/images/dress.jpg'),
  },
  {
    id: 'weekend-denim',
    title: 'Borrowed-blue denim',
    category: 'Jackets',
    size: 'XL · oversized',
    condition: 'Good vintage condition',
    price: 9,
    mode: 'swap',
    description: 'A perfectly worn-in denim layer. Hoping to trade for a knit or your favorite graphic tee.',
    owner: 'Riley C.',
    image: require('../assets/images/denim.jpg'),
  },
];

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const dateOptions = (offset: number, count = 7) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset + index);
    return date;
  });
