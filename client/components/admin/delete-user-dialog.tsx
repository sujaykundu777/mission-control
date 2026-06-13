"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface DeleteUserDialogProps {
  user: User | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteUserDialog({ user, onClose, onDeleted }: DeleteUserDialogProps) {
  async function handleDelete() {
    if (!user) return;

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to delete user");
      onClose();
      return;
    }

    toast.success("User deleted successfully");
    onDeleted();
    onClose();
  }

  return (
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{user?.email}</strong>? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
