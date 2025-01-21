import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 relative group"
        >
          <div className="absolute -top-2 -right-2">
            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
          Portfolio Rebalancing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Portfolio Rebalancing
            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ETH Allocation ({Math.round(targetAllocation.eth)}%)</Label>
              <Slider
                value={[targetAllocation.eth]}
                onValueChange={([value]) => setTargetAllocation({ ...targetAllocation, eth: value })}
                min={0}
                max={100}
                step={1}
                disabled={true}
                className="opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label>SOL Allocation ({Math.round(targetAllocation.sol)}%)</Label>
              <Slider
                value={[targetAllocation.sol]}
                onValueChange={([value]) => setTargetAllocation({ ...targetAllocation, sol: value })}
                min={0}
                max={100}
                step={1}
                disabled={true}
                className="opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label>DOT Allocation ({Math.round(targetAllocation.dot)}%)</Label>
              <Slider
                value={[targetAllocation.dot]}
                onValueChange={([value]) => setTargetAllocation({ ...targetAllocation, dot: value })}
                min={0}
                max={100}
                step={1}
                disabled={true}
                className="opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <Alert className="bg-purple-900/20 border-purple-900/50">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-purple-400">
              Coming Soon! Automatisches Portfolio Rebalancing für nur $1/Monat.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button
              disabled={true}
              className="bg-purple-600 hover:bg-purple-700 opacity-50 cursor-not-allowed"
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}