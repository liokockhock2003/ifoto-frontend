import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { EquipmentRequest } from '@/store/schemas/request';

import { formatDate, formatDateRange, STATUS_LABEL, STATUS_VARIANT } from './utils';

type EquipmentRequestViewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: EquipmentRequest | null;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
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

    const { variant, className } = STATUS_VARIANT[request.status] ?? { variant: 'outline', className: '' };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span>{request.requestNumber}</span>
                        <Badge variant={variant} className={className}>
                            {STATUS_LABEL[request.status] ?? request.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Submitted {formatDate(request.createdAt)} · {request.eventName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <Field label="Requested By" value={request.requestedByUsername} />
                        <Field label="Reviewed By" value={request.reviewedByUsername} />
                        <Field label="Event" value={request.eventName} />
                        <Field
                            label="Requested Dates"
                            value={formatDateRange(request.requestedStartDate, request.requestedEndDate)}
                        />
                        <Field
                            label="Approved Dates"
                            value={formatDateRange(request.approvedStartDate, request.approvedEndDate)}
                        />
                        <Field
                            label="Duration"
                            value={request.durationDays != null ? `${request.durationDays} day${request.durationDays !== 1 ? 's' : ''}` : null}
                        />
                    </div>

                    {/* Notes */}
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
                                <Field label="Rejection Reason" value={request.rejectionReason} />
                            )}
                            {request.committeeNotes && (
                                <Field label="Committee Notes" value={request.committeeNotes} />
                            )}
                        </div>
                    )}

                    {/* Items table */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Equipment Items ({request.items.length})
                        </p>
                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Type</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Brand</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Model</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Serial No.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {request.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                                                No items
                                            </td>
                                        </tr>
                                    ) : (
                                        request.items.map((item) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="px-3 py-2">{item.equipmentType}</td>
                                                <td className="px-3 py-2">{item.brand ?? '—'}</td>
                                                <td className="px-3 py-2">{item.model ?? '—'}</td>
                                                <td className="px-3 py-2 font-mono text-xs">{item.serialNumber ?? '—'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
