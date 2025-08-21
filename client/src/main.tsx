import "./dev-debug";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Initialize i18n service
import { i18nService } from "./services/i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/auth-context";
import { SidebarProvider } from "./contexts/sidebar-context";
import { NotificationProvider } from "./components/NotificationToast";
import { fixApiUrl } from "./utils/urlJoin";

// Global fetch interceptor to fix API URL duplication issues
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string') {
    input = fixApiUrl(input);
  } else if (input instanceof URL) {
    input = new URL(fixApiUrl(input.toString()));
  }
  return originalFetch(input, init);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Initialize i18n service before rendering
i18nService.initialize().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="affiliate-platform-theme">
        <QueryClientProvider client={queryClient}>
<<<<<<< HEAD
          <NotificationProvider>
            <AuthProvider>
              <SidebarProvider>
                <App />
              </SidebarProvider>
            </AuthProvider>
          </NotificationProvider>
=======
          <AuthProvider>
            <SidebarProvider>
              <App />
            </SidebarProvider>
          </AuthProvider>
>>>>>>> pr148-branch
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}).catch(error => {
  console.error('Failed to initialize i18n service:', error);
  // Still render the app even if i18n fails
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="affiliate-platform-theme">
        <QueryClientProvider client={queryClient}>
<<<<<<< HEAD
          <NotificationProvider>
            <AuthProvider>
              <SidebarProvider>
                <App />
              </SidebarProvider>
            </AuthProvider>
          </NotificationProvider>
=======
          <AuthProvider>
            <SidebarProvider>
              <App />
            </SidebarProvider>
          </AuthProvider>
>>>>>>> pr148-branch
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
});
