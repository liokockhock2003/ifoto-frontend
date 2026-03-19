import { useEffect, useMemo, useState } from 'react';
import { Check, Lock, Unlock, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/store/schemas/user';
import { useUpdateUser } from '@/store/queries/user';

const ROLE_OPTIONS = [
    'ROLE_ADMIN',
    'ROLE_CLUB_MEMBER',
    'ROLE_EQUIPMENT_COMMITTEE',
    'ROLE_EVENT_COMMITTEE',
    'ROLE_GUEST',
    'ROLE_HIGH_COMMITTEE',
];

type UserEditDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onUpdated?: () => void;
};

export function UserEditDialog({ open, onOpenChange, user, onUpdated }: UserEditDialogProps) {
    const updateUserMutation = useUpdateUser();

    const initialRoles = useMemo(() => user?.roles ?? [], [user?.roles]);
    const initialLocked = useMemo(() => user?.isLocked ?? false, [user?.isLocked]);

    const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);
    const [locked, setLocked] = useState(initialLocked);

    useEffect(() => {
        setSelectedRoles(initialRoles);
        setLocked(initialLocked);
    }, [initialLocked, initialRoles, open]);

    const normalizedInitialRoles = useMemo(
        () => [...initialRoles].sort().join(','),
        [initialRoles],
    );
    const normalizedSelectedRoles = useMemo(
        () => [...selectedRoles].sort().join(','),
        [selectedRoles],
    );

    const hasChanges = !!user && (normalizedSelectedRoles !== normalizedInitialRoles || locked !== initialLocked);

    function toggleRole(role: string) {
        setSelectedRoles((prev) => {
            if (prev.includes(role)) {
                return prev.filter((item) => item !== role);
            }
            return [...prev, role];
        });
    }

    async function handleSave() {
        if (!user) return;
        if (selectedRoles.length === 0) {
            toast.error('Please select at least one role.');
            return;
        }

        try {
            await updateUserMutation.mutateAsync({
                username: user.username,
                roles: selectedRoles,
                locked,
            });

            toast.success(`Updated ${user.username}`);
            onUpdated?.();
            onOpenChange(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update user';
            toast.error(message);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Edit User</CardTitle>
                    <CardDescription>
                        Update role and account lock status for {user?.username ?? 'selected user'}.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">User Roles (multiple)</p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {ROLE_OPTIONS.map((role) => {
                                const isSelected = selectedRoles.includes(role);

                                return (
                                    <Button
                                        key={role}
                                        type="button"
                                        variant={isSelected ? 'default' : 'outline'}
                                        className="justify-between"
                                        onClick={() => toggleRole(role)}
                                    >
                                        <span className="truncate text-left">{role}</span>
                                        {isSelected ? <Check className="ml-2 h-4 w-4" /> : null}
                                    </Button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Selected: {selectedRoles.length > 0 ? selectedRoles.join(', ') : 'None'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Lock/Unlock Account</p>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant={locked ? 'default' : 'outline'}
                                className="flex-1"
                                onClick={() => setLocked(true)}
                            >
                                <Lock className="mr-2 h-4 w-4" />
                                Lock
                            </Button>
                            <Button
                                type="button"
                                variant={!locked ? 'default' : 'outline'}
                                className="flex-1"
                                onClick={() => setLocked(false)}
                            >
                                <Unlock className="mr-2 h-4 w-4" />
                                Unlock
                            </Button>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={updateUserMutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={!user || !hasChanges || updateUserMutation.isPending || selectedRoles.length === 0}
                    >
                        {updateUserMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

