import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users']
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully."
      });
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user."
      });
      setUserToDelete(null);
    }
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
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  {user.email} {user.isAdmin && <span className="text-blue-500">(Admin)</span>}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  ID: {user.id}
                </span>
              </div>
              {!user.isAdmin && (
                <AlertDialog open={userToDelete?.id === user.id} onOpenChange={(open) => !open && setUserToDelete(null)}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-red-100 hover:text-red-600"
                      onClick={() => setUserToDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the user and all their associated data.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteUserMutation.mutate(user.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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