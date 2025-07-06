/**
 * Utility functions for formatting and validation
 */

/**
 * Format currency values to Brazilian Real (BRL)
 * @param value Number to format
 * @returns Formatted string
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) {
    return 'R$ 0,00';
  }

  try {
    // Ensure the value is a number
    const numValue = typeof value === 'number' ? value : Number(value);

    // Check if it's a valid number
    if (isNaN(numValue)) {
      return 'R$ 0,00';
    }

    return numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch (error) {
    console.error('Erro ao formatar valor:', error);
    return 'R$ 0,00';
  }
};

/**
 * Validate CRM format (XX NNNNN)
 * @param crm CRM string to validate
 * @returns Boolean indicating if CRM is valid
 */
export const validateCRM = (crm: string): boolean => {
  // Format should be: 2 letters + space + numbers (typically 5 digits but can vary)
  const crmRegex = /^[A-Z]{2}\s\d{4,6}$/;
  return crmRegex.test(crm);
};

/**
 * Format CRM to standard format (XX NNNNN)
 * @param crm CRM string to format
 * @returns Formatted CRM string
 */
export const formatCRM = (crm: string): string => {
  // Remove all spaces and make uppercase
  const cleanCRM = crm.replace(/\s/g, '').toUpperCase();

  // If we have at least 2 characters and some digits
  if (cleanCRM.length >= 3) {
    const state = cleanCRM.substring(0, 2);
    const number = cleanCRM.substring(2);
    return `${state} ${number}`;
  }

  return crm;
};
