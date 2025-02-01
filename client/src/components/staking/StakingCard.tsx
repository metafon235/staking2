import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { stakePIVX } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface StakingCardProps {
  isLoading?: boolean;
}

import { ErrorBoundary } from 'react-error-boundary';

function StakingCardContent({ isLoading }: StakingCardProps) {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const stakeMutation = useMutation({
    mutationFn: () => stakePIVX(parseFloat(amount)),
    onSuccess: () => {
      toast({
        title: "Staking Successful",
        description: `Successfully staked ${amount} PIVX. Your rewards will start accumulating.`
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
    if (!amount || amountNum < 100) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Minimum stake amount is 100 PIVX"
      });
      return;
    }
    stakeMutation.mutate();
  };

  const stakingData = queryClient.getQueryData<StakingData>(['/api/staking/data']);

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Stake PIVX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 bg-zinc-800" />
          <Skeleton className="h-32 bg-zinc-800" />
          <Skeleton className="h-10 bg-zinc-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Stake PIVX</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Amount (PIVX)</label>
          <Input
            type="number"
            placeholder="Min. 100 PIVX"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            step="1"
            disabled={stakeMutation.isPending}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        {stakingData && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Current Rewards:</span>
              <span>{stakingData.rewards.toFixed(2)} PIVX</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Monthly Rewards:</span>
              <span>{(stakingData.totalStaked * 0.10 / 12).toFixed(2)} PIVX</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Total Staked:</span>
              <span>{stakingData.totalStaked.toFixed(2)} PIVX</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>APY:</span>
              <span>10.00%</span>
            </div>
          </div>
        )}

        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
          onClick={handleStake}
          disabled={stakeMutation.isPending || !amount || parseFloat(amount) < 100}
        >
          {stakeMutation.isPending ? "Staking..." : "Stake"}
        </Button>
      </CardContent>
    </Card>
  );
}