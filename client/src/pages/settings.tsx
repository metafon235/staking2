import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, AlertCircle, Copy, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

async function updateWalletAddress(walletAddress: string) {
  const response = await fetch('/api/settings/wallet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update wallet address');
  }

  return response.json();
}

async function fetchUserSettings() {
  const response = await fetch('/api/settings');
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
}

interface UserSettings {
  walletAddress?: string;
  referralCode?: string;
  referralStats?: {
    totalReferrals: number;
    totalRewards: number;
  };
}

export default function Settings() {
  const [walletAddress, setWalletAddress] = useState("");
  const { toast } = useToast();

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: fetchUserSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateWalletAddress,
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your wallet address has been successfully updated."
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Update",
        description: error.message
      });
    }
  });

  // Update wallet address when settings are loaded
  useEffect(() => {
    if (settings?.walletAddress) {
      setWalletAddress(settings.walletAddress);
    }
  }, [settings?.walletAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a wallet address"
      });
      return;
    }
    updateMutation.mutate(walletAddress);
  };

  const handleCopyReferralLink = () => {
    if (!settings?.referralCode) return;

    const referralLink = `${window.location.origin}/auth?ref=${settings.referralCode}`;
    navigator.clipboard.writeText(referralLink);

    toast({
      title: "Referral Link Copied",
      description: "Your referral link has been copied to clipboard"
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Wallet Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">
                Funding/Withdrawal Wallet Address
              </label>
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your ETH wallet address"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="text-xs text-zinc-500">
                This wallet will be used for depositing stakes and receiving withdrawals
              </p>
            </div>

            <Alert className="bg-yellow-900/20 border-yellow-900/50 text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Important: Stake activation and deactivation processes take 24-48 hours to complete for security purposes.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Referral Section */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Referral Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Your Referral Link</label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={settings?.referralCode ? `${window.location.origin}/auth?ref=${settings.referralCode}` : 'Loading...'}
                className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyReferralLink}
                className="shrink-0"
                disabled={!settings?.referralCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-zinc-500">
              Share this link and earn 1% of the staking rewards generated by your referrals!
            </p>
          </div>

          {settings?.referralStats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm text-zinc-400">Total Referrals</p>
                <p className="text-2xl font-bold text-white">
                  {settings.referralStats.totalReferrals}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm text-zinc-400">Earned Rewards</p>
                <p className="text-2xl font-bold text-purple-400">
                  {settings.referralStats.totalRewards.toFixed(9)} ETH
                </p>
              </div>
            </div>
          )}

          <Alert className="bg-purple-900/20 border-purple-900/50">
            <LinkIcon className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-purple-400">
              When your referrals stake their ETH, you'll automatically earn 1% of their staking rewards!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}