import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return 'R$ 0,00';
  }
  try {
    const numValue = typeof value === 'number' ? value : Number(value);
    if (isNaN(numValue)) {
      return 'R$ 0,00';
    }
    return numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch (error) {
    console.error('Erro ao formatar valor:', error);
    return 'R$ 0,00';
  }
}
