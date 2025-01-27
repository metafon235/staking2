import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, AlertCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateEthereumAddress } from "@/lib/validation";

interface UserSettings {
  walletAddress?: string;
}

async function updateWalletAddress(walletAddress: string) {
  const response = await fetch('/api/settings/wallet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update wallet address');
  }

  return response.json();
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
  const [walletAddress, setWalletAddress] = useState("");
  const [addressValidation, setAddressValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true });
  const { toast } = useToast();

  const { data: settings, isLoading: isLoadingSettings } = useQuery<UserSettings>({
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

  useEffect(() => {
    if (settings?.walletAddress) {
      setWalletAddress(settings.walletAddress);
      setAddressValidation(validateEthereumAddress(settings.walletAddress));
    }
  }, [settings?.walletAddress]);

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

export default function Settings() {
  return (
    <AppLayout>
      <SettingsContent />
    </AppLayout>
  );
}