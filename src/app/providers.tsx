import { PropsWithChildren, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toast } from '@/components/common/Toast';

export const AppProviders = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toast />
    </QueryClientProvider>
  );
};
