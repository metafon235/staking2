import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { stakeETH } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { StakingData } from "@/lib/types";

export default function StakingCard() {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch staking data every minute
  const { data: stakingData } = useQuery<StakingData>({
    queryKey: ['/api/staking/data'],
    refetchInterval: 60000, // Refetch every minute
  });

  const stakeMutation = useMutation({
    mutationFn: () => stakeETH(parseFloat(amount)),
    onSuccess: () => {
      toast({
        title: "Staking Successful",
        description: `Successfully initiated staking of ${amount} ETH`
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
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to stake"
      });
      return;
    }
    stakeMutation.mutate();
  };

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
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={stakeMutation.isPending}
          />
        </div>

        {stakingData && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm">
              <span>Current Rewards:</span>
              <span>{stakingData.rewards.toFixed(8)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Projected Monthly:</span>
              <span>{stakingData.projected.toFixed(8)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Staked:</span>
              <span>{stakingData.totalStaked.toFixed(8)} ETH</span>
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
          disabled={stakeMutation.isPending || !amount || parseFloat(amount) <= 0}
        >
          {stakeMutation.isPending ? "Staking..." : "Stake"}
        </Button>
      </CardContent>
    </Card>
  );
}