import { useEffect, useMemo, useState } from 'react';
import { Check, Info, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUpdateUser } from '@/store/queries/user';
import type { User } from '@/store/schemas/user';
import { getRoleLabel } from '@/constants/roles';

/**
 * Roles that automatically imply ROLE_CLUB_MEMBER membership.
 */
const IMPLIES_CLUB_MEMBER = ['ROLE_ADMIN', 'ROLE_HIGH_COMMITTEE', 'ROLE_EQUIPMENT_COMMITTEE'] as const;

/**
 * Event Committee requires at least one of these to also be selected.
 */
const EVENT_COMMITTEE_REQUIRES_ONE_OF = ['ROLE_CLUB_MEMBER', 'ROLE_GUEST'] as const;

const ROLE_GROUPS = [
    {
        label: 'Committee Roles',
        description: 'Admin, High Committee and Equipment Committee automatically include Club Member.',
        roles: ['ROLE_ADMIN', 'ROLE_HIGH_COMMITTEE', 'ROLE_EQUIPMENT_COMMITTEE'],
    },
    {
        label: 'Membership Type',
        description: 'Club Member and Guest are mutually exclusive. Club Member is auto-included when a committee role that implies it is selected.',
        roles: ['ROLE_CLUB_MEMBER', 'ROLE_GUEST'],
    },
    {
        label: 'Event Committee',
        description: 'Event Committee is independent and must be paired with either Club Member or Guest.',
        roles: ['ROLE_EVENT_COMMITTEE'],
    },
] as const;

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

    const normalizedInitialRoles = useMemo(() => [...initialRoles].sort().join(','), [initialRoles]);
    const normalizedSelectedRoles = useMemo(() => [...selectedRoles].sort().join(','), [selectedRoles]);

    const clubMemberImplied = IMPLIES_CLUB_MEMBER.some((r) => selectedRoles.includes(r));

    const eventCommitteeSelected = selectedRoles.includes('ROLE_EVENT_COMMITTEE');
    const eventCommitteeValid =
        !eventCommitteeSelected ||
        EVENT_COMMITTEE_REQUIRES_ONE_OF.some((r) => selectedRoles.includes(r));

    const hasChanges =
        !!user && (normalizedSelectedRoles !== normalizedInitialRoles || locked !== initialLocked);

    const canSave =
        !!user &&
        hasChanges &&
        !updateUserMutation.isPending &&
        selectedRoles.length > 0 &&
        eventCommitteeValid;

    function toggleRole(role: string) {
        setSelectedRoles((prev) => {
            let next: string[];
            if (prev.includes(role)) {
                next = prev.filter((r) => r !== role);
            } else {
                next = [...prev, role];
            }

            // Enforce: Club Member and Guest are mutually exclusive
            if (role === 'ROLE_CLUB_MEMBER' && next.includes('ROLE_CLUB_MEMBER')) {
                next = next.filter((r) => r !== 'ROLE_GUEST');
            } else if (role === 'ROLE_GUEST' && next.includes('ROLE_GUEST')) {
                next = next.filter((r) => r !== 'ROLE_CLUB_MEMBER');
            }

            // Enforce: High Committee and Equipment Committee are mutually exclusive
            if (role === 'ROLE_HIGH_COMMITTEE' && next.includes('ROLE_HIGH_COMMITTEE')) {
                next = next.filter((r) => r !== 'ROLE_EQUIPMENT_COMMITTEE');
            } else if (role === 'ROLE_EQUIPMENT_COMMITTEE' && next.includes('ROLE_EQUIPMENT_COMMITTEE')) {
                next = next.filter((r) => r !== 'ROLE_HIGH_COMMITTEE');
            }

            // Enforce: selecting an implication role auto-adds Club Member and removes Guest
            const needsClubMember = IMPLIES_CLUB_MEMBER.some((r) => next.includes(r));
            if (needsClubMember) {
                if (!next.includes('ROLE_CLUB_MEMBER')) next = [...next, 'ROLE_CLUB_MEMBER'];
                next = next.filter((r) => r !== 'ROLE_GUEST');
            }

            return next;
        });
    }

    async function handleSave() {
        if (!user) return;
        if (selectedRoles.length === 0) {
            toast.error('Please select at least one role.');
            return;
        }
        if (!eventCommitteeValid) {
            toast.error('Event Committee must be paired with Club Member or Guest.');
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

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg text-muted-foreground">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update role and account lock status for{' '}
                            <span className="font-medium text-foreground">
                                {user?.username ?? 'selected user'}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Role groups */}
                        {ROLE_GROUPS.map((group) => (
                            <div key={group.label} className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium text-foreground">{group.label}</p>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-56 text-xs">
                                            {group.description}
                                        </TooltipContent>
                                    </Tooltip>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {group.roles.map((role) => {
                                        const isSelected = selectedRoles.includes(role);
                                        const isForced =
                                            role === 'ROLE_CLUB_MEMBER' && clubMemberImplied;

                                        return (
                                            <Tooltip key={role}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant={isSelected ? 'default' : 'outline'}
                                                        className="justify-between"
                                                        disabled={isForced}
                                                        onClick={() => !isForced && toggleRole(role)}
                                                    >
                                                        <span className="truncate text-left">
                                                            {getRoleLabel(role)}
                                                        </span>
                                                        {isForced ? (
                                                            <Lock className="ml-2 h-3.5 w-3.5 opacity-60" />
                                                        ) : isSelected ? (
                                                            <Check className="ml-2 h-4 w-4" />
                                                        ) : null}
                                                    </Button>
                                                </TooltipTrigger>
                                                {isForced && (
                                                    <TooltipContent side="top" className="text-xs">
                                                        Auto-included by Admin, High Committee, or Equipment Committee
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        );
                                    })}
                                </div>

                                {/* Event Committee constraint warning */}
                                {(group.roles as readonly string[]).includes('ROLE_EVENT_COMMITTEE') &&
                                    eventCommitteeSelected &&
                                    !eventCommitteeValid && (
                                        <p className="text-xs text-destructive">
                                            Event Committee must also have Club Member or Guest selected.
                                        </p>
                                    )}
                            </div>
                        ))}

                        {/* Account Status */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Account Status</p>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={!locked}
                                    onCheckedChange={(checked) => setLocked(!checked)}
                                />
                                <div>
                                    {locked ? (
                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                            Inactive
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                            Active
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            className="text-muted-foreground"
                            type="button"
                            variant="outline"
                            disabled={updateUserMutation.isPending}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => void handleSave()}
                            disabled={!canSave}
                        >
                            {updateUserMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
