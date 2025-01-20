import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface User {
  id: number;
  email: string;
  walletAddress?: string;
  referralCode?: string;
  isAdmin: boolean;
  createdAt: string;
  stakes: Array<{
    amount: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users']
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="grid gap-4">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.email} {user.isAdmin && <span className="text-blue-500">(Admin)</span>}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                ID: {user.id}
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Wallet Address</p>
                    <p className="text-sm text-muted-foreground">
                      {user.walletAddress || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Referral Code</p>
                    <p className="text-sm text-muted-foreground">
                      {user.referralCode || 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Stakes</p>
                  <div className="space-y-1">
                    {user.stakes.map((stake, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex justify-between">
                        <span>{parseFloat(stake.amount).toFixed(4)} ETH</span>
                        <span>{stake.status}</span>
                      </div>
                    ))}
                    {user.stakes.length === 0 && (
                      <p className="text-sm text-muted-foreground">No stakes</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
