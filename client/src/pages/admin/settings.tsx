import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AdminSettings {
  masterWalletAddress: string;
  updatedAt: string | null;
  updatedBy: number | null;
}

const walletSchema = z.object({
  walletAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
    .min(42, "Ethereum address must be 42 characters")
    .max(42, "Ethereum address must be 42 characters")
});

type WalletFormData = z.infer<typeof walletSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<AdminSettings>({
    queryKey: ['/api/admin/settings'],
  });

  const { mutate: updateWallet, isPending: isUpdating } = useMutation({
    mutationFn: async (data: WalletFormData) => {
      const response = await fetch('/api/admin/settings/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Master wallet has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      walletAddress: '',
    },
    values: settings ? {
      walletAddress: settings.masterWalletAddress,
    } : undefined,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const onSubmit = (data: WalletFormData) => {
    updateWallet(data);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Master Staking Wallet</CardTitle>
            <CardDescription>
              Configure the master wallet that will be used for staking operations.
              All user stakes will be managed through this wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Ethereum Wallet Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="walletAddress"
                    placeholder="0x..."
                    {...form.register("walletAddress")}
                  />
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
                {form.formState.errors.walletAddress && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {form.formState.errors.walletAddress.message}
                  </p>
                )}
              </div>

              {settings?.updatedAt && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Last updated: {format(new Date(settings.updatedAt), 'PPpp')}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}