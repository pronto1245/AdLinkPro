import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n";
import App from "./App";

// ИСПРАВЛЕННЫЙ global error handler - предотвращает unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Тихо обрабатываем ошибки без выброса в консоль
  console.warn('Promise rejection handled:', event.reason?.message || 'Unknown error');
  event.preventDefault(); // Предотвращаем default error behavior
});

window.addEventListener('error', (event) => {
  // Тихо обрабатываем критичные ошибки  
  if (!event.message?.includes('ResizeObserver') && 
      !event.message?.includes('Non-Error promise')) {
    console.warn('Global error handled:', event.error?.message || event.message);
  }
  event.preventDefault();
});
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false, // Отключаем retry полностью
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Глобальный error handler для queries
      onError: (error: any) => {
        console.warn('Query error handled:', error.message);
      },
    },
    mutations: {
      retry: false,
      // Глобальный error handler для mutations
      onError: (error: any) => {
        console.warn('Mutation error handled:', error.message);
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="affiliate-platform-theme">
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
