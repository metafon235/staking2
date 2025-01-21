import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface PortfolioAllocation {
  eth: number;
  sol: number;
  dot: number;
}

interface RebalancePortfolioDialogProps {
  currentAllocation: PortfolioAllocation;
  isEnabled?: boolean;
}

export default function RebalancePortfolioDialog({ 
  currentAllocation,
  isEnabled = true 
}: RebalancePortfolioDialogProps) {
  const [targetAllocation, setTargetAllocation] = useState<PortfolioAllocation>(currentAllocation);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rebalanceMutation = useMutation({
    mutationFn: async (allocation: PortfolioAllocation) => {
      const response = await fetch('/api/portfolio/rebalance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allocation),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rebalance portfolio');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      toast({
        title: "Portfolio Rebalanced",
        description: "Your portfolio has been successfully rebalanced."
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Rebalancing Failed",
        description: error.message
      });
    }
  });

  const handleRebalance = () => {
    rebalanceMutation.mutate(targetAllocation);
  };

  const updateAllocation = (coin: keyof PortfolioAllocation, value: number) => {
    const remaining = 100 - value;
    const otherCoins = Object.keys(targetAllocation).filter(c => c !== coin) as Array<keyof PortfolioAllocation>;
    const currentOtherTotal = otherCoins.reduce((sum, c) => sum + targetAllocation[c], 0);
    
    const newAllocation = { ...targetAllocation };
    newAllocation[coin] = value;

    // Proportionally adjust other allocations
    if (currentOtherTotal > 0) {
      otherCoins.forEach(c => {
        newAllocation[c] = (targetAllocation[c] / currentOtherTotal) * remaining;
      });
    } else {
      // If other allocations are 0, distribute equally
      otherCoins.forEach(c => {
        newAllocation[c] = remaining / otherCoins.length;
      });
    }

    setTargetAllocation(newAllocation);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          disabled={!isEnabled}
        >
          {isEnabled ? "Rebalance Portfolio" : "Coming Soon"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rebalance Portfolio</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ETH Allocation ({Math.round(targetAllocation.eth)}%)</Label>
              <Slider
                value={[targetAllocation.eth]}
                onValueChange={([value]) => updateAllocation('eth', value)}
                min={0}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-purple-600"
              />
            </div>
            <div className="space-y-2">
              <Label>SOL Allocation ({Math.round(targetAllocation.sol)}%)</Label>
              <Slider
                value={[targetAllocation.sol]}
                onValueChange={([value]) => updateAllocation('sol', value)}
                min={0}
                max={100}
                step={1}
                disabled={true}
                className="opacity-50 cursor-not-allowed"
              />
              <p className="text-sm text-zinc-500">Coming soon</p>
            </div>
            <div className="space-y-2">
              <Label>DOT Allocation ({Math.round(targetAllocation.dot)}%)</Label>
              <Slider
                value={[targetAllocation.dot]}
                onValueChange={([value]) => updateAllocation('dot', value)}
                min={0}
                max={100}
                step={1}
                disabled={true}
                className="opacity-50 cursor-not-allowed"
              />
              <p className="text-sm text-zinc-500">Coming soon</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleRebalance}
              disabled={rebalanceMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {rebalanceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rebalancing...
                </>
              ) : (
                'Rebalance Now'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
