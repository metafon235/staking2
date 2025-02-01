
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Copy } from "lucide-react";

interface UserSettings {
  coldStakingAddress?: string;
  ownerAddress?: string;
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

async function generateColdStakingWallet() {
  const response = await fetch('/api/settings/cold-staking', {
    method: 'POST',
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to generate cold staking wallet');
  }
  return response.json();
}

function SettingsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: settings, isLoading: isLoadingSettings } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
    queryFn: fetchUserSettings,
  });

  const generateWalletMutation = useMutation({
    mutationFn: generateColdStakingWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Cold staking wallet generated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard"
    });
  };

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

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Cold Staking Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">
              Generate a cold staking wallet to secure your PIVX while earning staking rewards.
              The platform will retain 3% of staking rewards for maintenance.
            </p>
            {settings?.coldStakingAddress ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200">Cold Staking Address</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-zinc-800 rounded text-sm">
                      {settings.coldStakingAddress}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(settings.coldStakingAddress!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {settings.ownerAddress && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-200">Owner Address</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-zinc-800 rounded text-sm">
                        {settings.ownerAddress}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(settings.ownerAddress!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => generateWalletMutation.mutate()}
                disabled={generateWalletMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {generateWalletMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Generate Cold Staking Wallet
              </Button>
            )}
          </div>
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
