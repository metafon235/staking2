import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user?.isAdmin) {
      setLocation("/admin/login");
    }
  }, [user, setLocation]);

  if (!user?.isAdmin) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage user accounts and permissions</p>
              <Button className="mt-4" onClick={() => setLocation("/admin/users")}>
                View Users
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stakes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Monitor and manage staking activities</p>
              <Button className="mt-4" onClick={() => setLocation("/admin/stakes")}>
                View Stakes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View and manage platform transactions</p>
              <Button className="mt-4" onClick={() => setLocation("/admin/transactions")}>
                View Transactions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
