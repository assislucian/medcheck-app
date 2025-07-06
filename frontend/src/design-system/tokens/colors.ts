/**
 * MedCheck Design System - Color Tokens
 *
 * This file defines all color tokens used throughout the application.
 */

export const colors = {
  // Brand Colors
  primary: {
    50: '#EBF8FF',
    100: '#D1EEFC',
    200: '#A7D8F0',
    300: '#7CC1E4',
    400: '#55AAD4',
    500: '#3182CE', // Primary brand color
    600: '#2B6CB0',
    700: '#2C5282',
    800: '#2A4365',
    900: '#1A365D',
  },

  // Secondary colors
  secondary: {
    50: '#F0F9E6',
    100: '#DCFCB8',
    200: '#C2F18C',
    300: '#A0D970',
    400: '#7DC142',
    500: '#68C239', // Secondary brand color
    600: '#4D9E28',
    700: '#389016',
    800: '#256811',
    900: '#1E5209',
  },

  // Neutral colors
  neutral: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096', // Base neutral
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },

  // Feedback colors
  success: {
    100: '#E3F5E6',
    500: '#48BB78',
    700: '#276749',
  },
  warning: {
    100: '#FEFCBF',
    500: '#ECC94B',
    700: '#975A16',
  },
  error: {
    100: '#FED7D7',
    500: '#F56565',
    700: '#C53030',
  },
  info: {
    100: '#E6F6FF',
    500: '#4299E1',
    700: '#2B6CB0',
  },

  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ColorToken = keyof typeof colors;
