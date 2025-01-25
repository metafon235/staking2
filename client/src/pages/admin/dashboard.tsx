import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();

  // Show loading state while checking user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect non-admin users
  if (!user.isAdmin) {
    window.location.href = "/";
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
              <Button className="w-full" onClick={() => setLocation("/admin/users")}>
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staking Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Monitor staking activities and rewards</p>
              <Button className="w-full" onClick={() => setLocation("/admin/staking")}>
                View Stakes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Review and manage platform transactions</p>
              <Button className="w-full" onClick={() => setLocation("/admin/transactions")}>
                View Transactions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Configure platform settings and parameters</p>
              <Button className="w-full" onClick={() => setLocation("/admin/settings")}>
                Manage Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage staking rewards and distributions</p>
              <Button className="w-full" onClick={() => setLocation("/admin/rewards")}>
                Manage Rewards
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View platform statistics and analytics</p>
              <Button className="w-full" onClick={() => setLocation("/admin/analytics")}>
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}