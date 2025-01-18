import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectWallet } from "@/lib/coinbase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleConnect = async () => {
    try {
      await connectWallet();
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to Coinbase Wallet"
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Ethereum Staking Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Connect your Coinbase Wallet to start staking ETH and earning rewards
          </p>
          <div className="flex justify-center">
            <Button size="lg" onClick={handleConnect}>
              Connect Coinbase Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}