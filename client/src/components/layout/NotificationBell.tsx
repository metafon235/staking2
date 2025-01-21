import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: 'reward' | 'price_change' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to mark notification as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Benachrichtigung konnte nicht als gelesen markiert werden"
      });
    }
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Erfolg",
        description: "Benachrichtigung wurde gelöscht"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Benachrichtigung konnte nicht gelöscht werden"
      });
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <ScrollArea className="h-[300px]">
          <div className="p-4">
            <h4 className="text-sm font-medium mb-4">Benachrichtigungen</h4>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Benachrichtigungen vorhanden
              </p>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors relative group ${
                      notification.read
                        ? 'bg-muted/50'
                        : 'bg-primary/10'
                    }`}
                  >
                    <div
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead.mutate(notification.id);
                        }
                      }}
                    >
                      <h5 className="text-sm font-medium mb-1">
                        {notification.title}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteNotification.mutate(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}