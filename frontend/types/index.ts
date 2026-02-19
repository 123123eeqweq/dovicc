export interface Company {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  address: string;
  isOpen: boolean;
  closingTime?: string;
  openingTime?: string;
  imageUrl: string;
  isPremium?: boolean;
  isTop?: boolean;
  phone?: string;
  email?: string;
  website?: string;
}

export interface Review {
  id: string;
  author: string;
  authorInitials: string;
  avatarUrl?: string;
  rating: number;
  date: string;
  text: string;
  isVerified: boolean;
  likes: number;
  dislikes: number;
  pros?: string[];
  cons?: string[];
  reply?: {
    author: string;
    text: string;
    date: string;
  };
  photos?: string[];
  companyName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
  color: string;
}
