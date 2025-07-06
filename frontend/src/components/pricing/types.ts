import { LucideIcon } from 'lucide-react';

export type BillingInterval = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: string;
    yearly: string;
  };
  discount?: {
    yearly?: string;
  };
  features: string[];
  icon: LucideIcon;
  bgColor: string;
  isFeatured?: boolean;
  isEnterprise?: boolean;
}

export interface PricingPlansProps {
  isLoggedIn: boolean;
  isTrial: boolean;
  onCheckout: () => boolean;
}
