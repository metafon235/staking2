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

          const contentType = res.headers.get('content-type');
          let data;

          try {
            data = await res.json();
          } catch (e) {
            console.error('Failed to parse JSON:', e);
            return null;
          }

          if (!res.ok) {
            if (res.status === 401) {
              return null;
            }
            console.error('API Error:', res.status, data);
            return null;
          }

          return data;
        } catch (error) {
          console.error('Query error:', error);
          return null;
        }
      },
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      retry: 1,
      retryDelay: 1000,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    }
  },
});