import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { LogOut, LogIn } from "lucide-react";
import { useLocation } from "wouter";

export default function Header() {
  const { user, logout } = useUser();
  const [_, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogin = () => {
    setLocation("/auth");
  };

  return (
    <header className="fixed top-0 right-0 z-50 p-4">
      {user ? (
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="text-zinc-400 hover:text-white"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      ) : (
        <Button 
          variant="ghost" 
          onClick={handleLogin}
          className="text-zinc-400 hover:text-white"
        >
          <LogIn className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Login</span>
        </Button>
      )}
    </header>
  );
}
