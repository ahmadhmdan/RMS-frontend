import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 60 * 24, // 24 hours - data is considered fresh for 1 full day
            gcTime: 1000 * 60 * 60 * 24,     // 24 hours - unused/inactive data stays in cache for 1 day
            retry: 1,
            refetchOnWindowFocus: false,    // prevents automatic refetch when user returns to tab
        },
    },
});

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
    );
};