import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { stakeETH } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export default function StakingCard() {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleStake = async () => {
    try {
      await stakeETH(parseFloat(amount));
      toast({
        title: "Staking Successful",
        description: `Successfully staked ${amount} ETH`
      });
      setAmount("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Staking Failed",
        description: "Failed to stake ETH. Please try again."
      });
    }
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
          />
        </div>
        <Button 
          className="w-full" 
          onClick={handleStake}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Stake
        </Button>
      </CardContent>
    </Card>
  );
}
