import { AlertTriangle, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/store/schemas/user';
import { useDeleteUser } from '@/store/queries/user';

type UserDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onDeleted?: () => void;
};

export function UserDeleteDialog({ open, onOpenChange, user, onDeleted }: UserDeleteDialogProps) {
    const deleteUserMutation = useDeleteUser();

    async function handleDelete() {
        if (!user) return;

        try {
            await deleteUserMutation.mutateAsync({ username: user.username });
            toast.success(`Deleted ${user.username}`);
            onDeleted?.();
            onOpenChange(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete user';
            toast.error(message);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm Deletion
                    </CardTitle>
                    <CardDescription>
                        This action cannot be undone. You are about to permanently delete user {user?.username ?? ''}.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Please confirm you want to continue.
                    </p>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={deleteUserMutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!user || deleteUserMutation.isPending}
                        onClick={() => void handleDelete()}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
