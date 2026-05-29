import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { EquipmentRequest } from '@/store/schemas/request';

import { REQUEST_STATUS_BADGE, REQUEST_STATUS_LABEL } from '@/constants/requestStatus';
import { formatDate, formatDateRange } from './utils';

type EquipmentRequestViewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: EquipmentRequest | null;
};

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-sm">{value ?? '—'}</p>
        </div>
    );
}

export function EquipmentRequestViewDialog({
    open,
    onOpenChange,
    request,
}: EquipmentRequestViewDialogProps) {
    if (!request) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span>{request.requestNumber}</span>
                        <Badge variant="outline" className={REQUEST_STATUS_BADGE[request.status] ?? ''}>
                            {REQUEST_STATUS_LABEL[request.status] ?? request.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Submitted {formatDate(request.createdAt)} · {request.eventName}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6">
                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <InfoField label="Requested By" value={request.requestedByUsername} />
                            <InfoField label="Reviewed By" value={request.reviewedByUsername} />
                            <InfoField label="Event" value={request.eventName} />
                            <InfoField
                                label="Requested Dates"
                                value={formatDateRange(request.requestedStartDate, request.requestedEndDate)}
                            />
                            <InfoField
                                label="Approved Dates"
                                value={formatDateRange(request.approvedStartDate, request.approvedEndDate)}
                            />
                            <InfoField
                                label="Duration"
                                value={request.durationDays != null ? `${request.durationDays} day${request.durationDays !== 1 ? 's' : ''}` : null}
                            />
                        </div>

                        {/* Requester notes */}
                        {request.requesterNotes && (
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Requester Notes</p>
                                <p className="text-sm rounded-md bg-muted px-3 py-2">{request.requesterNotes}</p>
                            </div>
                        )}

                        {/* Rejection / committee notes */}
                        {(request.status === 'REJECTED' || request.committeeNotes) && (
                            <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                                {request.rejectionReason && (
                                    <InfoField label="Rejection Reason" value={request.rejectionReason} />
                                )}
                                {request.committeeNotes && (
                                    <InfoField label="Committee Notes" value={request.committeeNotes} />
                                )}
                            </div>
                        )}

                        {/* Equipment items */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Equipment Items ({request.items.length})
                            </p>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Brand</TableHead>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Serial No.</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {request.items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                                    No items
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            request.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.equipmentType}</TableCell>
                                                    <TableCell>{item.brand ?? '—'}</TableCell>
                                                    <TableCell>{item.model ?? '—'}</TableCell>
                                                    <TableCell className="font-mono text-xs">{item.serialNumber ?? '—'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Accessories */}
                        {request.subItems.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Accessories ({request.subItems.length})
                                </p>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Brand</TableHead>
                                                <TableHead className="text-right">Qty</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {request.subItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.equipmentType}</TableCell>
                                                    <TableCell>{item.brand ?? '—'}</TableCell>
                                                    <TableCell className="text-right">{item.borrowedQuantity ?? '—'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
