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
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      staleTime: 0,
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: false,
    }
  },
});