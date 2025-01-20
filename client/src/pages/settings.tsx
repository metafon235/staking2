import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, AlertCircle, Copy, Link as LinkIcon, Check, X, Users, Gift } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateEthereumAddress } from "@/lib/validation";

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
  const [addressValidation, setAddressValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true });
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
      setAddressValidation(validateEthereumAddress(settings.walletAddress));
    }
  }, [settings?.walletAddress]);

  // Validate address on change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setWalletAddress(newAddress);
    if (newAddress) {
      setAddressValidation(validateEthereumAddress(newAddress));
    } else {
      setAddressValidation({ isValid: true });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateEthereumAddress(walletAddress);
    setAddressValidation(validation);

    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validation.error
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

      {/* Referral Section - Moved to top for better visibility */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-400" />
            Referral Programm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          {settings?.referralStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <p className="text-sm text-zinc-400">Vermittelte Nutzer</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {settings.referralStats.totalReferrals}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-purple-400" />
                  <p className="text-sm text-zinc-400">Verdiente Rewards</p>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  {settings.referralStats.totalRewards > 0 
                    ? `${settings.referralStats.totalRewards.toFixed(9)} ETH`
                    : '0.000000000 ETH'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Ihr Referral-Link
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={settings?.referralCode 
                  ? `${window.location.origin}/auth?ref=${settings.referralCode}`
                  : 'Wird geladen...'
                }
                className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyReferralLink}
                className="shrink-0 hover:bg-purple-600/20 hover:text-purple-400"
                disabled={!settings?.referralCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-zinc-500">
              Teilen Sie diesen Link und verdienen Sie 1% der Staking-Rewards Ihrer vermittelten Nutzer!
            </p>
          </div>

          {/* Referral Info */}
          <Alert className="bg-purple-900/20 border-purple-900/50">
            <Gift className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-purple-400">
              Wenn Ihre vermittelten Nutzer ETH staken, erhalten Sie automatisch 1% ihrer Staking-Rewards!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Wallet Settings */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Wallet Einstellungen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">
                Einzahlungs-/Auszahlungs-Wallet Adresse
              </label>
              <div className="relative">
                <Input
                  value={walletAddress}
                  onChange={handleAddressChange}
                  placeholder="Geben Sie Ihre ETH Wallet-Adresse ein"
                  className={`bg-zinc-800 border-zinc-700 text-white pr-10 ${
                    walletAddress && (addressValidation.isValid ? 'border-green-500' : 'border-red-500')
                  }`}
                />
                {walletAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {addressValidation.isValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {!addressValidation.isValid && (
                <p className="text-sm text-red-500">{addressValidation.error}</p>
              )}
              <p className="text-xs text-zinc-500">
                Diese Wallet wird für Einzahlungen und Auszahlungen verwendet
              </p>
            </div>

            <Alert className="bg-yellow-900/20 border-yellow-900/50 text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Wichtig: Stellen Sie sicher, dass Sie eine gültige Ethereum-Wallet-Adresse angeben. 
                Diese Adresse wird für alle Transaktionen verwendet.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={updateMutation.isPending || !addressValidation.isValid}
            >
              {updateMutation.isPending ? "Wird aktualisiert..." : "Änderungen speichern"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}