import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  thumb_2x: string;
  published_at: string;
}

async function fetchNews(): Promise<NewsItem[]> {
  const response = await fetch('/api/news');
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
}

export default function NewsWidget() {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['/api/news'],
    queryFn: fetchNews,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (error) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Crypto News</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">Failed to load news</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Crypto News</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-24 h-24 bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-zinc-800" />
                    <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // News items
            <div className="space-y-4">
              {news?.map((item, index) => (
                <a
                  key={`${item.url}-${item.published_at}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                >
                  {item.thumb_2x && (
                    <img
                      src={item.thumb_2x}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-white group-hover:text-purple-400 flex items-center gap-1">
                      {item.title}
                      <ExternalLink className="h-3 w-3 inline opacity-50" />
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {item.description}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(item.published_at).toLocaleDateString()}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}