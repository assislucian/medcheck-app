import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './hooks/use-theme';
import { NotificationProvider } from './contexts/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RealTimeSyncProvider } from './providers/RealTimeSyncProvider';
// import { MuiThemeProvider } from './mui-theme'

// Teste incremental: comece apenas com <App />
const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <RealTimeSyncProvider>
          <App />
        </RealTimeSyncProvider>
      </QueryClientProvider>
    </NotificationProvider>
  </ThemeProvider>
);

// Para testar incrementalmente, descomente cada bloco abaixo e recarregue a página.

// 1. Teste com MuiThemeProvider
// console.log('Renderizando com MuiThemeProvider')
// createRoot(document.getElementById("root")!).render(
//   <MuiThemeProvider>
//     <App />
//   </MuiThemeProvider>
// )

// 2. Teste com MuiThemeProvider + QueryClientProvider
// console.log('Renderizando com MuiThemeProvider + QueryClientProvider')
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     },
//   },
// })
// createRoot(document.getElementById("root")!).render(
//   <MuiThemeProvider>
//     <QueryClientProvider client={queryClient}>
//       <App />
//     </QueryClientProvider>
//   </MuiThemeProvider>
// )

// 3. Teste com MuiThemeProvider + QueryClientProvider + NotificationProvider
// console.log('Renderizando com MuiThemeProvider + QueryClientProvider + NotificationProvider')
// createRoot(document.getElementById("root")!).render(
//   <MuiThemeProvider>
//     <QueryClientProvider client={queryClient}>
//       <NotificationProvider>
//         <App />
//       </NotificationProvider>
//     </QueryClientProvider>
//   </MuiThemeProvider>
// )

// 4. Teste com todos os providers (incluindo ThemeProvider customizado)
// console.log('Renderizando com todos os providers')
// createRoot(document.getElementById("root")!).render(
//   <AppThemeProvider>
//     <MuiThemeProvider>
//       <QueryClientProvider client={queryClient}>
//         <NotificationProvider>
//           <App />
//         </NotificationProvider>
//       </QueryClientProvider>
//     </MuiThemeProvider>
//   </AppThemeProvider>
// )
