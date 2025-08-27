import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
  toggleTheme: () => null,
  resetTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'medcheck-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get the saved theme from localStorage
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }

    // Sempre usar light mode como padrão, independente da preferência do sistema
    // O usuário pode escolher dark mode manualmente se desejar
    return 'light';
  });

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Função para limpar cache e resetar para light mode
  const resetTheme = () => {
    localStorage.removeItem(storageKey);
    setTheme('light');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);

    // Ensure that the body also has the theme class
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);

    // Set a data-theme attribute for custom styling if needed
    document.documentElement.setAttribute('data-theme', theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1A1A1A' : '#FFFFFF');
    }

    // Debug logging para mobile
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 Theme changed:', {
        theme,
        storageKey,
        localStorage: localStorage.getItem(storageKey),
        prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
        userAgent: navigator.userAgent,
        isMobile: window.innerWidth < 768,
        rootClasses: root.className,
        bodyClasses: document.body.className
      });
      
      // Instruções para limpar cache no mobile
      console.log('🔧 Para limpar cache do tema no mobile, execute no console:');
      console.log('localStorage.removeItem("medcheck-theme"); location.reload();');
    }
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (theme: Theme) => setTheme(theme),
    toggleTheme,
    resetTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
