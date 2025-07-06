import { Star, BadgeDollarSign, ShieldCheck } from 'lucide-react';
import type { Plan } from './types';

export const plans: Plan[] = [
  {
    id: 'price_individual_monthly', // Stripe price ID for individual monthly plan
    name: 'Individual',
    description: 'Plano ideal para médicos individuais',
    price: {
      monthly: 'R$ 89,90',
      yearly: 'R$ 899,00',
    },
    discount: {
      yearly: '16%',
    },
    features: [
      '1 CRM registrado',
      'Uploads ilimitados',
      'Histórico completo',
      'Exportação para Excel',
      'Suporte por email',
    ],
    icon: Star,
    bgColor: 'from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30',
  },
  {
    id: 'price_clinic_monthly', // Stripe price ID for clinic monthly plan
    name: 'Clínica',
    description: 'Para clínicas e grupos médicos',
    price: {
      monthly: 'R$ 299,90',
      yearly: 'R$ 2.999,00',
    },
    discount: {
      yearly: '16%',
    },
    features: [
      'Até 5 CRMs registrados',
      'Uploads ilimitados',
      'Histórico completo',
      'Exportação para Excel',
      'Suporte prioritário',
      'Dashboard avançado para clínicas',
      'Relatórios consolidados',
    ],
    icon: BadgeDollarSign,
    bgColor:
      'from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/30',
    isFeatured: true,
  },
  {
    id: 'price_premium_monthly', // Stripe price ID for premium monthly plan
    name: 'Premium',
    description: 'Soluções personalizadas para hospitais',
    price: {
      monthly: 'Sob consulta',
      yearly: 'Sob consulta',
    },
    features: [
      'CRMs ilimitados',
      'Uploads ilimitados',
      'Histórico completo',
      'Exportação personalizada',
      'Suporte premium 24/7',
      'Integrações com sistemas',
      'Dashboard personalizado',
      'Treinamento dedicado',
      'API para integração',
    ],
    icon: ShieldCheck,
    bgColor:
      'from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30',
    isEnterprise: true,
  },
];
