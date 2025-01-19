import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, AlertCircle, Wallet, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { connectWallet } from "@/lib/web3";

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

export default function Settings() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
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

  // Set initial wallet address when settings are loaded
  useEffect(() => {
    if (settings?.walletAddress) {
      setWalletAddress(settings.walletAddress);
    }
  }, [settings]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      updateMutation.mutate(address);

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your Web3 wallet."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateWallet = () => {
    // Open Coinbase Wallet website in a new tab
    window.open('https://www.coinbase.com/wallet', '_blank');
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
          <CardTitle className="text-white">Web3 Wallet Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              Connected Wallet Address
            </label>
            <div className="flex items-center gap-4">
              <Input
                value={walletAddress}
                readOnly
                placeholder="No wallet connected"
                className="bg-zinc-800 border-zinc-700 text-white flex-1"
              />
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </div>

          {!walletAddress && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={handleCreateWallet}
                className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Create New Wallet
              </Button>
            </div>
          )}

          <Alert className="bg-yellow-900/20 border-yellow-900/50 text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Important: Your Web3 wallet is used for all staking transactions and withdrawals. Make sure to securely store your wallet credentials.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Funding/Withdrawal Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
              onClick={() => updateMutation.mutate(walletAddress)}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}