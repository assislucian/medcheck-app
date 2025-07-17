import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px',
    },
    extend: {
      colors: {
        // Health-plan page palette - cool medical colors
        brand: {
          blue: '#0074D9',
          sky: '#E6F4FF',
          mint: '#D5F5EB',
          navy: '#002B5B',
          green: '#079E5B',
          50: '#E6F4FF', // Light blue wash
          100: '#D5F5EB', // Light mint wash
          200: '#BAE6FD', // Soft blue
          300: '#7DD3FC', // Light cyan-blue
          400: '#38BDF8', // Bright cyan
          500: '#0074D9', // Primary medical blue
          600: '#0284C7', // Deep blue
          700: '#002B5B', // Dark navy
          800: '#075985', // Very dark blue
          900: '#0C4A6E', // Navy blue
        },
        medical: {
          50: '#E6F4FF', // Crisp white with hint of blue
          100: '#D5F5EB', // Very light mint
          200: '#BAE6FD', // Light wash
          300: '#7DD3FC', // Soft blue for accents
          400: '#38BDF8', // Medium blue for highlights
          500: '#0074D9', // Primary medical blue
          600: '#0074D9', // Trust blue
          700: '#002B5B', // Deep trust blue
          800: '#002B5B', // Dark professional blue
          900: '#002B5B', // Deep navy
        },
        mint: {
          50: '#D5F5EB', // Very light mint
          100: '#D5F5EB', // Light mint wash
          200: '#99F6E4', // Soft mint
          300: '#5EEAD4', // Fresh mint
          400: '#2DD4BF', // Bright teal
          500: '#079E5B', // Primary green
          600: '#079E5B', // Deep teal
          700: '#079E5B', // Dark teal
          800: '#115E59', // Very dark teal
          900: '#134E4A', // Deep teal-green
        },
        clinical: {
          50: '#FAFAFA', // Clinical white
          100: '#F4F4F5', // Light gray
          200: '#E4E4E7', // Soft gray
          300: '#D4D4D8', // Medium gray
          400: '#A1A1AA', // Gray for text
          500: '#71717A', // Dark gray
          600: '#52525B', // Darker gray
          700: '#3F3F46', // Very dark gray
          800: '#27272A', // Near black
          900: '#18181B', // Deep black
        },
        trust: {
          50: '#E6F4FF', // Trust blue wash
          100: '#D5F5EB', // Light trust blue
          200: '#BAE6FD', // Soft trust blue
          300: '#7DD3FC', // Medium trust blue
          400: '#38BDF8', // Bright trust blue
          500: '#0074D9', // Primary trust blue
          600: '#0074D9', // Deep trust blue
          700: '#002B5B', // Dark trust blue
          800: '#002B5B', // Very dark trust blue
          900: '#002B5B', // Navy trust blue
        },
        ink: {
          DEFAULT: '#14171A',
          light: '#3C4043',
        },
        // Semantic color groups
        'health-primary': '#0074D9',
        'health-accent': '#079E5B',
        'health-surface': '#E6F4FF',
        'health-soft': '#D5F5EB',
        'health-dark': '#002B5B',
        /* --- Semantic tokens already mapped above --- */
        /* Surface scale (0–3) – used for subtle background elevations.
           Allows utility classes like bg-surface-1 or border-surface-3 to
           compile correctly in both light and dark themes (values come from
           CSS variables declared in index.css) */
        'surface-0': 'rgb(var(--surface-0) / <alpha-value>)',
        'surface-1': 'rgb(var(--surface-1) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        'surface-3': 'rgb(var(--surface-3) / <alpha-value>)',
        /* Additional alias for text-body if used as text-body class */
        body: {
          DEFAULT: 'rgb(var(--text-body) / <alpha-value>)',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
