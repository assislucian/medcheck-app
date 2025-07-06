import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';

const muiTheme = createTheme({
  typography: {
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
});

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
