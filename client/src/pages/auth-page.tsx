import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useUser();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
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
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!email || !password}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            <p className="text-center text-sm text-zinc-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-purple-400 hover:text-purple-300"
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