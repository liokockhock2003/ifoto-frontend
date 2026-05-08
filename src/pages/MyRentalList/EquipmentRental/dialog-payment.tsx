import { CheckCircle2, XCircle } from 'lucide-react';

import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface PaymentResultDialogProps {
    status: 'success' | 'failed' | null;
    billId: string | null;
    onClose: () => void;
}

export function PaymentResultDialog({ status, billId, onClose }: PaymentResultDialogProps) {
    return (
        <Dialog open={!!status} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-sm text-foreground">
                {status === 'success' && (
                    <>
                        <DialogHeader>
                            <div className="flex flex-col items-center gap-3 pt-2 pb-1">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                                <DialogTitle className="text-center text-lg">Payment Successful</DialogTitle>
                            </div>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-3 pb-2">
                            <p className="text-sm text-muted-foreground text-center">
                                Your payment has been processed successfully.
                            </p>
                            {billId && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Bill ID:</span>
                                    <Badge variant="secondary" size="sm" className="font-mono">{billId}</Badge>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button size="sm" onClick={onClose}>Okay</Button>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <DialogHeader>
                            <div className="flex flex-col items-center gap-3 pt-2 pb-1">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                </div>
                                <DialogTitle className="text-center text-lg">Payment Failed</DialogTitle>
                            </div>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-3 pb-2">
                            <p className="text-sm text-muted-foreground text-center">
                                Your payment could not be completed. Please try again.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Button size="sm" onClick={onClose}>Okay</Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
