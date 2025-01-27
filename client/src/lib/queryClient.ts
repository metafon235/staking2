import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          const res = await fetch(queryKey[0] as string, {
            credentials: "include",
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error(`API Error (${res.status}):`, errorText);

            if (res.status >= 500) {
              throw new Error(`Server error: ${res.status}`);
            }

            throw new Error(errorText);
          }

          const data = await res.json();
          console.log('API Response:', queryKey[0], data);
          return data;
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: false,
    }
  },
});