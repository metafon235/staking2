import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface UserSettings {
  notificationSettings?: {
    rewardThreshold?: number;
    priceChangeThreshold?: number;
  };
}

async function fetchUserSettings() {
  const response = await fetch('/api/settings', {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
}

function SettingsContent() {
  const { toast } = useToast();

  const { data: settings, isLoading: isLoadingSettings } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
    queryFn: fetchUserSettings,
  });

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      {/* User Settings */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">User Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add other settings sections here */}
          <p className="text-zinc-400">More settings coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  return (
    <AppLayout>
      <SettingsContent />
    </AppLayout>
  );
}