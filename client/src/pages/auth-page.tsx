import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function getQueryParam(param: string): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useUser();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Get referral code from URL if present
  const referralCode = getQueryParam('ref');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await (isLogin ? login : register)({ 
        email, 
        password,
        referralCode: !isLogin ? referralCode : undefined // Only send referralCode during registration
      });

      if (!result.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
        return;
      }

      toast({
        title: isLogin ? "Login Successful" : "Registration Successful",
        description: "Welcome to the Staking Platform"
      });

      // Wait for next tick
      await new Promise(resolve => setTimeout(resolve, 0));

      // Check user status
      const user = queryClient.getQueryData(['user']);
      if (user) {
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/95 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-white">
            {isLogin ? "Login" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {isLogin
              ? "Enter your credentials to access your account"
              : referralCode 
                ? "Create an account using your referral invitation"
                : "Create an account to start staking"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                disabled={isLoading}
                required
              />
            </div>

            {!isLogin && referralCode && (
              <div className="bg-purple-900/20 border border-purple-900/50 rounded-lg p-3">
                <p className="text-sm text-purple-400">
                  You've been invited! Sign up to start earning rewards together.
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!email || !password || isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            <p className="text-center text-sm text-zinc-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-purple-400 hover:text-purple-300"
                disabled={isLoading}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}