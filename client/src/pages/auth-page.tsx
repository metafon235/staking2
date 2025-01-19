import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useUser();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await (isLogin ? login : register)({ email, password });

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

      await new Promise(resolve => setTimeout(resolve, 0));

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
    <div className="min-h-screen flex items-center justify-center bg-[#756D54]/5 p-4">
      <Card className="w-full max-w-md bg-[#756D54]/10 border-[#756D54]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-white">
            {isLogin ? "Login" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-[#BED558]">
            {isLogin
              ? "Enter your credentials to access your account"
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
                className="bg-[#756D54]/20 border-[#8B9556] text-white placeholder:text-[#8B9556]"
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
                className="bg-[#756D54]/20 border-[#8B9556] text-white placeholder:text-[#8B9556]"
                disabled={isLoading}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#8419CB] hover:bg-[#8419CB]/80 text-white"
              disabled={!email || !password || isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            <p className="text-center text-sm text-[#8B9556]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-[#BED558] hover:text-[#BED558]/80"
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