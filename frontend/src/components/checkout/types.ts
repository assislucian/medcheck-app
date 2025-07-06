export type PaymentMethod = 'credit_card' | 'bank_slip' | 'pix';

export interface PlanInfo {
  planId: string;
  planName: string;
  price: string;
  interval: 'monthly' | 'yearly';
}
