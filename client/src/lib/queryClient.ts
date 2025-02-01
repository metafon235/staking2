import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          const res = await fetch(queryKey[0] as string, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) {
            if (res.status === 401) {
              return null;
            }
            const errorText = await res.text();
            throw new Error(errorText);
          }

          return res.json();
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      },
      refetchInterval: 30000, // Reduce polling frequency to 30 seconds
      refetchOnWindowFocus: 'always',
      staleTime: 25000, // Cache valid for 25 seconds
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000),
    },
    mutations: {
      retry: false,
    }
  },
});