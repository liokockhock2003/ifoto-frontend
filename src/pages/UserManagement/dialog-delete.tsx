import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteUser } from '@/store/queries/user';
import type { User } from '@/store/schemas/user';

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm Deletion
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. You are about to permanently delete user{' '}
                        <span className="font-medium text-foreground">{user?.username ?? '—'}</span>.
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">Please confirm you want to continue.</p>

                <DialogFooter>
                    <Button
                        className="text-muted-foreground"
                        type="button"
                        variant="outline"
                        disabled={deleteUserMutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
