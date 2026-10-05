import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { AuthBootstrap } from '@/components/auth/AuthBootstrap';
import { store } from '@/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </Provider>
  );
}
