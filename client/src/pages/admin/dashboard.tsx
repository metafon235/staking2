import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";

interface AdminStats {
  totalUsers: number;
  totalStakes: number;
  totalTransactions: number;
  totalStakedAmount: number;
}

interface User {
  id: number;
  username: string;
  walletAddress: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user?.isAdmin) {
      setLocation("/admin/login");
    }
  }, [user, setLocation]);

  const { data: stats } = useQuery<{ stats: AdminStats }>({
    queryKey: ["/api/admin/overview"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{stats?.stats.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Total Stakes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{stats?.stats.totalStakes || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {stats?.stats.totalTransactions || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Total Staked Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {stats?.stats.totalStakedAmount?.toFixed(6) || "0"} ETH
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-zinc-400">
                  <th className="p-4">ID</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Wallet Address</th>
                  <th className="p-4">Admin</th>
                  <th className="p-4">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-t border-zinc-700 text-white">
                    <td className="p-4">{user.id}</td>
                    <td className="p-4">{user.username}</td>
                    <td className="p-4">{user.walletAddress || "-"}</td>
                    <td className="p-4">{user.isAdmin ? "Yes" : "No"}</td>
                    <td className="p-4">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
