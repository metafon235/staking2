import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { stakeETH } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { StakingData } from "@/lib/types";

export default function StakingCard() {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch staking data every minute
  const { data: stakingData, error } = useQuery<StakingData>({
    queryKey: ['/api/staking/data'],
    refetchInterval: 60000, // Refetch every minute
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale to force refresh
  });

  // Force refresh when component mounts and set up interval
  useEffect(() => {
    // Initial fetch
    queryClient.invalidateQueries({ queryKey: ['/api/staking/data'] });

    const interval = setInterval(() => {
      console.log('Refreshing staking data...', new Date().toISOString());
      queryClient.invalidateQueries({ queryKey: ['/api/staking/data'] });
    }, 60000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const stakeMutation = useMutation({
    mutationFn: () => stakeETH(parseFloat(amount)),
    onSuccess: () => {
      toast({
        title: "Staking Successful",
        description: `Successfully staked ${amount} ETH. Your rewards will start accumulating.`
      });
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ['/api/staking/data'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Staking Failed",
        description: error.message
      });
    }
  });

  const handleStake = () => {
    const amountNum = parseFloat(amount);
    if (!amount || amountNum < 0.01) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Minimum stake amount is 0.01 ETH"
      });
      return;
    }
    stakeMutation.mutate();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-500">Failed to load staking data. Please try again later.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stake ETH</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (ETH)</label>
          <Input
            type="number"
            placeholder="Min. 0.01 ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            disabled={stakeMutation.isPending}
          />
        </div>

        {stakingData && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm">
              <span>Current Rewards:</span>
              <span>{stakingData.rewards.toFixed(6)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Projected Monthly:</span>
              <span>{stakingData.projected.toFixed(6)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Staked:</span>
              <span>{stakingData.totalStaked.toFixed(2)} ETH</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>APY:</span>
              <span>3.00%</span>
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleStake}
          disabled={stakeMutation.isPending || !amount || parseFloat(amount) < 0.01}
        >
          {stakeMutation.isPending ? "Staking..." : "Stake"}
        </Button>
      </CardContent>
    </Card>
  );
}