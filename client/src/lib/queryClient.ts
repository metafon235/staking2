import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          console.log('Fetching:', queryKey[0]); // Debug log

          const res = await fetch(queryKey[0] as string, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          // First try to parse the response as JSON
          let data;
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await res.json();
          } else {
            data = await res.text();
          }

          // Log the response for debugging
          console.log('API Response:', {
            status: res.status,
            data,
            url: queryKey[0],
          });

          if (!res.ok) {
            // For 401s, we don't want to show an error, just return null
            if (res.status === 401) {
              return null;
            }
            throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
          }

          return data;
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      },
      refetchInterval: 5000, // Refetch every 5 seconds
      refetchOnWindowFocus: true,
      retry: 1,
      retryDelay: 1000,
      staleTime: 0, // Always fetch fresh data
    },
    mutations: {
      retry: false,
    }
  },
});