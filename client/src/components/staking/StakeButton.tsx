import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface StakeButtonProps {
  userId: number;
  onSuccess?: () => void;
}

export function StakeButton({ userId, onSuccess }: StakeButtonProps) {
  const [amount, setAmount] = useState<string>('');
  const { toast } = useToast();

  const stakeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/stakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to stake PIVX');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Staking initiated",
        description: `Successfully staked ${amount} PIVX`,
      });
      setAmount('');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Staking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStake = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to stake",
        variant: "destructive",
      });
      return;
    }

    stakeMutation.mutate();
  };

  return (
    <div className="flex gap-2">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter PIVX amount"
        className="px-3 py-2 border rounded-md"
        min="0"
        step="0.01"
      />
      <Button 
        onClick={handleStake}
        disabled={stakeMutation.isPending || !amount}
      >
        {stakeMutation.isPending ? "Staking..." : "Stake"}
      </Button>
    </div>
  );
}