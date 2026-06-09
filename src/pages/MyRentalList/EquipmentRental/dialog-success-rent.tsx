import { CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type RentalSuccessDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalNumber?: string;
};

export function RentalSuccessDialog({ open, onOpenChange, rentalNumber }: RentalSuccessDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm text-center text-foreground">
                <DialogHeader className="items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                    </div>
                    <DialogTitle className="text-lg text-foreground">Rental Submitted!</DialogTitle>
                    <DialogDescription className="text-sm text-center space-y-2" asChild>
                        <div>
                            {rentalNumber && (
                                <span className="block font-mono font-semibold text-foreground mb-1">{rentalNumber}</span>
                            )}
                            <p>Your rental request has been submitted successfully.</p>
                            <ul className="text-left text-xs space-y-1 mt-2 text-muted-foreground">
                                <li>• A personal Equipment Committee member will be assigned within 1–2 working days.</li>
                                <li>• Pickup date &amp; time and return date &amp; time will be confirmed by your assigned Equipment Committee member.</li>
                            </ul>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button size="sm" onClick={() => onOpenChange(false)}>
                        Okay
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
