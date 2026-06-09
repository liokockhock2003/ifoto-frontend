import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/store/auth-context';
import { useGetBankDetails } from '@/store/queries/user';

// Per-user key so dismissing the prompt for one committee member doesn't
// suppress it for another who logs in later in the same tab (sessionStorage
// persists across logout/login within a tab).
const sessionKeyFor = (username: string | undefined) =>
    `bank_details_prompt_dismissed:${username ?? 'unknown'}`;

// Inner component — only mounted when the user IS a committee member,
// so useGetBankDetails never fires for other roles.
function BankDetailsPromptInner({ username }: { username: string | undefined }) {
    const navigate = useNavigate();
    const { data, isLoading } = useGetBankDetails();

    const sessionKey = sessionKeyFor(username);
    const [dismissed, setDismissed] = useState(
        () => sessionStorage.getItem(sessionKey) === 'true',
    );

    // data === null means the query resolved with a 404 (no bank details set).
    // data === undefined means the query hasn't settled yet or errored — don't show.
    if (isLoading || data !== null || dismissed) return null;

    function handleSetUpNow() {
        void navigate('/committee-bank-details');
        setDismissed(true);
        sessionStorage.setItem(sessionKey, 'true');
    }

    function handleLater() {
        setDismissed(true);
        sessionStorage.setItem(sessionKey, 'true');
    }

    return (
        <Dialog open onOpenChange={() => undefined}>
            <DialogContent
                className="sm:max-w-md text-foreground"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-6 text-foreground">
                        <Landmark className="size-5 text-primary" />
                        <DialogTitle>Set up your bank details</DialogTitle>
                    </div>
                    <DialogDescription>
                        Renters need your bank account details to complete bank transfers.
                        Please add them before approving rentals that use bank transfer as a payment method.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-2 sm:justify-end text-foreground">
                    <Button variant="outline" onClick={handleLater}>
                        Later
                    </Button>
                    <Button onClick={handleSetUpNow}>
                        Set Up Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Outer guard — renders nothing for non-committee roles,
// preventing the query from running unnecessarily.
export function BankDetailsPrompt() {
    const { hasRole, user } = useAuth();
    if (!hasRole('ROLE_EQUIPMENT_COMMITTEE')) return null;
    // key by username so the inner state resets if the active user changes.
    return <BankDetailsPromptInner key={user?.username} username={user?.username} />;
}
