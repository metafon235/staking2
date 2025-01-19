import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { stakeETH, submitStakeTransaction, getStakingWallet } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StakingData } from "@/lib/types";
import WalletInfo from "./WalletInfo";

export default function StakingCard() {
  const [amount, setAmount] = useState("");
  const [showWallet, setShowWallet] = useState(false);
  const [currentStakeId, setCurrentStakeId] = useState<number | null>(null);
  const [stakingWallet, setStakingWallet] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const stakeMutation = useMutation({
    mutationFn: async () => {
      const stake = await stakeETH(parseFloat(amount));
      setCurrentStakeId(stake.id);
      const wallet = await getStakingWallet();
      setStakingWallet(wallet.address);
      return stake;
    },
    onSuccess: () => {
      toast({
        title: "Stake Initiated",
        description: "Please send the specified amount to the provided wallet address"
      });
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

  const submitTransactionMutation = useMutation({
    mutationFn: async (transactionHash: string) => {
      if (!currentStakeId) throw new Error("No active stake");
      await submitStakeTransaction(currentStakeId, transactionHash);
    },
    onSuccess: () => {
      toast({
        title: "Transaction Submitted",
        description: "Your stake will be activated once the transaction is confirmed"
      });
      setAmount("");
      setShowWallet(false);
      setCurrentStakeId(null);
      setStakingWallet(null);
      queryClient.invalidateQueries({ queryKey: ['/api/staking/data'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Verification Failed",
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
    setShowWallet(true);
    stakeMutation.mutate();
  };

  const stakingData = queryClient.getQueryData<StakingData>(['/api/staking/data']);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Stake ETH</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Amount (ETH)</label>
          <Input
            type="number"
            placeholder="Min. 0.01 ETH"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setShowWallet(false);
              setCurrentStakeId(null);
              setStakingWallet(null);
            }}
            min="0.01"
            step="0.01"
            disabled={stakeMutation.isPending}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        {showWallet && stakingWallet && amount && (
          <div className="space-y-4">
            <WalletInfo address={stakingWallet} amount={amount} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">
                Transaction Hash (after sending ETH)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="0x..."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  onSubmit={(e) => submitTransactionMutation.mutate(e.currentTarget.value)}
                />
                <Button 
                  onClick={() => {
                    const hash = document.querySelector('input[placeholder="0x..."]') as HTMLInputElement;
                    if (hash.value) {
                      submitTransactionMutation.mutate(hash.value);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Verify
                </Button>
              </div>
            </div>
          </div>
        )}

        {stakingData && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Current Rewards:</span>
              <span>{stakingData.rewards.toFixed(9)} ETH</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Monthly Rewards:</span>
              <span>{stakingData.monthlyRewards.toFixed(9)} ETH</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Total Staked:</span>
              <span>{stakingData.totalStaked.toFixed(9)} ETH</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>APY:</span>
              <span>3.00%</span>
            </div>
          </div>
        )}

        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
          onClick={handleStake}
          disabled={stakeMutation.isPending || !amount || parseFloat(amount) < 0.01}
        >
          {stakeMutation.isPending ? "Processing..." : "Stake"}
        </Button>
      </CardContent>
    </Card>
  );
}